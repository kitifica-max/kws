#!/usr/bin/env python3
"""Stdlib-only client for the pinterest-design-research proxy.

No Pinterest app, no OAuth, no API keys, no .env: the plugin ships with the
proxy URL baked in, and the proxy holds every real credential server-side
(Netlify env vars + Blobs). All you get here are the board's pins.

  PINTEREST_PROXY_URL      optional override of the baked-in proxy URL
  PINTEREST_PROXY_SECRET   optional; only needed against a proxy that still
                           requires a shared secret on its read endpoints

Images are downloaded directly from Pinterest's CDN (i.pinimg.com) by this
script — the proxy only relays pin metadata, never image bytes. Output shape
(manifest.json + images/) is what the rest of the skill consumes.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_PROXY_URL = "https://pinplug.kitifica.com"
# The curated "UI Reference" board this plugin reads. Override per call with
# --board-id (the proxy only serves boards it has been configured to expose).
DEFAULT_BOARD_ID = "1115063257681091512"


def call(path: str, params: dict = None) -> dict:
    base = (os.environ.get("PINTEREST_PROXY_URL") or DEFAULT_PROXY_URL).rstrip("/")
    query = dict(params or {})
    headers = {"Accept": "application/json"}
    secret = os.environ.get("PINTEREST_PROXY_SECRET", "").strip()
    if secret:
        headers["x-proxy-secret"] = secret
    url = f"{base}{path}" + (f"?{urllib.parse.urlencode(query)}" if query else "")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        try:  # proxies answer {"error": "..."}; show the sentence, not the JSON
            message = json.loads(detail).get("error") or detail
        except (ValueError, AttributeError):
            message = detail
        sys.exit(f"Proxy error {e.code} on {path}: {message}")


def download_file(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "pinterest-design-research-skill"})
    with urllib.request.urlopen(req, timeout=30) as resp, open(dest, "wb") as f:
        f.write(resp.read())


def cmd_list_boards(args) -> None:
    print(json.dumps(call("/api/boards"), indent=2))


def cmd_status(args) -> None:
    params = {"board_id": args.board_id}
    if args.ack:
        params["ack"] = "1"
    print(json.dumps(call("/api/status", params), indent=2))


def cmd_pull(args) -> None:
    result = call("/api/pull", {"board_id": args.board_id})
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
    print(f"Pulled {len(manifest)} pins across {result['section_count']} sections.")
    print(f"Manifest: {manifest_path}")
    print(f"Images: {images_dir}")

    if args.ack:
        call("/api/status", {"board_id": args.board_id, "ack": "1"})
        print("Acknowledged: baseline updated on the proxy.")


def add_board_arg(parser) -> None:
    parser.add_argument(
        "--board-id",
        default=DEFAULT_BOARD_ID,
        help=f"Board to read (default: the plugin's curated board {DEFAULT_BOARD_ID})",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("list-boards", help="List the boards this proxy exposes")
    p.set_defaults(func=cmd_list_boards)

    p = sub.add_parser("status", help="Check whether a board changed since the last acknowledged baseline")
    add_board_arg(p)
    p.add_argument("--ack", action="store_true", help="Commit the current state as the new baseline")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("pull", help="Pull a board's pins + download images + write a manifest")
    add_board_arg(p)
    p.add_argument("--out-dir", required=True)
    p.add_argument("--ack", action="store_true", help="Also acknowledge the proxy's change baseline after a successful pull")
    p.set_defaults(func=cmd_pull)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
