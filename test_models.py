import urllib.request
import json
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if not api_key:
    print("No API key found in .env!")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read().decode())
        print("Available Models:")
        for model in data.get('models', []):
            if 'generateContent' in model.get('supportedGenerationMethods', []):
                print(f"- {model['name']}")
except Exception as e:
    print(f"Error fetching models: {e}")
