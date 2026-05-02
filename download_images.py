import urllib.request
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

urls = {
    "hdfc-infinia": "https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/652f144e-173a-4467-85b4-4b534d943a4e",
    "axis-magnus": "https://www.axisbank.com/images/default-source/revamp_new/cards/magnus-credit-card-new.png",
    "axis-atlas": "https://www.axisbank.com/images/default-source/revamp_new/cards/atlas-credit-card.png",
    "sbi-octane": "https://www.sbicard.com/sbi-card-en/assets/media/images/personal/credit-cards/travel/bpcl-octane/bpcl-sbi-card-octane.png",
    "hsbc-liveplus": "https://www.hsbc.co.in/content/dam/hsbc/in/images/credit-cards/hsbc-live-plus-credit-card-480x300.png",
    "amex-platinum": "https://icm.aexp-static.com/Internet/IMAGIN/IN_en/703_1_Solid_Platinum_Card_270x173.png",
    "sbi-cashback": "https://www.sbicard.com/sbi-card-en/assets/media/images/personal/credit-cards/shopping/cashback-sbi-card/cashback-sbi-card.png"
}

os.makedirs("public/cards", exist_ok=True)

for card_id, url in urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response, open(f"public/cards/{card_id}.png", 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"Downloaded {card_id}")
    except Exception as e:
        print(f"Failed {card_id}: {e}")

