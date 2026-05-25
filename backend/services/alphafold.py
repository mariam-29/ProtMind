import urllib.request
from typing import List, Dict
from .cache import get_cached_response, set_cached_response

class HeadRequest(urllib.request.Request):
    def get_method(self):
        return "HEAD"

def check_url_exists(url: str) -> bool:
    cache_key = f"head_check_{url}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    try:
        req = HeadRequest(url, headers={"User-Agent": "ProtMind-Bioinformatics-Platform/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            exists = response.status == 200
            set_cached_response(cache_key, exists, expire_hours=48)
            return exists
    except Exception:
        set_cached_response(cache_key, False, expire_hours=48)
        return False

def get_structure_info(accession: str, pdb_ids: List[str]) -> Dict[str, str]:
    af_url = f"https://alphafold.ebi.ac.uk/files/AF-{accession.upper()}-F1-model_v4.cif"
    
    # Check if AlphaFold model exists
    if check_url_exists(af_url):
        return {
            "url": af_url,
            "source": "AlphaFold",
            "label": f"AF-{accession.upper()}-F1"
        }
        
    # If not found, fall back to PDB structure if available
    if pdb_ids and len(pdb_ids) > 0:
        pdb_id = pdb_ids[0].upper()
        pdb_url = f"https://files.rcsb.org/download/{pdb_id}.cif"
        return {
            "url": pdb_url,
            "source": "PDB",
            "label": f"PDB-{pdb_id}"
        }
        
    # Default fallback
    default_pdb = "1TRZ"
    return {
        "url": f"https://files.rcsb.org/download/{default_pdb}.cif",
        "source": "PDB Fallback",
        "label": f"PDB-{default_pdb} (Fallback)"
    }
