#!/usr/bin/env python3
"""Stdlib-only client for the pinterest-design-research Netlify proxy.

Unlike pinterest_client.py (which needs a Pinterest app id/secret and does
the OAuth dance locally), this talks to a small serverless proxy that holds
the real Pinterest credentials and tokens server-side. Only two values are
needed here, read from .env / PINTEREST_DOTENV_PATH same as the other
script:

  PINTEREST_PROXY_URL      e.g. https://kws-pinterest-proxy.netlify.app
  PINTEREST_PROXY_SECRET   the shared secret configured on that site

Images are still downloaded directly from Pinterest's CDN (i.pinimg.com) by
this script, client-side — the proxy only relays pin metadata, never image
bytes. Output shape (manifest.json + images/) matches pinterest_client.py's
`pull` command exactly, so the rest of the skill doesn't care which client
produced it.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


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
        values[key.strip()] = val.strip().strip('"').strip("'")
    return values


def load_config() -> dict:
    env_path = find_env_path()
    file_values = read_env(env_path)
    merged = {**file_values, **{k: v for k, v in os.environ.items() if k.startswith("PINTEREST_PROXY_")}}
    merged["_env_path"] = str(env_path)
    return merged


def require(cfg: dict, key: str) -> str:
    val = cfg.get(key)
    if not val:
        sys.exit(
            f"Missing {key} in {cfg.get('_env_path')} (or env). "
            f"Set PINTEREST_PROXY_URL and PINTEREST_PROXY_SECRET — see "
            f"references/remote-proxy.md."
        )
    return val


def call(cfg: dict, path: str, params: dict = None) -> dict:
    base = require(cfg, "PINTEREST_PROXY_URL").rstrip("/")
    secret = require(cfg, "PINTEREST_PROXY_SECRET")
    query = dict(params or {})
    query["secret"] = secret
    url = f"{base}{path}?{urllib.parse.urlencode(query)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        sys.exit(f"Proxy error {e.code} on {path}: {detail}")


def download_file(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "pinterest-design-research-skill"})
    with urllib.request.urlopen(req, timeout=30) as resp, open(dest, "wb") as f:
        f.write(resp.read())


def cmd_list_boards(args, cfg: dict) -> None:
    print(json.dumps(call(cfg, "/api/boards"), indent=2))


def cmd_status(args, cfg: dict) -> None:
    params = {"board_id": args.board_id}
    if args.ack:
        params["ack"] = "1"
    print(json.dumps(call(cfg, "/api/status", params), indent=2))


def cmd_pull(args, cfg: dict) -> None:
    result = call(cfg, "/api/pull", {"board_id": args.board_id})
    pins = result["pins"]

    out_dir = Path(args.out_dir)
    images_dir = out_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    manifest = []
    for pin in pins:
        image_url = pin.pop("image_url", None)
        if not image_url:
            continue
        ext = Path(urllib.parse.urlparse(image_url).path).suffix or ".jpg"
        dest = images_dir / f"{pin['id']}{ext}"
        if not dest.exists():
            download_file(image_url, dest)
        pin["image_path"] = str(dest.relative_to(out_dir))
        manifest.append(pin)

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"Pulled {len(manifest)} pins across {result['section_count']} sections (via proxy).")
    print(f"Manifest: {manifest_path}")
    print(f"Images: {images_dir}")

    if args.ack:
        call(cfg, "/api/status", {"board_id": args.board_id, "ack": "1"})
        print("Acknowledged: baseline updated on the proxy.")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("list-boards", help="List the authenticated user's boards")
    p.set_defaults(func=cmd_list_boards)

    p = sub.add_parser("status", help="Check whether a board changed since the last acknowledged baseline")
    p.add_argument("--board-id", required=True)
    p.add_argument("--ack", action="store_true", help="Commit the current state as the new baseline")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("pull", help="Pull a board's pins + download images + write a manifest")
    p.add_argument("--board-id", required=True)
    p.add_argument("--out-dir", required=True)
    p.add_argument("--ack", action="store_true", help="Also acknowledge the proxy's change baseline after a successful pull")
    p.set_defaults(func=cmd_pull)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    cfg = load_config()
    args.func(args, cfg)


if __name__ == "__main__":
    main()
