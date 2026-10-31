#!/usr/bin/env python3
"""Check the vendored contracts: every file matches contracts/VERSION.json, and (with --against DIR, a checkout of
llmops-platform at that ref) every file equals the back end's own copy.
Usage: check_contracts.py [--against _platform]"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ap = argparse.ArgumentParser()
ap.add_argument("--against", type=Path)
a = ap.parse_args()
meta = json.loads((ROOT / "contracts/VERSION.json").read_text(encoding="utf-8"))
bad = []
present = {str(p.relative_to(ROOT / "contracts")) for p in (ROOT / "contracts").rglob("*")
           if p.is_file() and p.name != "VERSION.json"}
for rel in sorted(present ^ set(meta["files"])):
    bad.append(f"{rel}: listed in VERSION.json but missing, or present but not listed")
for rel, digest in meta["files"].items():
    p = ROOT / "contracts" / rel
    if p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest() != digest:
        bad.append(f"{rel}: edited by hand (SHA-256 differs from VERSION.json)")
    if a.against is not None:
        theirs = a.against / "contracts" / rel
        if not theirs.is_file() or theirs.read_bytes() != p.read_bytes():
            bad.append(f"{rel}: differs from {meta['repo']}@{meta['ref']}")
for b in bad:
    print("  " + b)
print(f"contracts {meta['repo']}@{meta['ref']}: {len(meta['files'])} files, {len(bad)} problems")
sys.exit(1 if bad else 0)
