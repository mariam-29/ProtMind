# Feature Specification: ProtMind Unified Bioinformatics Platform

**Feature Branch**: `001-protmind-core`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Unified intelligent medical bioinformatics platform consolidating protein research infrastructure — data pipelines, 3D visualization, AI-powered function/interaction/mutation prediction with explainability, and CCA clinical demonstration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Protein Data Retrieval & Unified Dashboard (Priority: P1)

A biomedical researcher wants to look up protein P01308 (Human Insulin) without navigating UniProt, AlphaFold, STRING, and DrugBank separately. They enter a single identifier and see consolidated sequence data, GO annotations, structural information, known interactions, and pharmacological context — all in one view.

**Why this priority**: This is the foundational value proposition. Without unified data retrieval, no downstream tool or AI model can function. It replaces the 4–6 platform workflow that the SRS identifies as the core problem.

**Independent Test**: Enter UniProt ID "P01308" → system returns sequence, experimental GO annotations, AlphaFold structure link, STRING interaction partners, and DrugBank compound associations.

**Acceptance Scenarios**:

1. **Given** the landing dashboard, **When** a user enters UniProt ID "P01308", **Then** the system displays protein name, organism, sequence length, amino acid sequence, and GO annotations filtered to experimental evidence codes.
2. **Given** a valid UniProt ID, **When** the system queries AlphaFold DB, **Then** it returns the predicted structure file (mmCIF/PDB) or triggers SWISS-MODEL fallback if not found.
3. **Given** a valid protein, **When** the user views the interactions tab, **Then** STRING interaction partners are displayed with combined scores.
4. **Given** an invalid or nonexistent UniProt ID, **When** the user submits it, **Then** the system returns a descriptive error message suggesting corrective action (not a raw stack trace).

---

### User Story 2 — Browser-Based 3D Structure Visualization (Priority: P1)

A researcher needs to visualize a protein's 3D structure directly in the browser without installing UCSF Chimera or PyMOL. They load a structure by UniProt ID or PDB ID and interact with it using rotation, zoom, color-coding by pLDDT confidence, and residue selection.

**Why this priority**: This is the second pillar — replacing desktop-only visualization with a browser tool. Phase 2 of the SRS delivers standalone visualization value before any AI is deployed.

**Independent Test**: Open the 3D Structure Viewer, enter PDB ID "1TRZ" → structure renders in 3D within 3 seconds, user can rotate and click residues.

**Acceptance Scenarios**:

1. **Given** a protein with an AlphaFold structure, **When** the user opens the 3D viewer, **Then** the structure renders within 3 seconds using Mol* with pLDDT confidence coloring (AlphaFold convention: dark blue ≥90, light blue 70–90, yellow 50–70, orange <50).
2. **Given** a rendered structure, **When** the user clicks a residue, **Then** the residue name, number, chain, and any associated annotations are displayed.
3. **Given** a protein NOT in AlphaFold DB, **When** the user requests its structure, **Then** the system falls back to SWISS-MODEL homology modeling and displays a progress indicator via WebSocket/SSE.
4. **Given** a browser without WebGL support, **When** the user attempts to load the viewer, **Then** the system displays a static rendered image as fallback with a message explaining the limitation.

---

### User Story 3 — Protein Function Prediction with Explainability (Priority: P2)

A researcher studying a poorly annotated protein wants to predict its biological function. They submit a sequence and receive predicted GO terms with confidence scores, residue-level attribution highlighting which parts of the sequence drive the prediction, and links to supporting evidence in UniProt and literature.

**Why this priority**: This is Model 1 (MVP AI model). It requires GPU compute (Phase 3) and builds on the data layer from US1. It directly addresses the "Black-Box AI" research problem.

**Independent Test**: Submit a known protein sequence → receive predicted GO terms with Fmax, AUPR, MCC metrics and a residue-level heatmap.

**Acceptance Scenarios**:

1. **Given** a protein sequence (or UniProt ID), **When** function prediction is triggered, **Then** the system extracts ESM-2 embeddings and returns predicted GO terms ranked by confidence.
2. **Given** prediction results, **When** the user views the report, **Then** each prediction includes: model version, dataset version, confidence score, calibration curve, and residue-level attribution map.
3. **Given** prediction results, **When** the user selects a predicted GO term, **Then** the system highlights the contributing residues on both the sequence display and the 3D structure.
4. **Given** a prediction, **When** the user requests evidence, **Then** the system links to UniProt entries and literature supporting or contradicting the prediction.

---

### User Story 4 — Protein-Protein Interaction Prediction (Priority: P3)

A researcher wants to predict whether two proteins interact and understand the structural basis of that interaction. They enter two protein identifiers and receive an interaction probability, predicted binding interface residues visualized on both structures, and pharmacological context from DrugBank.

