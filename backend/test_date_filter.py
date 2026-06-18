"""Quick test of the /expenses date filter."""
import urllib.request
import json

TOKEN = None

# Login first
login_data = json.dumps({"email": "user@example.com", "password": "password123"}).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/auth/login",
    data=login_data,
    headers={"Content-Type": "application/json"},
)
resp = urllib.request.urlopen(req)
TOKEN = json.loads(resp.read())["access_token"]
print(f"Got token (len={len(TOKEN)})")

def fetch(url):
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read())

# Test 1: No date filter
all_data = fetch("http://127.0.0.1:8000/expenses?limit=100")
print(f"\nAll expenses (no date filter): {len(all_data)} items")
for d in all_data[:3]:
    print(f"  {d['title']} | {d['expense_date']} | {d['amount']}")

# Test 2: With date filter
filtered = fetch("http://127.0.0.1:8000/expenses?start_date=2026-06-01&end_date=2026-06-10&limit=100")
print(f"\nFiltered (Jun 1-10): {len(filtered)} items")
for d in filtered:
    print(f"  {d['title']} | {d['expense_date']} | {d['amount']}")

# Test 3: All unique dates
dates = sorted(set(d["expense_date"] for d in all_data))
print(f"\nAll unique expense dates: {dates}")
