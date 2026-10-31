#!/usr/bin/env python3
"""Write contracts/VERSION.json: where the vendored contracts come from and each file's SHA-256.
Usage: contracts_version.py --repo <owner>/llmops-platform --ref <tag or main> [--commit <sha>]"""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ap = argparse.ArgumentParser()
ap.add_argument("--repo", required=True)
ap.add_argument("--ref", required=True)
ap.add_argument("--commit")
a = ap.parse_args()
files = {str(p.relative_to(ROOT / "contracts")): hashlib.sha256(p.read_bytes()).hexdigest()
         for p in sorted((ROOT / "contracts").rglob("*")) if p.is_file() and p.name != "VERSION.json"}
(ROOT / "contracts/VERSION.json").write_text(json.dumps(
    {"repo": a.repo, "ref": a.ref, "commit": a.commit, "files": files}, indent=2) + "\n", encoding="utf-8")
print(f"contracts/VERSION.json: {len(files)} files from {a.repo}@{a.ref}")
