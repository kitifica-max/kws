#!/usr/bin/env python3
"""Stdlib-only Pinterest API v5 client for the pinterest-design-research skill.

Reads/writes credentials in a .env file. Never prints access_token,
refresh_token, app_id or app_secret to stdout.
"""
import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API_BASE = "https://api.pinterest.com/v5"
AUTH_BASE = "https://www.pinterest.com/oauth/"
DEFAULT_SCOPES = "boards:read,pins:read"
TOKEN_REFRESH_MARGIN_SECONDS = 600
SENSITIVE_KEYS = {
    "PINTEREST_APP_SECRET",
    "PINTEREST_ACCESS_TOKEN",
    "PINTEREST_REFRESH_TOKEN",
}


def find_env_path() -> Path:
    override = os.environ.get("PINTEREST_DOTENV_PATH")
    if override:
        return Path(override)
    here = Path.cwd()
    for candidate in [here, *here.parents]:
        f = candidate / ".env"
        if f.exists():
            return f
        if (candidate / ".git").exists():
            return candidate / ".env"
    return here / ".env"


def read_env(path: Path) -> dict:
    values = {}
    if not path.exists():
        return values
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        val = val.strip().strip('"').strip("'")
        values[key.strip()] = val
    return values


def write_env_updates(path: Path, updates: dict) -> None:
    lines = path.read_text().splitlines() if path.exists() else []
    seen = set()
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key = stripped.split("=", 1)[0].strip()
        if key in updates:
            lines[i] = f"{key}={updates[key]}"
            seen.add(key)
    for key, val in updates.items():
        if key not in seen:
            lines.append(f"{key}={val}")
    path.write_text("\n".join(lines) + "\n")


def load_config() -> dict:
    env_path = find_env_path()
    file_values = read_env(env_path)
    merged = {**file_values, **{k: v for k, v in os.environ.items() if k.startswith("PINTEREST_")}}
    merged["_env_path"] = str(env_path)
    return merged


def require(cfg: dict, key: str) -> str:
    val = cfg.get(key)
    if not val:
        sys.exit(
            f"Missing {key} in {cfg.get('_env_path')}. "
            f"See references/api-reference.md for setup steps."
        )
    return val


def http_request(url: str, method: str = "GET", data: dict = None, headers: dict = None) -> dict:
    headers = headers or {}
    body = None
    if data is not None:
        body = urllib.parse.urlencode(data).encode()
        headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    attempts = 0
    while True:
        attempts += 1
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempts <= 2:
                delay = e.headers.get("Retry-After")
                time.sleep(float(delay) if delay else 2.0)
                continue
            detail = e.read().decode(errors="replace")
            sys.exit(f"Pinterest API error {e.code} on {url}: {detail}")


def oauth_token_request(cfg: dict, grant_fields: dict) -> dict:
    app_id = require(cfg, "PINTEREST_APP_ID")
    app_secret = require(cfg, "PINTEREST_APP_SECRET")
    basic = base64.b64encode(f"{app_id}:{app_secret}".encode()).decode()
    return http_request(
        f"{API_BASE}/oauth/token",
        method="POST",
        data=grant_fields,
        headers={"Authorization": f"Basic {basic}"},
    )


def cmd_auth_url(args, cfg: dict) -> None:
    app_id = require(cfg, "PINTEREST_APP_ID")
    redirect_uri = require(cfg, "PINTEREST_REDIRECT_URI")
    scopes = args.scopes or DEFAULT_SCOPES
    params = {
        "client_id": app_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scopes,
    }
    url = f"{AUTH_BASE}?{urllib.parse.urlencode(params)}"
    print("Open this URL, log in, approve access, then copy the ?code=... value")
    print("from the address bar after Pinterest redirects you:\n")
    print(url)


def cmd_exchange_code(args, cfg: dict) -> None:
    redirect_uri = require(cfg, "PINTEREST_REDIRECT_URI")
    result = oauth_token_request(
        cfg,
        {
            "grant_type": "authorization_code",
            "code": args.code,
            "redirect_uri": redirect_uri,
        },
    )
    save_tokens(cfg, result)
    print("Tokens saved to .env. Access token valid for", result.get("expires_in"), "seconds.")


