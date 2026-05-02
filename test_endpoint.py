import urllib.request
import json

data = {
    "profile": {
        "income": 100000,
        "creditScore": 750,
        "categories": {
            "dining": 1000,
            "travel": 500,
            "fuel": 0,
            "groceries": 0,
            "onlineShopping": 0,
            "utilityBills": 0,
            "jewelry": 0,
            "other": 0
        },
        "isMonthly": True
    },
    "result": {
        "netSavings": 5000,
        "totalAnnualRewards": 6000,
        "totalAnnualFees": 1000,
        "recommendedCards": [
            {"card": {"name": "HDFC Infinia Metal Edition"}}
        ]
    }
}

req = urllib.request.Request(
    "http://127.0.0.0:8000/explain",
    json.dumps(data).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as res:
        print(res.read().decode())
except Exception as e:
    print("Error:", e)