**Why this priority**: This is Model 2 (Phase 5). It builds on Models 1 infrastructure and adds interaction prediction.

**Independent Test**: Enter two known interacting proteins → system predicts interaction with binding interface visualization.

**Acceptance Scenarios**:

1. **Given** two UniProt IDs, **When** PPI prediction is triggered, **Then** the system returns an interaction probability score with confidence calibration.
2. **Given** a predicted interaction, **When** the user views the report, **Then** predicted binding interface residues are highlighted on both protein structures in a split-panel 3D view.
3. **Given** a predicted interaction, **When** the user views pharmacological context, **Then** relevant DrugBank compounds targeting either protein are displayed.

---

### User Story 5 — Cross-Species Essentiality & Mutation Analysis (Priority: P3)

A researcher studying a disease-linked mutation wants to understand its effect on protein function and stability. They enter a protein ID and a mutation specification (e.g., G12V) and receive: predicted effect on function, structural comparison (wild-type vs. mutant) with RMSD quantification, and cross-species conservation analysis.

**Why this priority**: This is Model 3 (Phase 6). It is the most advanced predictive capability and depends on both Models 1 and 2.

**Independent Test**: Enter a known pathogenic mutation → system predicts functional impact with structural overlay.

**Acceptance Scenarios**:

1. **Given** a protein ID and mutation, **When** mutation analysis is triggered, **Then** the system predicts the effect on protein function with a confidence score.
2. **Given** a mutation prediction, **When** the user views structural comparison, **Then** wild-type and mutant structures are displayed side-by-side with RMSD quantification.

---

### User Story 6 — CCA Clinical Demonstration Dashboard (Priority: P4)

A clinical scientist researching Cholangiocarcinoma wants to identify candidate biomarkers and drug targets. They access the CCA dashboard and receive ranked, evidence-backed biomarker and drug target candidates derived from TCGA expression data processed through all three ProtMind models.

**Why this priority**: This is the capstone (Phase 7). It demonstrates the full platform capability on a real clinical use case.

**Independent Test**: Open CCA dashboard → see ranked biomarker candidates with evidence traces.

**Acceptance Scenarios**:

1. **Given** the CCA dashboard, **When** a clinical scientist opens it, **Then** the system displays ranked biomarker candidates from TCGA CCA expression data.
2. **Given** a candidate biomarker, **When** the user selects it, **Then** the system shows the full evidence chain: expression data → function prediction → interaction network → drug targets.

---

### User Story 7 — AI-Agent Natural Language Query (Priority: P2)

A researcher wants to ask a natural language question like "What is the function of P01308 and does it interact with insulin receptor?" instead of navigating the platform manually. The LLM router parses intent, orchestrates the required tools/models, and returns a structured response with summary, step-by-step explanation, visualizations, and references.

**Why this priority**: This is the AI-agent mode described in Flow A of the SRS. It differentiates ProtMind from being just another portal.

**Independent Test**: Type a natural language query → receive a structured multi-section response.

**Acceptance Scenarios**:

1. **Given** the search bar, **When** a user types a natural language query, **Then** the LLM router identifies the intent and required tools.
2. **Given** a parsed query, **When** the system orchestrates data retrieval and model inference, **Then** the user receives a structured response: plain-language summary, step-by-step explanation, technical details, visualizations, and references.

---

### Edge Cases

- What happens when a protein ID is valid but has no AlphaFold structure AND SWISS-MODEL cannot generate a homology model? → System displays available data (sequence, annotations, interactions) without 3D visualization and explains the limitation.
- What happens when external APIs (UniProt, AlphaFold, STRING) are rate-limited or down? → System uses cached data if available, displays stale-data indicators, and retries with exponential backoff.
- What happens when ESM-2 embedding extraction fails due to sequence length exceeding model limits? → System reports the limitation with the maximum supported sequence length and suggests alternatives.
- What happens when a user submits a non-protein sequence (e.g., DNA)? → System validates input type and returns a descriptive error.

## Requirements *(mandatory)*

### Functional Requirements

**Data Layer & Pipeline**
- **FR-001**: System MUST ingest and normalize protein data from six sources: UniProt (sequences/annotations), PDB (experimental structures), AlphaFold DB (predicted structures), STRING (interactions), DrugBank (pharmacology), and TCGA/NCI GDC (CCA expression data).
- **FR-002**: System MUST filter GO annotation labels to experimental evidence codes only (EXP, IDA, IPI, IMP, IGI, IEP) for model training data.
- **FR-003**: System MUST implement time-based dataset splitting by annotation date for all model training.
- **FR-004**: System MUST generate data cards and pipeline documentation for every dataset version.
- **FR-005**: System MUST process a full UniProt Swiss-Prot refresh within 24 hours.