def cmd_refresh(args, cfg: dict) -> None:
    refresh_token = require(cfg, "PINTEREST_REFRESH_TOKEN")
    result = oauth_token_request(
        cfg, {"grant_type": "refresh_token", "refresh_token": refresh_token}
    )
    save_tokens(cfg, result)
    print("Access token refreshed.")


def save_tokens(cfg: dict, token_response: dict) -> None:
    env_path = Path(cfg["_env_path"])
    expires_at = int(time.time()) + int(token_response.get("expires_in", 0))
    updates = {"PINTEREST_ACCESS_TOKEN": token_response["access_token"], "PINTEREST_TOKEN_EXPIRES_AT": str(expires_at)}
    if token_response.get("refresh_token"):
        updates["PINTEREST_REFRESH_TOKEN"] = token_response["refresh_token"]
    write_env_updates(env_path, updates)
    cfg.update(updates)


def ensure_token(cfg: dict) -> str:
    expires_at = int(cfg.get("PINTEREST_TOKEN_EXPIRES_AT") or 0)
    if not cfg.get("PINTEREST_ACCESS_TOKEN") or time.time() > expires_at - TOKEN_REFRESH_MARGIN_SECONDS:
        refresh_token = require(cfg, "PINTEREST_REFRESH_TOKEN")
        result = oauth_token_request(
            cfg, {"grant_type": "refresh_token", "refresh_token": refresh_token}
        )
        save_tokens(cfg, result)
    return cfg["PINTEREST_ACCESS_TOKEN"]


def api_get(cfg: dict, path: str, params: dict = None) -> list:
    token = ensure_token(cfg)
    headers = {"Authorization": f"Bearer {token}"}
    params = dict(params or {})
    params.setdefault("page_size", 100)
    items = []
    bookmark = None
    while True:
        query = dict(params)
        if bookmark:
            query["bookmark"] = bookmark
        url = f"{API_BASE}{path}?{urllib.parse.urlencode(query)}"
        resp = http_request(url, headers=headers)
        items.extend(resp.get("items", []))
        bookmark = resp.get("bookmark")
        if not bookmark:
            break
    return items


def cmd_list_boards(args, cfg: dict) -> None:
    print(json.dumps(api_get(cfg, "/boards"), indent=2))


def cmd_list_sections(args, cfg: dict) -> None:
    print(json.dumps(api_get(cfg, f"/boards/{args.board_id}/sections"), indent=2))


def cmd_list_pins(args, cfg: dict) -> None:
    if args.section_id:
        path = f"/boards/{args.board_id}/sections/{args.section_id}/pins"
    else:
        path = f"/boards/{args.board_id}/pins"
    print(json.dumps(api_get(cfg, path), indent=2))


def cmd_get_pin(args, cfg: dict) -> None:
    token = ensure_token(cfg)
    url = f"{API_BASE}/pins/{args.pin_id}"
    print(json.dumps(http_request(url, headers={"Authorization": f"Bearer {token}"}), indent=2))


def cmd_search_partner(args, cfg: dict) -> None:
    if cfg.get("PINTEREST_PARTNER_SEARCH_ENABLED", "").lower() != "true":
        sys.exit(
            "search/partner/pins is a beta endpoint gated behind Pinterest content-"
            "partner approval. Set PINTEREST_PARTNER_SEARCH_ENABLED=true in .env only "
            "if your app actually has that access (see references/api-reference.md). "
            "Otherwise use the board/section-based pull workflow instead."
        )
    token = ensure_token(cfg)
    params = {"query": args.query, "country": args.country, "limit": args.limit}
    url = f"{API_BASE}/search/partner/pins?{urllib.parse.urlencode(params)}"
    print(json.dumps(http_request(url, headers={"Authorization": f"Bearer {token}"}), indent=2))


def largest_image(pin: dict):
    images = (pin.get("media") or {}).get("images") or {}
    best = None
    for variant in images.values():
        if not isinstance(variant, dict) or "url" not in variant:
            continue
        area = (variant.get("width") or 0) * (variant.get("height") or 0)
        if best is None or area > best[0]:
            best = (area, variant["url"])
    return best[1] if best else None


def download_file(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "pinterest-design-research-skill"})
    with urllib.request.urlopen(req, timeout=30) as resp, open(dest, "wb") as f:
        f.write(resp.read())


