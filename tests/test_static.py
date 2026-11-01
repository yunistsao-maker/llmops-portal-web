"""Static checks of the page and the nginx config (no browser, no network). Run: pytest tests"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
SITE = HERE / "site"
INDEX = (SITE / "index.html").read_text(encoding="utf-8")
APP = (SITE / "assets/app.js").read_text(encoding="utf-8")
TEMPLATE = (HERE / "nginx/templates/portal.conf.template").read_text(encoding="utf-8")
HEADERS = (HERE / "nginx/snippets/security-headers.conf").read_text(encoding="utf-8")


def test_no_inline_code_or_styles():
    """CSP default-src 'self' without 'unsafe-inline': no inline scripts, style blocks, style attributes or handlers."""
    for tag in re.findall(r"<script\b[^>]*>", INDEX):
        assert "src=" in tag, tag
    assert "<style" not in INDEX and 'style="' not in INDEX
    assert not re.search(r"\son[a-z]+=", INDEX)
    assert 'style="' not in APP and "<style" not in APP and not re.search(r"\son(click|load|error|input|change)=", APP)
    assert "javascript:" not in APP


def test_no_external_or_prototype_dependencies():
    for text in (INDEX, APP):
        assert "fonts.googleapis" not in text and "fonts.gstatic" not in text
        assert "window.claude" not in text and "portal-data" not in text
    for path in ("/api/content/portal.json", "/api/chat", "/api/assist/form", "/api/requests"):
        assert f"'{path}'" in APP, path


def _keys(block: str) -> set[str]:
    return set(re.findall(r"'([^'\n]+)':", block))


def test_texts_exist_in_both_languages():
    zh_block = APP[APP.index("zh: {"):APP.index("\nen: {")]
    en_block = APP[APP.index("\nen: {"):APP.index("}};")]
    zh, en = _keys(zh_block), _keys(en_block)
    missing_en = sorted(k for k in zh - en if not k.endswith("Note"))
    assert not missing_en, missing_en
    assert not sorted(en - zh), sorted(en - zh)
    used = set(re.findall(r"\bt\('([a-zA-Z][\w.\-]*)'\s*[,)]", APP))  # literal keys only ('c.' + cls is dynamic)
    assert not sorted(used - zh), sorted(used - zh)


def test_nginx_template():
    for var in ("${CONTENT_API_URL}", "${ASSISTANT_API_URL}", "${REQUEST_API_URL}", "${TESTS_API_URL}", "${PORT}", "${NGINX_RESOLVER}"):
        assert var in TEMPLATE, var
    assert "location = /healthz" in TEMPLATE and "include /etc/nginx/snippets/security-headers.conf;" in TEMPLATE
    csp = re.search(r'Content-Security-Policy "([^"]+)"', HEADERS).group(1)
    assert "default-src 'self'" in csp and "frame-ancestors 'none'" in csp and "unsafe-inline" not in csp
    proxy = (HERE / "nginx/snippets/proxy.conf").read_text(encoding="utf-8")
    assert "proxy_set_header Authorization $http_authorization;" in proxy and 'proxy_set_header Cookie "";' in proxy


def test_dockerfile_pins_base_image():
    dockerfile = (HERE / "Dockerfile").read_text(encoding="utf-8")
    assert re.search(r"nginx-unprivileged:\d+\.\d+-alpine(-slim)?@sha256:[0-9a-f]{64}", dockerfile)  # any version, always by digest
    assert "USER 101:101" in dockerfile
