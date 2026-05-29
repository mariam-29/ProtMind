"""
attention.py — Extract and post-process attention weights
----------------------------------------------------------
This module turns the raw attention pooling scores that come out of
ESM2ClassificationHead.forward() into a frontend-ready heatmap payload.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW ATTENTION POOLING WORKS (plain English)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ESM2 runs on your sequence and produces a *hidden state* for every residue.
   Each hidden state is a vector of 640 numbers (for the 150M model) that
   encodes "what this residue means in context".

2. Our classification head has a tiny linear layer called `attention_pool`.
   It reads each residue's 640-dim vector and outputs a single number
   (a "raw importance score").

3. A softmax turns those scores into a probability distribution — values
   now sum to 1.0 and range between 0 and 1.

4. We multiply each residue's hidden state by its weight, then sum
   everything up.  Result: a single 640-dim vector representing the
   whole protein, with important residues contributing more.

5. THAT vector goes into the MLP classifier → GO term predictions.

So the weights tell you: *which residues most influenced the prediction*.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW THE FRONTEND RENDERS A HEATMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The React component receives:
    {
        "residue_attention": [0.02, 0.05, 0.91, 0.88, 0.10, ...]
        "sequence_length": 150
    }

It renders a row of coloured cells — one per residue.
A value close to 0 → pale/white cell.
A value close to 1 → intense/red cell.

Libraries you can use in React:
    - react-heatmap-grid  (simple, works out of the box)
    - d3.js  (full control, more code)
    - Custom CSS with rgba(255, 0, 0, weight)  (simplest)

Example React snippet:
    {sequence.split("").map((aa, i) => (
        <span key={i}
            title={`${aa} — importance: ${weights[i].toFixed(2)}`}
            style={{
                background: `rgba(220, 50, 50, ${weights[i]})`,
                padding: "2px 3px",
                fontFamily: "monospace",
            }}>
            {aa}
        </span>
    ))}
"""

from __future__ import annotations
import logging
from typing import List

import torch

from .utils import minmax_normalise

logger = logging.getLogger("protmind.attention")


def extract_attention_weights(
    pool_weights: torch.Tensor,   # shape: (1, seq_len)  — batch size 1 at inference
    sequence: str,
) -> List[float]:
    """
    Convert raw attention pooling weights (a PyTorch tensor) into a
    plain Python list of floats, one per residue.

    Steps
    -----
    1. Move tensor to CPU (it might be on GPU after inference).
    2. Convert to Python list.
    3. Strip the special [CLS] (index 0) and [EOS] (last index) tokens.
       ESM2 tokeniser adds these; they don't correspond to real residues.
    4. Sanity-check that the remaining length matches the sequence.
    5. Min-max normalise to [0, 1] so the frontend colour scale is consistent.

    Parameters
    ----------
    pool_weights : Tensor of shape (1, tokenised_length)
    sequence     : The original amino acid string (used to verify length)

    Returns
    -------
    List[float] of length len(sequence), values in [0, 1]
    """
    # ── 1 & 2: Tensor → Python list ──────────────────────────────────────
    weights_cpu: List[float] = pool_weights.squeeze(0).cpu().tolist()

    # ── 3: Drop [CLS] and [EOS] tokens ───────────────────────────────────
    # Token layout after ESM2 tokenisation:
    #   [CLS]  A  M  K  T  L  ...  [EOS]
    #     0    1  2  3  4  5  ...   -1
    residue_weights = weights_cpu[1:-1]

    # ── 4: Length check ───────────────────────────────────────────────────
    expected = len(sequence)
    actual   = len(residue_weights)
    if actual != expected:
        logger.warning(
            "Attention weight count (%d) doesn't match sequence length (%d). "
            "This can happen if the sequence was truncated during tokenisation. "
            "Trimming/padding to match.",
            actual, expected,
        )
        # Trim or zero-pad to match
        if actual > expected:
            residue_weights = residue_weights[:expected]
        else:
            residue_weights = residue_weights + [0.0] * (expected - actual)

    # ── 5: Normalise ──────────────────────────────────────────────────────
    normalised = minmax_normalise(residue_weights)
    logger.debug("Attention weights computed for %d residues", len(normalised))

    return normalised


def build_attention_payload(
    pool_weights: torch.Tensor,
    sequence: str,
) -> dict:
    """
    Build the complete attention dict that goes straight into the API response.

    Returns
    -------
    {
        "residue_attention": [0.12, 0.88, ...],
        "sequence_length": 150
    }
    """
    residue_weights = extract_attention_weights(pool_weights, sequence)
    return {
        "residue_attention": residue_weights,
        "sequence_length": len(sequence),
    }