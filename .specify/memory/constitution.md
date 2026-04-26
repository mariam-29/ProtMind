# ProtMind Constitution

## Core Principles

### I. Unified Platform Architecture
ProtMind MUST be a single, browser-based web application. No OS-specific desktop components. All visualization, prediction, and data retrieval tools MUST operate within a unified dashboard accessible via any modern browser with WebGL support.

### II. Data Integrity & Reproducibility
All model training runs MUST be fully reproducible from documented configuration (random seeds, data versions, hyperparameters). GO annotation labels MUST be filtered to experimental evidence codes only (EXP, IDA, IPI, IMP, IGI, IEP). Dataset splits MUST be time-based (by annotation date), never random. Data pipeline MUST be idempotent.

### III. Explainability First
Every AI prediction MUST include: the model version and dataset version used, residue-level evidence or attribution, confidence calibration, and traceable links to source databases and literature. No black-box outputs.

### IV. External API Safety
All outbound calls to external APIs (AlphaFold, SWISS-MODEL, STRING, UniProt, PDB, DrugBank) MUST be made by the backend only — never from the frontend. All external calls MUST implement rate limiting, caching, retry with exponential backoff, and graceful degradation.

### V. Security by Default
All data in transit MUST use TLS 1.3+. No PII or PHI stored. API keys in environment variables only, never hardcoded. JWT auth with 15-minute access token expiry and refresh rotation. SQL injection, XSS, CSRF protections on all endpoints.

### VI. Phased Delivery
Development follows seven sequential phases with clear dependencies. Phases 1-2 (data infrastructure, visualization) are CPU-only and deliver standalone value before any AI models. Phase 3 (MVP Model 1) is gated on GPU availability. Each phase delivers independently testable functionality.

## Technology Stack (Mandated)

- **Backend**: Python (FastAPI), PostgreSQL
- **Frontend**: React, TypeScript, TailwindCSS
- **3D Visualization**: Mol* and/or 3Dmol.js (WebGL)
- **ML**: PyTorch, ESM-2 (Meta AI protein language model)
- **Data Sources**: UniProt, AlphaFold DB, SWISS-MODEL, PDB, STRING, DrugBank, TCGA/NCI GDC

## Quality Gates

- 3D rendering ≤3 seconds for proteins up to 500 residues
- Function prediction inference ≤10 seconds per protein
- Dashboard load ≤2 seconds on 50 Mbps connection
- API metadata responses ≤500ms at p95
- Support ≥100 concurrent users at MVP

## Governance

Constitution supersedes all ad-hoc decisions. Amendments require explicit documentation and justification. All development artifacts MUST verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-26
