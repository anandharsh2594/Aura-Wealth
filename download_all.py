import os
import requests
from duckduckgo_search import DDGS
import sys

# Add backend to path to import CARDS
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from main import CARDS

os.makedirs('public/cards', exist_ok=True)

def download_image(card_id, query):
    if os.path.exists(f"public/cards/{card_id}.png"):
        return True
    
    try:
        results = DDGS().images(
            keywords=query,
            max_results=5
        )
        for res in results:
            url = res['image']
            if not url.endswith(('.png', '.webp', '.jpg')):
                continue
            
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                with open(f"public/cards/{card_id}.png", 'wb') as f:
                    f.write(response.content)
                print(f"Downloaded {card_id}")
                return True
        print(f"Failed to find valid image for {card_id}")
        return False
    except Exception as e:
        print(f"Error for {card_id}: {e}")
        return False

# Download concurrently
import concurrent.futures

with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    futures = []
    for card in CARDS:
        card_id = card['id']
        # We want transparent or high quality PNGs if possible
        query = f"{card['issuer']} {card['name']} credit card transparent"
        futures.append(executor.submit(download_image, card_id, query))
    
    concurrent.futures.wait(futures)

print("Done downloading all available images.")
