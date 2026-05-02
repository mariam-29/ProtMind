<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a2e,50:1a1a6e,100:00d4ff&height=260&section=header&text=PROTMIND&fontSize=72&fontColor=ffffff&animation=fadeIn&desc=AI-Powered%20Protein%20Intelligence%20Platform&descSize=22&descAlignY=75" />
</p>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=00D4FF&center=true&vCenter=true&width=750&lines=AI-Powered+Protein+Intelligence+Platform;GO+Function+Prediction+%7C+Residue+Explainability;3D+Structure+Visualization+%7C+CCA+Research;ESM-2+%7C+MCP+Orchestration+%7C+AlphaFold" />

<br/>

[![Status](https://img.shields.io/badge/Status-MVP%20In%20Progress-00d4ff?style=for-the-badge)](https://github.com/)
[![Target](https://img.shields.io/badge/Target-Cholangiocarcinoma-6a00ff?style=for-the-badge)](https://github.com/)
[![Demo](https://img.shields.io/badge/Demo-May%2018%2C%202025-00ff9c?style=for-the-badge)](https://github.com/)
[![Model](https://img.shields.io/badge/Backbone-ESM--2%20650M-ff6b6b?style=for-the-badge)](https://github.com/)

</div>

---

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png">
</p>

## 🧬 About The Project

> **ProtMind** is where biology meets intelligence.
> An end-to-end **Protein Analysis Platform** that combines large protein language models, LLM-based tool orchestration, and structural visualization — engineered for real research, not just demos.

The platform is purpose-built for **cholangiocarcinoma (CCA) research**, targeting FGFR2 and ~200 TCGA-sourced CCA-related proteins. Type a protein name — get GO function predictions, residue-level explainability, and 3D structure visualization in one unified place.

---

## 🧩 Problem Statement

- 🔬 **Researchers** struggle to cross-reference GO annotations, sequence models, and 3D structures across disconnected tools.
- 🏥 **CCA clinicians** lack integrated platforms to explore FGFR2 and related biomarkers computationally.
- 🤖 **Existing tools** require manual pipeline stitching — UniProt here, AlphaFold there, BLAST elsewhere.
- 📊 **Explainability** is almost always missing — predictions with no residue-level reasoning are black boxes.

**ProtMind solves all of this in one AI-powered, fully orchestrated platform.**

---

## 🎭 System Actors

| Icon | Actor | Responsibility |
| :---: | :--- | :--- |
| 🔬 | **Researcher** | Query proteins by name, ID, or sequence and explore predictions. |
| 🧬 | **ESM-2 Model** | Generate residue-level embeddings as the intelligence backbone. |
| 🤖 | **LLM Orchestrator** | Dispatch MCP tool calls — fetch, predict, visualize, explain. |
| 🛠️ | **MCP Tools** | Modular functions: data fetch · GO prediction · PPI · BLAST · RAG. |
| 🏥 | **CCA Demo Story** | FGFR2 end-to-end clinical walkthrough — the platform's flagship use case. |

---

## ⚙️ System Architecture

### Inputs
```
UniProt ID  ·  Gene Name  ·  Protein Sequence  ·  Free-text Query  ·  .pdb File
```

### Data & Storage
| Layer | Detail |
| :--- | :--- |
| **Data Sources** | UniProt · AlphaFold DB · SwissModel · TCGA |
| **Preprocessing** | BLAST + RAG homology search index |
| **Cloud Storage** | Azure Blob — data + model weights |
| **Curated Set** | ~200 CCA proteins sourced from TCGA |

### Intelligence Core
```bash
📥 Query Input
 └── 🤖 LLM Orchestrator (MCP Dispatcher)
      ├── 🔍 Fetch Tool       → UniProt / AlphaFold data retrieval
      ├── 🧠 Predict Tool     → GO MF prediction via ESM-2 fine-tune
      ├── 🔗 PPI Tool         → Protein–protein interaction (post-MVP)
      ├── 🌍 CrossSpec Tool   → Cross-species essentiality (post-MVP)
      └── 📚 RAG + BLAST      → In-platform homology search (no site hop)
```

---

## 🧠 AI Models

| Component | Description |
| :--- | :--- |
| **ESM-2** (backbone) | `facebook/esm2_t33_650M_UR50D` — 650M protein language model |
| **Model 1** | GO Molecular Function (MF) classifier — fine-tuned on CCA proteins |
| **Model 2** | Protein–protein interaction (PPI) prediction *(Phase 5+)* |
| **Model 3** | Cross-species essentiality / RMSD scoring *(Phase 5+)* |

---

## 🛠️ Software Engineering Philosophy

The project follows a rigorous AI engineering lifecycle to ensure quality and scientific validity:

- ✅ **Research-Driven Design:** Every feature maps back to a concrete CCA research need.
- ✅ **Modular Tool Architecture:** MCP dispatcher decouples orchestration from execution — tools are plug-and-play.
- ✅ **Explainability First:** Attention heatmaps at residue level — not just predictions, but *why*.
- ✅ **Demo-Safe Engineering:** Offline cache + fallback ensures a live demo never fails on connectivity.
- ✅ **Evaluation-Driven ML:** GO MF classifier evaluated on Fmax / AUPR — no blind fine-tuning.

---

## 📦 Project Structure

```bash
📦 ProtMind
 ┣ 📁 data
 ┃ ┣ 📘 UniProt GO pipeline
 ┃ ┣ 📗 BLAST homology index (RAG-ready)
 ┃ ┗ 📙 TCGA CCA protein set (~200 proteins)

 ┣ 📁 models
 ┃ ┣ 🧠 ESM-2 embeddings (Kaggle P100)
 ┃ ┣ 🎯 Model 1 – GO MF classifier (checkpoint + vocab JSON)
 ┃ ┗ 🔥 Attention heatmap exporter (residue-level explainability)

 ┣ 📁 backend
 ┃ ┣ ⚡ FastAPI REST endpoints
 ┃ ┣ 🤖 LLM orchestrator (MCP tool routing)
 ┃ ┗ 📚 RAG + BLAST in-platform search

 ┣ 📁 frontend
 ┃ ┣ ⚛️  React dashboard (query input → result panel)
 ┃ ┣ 🧬 Mol* 3D structure viewer (AlphaFold PDB → browser render)
 ┃ ┗ 🌡️  Attention heatmap UI (residue highlight on sequence)

 ┗ 📄 README.md
```

---

## 🚧 MVP Roadmap — 4 Weeks to Demo

### ✅ Week 1 — Data (Apr 21–27)
- [x] UniProt + GO pipeline
- [ ] BLAST preprocessing → homology index (RAG-ready)
- [ ] Azure Blob setup (container for data + models)
- [ ] AlphaFold API integration (fetch PDB URLs per accession)

### 🔄 Week 2 — AI Model (Apr 28 – May 4)
- [ ] ESM-2 embeddings on Kaggle P100
- [ ] Fine-tune Model 1 GO MF classifier (eval: Fmax / AUPR)
- [ ] Attention heatmap export (residue-level explainability)
- [ ] Save checkpoint + vocab JSON to Azure Blob

### ⏳ Week 3 — LLM + Tools (May 5–11)
- [ ] FastAPI backend (REST endpoints for all tools)
- [ ] LLM orchestrator with MCP tool routing
- [ ] RAG + BLAST in-platform homology search
- [ ] React dashboard shell (query input → result panel)

### ⏳ Week 4 — Frontend + Demo (May 12–18)
- [ ] Mol\* 3D structure viewer (AlphaFold PDB → browser render)
- [ ] Attention heatmap UI (residue highlight on sequence)
- [ ] CCA demo story — FGFR2 end-to-end scripted walkthrough
- [ ] Offline cache + fallback (demo-safe without internet)

---

## 🎯 Demo Deliverable

**Target: May 18, 2025**

> Researcher types **"FGFR2"** →
> LLM routes to fetch data + predict function →
> Shows **GO MF prediction** with **residue attention heatmap** + **3D AlphaFold structure** →
> Links UniProt evidence.
> **Full CCA story presentable in under 3 minutes.**

---

## 🔬 Scope Cuts (Deliberate MVP Deferrals)

| Feature | Status | Notes |
| :--- | :---: | :--- |
| Models 2 & 3 (PPI + cross-species) | 🔵 Phase 5+ | Fully designed in SRS, deferred post-event |
| ChimeraX / PyMOL desktop plugins | 🔵 Phase 4+ | Hooks designed; browser Mol\* covers demo |
| Full CCA clinical pipeline | 🔵 Phase 7 | TCGA differential expression → biomarker ranking; shown in slides only |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python · FastAPI · ESM-2 · BLAST |
| **LLM Layer** | MCP Tool Orchestration |
| **Storage** | Azure Blob Storage |
| **Frontend** | React |
| **Visualization** | Mol\* (browser) · ChimeraX · PyMOL *(desktop, planned)* |
| **Training** | Kaggle — P100 GPU |
| **Data** | UniProt · AlphaFold DB · SwissModel · TCGA |

---

## 👥 Project Team

| Name | Role |
| :--- | :--- |
| **[Team Member]** | AI / ML Engineer |
| **[Team Member]** | Backend Engineer |
| **[Team Member]** | Frontend Engineer |
| **[Team Member]** | Data Engineer |
| **[Team Member]** | Bioinformatics Researcher |

---

## 🌱 Future Enhancements

- 🚀 PPI Network Visualization — interactive protein–protein interaction graph.
- 🌍 Cross-species Essentiality Scoring — RMSD + conservation analysis.
- 📊 Full TCGA CCA Clinical Pipeline — differential expression → biomarker ranking.
- 📱 ChimeraX / PyMOL Desktop Plugin Integration.
- 🔐 User authentication + saved research sessions.
- 🤝 Multi-researcher collaborative annotation workspace.

---

<div align="center">

**ProtMind — Where Protein Science Meets Artificial Intelligence**

⭐ *Star the repo if you believe AI can accelerate cancer research!* ⭐

</div>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00d4ff,100:0072ff&height=140&section=footer"/>
</p>