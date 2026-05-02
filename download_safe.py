import os
import time
import requests
from duckduckgo_search import DDGS
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))
from main import CARDS

os.makedirs('public/cards', exist_ok=True)

def download_image(card):
    card_id = card['id']
    query = f"{card['issuer']} {card['name']} credit card official"
    
    # Check if already exists
    if os.path.exists(f"public/cards/{card_id}.png") or os.path.exists(f"public/cards/{card_id}.jpg"):
        print(f"Skipping {card_id}, already exists.")
        return

    print(f"Searching for {card_id}...")
    try:
        results = DDGS().images(keywords=query, max_results=3)
        for res in results:
            url = res['image']
            if not url.endswith(('.png', '.jpg', '.jpeg')):
                continue
                
            print(f"Found URL for {card_id}: {url}")
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            resp = requests.get(url, headers=headers, timeout=5)
            if resp.status_code == 200:
                ext = 'png' if url.endswith('.png') else 'jpg'
                with open(f"public/cards/{card_id}.{ext}", 'wb') as f:
                    f.write(resp.content)
                print(f"Successfully downloaded {card_id}")
                return
    except Exception as e:
        print(f"Error for {card_id}: {e}")

for card in CARDS:
    download_image(card)
    time.sleep(2) # Sleep to avoid rate limits

print("Finished processing all cards.")