**Visualization Suite**
- **FR-006**: System MUST provide a browser-based 3D protein structure viewer using Mol* or 3Dmol.js with WebGL.
- **FR-007**: System MUST support pLDDT confidence color-coding following the AlphaFold convention.
- **FR-008**: System MUST provide a structure comparator view for side-by-side or overlay comparison with RMSD quantification.
- **FR-009**: System MUST provide a sequence annotator displaying scrollable amino acid sequences with residue-level annotations.
- **FR-010**: System MUST provide a PPI interaction graph using D3.js for network visualization.
- **FR-011**: System MUST provide static image rendering as fallback when WebGL is unavailable.

**AI Prediction Models**
- **FR-012**: System MUST implement Protein Function Prediction (Model 1) using ESM-2 embeddings with residue-level explainability, evaluated on Fmax, AUPR, and MCC.
- **FR-013**: System MUST implement Protein-Protein Interaction Prediction (Model 2) with structural binding interface visualization.
- **FR-014**: System MUST implement Cross-Species Essentiality and Mutation Effect Prediction (Model 3) with structural comparison and RMSD.
- **FR-015**: Every prediction MUST include model version, dataset version, confidence score, calibration curve, and evidence trail.

**Explainability & Trust**
- **FR-016**: System MUST provide residue-level attribution maps for all function predictions.
- **FR-017**: System MUST provide confidence calibration curves showing prediction reliability.
- **FR-018**: System MUST trace every prediction to source databases and literature references.

**AI Agent & Interface**
- **FR-019**: System MUST support natural language query input parsed by an LLM router.
- **FR-020**: System MUST support direct standalone tool access (no AI involvement) for all visualization tools.
- **FR-021**: System MUST provide structured response output: plain-language summary, step-by-step explanation, technical details, visualizations, and references.

**CCA Clinical Demonstration**
- **FR-022**: System MUST process TCGA CCA expression data and produce ranked biomarker and drug target candidates.
- **FR-023**: System MUST provide full evidence chains from expression data through all three models to final candidate ranking.

**Security & Operations**
- **FR-024**: System MUST encrypt all data in transit using TLS 1.3+.
- **FR-025**: System MUST implement JWT authentication with 15-minute access token expiry and refresh token rotation.
- **FR-026**: System MUST implement role-based access control (Researcher, Clinical Scientist, Platform Admin).
- **FR-027**: System MUST store all API keys in environment variables via secrets manager.

### Key Entities

- **Protein**: Core entity identified by UniProt accession. Contains sequence, organism, gene name, description. Anchors all downstream data.
- **Annotation**: GO term association with evidence code, source database, and annotation date. Filtered to experimental evidence for training.
- **Structure**: 3D structure file (PDB/mmCIF) from AlphaFold DB, PDB, or SWISS-MODEL. Includes pLDDT scores and PAE data.
- **Interaction**: Protein-protein relationship with combined score, experimental score, and source (STRING, BioGRID).
- **Embedding**: ESM-2 vector representation of a protein sequence. Linked to specific ESM-2 model version.
- **Prediction**: AI model output linked to protein(s), model version, dataset version, confidence score, and evidence.
- **Dataset_Split**: Tracks which proteins belong to train/validation/test sets with split date.
- **Expression_Data**: TCGA CCA gene expression values for the clinical demonstration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Researchers can look up any UniProt Swiss-Prot protein and see consolidated data (sequence, annotations, structure, interactions) within 5 seconds.
- **SC-002**: 3D structure rendering completes within 3 seconds for proteins up to 500 residues.
- **SC-003**: A researcher new to the platform can complete a protein function prediction within 5 minutes of first use without documentation.
- **SC-004**: All visualization tools are accessible within 2 clicks from the main dashboard.
- **SC-005**: Protein function prediction inference completes within 10 seconds for a single protein.
- **SC-006**: The platform supports at least 100 concurrent users during MVP without degradation.
- **SC-007**: Every prediction output includes traceable evidence to source databases.
- **SC-008**: The CCA demonstration produces ranked biomarker candidates with complete evidence chains from TCGA expression data.
- **SC-009**: Dashboard initial load completes in under 2 seconds on a 50 Mbps connection.
- **SC-010**: Data pipeline can process a full UniProt Swiss-Prot refresh within 24 hours.

## Assumptions

- Researchers have reliable internet connectivity during active sessions (required for real-time API queries).
- Users have a basic understanding of protein biology concepts (sequences, structures, GO terms).
- ESM-2 embeddings capture sufficient protein sequence information for function, interaction, and essentiality predictions.
- AlphaFold DB structure predictions are of sufficient quality for visualization and training features.
- UniProt Swiss-Prot reviewed entries are higher quality than TrEMBL for training purposes.
- GPU resources will be secured after Phase 2 MVP demonstration for Phases 3–6.
- All data sources remain freely available for academic/research use.
- TCGA CCA expression data is representative of CCA biology at the protein level.
