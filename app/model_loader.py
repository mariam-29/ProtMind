"""
model_loader.py — Load ESM2 + fine-tuned classification head
-------------------------------------------------------------
Responsible for loading the model + vocabulary for inference.
"""

from __future__ import annotations
import json
import logging
import os
from pathlib import Path
from typing import Dict, Tuple

import torch
import torch.nn as nn
import esm

logger = logging.getLogger("protmind.model_loader")


# ─────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────

NUM_LABELS = int(os.getenv("NUM_LABELS", "818"))

MODELS_DIR = Path(__file__).parent.parent / "models"

CHECKPOINT = MODELS_DIR / "best_model_optimized.pt"

VOCAB_FILE = MODELS_DIR / "go_mf_vocabulary.json"


# ─────────────────────────────────────────────
# CLASSIFICATION HEAD
# ─────────────────────────────────────────────

class ESM2ClassificationHead(nn.Module):

    def __init__(self, hidden_size: int, num_labels: int, dropout: float = 0.1):
        super().__init__()

        self.attention_pool = nn.Linear(hidden_size, 1)
        self.norm = nn.LayerNorm(hidden_size)
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_size, 512)
        self.act = nn.GELU()
        self.fc2 = nn.Linear(512, num_labels)

    def forward(self, hidden_states, attention_mask):
        raw_weights = self.attention_pool(hidden_states).squeeze(-1)

        if attention_mask is not None:
            raw_weights = raw_weights.masked_fill(
                attention_mask == 0,
                float("-inf")
            )

        pool_weights = torch.softmax(raw_weights, dim=-1)

        pooled = (pool_weights.unsqueeze(-1) * hidden_states).sum(dim=1)

        x = self.norm(pooled)
        x = self.dropout(x)
        x = self.fc1(x)
        x = self.act(x)
        x = self.dropout(x)
        logits = self.fc2(x)

        return logits, pool_weights


# ─────────────────────────────────────────────
# FULL MODEL
# ─────────────────────────────────────────────

class ProtMindModel(nn.Module):

    def __init__(self, esm_model, num_labels, padding_idx=1, dropout=0.1):
        super().__init__()

        self.esm = esm_model

        # ESM2-150M settings
        self.num_layers = 30
        self.padding_idx = padding_idx
        self.hidden_dim = 640

        # ─────────────────────────────
        # ATTENTION POOLING
        # ─────────────────────────────
        self.attn_pool = nn.Linear(self.hidden_dim, 1)

        # ─────────────────────────────
        # NORMALIZATION
        # ─────────────────────────────
        self.layer_norm = nn.LayerNorm(self.hidden_dim)

        # ─────────────────────────────
        # CLASSIFIER
        # ─────────────────────────────
        self.classifier = nn.Sequential(
        nn.Linear(self.hidden_dim, 512),
        nn.GELU(),
        nn.Dropout(dropout),
        nn.Linear(512, num_labels)
    )

    def forward(self, tokens, attention_mask=None):

        # ─────────────────────────────
        # ESM FORWARD
        # ─────────────────────────────
        out = self.esm(
            tokens,
            repr_layers=[self.num_layers],
            return_contacts=False
        )

        hidden_states = out["representations"][self.num_layers]

        # ─────────────────────────────
        # ATTENTION MASK
        # ─────────────────────────────
        if attention_mask is None:
            attention_mask = (tokens != self.padding_idx)

        # ─────────────────────────────
        # ATTENTION POOLING
        # ─────────────────────────────
        raw_weights = self.attn_pool(hidden_states).squeeze(-1)

        raw_weights = raw_weights.masked_fill(
            attention_mask == 0,
            float("-inf")
        )

        pool_weights = torch.softmax(raw_weights, dim=-1)

        pooled = (
            pool_weights.unsqueeze(-1) * hidden_states
        ).sum(dim=1)

        # ─────────────────────────────
        # CLASSIFICATION
        # ─────────────────────────────
        pooled = self.layer_norm(pooled)

        logits = self.classifier(pooled)

        return logits, pool_weights

# ─────────────────────────────────────────────
# LOADER
# ─────────────────────────────────────────────

def load_model_and_vocab():

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info("Using device: %s", device)

    if device.type == "cuda":
        logger.info(
            "GPU: %s | VRAM: %.1f GB",
            torch.cuda.get_device_name(0),
            torch.cuda.get_device_properties(0).total_memory / 1e9
        )

    # ─────────────────────────────────────────
    # LOAD ESM MODEL (FIXED HERE)
    # ─────────────────────────────────────────

    logger.info("Loading ESM2 150M model...")

    esm_model, alphabet = esm.pretrained.esm2_t30_150M_UR50D()

    # IMPORTANT: move ESM model to device
    esm_model = esm_model.to(device)
    esm_model.eval()

    # ─────────────────────────────────────────
    # BUILD PROTMIND MODEL (FIXED esm_model bug)
    # ─────────────────────────────────────────

    model = ProtMindModel(
        esm_model=esm_model,   
        num_labels=NUM_LABELS,
        padding_idx=alphabet.padding_idx,
        dropout=0.1
    )

    # ─────────────────────────────────────────
    # LOAD CHECKPOINT
    # ─────────────────────────────────────────

    if CHECKPOINT.exists():
        logger.info("Loading checkpoint: %s", CHECKPOINT)

        checkpoint = torch.load(
        CHECKPOINT,
        map_location=device,
        weights_only=False
        )

        state_dict = (
            checkpoint.get("model_state")
            or checkpoint.get("model_state_dict")
            or checkpoint
        )

        missing, unexpected = model.load_state_dict(state_dict, strict=False)

        if missing:
            logger.warning("Missing keys: %s", missing[:5])

        if unexpected:
            logger.warning("Unexpected keys: %s", unexpected[:5])

        logger.info("Checkpoint loaded successfully.")

    else:
        logger.warning("Checkpoint not found at %s", CHECKPOINT)

    # ─────────────────────────────────────────
    # FINAL SETUP
    # ─────────────────────────────────────────

    model = model.to(device)
    model.eval()

    vocab = _load_vocab()

    batch_converter = alphabet.get_batch_converter()

    return model, alphabet, batch_converter, vocab, device


# ─────────────────────────────────────────────
# VOCAB LOADER
# ─────────────────────────────────────────────

def _load_vocab():

    if not VOCAB_FILE.exists():
        raise FileNotFoundError(f"GO vocabulary not found at {VOCAB_FILE}")

    with open(VOCAB_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    # ─────────────────────────────
    # CASE 1: list format
    # ─────────────────────────────
    if isinstance(raw, list):
        vocab = {i: entry for i, entry in enumerate(raw)}

    # ─────────────────────────────
    # CASE 2: dict format
    # ─────────────────────────────
    elif isinstance(raw, dict):

       

        if "go_terms" in raw and "vocabulary" in raw:

            vocab = {
                "go_terms": raw["go_terms"],
                "vocabulary": raw["vocabulary"]
            }

        else:

            vocab = {}

            for k, v in raw.items():

                try:
                    idx = int(k)
                    vocab[idx] = v

                except ValueError:
                    logger.warning("Skipping unknown vocab key: %s", k)

    else:
        raise ValueError("Unsupported vocabulary format")

    logger.info("Loaded GO vocabulary")
    return vocab