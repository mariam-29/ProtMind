# ProtMind

> AI-powered protein intelligence platform for cholangiocarcinoma (CCA) research.
> Type a protein name — get GO function predictions, residue-level explainability, and 3D structure visualization in one place.

---

## Overview

ProtMind is an end-to-end protein analysis platform that combines large protein language models, LLM-based tool orchestration, and structural visualization. The current MVP targets **FGFR2 and CCA-related proteins** (~200 TCGA-sourced), with a demo story presentable in under 3 minutes.

---

## System Architecture

### Inputs
- UniProt ID or gene name
- Protein sequence / free-text query
- 3D structure file (.pdb)

### Data & Storage
- **Data sources:** UniProt, AlphaFold DB, SwissModel
- **Preprocessing:** BLAST + RAG homology search index
- **Cloud storage:** Azure Blob (data + model weights)
- **Curated set:** ~200 CCA proteins sourced from TCGA

### Intelligence Core
- **LLM orchestrator:** MCP tool dispatcher — decides what to call next
- **Tool functions (MCP):** Fetch data · Predict function · PPI prediction · Cross-species analysis
- **Built-in search:** RAG + BLAST runs in-platform (no external site hop)
- **Model selector:** Routes queries to Model 1 / 2 / 3 or data-only path

### AI Models
| Component | Description |
|---|---|
| **ESM-2** (backbone) | `facebook/esm2_t33_650M_UR50D` — 650M protein language model |
| **Model 1** | GO Molecular Function (MF) prediction |
| **Model 2** | Protein–protein interaction (PPI) prediction *(post-MVP)* |
| **Model 3** | Cross-species essentiality / RMSD scoring *(post-MVP)* |

### Visualization
- **Mol\*** — browser-based 3D structure viewer (AlphaFold PDB)
- **ChimeraX / PyMOL** — desktop plugin integration *(designed, post-MVP)*

### Outputs
- React web dashboard
- Residue-level attention heatmap
- CCA clinical demo (FGFR2 end-to-end walkthrough)

---

## MVP Roadmap — 4 Weeks to Demo

### Week 1 — Data (Apr 21–27)
- [x] UniProt + GO pipeline
- [ ] BLAST preprocessing → homology index (RAG-ready)
- [ ] Azure Blob setup (container for data + models)
- [ ] AlphaFold API integration (fetch PDB URLs per accession)

### Week 2 — AI Model (Apr 28 – May 4)
- [ ] ESM-2 embeddings on Kaggle P100
- [ ] Fine-tune Model 1 GO MF classifier (eval: Fmax / AUPR)
- [ ] Attention heatmap export (residue-level explainability)
- [ ] Save checkpoint + vocab JSON to Azure Blob

### Week 3 — LLM + Tools (May 5–11)
- [ ] FastAPI backend (REST endpoints for all tools)
- [ ] LLM orchestrator with MCP tool routing
- [ ] RAG + BLAST in-platform homology search
- [ ] React dashboard shell (query input → result panel)

### Week 4 — Frontend + Demo (May 12–18)
- [ ] Mol\* 3D structure viewer (AlphaFold PDB → browser render)
- [ ] Attention heatmap UI (residue highlight on sequence)
- [ ] CCA demo story — FGFR2 end-to-end scripted walkthrough
- [ ] Offline cache + fallback (demo-safe without internet)

---

## Scope Cuts (Deliberate MVP Deferrals)

| Feature | Status | Notes |
|---|---|---|
| Models 2 & 3 (PPI + cross-species) | Phase 5+ | Fully designed in SRS, deferred post-event |
| ChimeraX / PyMOL plugins | Phase 4+ | Hooks designed; browser Mol\* covers demo visualization |
| Full CCA clinical pipeline | Phase 7 | TCGA differential expression → biomarker ranking; shown in slides only |

---

## Demo Deliverable

**Target: May 18**

> Researcher types **"FGFR2"** → LLM routes to fetch data + predict function → shows GO MF prediction with residue attention heatmap + 3D AlphaFold structure → links UniProt evidence. Full CCA story presentable in 3 minutes.

---

## Tech Stack

- **Backend:** Python · FastAPI · ESM-2 · BLAST
- **LLM layer:** MCP tool orchestration
- **Storage:** Azure Blob Storage
- **Frontend:** React
- **Visualization:** Mol\* (browser) · ChimeraX · PyMOL (desktop, planned)
- **Training:** Kaggle (P100 GPU)
- **Data:** UniProt · AlphaFold DB · SwissModel · TCGA
