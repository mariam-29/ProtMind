"""
inference.py — End-to-end prediction pipeline
----------------------------------------------
This is the heart of ProtMind.  It takes a raw amino-acid string and
returns GO term predictions + attention weights.
"""

from __future__ import annotations
import logging
from typing import Dict, List, Tuple

import torch
import torch.nn.functional as F

from .attention import build_attention_payload
from .model_loader import ProtMindModel
from .schemas import AttentionData, GOPrediction
from .utils import truncate_sequence, top_k_indices

logger = logging.getLogger("protmind.inference")


# ─────────────────────────────────────────────
# TOKENISATION (FIXED FOR ESM)
# ─────────────────────────────────────────────

def tokenise_sequence(
    sequence: str,
    tokenizer,   # ← actually ESM batch_converter
    device: torch.device,
    max_length: int = 1024,
) -> torch.Tensor:
    """
    Convert amino acid string → ESM tokens tensor.
    """

    sequence = truncate_sequence(sequence, max_len=max_length - 2)

    
    batch_labels, batch_strs, batch_tokens = tokenizer([
        ("protein", sequence)
    ])

    input_ids = batch_tokens.to(device)

    attention_mask = (input_ids != 1).to(device)  # 1 = padding index in ESM

    logger.debug("Tokenised sequence → %d tokens", input_ids.shape[1])

    return input_ids, attention_mask


# ─────────────────────────────────────────────
# CORE INFERENCE
# ─────────────────────────────────────────────

def run_inference(
    sequence: str,
    model: ProtMindModel,
    tokenizer,
    vocab: Dict,
    device: torch.device,
    top_k: int = 10,
    threshold: float = 0.3,
) -> Tuple[List[GOPrediction], AttentionData]:

    input_ids, attention_mask = tokenise_sequence(sequence, tokenizer, device)

    with torch.no_grad():

        if device.type == "cuda":
            with torch.autocast(device_type="cuda", dtype=torch.float16):
                logits, pool_weights = model(input_ids, attention_mask)
        else:
            logits, pool_weights = model(input_ids, attention_mask)

    probs = torch.sigmoid(logits).squeeze(0)
    probs_list = probs.cpu().tolist()

    active_indices = [i for i, p in enumerate(probs_list) if p >= threshold]

    if not active_indices:
        logger.info("No GO term exceeded threshold %.2f — fallback top-1", threshold)
        active_indices = [int(torch.argmax(probs).item())]

    active_scores = [probs_list[i] for i in active_indices]
    sorted_pairs = sorted(zip(active_indices, active_scores), key=lambda x: x[1], reverse=True)
    top_pairs = sorted_pairs[:top_k]

    predictions: List[GOPrediction] = []

    for rank, (idx, conf) in enumerate(top_pairs, start=1):

        
        try:
            go_id = vocab["go_terms"][idx]

            term_info = vocab["vocabulary"].get(
                go_id,
                {"name": "Unknown"}
            )

            go_name = term_info.get("name", "Unknown")

        except Exception as e:

            logger.warning("Vocab lookup failed for idx %s: %s", idx, e)

            go_id = f"GO:{idx:07d}"
            go_name = "Unknown"

        predictions.append(GOPrediction(
            go_id      = go_id,
            go_name    = go_name,
            confidence = round(conf, 4),
            rank       = rank,
        ))

    attention_dict = build_attention_payload(pool_weights, sequence)
    attention_data = AttentionData(**attention_dict)

    return predictions, attention_data


# ─────────────────────────────────────────────
# BATCH INFERENCE (unchanged)
# ─────────────────────────────────────────────

def run_batch_inference(
    sequences: List[str],
    model: ProtMindModel,
    tokenizer,
    vocab: Dict,
    device: torch.device,
    top_k: int = 10,
    threshold: float = 0.3,
):

    results = []

    for seq in sequences:
        preds, attn = run_inference(
            seq,
            model,
            tokenizer,
            vocab,
            device,
            top_k,
            threshold
        )

        results.append((preds, attn))

    return results