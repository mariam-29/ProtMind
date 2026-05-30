import json
import httpx
import time

def test_rag_and_prediction():
    base_url = "http://localhost:8002"
    
    print("==================================================")
    print("STEP 1: Registering a test user for JWT Auth...")
    print("==================================================")
    signup_payload = {
        "email": "test_researcher_rag@protmind.com",
        "password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "Researcher",
        "institution": "ProtMind Labs",
        "role": "Researcher"
    }
    
    try:
        resp = httpx.post(f"{base_url}/api/auth/signup", json=signup_payload, timeout=10.0)
        if resp.status_code == 200:
            token = resp.json()["access_token"]
            print("[SUCCESS] User registered successfully!")
        else:
            print("[WARNING] User already registered. Logging in instead...")
            login_payload = {
                "email": signup_payload["email"],
                "password": signup_payload["password"]
            }
            resp = httpx.post(f"{base_url}/api/auth/login", json=login_payload, timeout=10.0)
            token = resp.json()["access_token"]
            print("[SUCCESS] Logged in successfully!")
    except Exception as e:
        print(f"[ERROR] Connection or Auth failed: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("\n==================================================")
    # Human Insulin sequence (P01308)
    insulin_sequence = "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSIC"
    print("STEP 2: Querying /api/predict/function for Insulin (P01308)...")
    print("==================================================")
    predict_payload = {
        "sequence": insulin_sequence,
        "protein_id": "P01308"
    }
    
    try:
        resp = httpx.post(f"{base_url}/api/predict/function", json=predict_payload, headers=headers, timeout=30.0)
        assert resp.status_code == 200, f"Request failed: {resp.text}"
        data = resp.json()
    except Exception as e:
        print(f"[ERROR] Request to prediction API failed: {e}")
        return

    print("\n--- API RESPONSE ---")
    print(f"Model Version: {data.get('model_version')}")
    
    print("\nPredicted GO Molecular Functions:")
    for pred in data.get("predictions", []):
        print(f"  - {pred['go_id']}: {pred['term']} (Confidence: {pred['confidence']:.1f}%)")
        
    print(f"\nAttention Weights (first 10 residues):")
    print(f"  {data.get('attributions', [])[:10]}... (Total: {len(data.get('attributions', []))} residues)")

    print("\nRAG Vector Database Chunks Retrieved:")
    for idx, chunk in enumerate(data.get("retrieved_chunks", [])):
        print(f"  [{idx + 1}] Source: {chunk.get('uniprot_id')} | Match Score: {chunk.get('similarity_score', 0.0) * 100:.1f}%")
        print(f"      Content Snippet: {chunk.get('content')[:120].replace('\n', ' ')}...")

    print("\nGenerated Biological Explanation:")
    print("--------------------------------------------------")
    print(data.get("rag_explanation"))
    print("--------------------------------------------------")
    
    print("\nExact Prompt Sent to LLM:")
    print("==================================================")
    print(data.get("augmented_prompt")[:450] + "\n...[TRUNCATED PROMPT]...")
    print("==================================================")

if __name__ == "__main__":
    time.sleep(2.0)
    test_rag_and_prediction()
