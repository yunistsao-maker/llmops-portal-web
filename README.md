# llmops-portal-web

The LLMOps portal page: static site served by nginx (unprivileged, read-only), which forwards `/api/*` to the
back-end services of `llmops-platform`. Deployed by Argo CD from `llmops-deploy`.

| Repo | Role |
|---|---|
| `llmops-platform` | back-end services; owns the API and view-model contracts |
| `llmops-portal-web` (this) | the page; builds the `portal-web` image |
| `llmops-deploy` | what runs where (Argo CD); release workflows open PRs there |

## Contracts

`contracts/` is a pinned copy of the back end's contracts: the portal view model sample
(`fixtures/portal-view.sample.json`), the request form schema and the OpenAPI documents of content-api,
assistant-api, request-api and test-orchestrator. `contracts/VERSION.json` records the source tag and every file's
SHA-256. New versions arrive as pull requests from the llmops-platform release workflow. CI checks that the files
match `VERSION.json` and the back end at that tag, and runs the browser check against that back-end version.

## CI/CD

- **Pull requests:** static checks (`pytest tests`), ESLint, contract check, browser check (headless Chromium
  against the real content-api and assistant-api of the pinned back-end version, in-process), image build + Trivy.
- **main:** push `portal-web:<git sha>` to ECR (SBOM, provenance, cosign signature with the AWS KMS key) and open
  an auto-merge PR in llmops-deploy that bumps `envs/aws-test`. Tags `v*` also push `portal-web:<tag>` for
  on-prem promotion.
- Needs variables `AWS_REGION`, `ECR_REGISTRY`, `AWS_CI_PUSH_ROLE_ARN`, `COSIGN_KMS_KEY` and secrets `CI_APP_ID`,
  `CI_APP_PRIVATE_KEY` (GitHub App: read llmops-platform, write llmops-deploy).

Local browser check: check out llmops-platform next to this repo (or set `LLMOPS_PLATFORM_DIR`), then follow
"Tests" below.

## The page

The LLMOps portal page (bilingual 中文 / EN, three palettes, news, retirements with a month calendar, models, tests
with the SEC-01..32 matrix, cost estimate, model request form, 「問問看」 chat and the AI form helper) served by nginx,
which also forwards `/api/*` to the services.

- Model pages have three layers with deep links: `#m-<id>` 模型與能力 (availability first: can I request it now,
  else the estimated month and 訂閱上線通知; key facts, strengths, what it replaces), `#m-<id>/security` 資安與 GW
  (security tests, data processing per cloud, gateway name, LiteLLM strings and versions, logging off) and
  `#m-<id>/rollout` 導入細節 (gates with owners and exit criteria, the full per-cloud table, compatibility and
  performance, cautions, related news). Every layer has 申請使用. The models table shows availability, not gate dots.
- Subscriptions go to request-api: `GET /api/subscriptions`, `PUT` / `DELETE /api/subscriptions/{model_id}`.
- Retirements: a small month calendar (Sunday first, dots on days with events, today marked) sticky beside the list
  on wide screens and above it on narrow ones; hovering or focusing a row turns the calendar to that month and draws a
  red-pen circle around the date (no animation with reduced motion); hovering or clicking a day marks and scrolls to
  its rows. It is the production port of the prototype `app3.html`:
data comes from `GET /api/content/portal.json` (loading and error states, retry), the chat from `POST /api/chat`,
the form helper from `POST /api/assist/form`, and the request form posts to `POST /api/requests` and shows the
returned id, status and gates (the page still previews gates, monthly cost and notes itself).
No inline scripts or styles (strict CSP), no web fonts (the CSS font stacks fall back to local fonts), no
`window.claude`.

**Kind:** service (nginx `nginxinc/nginx-unprivileged:1.30-alpine-slim`, pinned by digest), `PORT` 8080.
Stateless; run 2+ replicas.

## Routes
| Path | Goes to | Read timeout |
|---|---|---|
| `/`, `/index.html`, `/assets/*` | static files (`Cache-Control: no-cache`, ETag revalidation, gzip) | — |
| `/api/content/*` | `CONTENT_API_URL` | 30 s |
| `/api/chat`, `/api/assist/*` | `ASSISTANT_API_URL` | 120 s |
| `/api/requests`, `/api/requests/*`, `/api/subscriptions`, `/api/subscriptions/*` | `REQUEST_API_URL` | 30 s |
| `/api/tests`, `/api/tests/*` | `TESTS_API_URL` (not used by the page yet) | 30 s |
| other `/api/*` | `404` JSON | |
| `/healthz`, `/readyz` | `200` (nginx is up) | |

