"""
utils.py — Shared helper utilities for ProtMind
------------------------------------------------
Small pure functions that don't belong to any single module.
Keeping them here avoids circular imports and makes unit-testing easy.
"""

from __future__ import annotations
import logging
import time
import re
from typing import List, Tuple

logger = logging.getLogger("protmind.utils")


# ─────────────────────────────────────────────
# LOGGING SETUP
# ─────────────────────────────────────────────

def setup_logging(level: str = "INFO") -> None:
    """
    Configure structured logging for the entire application.

    Call once at startup (in main.py).  Every module then does:
        import logging
        logger = logging.getLogger("protmind.<module_name>")
    """
    numeric_level = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(
        level=numeric_level,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # Silence noisy third-party loggers
    logging.getLogger("transformers").setLevel(logging.WARNING)
    logging.getLogger("torch").setLevel(logging.WARNING)
    logger.info("Logging initialised at level %s", level)


# ─────────────────────────────────────────────
# SEQUENCE HELPERS
# ─────────────────────────────────────────────

VALID_AA = re.compile(r"^[ACDEFGHIKLMNPQRSTVWYBZXU]+$")

def validate_sequence(sequence: str) -> Tuple[bool, str]:
    """
    Return (is_valid, error_message).

    Checks:
    - Non-empty
    - Only recognised amino acid characters
    - Minimum length (≥ 5 residues) — shorter sequences are chemically meaningless
    """
    if not sequence:
        return False, "Sequence is empty."
    if len(sequence) < 5:
        return False, f"Sequence is too short ({len(sequence)} aa). Minimum is 5."
    if not VALID_AA.match(sequence):
        illegal = set(sequence) - set("ACDEFGHIKLMNPQRSTVWYBZXU")
        return False, f"Invalid characters: {illegal}"
    return True, ""


def truncate_sequence(sequence: str, max_len: int = 1022) -> str:
    """
    ESM2 tokeniser adds [CLS] and [EOS] tokens, so the actual residue budget
    is max_model_length - 2.  For ESM2-150M the transformer max is 1024 tokens,
    so we truncate at 1022 residues to stay safe.

    We log a warning if truncation happens so the caller knows.
    """
    if len(sequence) > max_len:
        logger.warning(
            "Sequence length %d exceeds limit %d — truncating to first %d residues.",
            len(sequence), max_len, max_len,
        )
        return sequence[:max_len]
    return sequence


# ─────────────────────────────────────────────
# SCORE HELPERS
# ─────────────────────────────────────────────

def minmax_normalise(values: List[float]) -> List[float]:
    """
    Scale a list of floats to [0, 1].

    Why we need this for attention weights:
        Raw attention pooling scores can be tiny floats (e.g. 0.0003 to 0.002).
        The React heatmap component expects values in [0, 1] so it can map them
        to a colour scale (e.g. white → red).
    """
    if not values:
        return values
    lo, hi = min(values), max(values)
    span = hi - lo
    if span == 0:
        # All values identical — return uniform weights
        return [0.5] * len(values)
    return [(v - lo) / span for v in values]


def top_k_indices(scores: List[float], k: int) -> List[int]:
    """Return indices of the k largest values, sorted descending."""
    indexed = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
    return [i for i, _ in indexed[:k]]


# ─────────────────────────────────────────────
# TIMING
# ─────────────────────────────────────────────

class Timer:
    """
    Simple context-manager timer.

    Usage:
        with Timer() as t:
            do_work()
        print(t.elapsed_ms)   # milliseconds
    """
    def __enter__(self):
        self._start = time.perf_counter()
        return self

    def __exit__(self, *_):
        self.elapsed_ms = (time.perf_counter() - self._start) * 1000

    @property
    def elapsed(self) -> float:
        """Elapsed time in seconds."""
        return self.elapsed_ms / 1000