def manifest_entry(pin: dict, image_path: str) -> dict:
    return {
        "id": pin.get("id"),
        "title": pin.get("title"),
        "description": pin.get("description"),
        "alt_text": pin.get("alt_text"),
        "link": pin.get("link"),
        "board_id": pin.get("board_id"),
        "board_section_id": pin.get("board_section_id"),
        "dominant_color": pin.get("dominant_color"),
        "created_at": pin.get("created_at"),
        "image_path": image_path,
    }


def cmd_download_images(args, cfg: dict) -> None:
    pins = json.loads(Path(args.input).read_text())
    out_dir = Path(args.out_dir)
    images_dir = out_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for pin in pins:
        image_url = largest_image(pin)
        if not image_url:
            continue
        ext = Path(urllib.parse.urlparse(image_url).path).suffix or ".jpg"
        dest = images_dir / f"{pin['id']}{ext}"
        if not dest.exists():
            download_file(image_url, dest)
        manifest.append(manifest_entry(pin, str(dest.relative_to(out_dir))))
    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"Downloaded {len(manifest)} images. Manifest: {manifest_path}")


def cmd_pull(args, cfg: dict) -> None:
    sections = api_get(cfg, f"/boards/{args.board_id}/sections")
    section_by_id = {s["id"]: s["name"] for s in sections}
    all_pins = api_get(cfg, f"/boards/{args.board_id}/pins")

    out_dir = Path(args.out_dir)
    images_dir = out_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    manifest = []
    for pin in all_pins:
        image_url = largest_image(pin)
        if not image_url:
            continue
        ext = Path(urllib.parse.urlparse(image_url).path).suffix or ".jpg"
        dest = images_dir / f"{pin['id']}{ext}"
        if not dest.exists():
            download_file(image_url, dest)
        entry = manifest_entry(pin, str(dest.relative_to(out_dir)))
        entry["section_name"] = section_by_id.get(pin.get("board_section_id"))
        manifest.append(entry)

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"Pulled {len(manifest)} pins across {len(sections)} sections.")
    print(f"Manifest: {manifest_path}")
    print(f"Images: {images_dir}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("auth-url", help="Print the OAuth authorization URL to open in a browser")
    p.add_argument("--scopes", default=DEFAULT_SCOPES)
    p.set_defaults(func=cmd_auth_url)

    p = sub.add_parser("exchange-code", help="Exchange an authorization code for tokens, save to .env")
    p.add_argument("--code", required=True)
    p.set_defaults(func=cmd_exchange_code)

    p = sub.add_parser("refresh", help="Force a token refresh (normally automatic)")
    p.set_defaults(func=cmd_refresh)

    p = sub.add_parser("list-boards", help="List the authenticated user's boards")
    p.set_defaults(func=cmd_list_boards)

    p = sub.add_parser("list-sections", help="List sections on a board")
    p.add_argument("--board-id", required=True)
    p.set_defaults(func=cmd_list_sections)

    p = sub.add_parser("list-pins", help="List pins on a board or board section")
    p.add_argument("--board-id", required=True)
    p.add_argument("--section-id")
    p.set_defaults(func=cmd_list_pins)

    p = sub.add_parser("get-pin", help="Get one pin by id")
    p.add_argument("--pin-id", required=True)
    p.set_defaults(func=cmd_get_pin)

    p = sub.add_parser("search-partner", help="Beta partner search (only if your app has access)")
    p.add_argument("--query", required=True)
    p.add_argument("--country", required=True)
    p.add_argument("--limit", type=int, default=25)
    p.set_defaults(func=cmd_search_partner)

    p = sub.add_parser("download-images", help="Download images + write a manifest from a pins JSON file")
    p.add_argument("--input", required=True, help="Path to a JSON file containing a list of pin objects")
    p.add_argument("--out-dir", required=True)
    p.set_defaults(func=cmd_download_images)

    p = sub.add_parser("pull", help="End-to-end: list sections+pins for a board, download images, write manifest")
    p.add_argument("--board-id", required=True)
    p.add_argument("--out-dir", required=True)
    p.set_defaults(func=cmd_pull)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    cfg = load_config()
    args.func(args, cfg)


if __name__ == "__main__":
    main()