Paths and query strings pass through unchanged. Forwarded: `Authorization` (as received), `X-Request-Id` (nginx's
`$request_id`), `X-Forwarded-For/-Proto/-Host`. **Not** forwarded: cookies. Request bodies over 64 KB → `413` JSON;
an unreachable or unresolvable upstream → `502 {"error": {"code": "upstream_unreachable"}}` for that path only.

Security headers on every response: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';
img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self';
frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
`Permissions-Policy`, `Cross-Origin-Opener-Policy` and `Cross-Origin-Resource-Policy: same-origin`.
HSTS belongs on the TLS-terminating ingress.

## Sign-in
The page has no login flow of its own. Put an OIDC-aware ingress or auth proxy (for example oauth2-proxy with
`--set-authorization-header`) in front of portal-web; it signs users in and sends `Authorization: Bearer <token>` with
every request; portal-web passes it to the services, which verify it (`AUTH_MODE=oidc`). On `401` the page asks the
user to reload (the proxy then redirects to sign-in). For the AWS test box the services can run with `AUTH_MODE=dev`.

## Configuration
| Variable | Required | Default | Meaning |
|---|---|---|---|
| `PORT` | no | `8080` | listen port |
| `CONTENT_API_URL` | no | `http://content-api:8080` | `scheme://host:port`, no path |
| `ASSISTANT_API_URL` | no | `http://assistant-api:8080` | |
| `REQUEST_API_URL` | no | `http://request-api:8080` | |
| `TESTS_API_URL` | no | `http://tests-api:8080` | |
| `NGINX_RESOLVER` | no | nameservers in `/etc/resolv.conf` | DNS used to find the services per request |
| `NGINX_UPSTREAM_DOMAIN` | no | the `*.svc.*` search domain in `/etc/resolv.conf` | appended to bare service names, because nginx's resolver ignores search domains; `-` = never |
| `NGINX_ENVSUBST_OUTPUT_DIR`, `NGINX_ENVSUBST_FILTER`, `NGINX_ENTRYPOINT_QUIET_LOGS` | set in the image | | leave as they are |

Upstreams are resolved at request time (`resolver` + variables), so portal-web starts even when a service does not
exist yet; in Kubernetes `http://content-api:8080` becomes `http://content-api.<namespace>.svc.cluster.local:8080`
automatically. No secrets.

## Probes, network, resources
- Probes: `GET /healthz` (liveness), `GET /readyz` (readiness) on `PORT`.
- Outbound: the four services above and cluster DNS only.
- Image: runs as the base image's unprivileged user (UID/GID 101), read-only root filesystem; needs a writable `/tmp`
  (emptyDir: rendered config, pid, proxy buffers). SIGTERM: graceful nginx quit.
- Logs: JSON lines on stdout (`ts, level, component, logger, msg, method, path, status, bytes, sec, upstream_sec, rid`);
  no query strings, headers or client addresses. nginx errors go to stderr.
- Suggested resources: requests 50m CPU / 64Mi, limits 500m / 128Mi.
- Events: none.

## Files
- `site/index.html`, `site/assets/app.js`, `site/assets/app.css`, `site/assets/theme.js` (palette and language
  before first paint), `site/assets/favicon.svg`
- `nginx/nginx.conf`, `nginx/templates/portal.conf.template` (rendered at start-up by the image's entrypoint),
  `nginx/snippets/*.conf`, `nginx/15-portal-upstreams.envsh` (resolver and service names)

## Tests
- `pytest tests` — static checks: no inline code or styles, every UI text in both languages,
  CSP and forwarding settings, pinned base image.
- Browser check (headless Chromium, 55 checks: every page, the model layers, subscribe / unsubscribe, the retirement
  calendar circle, matrix, cost, request submit, chat, form helper, both languages, palettes, phone width, loading
  error and retry; fails on any console error, CSP violation or failed request):
  ```
  python tests/stub_stack.py &          # real content-api + assistant-api in-process, fake
                                                              # gateway, request-api stand-in (requests validated
                                                              # against contracts/schemas/request.schema.json,
                                                              # subscriptions in memory)
  docker run -d --network host --read-only --tmpfs /tmp -e PORT=18080 \
    -e CONTENT_API_URL=http://127.0.0.1:18101 -e ASSISTANT_API_URL=http://127.0.0.1:18102 \
    -e REQUEST_API_URL=http://127.0.0.1:18103 llmops/portal-web:dev
  PORTAL_URL=http://127.0.0.1:18080 node tests/browser-check.cjs
  ```
