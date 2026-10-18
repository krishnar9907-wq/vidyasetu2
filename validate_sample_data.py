"""Automated checks for data/sample.json. Run: python3 tests/validate_sample_data.py"""
import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data" / "sample.json"
LEVELS = {"school", "college", "competitive"}
failures = []


def check(cond, msg):
    print(("PASS  " if cond else "FAIL  ") + msg)
    if not cond:
        failures.append(msg)


data = json.loads(DATA.read_text(encoding="utf-8"))
check(all(k in data for k in ("library", "mentors", "opportunities", "sports")), "all four collections present")

for name in ("library", "mentors", "opportunities"):
    ids = [x["id"] for x in data[name]]
    check(len(ids) == len(set(ids)), f"{name}: ids are unique")

check(all(x["level"] in LEVELS for x in data["library"]), "library: every level is valid")
check({x["level"] for x in data["library"]} == LEVELS, "library: all three levels have content")
check(all(x["official_url"].startswith("https://") for x in data["opportunities"]), "opportunities: all links use https")
check(all("fictional" in m["bio"].lower() for m in data["mentors"]), "mentors: every profile is labelled fictional")
check(all(s["stages"] and all(st["checklist"] for st in s["stages"]) for s in data["sports"]), "sports: every stage has a checklist")

print(f"\n{len(failures)} failure(s)")
sys.exit(1 if failures else 0)
