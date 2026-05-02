import urllib.request
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

cards = [
    ("hdfc-infinia", "https://cardinsider.com/wp-content/uploads/2021/07/HDFC-Bank-Infinia-Credit-Card-Metal-Edition.png"),
    ("axis-magnus", "https://cardinsider.com/wp-content/uploads/2021/09/Axis-Bank-Magnus-Credit-Card.png"),
    ("axis-atlas", "https://cardinsider.com/wp-content/uploads/2022/02/Axis-Bank-Atlas-Credit-Card.png"),
    ("sbi-octane", "https://cardinsider.com/wp-content/uploads/2021/03/BPCL-SBI-Card-Octane.png"),
    ("hsbc-liveplus", "https://cardinsider.com/wp-content/uploads/2024/06/HSBC-Live-Credit-Card.png"),
    ("amex-platinum", "https://cardinsider.com/wp-content/uploads/2021/05/Amex-Platinum-Card.png"),
    ("sbi-cashback", "https://cardinsider.com/wp-content/uploads/2022/09/Cashback-SBI-Credit-Card-1.png"),
    ("hdfc-millennia", "https://cardinsider.com/wp-content/uploads/2021/07/HDFC-Bank-Millennia-Credit-Card.png"),
    ("sbi-elite", "https://cardinsider.com/wp-content/uploads/2021/03/SBI-Card-Elite.png"),
    ("axis-ace", "https://cardinsider.com/wp-content/uploads/2021/09/Axis-Bank-ACE-Credit-Card.png")
]

os.makedirs("public/cards", exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Referer': 'https://cardinsider.com/'
}

for card_id, url in cards:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response, open(f"public/cards/{card_id}.png", 'wb') as out_file:
            out_file.write(response.read())
            print(f"Success: {card_id}")
    except Exception as e:
        print(f"Error {card_id}: {e}")
