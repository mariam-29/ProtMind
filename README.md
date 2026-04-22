🧠 ProtMind
AI-powered protein understanding platform
<p align="center">
  <img src="./preview.png" alt="ProtMind Architecture" width="90%">
</p>
<p align="center">
  <b>From sequence → to biological insight</b><br>
  LLM orchestration · Protein AI · Structural visualization
</p>
---
🚀 Overview
ProtMind is an end-to-end AI system that transforms protein inputs into functional, structural, and biological insights.
Instead of manually querying multiple bioinformatics tools, ProtMind uses an LLM-powered orchestrator to decide:
what data to fetch
which model to run
how to present results
---
⚙️ Core Architecture
🔽 Inputs
UniProt ID / Gene name
Protein sequence
Free text biological query
3D structure (PDB)
---
🟩 Data Layer
UniProt / AlphaFold / SwissModel → raw data sources
BLAST + RAG → homology-aware retrieval
Azure Blob → data & model storage
CCA dataset (~200 proteins) → curated domain focus
---
🟪 Intelligence Core
LLM Orchestrator
MCP-style tool routing
decides next action dynamically
Tooling Layer
Fetch protein data
Function prediction
PPI analysis (planned)
Cross-species reasoning (planned)
RAG Search
Built-in BLAST retrieval
no external dependency
---
🟦 AI Models
ESM-2 (650M) → protein language backbone
Prediction Stack
Model 1 → GO Molecular Function
Model 2 → PPI (post-MVP)
Model 3 → Cross-species (post-MVP)
Explainability
Residue-level attention heatmaps
Visualization
Mol* (web)
ChimeraX / PyMOL (planned integration)
---
🔼 Outputs
Interactive React dashboard
3D protein visualization
CCA-focused biological insights
---
🧪 MVP Roadmap (4 Weeks)
🟢 Week 1 — Data
UniProt + GO pipeline
BLAST preprocessing (RAG-ready)
Azure Blob setup
AlphaFold API integration
---
🟣 Week 2 — Model
ESM-2 embeddings (GPU)
Fine-tune GO classifier
Export attention heatmaps
Save model to cloud
---
🟠 Week 3 — LLM System
FastAPI backend
LLM tool orchestration
RAG + BLAST integration
React dashboard (basic)
---
🟡 Week 4 — Demo
Mol* 3D viewer
Heatmap visualization UI
FGFR2 demo scenario
Offline-safe fallback
---
⚠️ MVP Scope (Intentional Cuts)
Models 2 & 3 → deferred
Desktop plugins → not integrated yet
Full clinical pipeline → presentation only
---
🎯 Final Demo
A researcher can type:
FGFR2
ProtMind will:
Fetch protein data
Run function prediction
Highlight important residues
Display 3D AlphaFold structure
Link biological evidence
⏱️ End-to-end in ~3 minutes
---
🧰 Tech Stack
Backend: FastAPI
Frontend: React
AI: ESM-2 (PyTorch)
Storage: Azure Blob
Search: BLAST + RAG
Visualization: Mol*
---
🌍 Vision
ProtMind aims to become a research co-pilot for protein science —  
bridging raw sequence data with actionable biological understanding.
---
🔗 Live Demo
👉 (Add GitHub Pages link here)
---
👀 Preview
> Add a screenshot or GIF here for maximum impact
