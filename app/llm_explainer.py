"""
llm_explainer.py — Local LLM via Ollama for biological explanations
---------------------------------------------------------------------
Ollama runs a local LLM server (e.g. llama3, mistral) on your machine.
We send it a carefully crafted prompt and get back a plain-English
explanation of the predicted protein functions.

WHY LOCAL LLM INSTEAD OF GPT-4?
    - No API key required — works offline
    - No per-call cost
    - Data stays on your machine (important for proprietary sequences)
    - Ollama is easy to install and runs on CPU if needed

ANTI-HALLUCINATION DESIGN
    The prompt explicitly lists the ACTUAL predicted GO terms and tells
    the model to explain ONLY those — never to speculate or add terms
    that aren't in the list.  This is called "grounded generation".
"""

from __future__ import annotations
import logging
import os
from typing import List

import httpx   # async HTTP client — much better than requests for FastAPI

from .schemas import GOPrediction

logger = logging.getLogger("protmind.llm_explainer")

# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL",    "llama3")   # or "mistral"
OLLAMA_TIMEOUT  = float(os.getenv("OLLAMA_TIMEOUT", "10"))   # seconds

# If the LLM takes longer than this we return a fallback message
# instead of making the user wait forever
MAX_WAIT_SECONDS = 90.0


# ─────────────────────────────────────────────
# PROMPT ENGINEERING
# ─────────────────────────────────────────────

def build_prompt(sequence: str, predictions: List[GOPrediction]) -> str:
    """
    Construct the prompt we send to the LLM.

    PROMPT ENGINEERING PRINCIPLES USED HERE:
    1. Role assignment — "You are an expert biochemist…" primes the model
       to use domain vocabulary.
    2. Explicit constraint — "Explain ONLY the GO terms listed below"
       prevents hallucination.
    3. Structured input — we give the model a clear, formatted list of
       terms and confidences so it doesn't have to infer them.
    4. Output format instruction — we ask for 3 concise paragraphs so the
       response fits cleanly in the frontend card.
    5. Confidence-awareness — asking the model to note high-confidence
       predictions helps it write a more nuanced explanation.
    """
    seq_preview = sequence[:60] + ("..." if len(sequence) > 60 else "")

    # Format predictions as a numbered list with confidences
    pred_lines = "\n".join(
        f"  {p.rank}. {p.go_id} — {p.go_name} (confidence: {p.confidence:.0%})"
        for p in predictions
    )

    high_conf = [p for p in predictions if p.confidence >= 0.7]
    high_conf_names = ", ".join(p.go_name for p in high_conf) if high_conf else "none above 70%"

    prompt = f"""You are an expert biochemist and structural biologist helping researchers understand protein function predictions made by an AI system.

A protein sequence has been analysed and the following Gene Ontology Molecular Function (GO MF) terms have been predicted:

{pred_lines}

Protein sequence (first 60 residues): {seq_preview}
Total sequence length: {len(sequence)} amino acids
High-confidence predictions (≥70%): {high_conf_names}

Your task:
1. Write a concise BIOLOGICAL SUMMARY (2–3 sentences) explaining what molecular functions this protein likely performs, based ONLY on the GO terms listed above.
2. Write a brief FUNCTIONAL CONTEXT paragraph explaining the biological significance of the most confident predictions — what cellular processes do these functions contribute to?
3. Write a SHORT CONFIDENCE NOTE (1 sentence) about the reliability of these predictions, mentioning if any predictions are below 50% confidence.

IMPORTANT RULES:
- ONLY explain the GO terms listed above. Do NOT add or invent other functions.
- Use plain language that a biology graduate student can understand.
- Be specific about molecular mechanisms where possible.
- Do NOT start with "Based on the predictions" or "According to the model".
- Keep total response under 200 words.

Respond directly with the three sections, no headers needed."""

    return prompt


# ─────────────────────────────────────────────
# OLLAMA CLIENT
# ─────────────────────────────────────────────

async def check_ollama_health() -> bool:
    """
    Ping the Ollama server to see if it's running.
    Returns True if reachable, False otherwise.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


async def generate_explanation(
    sequence: str,
    predictions: List[GOPrediction],
) -> str:
    """
    Call the local Ollama LLM and return its biological explanation.

    We use the /api/generate endpoint (non-streaming) for simplicity.
    If you want streaming responses (text appears word by word in the UI),
    use the stream=True endpoint instead.

    Returns a plain-text explanation string, or a fallback message
    if Ollama is unavailable or times out.
    """
    if not predictions:
        return "No GO terms were predicted with sufficient confidence to generate an explanation."

    prompt = prompt = f"""
    You are a bioinformatics expert.
    Given these GO predictions:
    {predictions}
    Only explain based on these GO terms.
    Do not invent new functions.
    """
    #build_prompt(sequence, predictions)
    

    payload = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,          # get the full response at once
        "options": {
            "temperature": 0.3,   # lower = more factual, less creative
            "top_p":       0.9,
            "num_predict": 400,   # max tokens in response (≈ 300 words)
            "stop": ["###", "---"],  # stop sequences prevent rambling
        },
    }

    logger.info("Sending prompt to Ollama (model=%s, %d predictions)", OLLAMA_MODEL, len(predictions))

    try:
        async with httpx.AsyncClient(timeout=MAX_WAIT_SECONDS) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=payload,
            )
            response.raise_for_status()   # raises if HTTP status is 4xx or 5xx

            data = response.json()
            explanation = data.get("response", "").strip()

            if not explanation:
                return _fallback_explanation(predictions)

            logger.info("LLM explanation generated (%d chars)", len(explanation))
            return explanation

    except httpx.TimeoutException:
        logger.warning("Ollama request timed out after %.0f seconds", MAX_WAIT_SECONDS)
        return _fallback_explanation(predictions, reason="LLM timed out")

    except httpx.ConnectError:
        logger.warning("Could not connect to Ollama at %s. Is it running?", OLLAMA_BASE_URL)
        return _fallback_explanation(predictions, reason="Ollama not running")

    except Exception as e:
        logger.error("Unexpected error calling Ollama: %s", e, exc_info=True)
        return _fallback_explanation(predictions, reason=str(e))


def _fallback_explanation(predictions: List[GOPrediction], reason: str = "") -> str:
    """
    When the LLM is unavailable, generate a simple rule-based explanation
    so the API still returns something useful.

    This is NOT an AI explanation — it's a template.  We label it clearly
    so the frontend can show a disclaimer.
    """
    top3 = predictions[:3]
    term_list = "; ".join(f"{p.go_name} ({p.confidence:.0%})" for p in top3)
    suffix = f" (Note: LLM unavailable — {reason})" if reason else " (LLM unavailable)"

    return (
        f"[Template explanation{suffix}] "
        f"This protein is predicted to perform the following molecular functions: {term_list}. "
        f"A total of {len(predictions)} GO Molecular Function terms were predicted above the "
        f"confidence threshold. For detailed biological interpretation, ensure Ollama is running "
        f"with '{OLLAMA_MODEL}' model loaded."
    )