# Implementation Plan: ProtMind Core Infrastructure

**Branch**: `001-protmind-core` | **Date**: 2026-04-26 | **Spec**: [spec.md](../../spec.md)
**Input**: Feature specification for ProtMind Unified Platform.

## Summary

Build the foundational infrastructure for ProtMind, including the backend API (FastAPI), frontend dashboard (React/Next.js), and integration with core bioinformatics APIs (UniProt, AlphaFold, STRING). The goal is to deliver a functional MVP where a user can search for a protein and see a unified view of its data.

## Technical Context

**Language/Version**: Python 3.12 (Backend), JavaScript/TypeScript (Frontend)
**Primary Dependencies**: FastAPI, Mol* (3D visualization), ESM-2 (Embeddings), STRING API (Interactions)
**Storage**: Azure Blob Storage (for large structural files), PostgreSQL (metadata)
**Testing**: pytest
**Target Platform**: Web (Modern Browsers with WebGL)
**Project Type**: Web Service / Dashboard
**Performance Goals**: <3s for 3D rendering, <10s for AI inference
**Constraints**: WebGL dependency, Rate-limited external APIs
**Scale/Scope**: Academic research platform, handle 100+ concurrent users

## Project Structure

```text
backend/
├── src/
│   ├── api/          # FastAPI routes
│   ├── services/     # UniProt/AlphaFold/STRING wrappers
│   ├── models/       # Pydantic models for data
│   └── inference/    # ESM-2 model integration
└── tests/

frontend/
├── src/
│   ├── components/   # Mol* Viewer, SearchBar, Dashboard
│   ├── pages/        # Dashboard, Report views
│   └── services/     # API client
└── tests/

data/                 # Local data storage/caching
```

**Structure Decision**: Web application with separate frontend and backend to allow for independent scaling and deployment.

## Phase 0: Research & Data Strategy

1. **UniProt API**: Verify fields needed for sequence and annotation retrieval.
2. **AlphaFold DB**: Test mmCIF/PDB file retrieval for common proteins.
3. **STRING API**: Document the network interaction format.
4. **Mol* Integration**: Explore the best way to embed Mol* in a React component.

## Phase 1: Core API & Data Retrieval

- Implement `ProteinService` to fetch and unify data from UniProt and AlphaFold.
- Implement `InteractionService` to fetch PPI data from STRING.
- Set up caching layer to stay within API rate limits.

## Phase 2: Frontend Foundation & Visualization

- Scaffold React/Next.js frontend.
- Integrate Mol* for 3D structure rendering.
- Build the search interface and landing dashboard.
