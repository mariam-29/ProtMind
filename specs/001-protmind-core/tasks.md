# Tasks: ProtMind Core Infrastructure

**Input**: Design documents from `/specs/001-protmind-core/`
**Prerequisites**: plan.md, spec.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create project structure (backend/src, frontend/src) per implementation plan
- [ ] T002 Initialize Python backend with FastAPI and uv
- [ ] T003 [P] Initialize React/Next.js frontend with TailwindCSS
- [ ] T004 [P] Configure environment variables (.env) for API keys

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure for data retrieval and API routing.

- [ ] T005 Implement API Gateway / Base Router in backend/src/api/main.py
- [ ] T006 [P] Create Pydantic models for Protein and Interaction in backend/src/models/
- [ ] T007 [P] Implement Caching layer (local/redis) for external API calls
- [ ] T008 Setup error handling middleware for backend API

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Unified Protein Research Dashboard (Priority: P1) 🎯 MVP

**Goal**: Fetch and display protein sequence and structure data in a unified view.

**Independent Test**: Enter 'P01308' and verify unified data display.

- [ ] T009 [P] [US1] Implement UniProt client in backend/src/services/uniprot.py
- [ ] T010 [P] [US1] Implement AlphaFold client in backend/src/services/alphafold.py
- [ ] T011 [US1] Implement Unified Protein Endpoint in backend/src/api/protein.py
- [ ] T012 [US1] Build SearchBar component in frontend/src/components/SearchBar.tsx
- [ ] T013 [US1] Build Dashboard layout in frontend/src/pages/index.tsx
- [ ] T014 [US1] Integrate SearchBar with backend API

**Checkpoint**: US1 fully functional - can search and see basic protein data.

---

## Phase 4: User Story 2 - Browser-Based 3D Visualization (Priority: P1)

**Goal**: Render protein structures in 3D using Mol*.

**Independent Test**: Rotate and interact with a 3D protein model in the browser.

- [ ] T015 [P] [US2] Create Mol* wrapper component in frontend/src/components/MolStarViewer.tsx
- [ ] T016 [US2] Integrate MolStarViewer into the Dashboard
- [ ] T017 [US2] Implement structure file proxy in backend to handle CORS/retrieval from AlphaFold

**Checkpoint**: US1 + US2 functional - search a protein and see it in 3D.

---

## Phase 5: User Story 3 - Protein Function Prediction (Priority: P2)

**Goal**: Predict protein function with ESM-2 and show explainability.

**Independent Test**: Run prediction on a sequence and see GO terms + highlighted residues.

- [ ] T018 [P] [US3] Implement ESM-2 embedding extraction in backend/src/inference/embeddings.py
- [ ] T019 [US3] Implement Function Prediction service in backend/src/services/function_prediction.py
- [ ] T020 [US3] Build Prediction Report view in frontend/src/pages/report.tsx
- [ ] T021 [US3] Implement residue highlighting in MolStarViewer based on prediction evidence

**Checkpoint**: All 3 user stories functional.
