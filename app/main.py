"""
main.py — FastAPI application entry point
------------------------------------------
"""

from __future__ import annotations
import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .inference import run_inference
from .llm_explainer import check_ollama_health, generate_explanation
from .model_loader import load_model_and_vocab
from .schemas import (
    ExplainResponse,
    HealthResponse,
    PredictRequest,
    PredictResponse,
)
from .utils import Timer, setup_logging

# ─────────────────────────────────────────────
# INIT
# ─────────────────────────────────────────────

load_dotenv()
setup_logging(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("protmind.main")


# ─────────────────────────────────────────────
# STARTUP / SHUTDOWN
# ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ProtMind starting up...")

    
    model, esm_model, tokenizer, vocab, device = load_model_and_vocab()

    app.state.model = model
    app.state.esm_model = esm_model
    app.state.tokenizer = tokenizer
    app.state.vocab = vocab
    app.state.device = device
    app.state.model_ready = True

    logger.info("ProtMind ready! Model loaded on %s", device)

    yield

    logger.info("ProtMind shutting down...")


# ─────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────

app = FastAPI(
    title="ProtMind — Protein Function Prediction API",
    description="Predicts Gene Ontology terms using ESM2",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        model_ready=getattr(app.state, "model_ready", False),
        device=str(getattr(app.state, "device", "unknown")),
        ollama_ready=await check_ollama_health(),
        version="1.0.0",
    )


# ─────────────────────────────────────────────
# PREDICT
# ─────────────────────────────────────────────

@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    _require_model_ready()

    with Timer() as t:
        try:
            predictions, attention = run_inference(
                sequence=request.sequence,
                model=app.state.model,
                tokenizer=app.state.tokenizer,
                vocab=app.state.vocab,
                device=app.state.device,
                top_k=request.top_k,
                threshold=request.threshold,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return PredictResponse(
        sequence_length=len(request.sequence),
        predictions=predictions,
        attention=attention,
        processing_time_ms=round(t.elapsed_ms, 1),
    )


# ─────────────────────────────────────────────
# EXPLAIN
# ─────────────────────────────────────────────

@app.post("/explain", response_model=ExplainResponse)
async def explain(request: PredictRequest):
    _require_model_ready()

    with Timer() as t:
        predictions, attention = run_inference(
            sequence=request.sequence,
            model=app.state.model,
            tokenizer=app.state.tokenizer,
            vocab=app.state.vocab,
            device=app.state.device,
            top_k=request.top_k,
            threshold=request.threshold,
        )

        explanation = await generate_explanation(
            request.sequence,
            predictions
        )

    return ExplainResponse(
        sequence_length=len(request.sequence),
        predictions=predictions,
        attention=attention,
        llm_explanation=explanation,
        processing_time_ms=round(t.elapsed_ms, 1),
    )


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _require_model_ready():
    if not getattr(app.state, "model_ready", False):
        raise HTTPException(
            status_code=503,
            detail="Model not ready yet",
        )