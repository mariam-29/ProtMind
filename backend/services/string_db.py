import urllib.request
import urllib.parse
import json
from typing import List, Dict, Any
from .cache import get_cached_response, set_cached_response

def fetch_string_interactions(accession: str) -> List[Dict[str, Any]]:
    url = f"https://string-db.org/api/json/network?identifiers={urllib.parse.quote(accession)}&species=9606"
    
    cached = get_cached_response(url)
    if cached is not None:
        return cached

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "ProtMind-Bioinformatics-Platform/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            
            # Normalize list of interactions
            interactions = []
            for item in data:
                interactions.append({
                    "protein_a": item.get("preferredName_A"),
                    "protein_b": item.get("preferredName_B"),
                    "score": item.get("score"),
                    "experimental_score": item.get("escore"),
                    "database_score": item.get("dscore")
                })
            
            # Limit to top 20 interactions to avoid cluttering and slow load times
            interactions = sorted(interactions, key=lambda x: x.get("score", 0), reverse=True)[:20]
            
            set_cached_response(url, interactions, expire_hours=48)
            return interactions
    except Exception as e:
        print(f"STRING API error calling {url}: {e}")
        return []
