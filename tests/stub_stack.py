"""Local back end for checking the portal page: the real content-api and assistant-api apps (in-process, object
storage in memory, a scripted fake LLM gateway) plus a request-api stand-in that validates every POST
/api/requests body against contracts/schemas/request.schema.json.

    python tests/stub_stack.py [--view FILE] [--base-port 18101]
        content-api   http://127.0.0.1:18101
        assistant-api http://127.0.0.1:18102
        request-api   http://127.0.0.1:18103 (stand-in: POST /api/requests, GET/PUT/DELETE /api/subscriptions),
                      also GET /_last for the last accepted request body
        fake gateway  http://127.0.0.1:18104/v1/chat/completions (for an assistant-api container)
Needs the dev venv (fastapi, uvicorn, httpx, jsonschema). Never calls a real model or the internet.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import threading
import time
import uuid
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
# the back end's code at the pinned contracts version (CI checks it out into _platform/)
ROOT = Path(os.environ.get("LLMOPS_PLATFORM_DIR") or WEB / "_platform")
sys.path[:0] = [str(ROOT / "libs/llmops-common/src"), str(ROOT / "components/content-api/src"),
                str(ROOT / "components/assistant-api/src")]

import httpx  # noqa: E402
import jsonschema  # noqa: E402
import uvicorn  # noqa: E402
from fastapi import FastAPI, Request  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from llmops_common.auth import Authenticator  # noqa: E402
from llmops_common.gates import next_gate, required_gates  # noqa: E402
from llmops_common.llm import GatewayClient  # noqa: E402
from llmops_common.storage import MemoryStore  # noqa: E402

B = "llmops-curated"
VIEW_ID = "20261031T000000Z-000000000001"


def fake_gateway(request: httpx.Request) -> httpx.Response:
    body = json.loads(request.content)
    msgs = body["messages"]
    last = msgs[-1]["content"]
    if body.get("response_format"):  # form helper
        lang_en = "English" in msgs[0]["content"]
        reply = ("Claude Haiku 5.5 fits a high-volume support bot: cheap and fast. Please confirm the data class yourself."
                 if lang_en else "客服機器人量大，建議 Claude Haiku 5.5：便宜又快。資料等級請你依公司分類自己確認。")
        content = json.dumps({"reply": reply, "questions": ["誰會用？" if not lang_en else "Who will use it?"],
                              "form": {"models": ["claude-haiku-5-5", "made-up-model"], "use": "客服知識庫問答機器人",
                                       "dataClass": "", "cloud": "aws", "rpd": 30000, "tin": 2000, "tout": 400,
                                       "external": True, "taiwan": False, "date": None, "note": ""}}, ensure_ascii=False)
    else:  # chat: answer with the first page from the context, plus links that must be filtered out
        routes = re.findall(r"\]\((#[^)\s]+)\)：", last)
        first = routes[0] if routes else "#home"
        content = (f"這是根據 portal 資料的回答（測試用）。\n- 重點一\n- 重點二\n\n請看 [相關頁面]({first})、"
                   f"[不存在的模型](#m-not-a-model) 與 [外部網站](https://example.com/x)。")
    return httpx.Response(200, json={"model": "fake-model", "usage": {"total_tokens": 42},
                                     "choices": [{"message": {"content": content}, "finish_reason": "stop"}]})


def request_api() -> FastAPI:
    schema = json.loads((WEB / "contracts/schemas/request.schema.json").read_text(encoding="utf-8"))
    validator = jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker())
    app = FastAPI()
    state = {"last": None}

    @app.post("/api/requests")
    async def create(request: Request):
        body = await request.json()
        errors = sorted(validator.iter_errors(body), key=lambda e: list(e.path))
        if errors:
            return JSONResponse({"error": {"code": "invalid_request", "message": "; ".join(e.message for e in errors[:3])}},
                                status_code=422)
        state["last"] = body
        gates = required_gates(body)
        return JSONResponse({"id": str(uuid.uuid4()), "status": "in_review", "next_gate": next_gate(gates, set()),
                             "gates": [{"gate": g, "status": "approved" if g == "G0" else "pending"} for g in gates]},
                            status_code=201)

    @app.get("/_last")
    def last():
        return state["last"] or {}

    subs: dict[str, str] = {}  # model_id -> created_at (one dev user)

    @app.get("/api/subscriptions")
    def list_subs():
        return {"items": [{"model_id": k, "created_at": v} for k, v in sorted(subs.items())]}

    @app.put("/api/subscriptions/{model_id}")
    def put_sub(model_id: str):
        if not re.fullmatch(r"[a-z0-9][a-z0-9.-]{1,80}", model_id):
            return JSONResponse({"error": {"code": "invalid_request", "message": "bad model id"}}, status_code=422)
        subs.setdefault(model_id, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
        return {"model_id": model_id, "created_at": subs[model_id]}

    @app.delete("/api/subscriptions/{model_id}", status_code=204)
    def delete_sub(model_id: str):
        subs.pop(model_id, None)
        return None

    return app


def gateway_app() -> FastAPI:
    """The scripted fake model as an OpenAI-compatible HTTP endpoint."""
    app = FastAPI()

    @app.post("/v1/chat/completions")
    async def completions(request: Request):
        resp = fake_gateway(httpx.Request("POST", "http://gw/v1/chat/completions", content=await request.body()))
        return JSONResponse(resp.json(), status_code=resp.status_code)

    return app


def serve(app, port: int) -> uvicorn.Server:
    server = uvicorn.Server(uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning", access_log=False))
    threading.Thread(target=server.run, daemon=True).start()
    return server


def main() -> None:
    from assistant_api.app import create_app as assistant_app
    from assistant_api.content import ContentIndex
    from content_api.app import create_app as content_app

    ap = argparse.ArgumentParser()
    ap.add_argument("--view", type=Path, default=WEB / "contracts/fixtures/portal-view.sample.json")
    ap.add_argument("--base-port", type=int, default=18101)
    args = ap.parse_args()
    store = MemoryStore()
    store.put_bytes(B, f"portal/views/{VIEW_ID}/portal.json", args.view.read_bytes(), "application/json; charset=utf-8")
    store.put_json(B, "portal/views/current.json", {"current": VIEW_ID, "release_id": "seed", "security_run_id": None,
                                                    "built_at": "2026-10-31T00:00:00Z"})
    store.put_json(B, "portal/manifest.json", {"current": "seed", "history": ["seed"]})
    dev = Authenticator(mode="dev", dev_email="tester@example.local")
    gw = GatewayClient("http://gateway.invalid", "sk-test", "portal-quick", transport=httpx.MockTransport(fake_gateway),
                       max_retries=0)
    servers = [serve(content_app(store=store, bucket=B, authenticator=dev), args.base_port),
               serve(assistant_app(content=ContentIndex(store, B, poll_seconds=3600), authenticator=dev, gateway=gw,
                                   start_polling=False), args.base_port + 1),
               serve(request_api(), args.base_port + 2), serve(gateway_app(), args.base_port + 3)]
    while not all(s.started for s in servers):
        time.sleep(0.05)
    print(json.dumps({"content": args.base_port, "assistant": args.base_port + 1, "requests": args.base_port + 2,
                      "gateway": args.base_port + 3}), flush=True)
    try:
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
