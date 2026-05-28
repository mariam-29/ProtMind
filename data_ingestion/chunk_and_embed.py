#!/usr/bin/env python3
"""
ProtMind Data Processing Pipeline - Chunking & Embeddings
=========================================================
This script processes the raw ingested UniProt metadata and:
1. Splits it into semantic chunks (Descriptive metadata & Sequence fragments).
2. Computes vector embeddings locally using SentenceTransformers (all-MiniLM-L6-v2).
3. Saves the chunks (JSON) and embeddings (NumPy binary) to processed_chunks/.
4. Provides a simple test query interface to verify the retrieval in action.

Designed to run locally for the ProtMind RAG system.
"""

import os
import sys
import json
import csv
import logging
import argparse
import numpy as np
from sentence_transformers import SentenceTransformer

# Configure Logging for clear console output
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# -----------------------------------------------------------------------------
# Configuration & Paths Setup
# -----------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Data Folder Configuration
RAW_DATA_DIR = os.path.join(SCRIPT_DIR, "raw_data")
METADATA_DIR = os.path.join(RAW_DATA_DIR, "metadata")
PROCESSED_CHUNKS_DIR = os.path.join(SCRIPT_DIR, "processed_chunks")

# Input/Output Files
INPUT_TSV_PATH = os.path.join(METADATA_DIR, "cca_panel_uniprot.tsv")
CHUNKS_JSON_PATH = os.path.join(PROCESSED_CHUNKS_DIR, "cca_panel_chunks.json")
EMBEDDINGS_NPY_PATH = os.path.join(PROCESSED_CHUNKS_DIR, "cca_panel_embeddings.npy")

# Default Embedding Model
DEFAULT_MODEL_NAME = "all-MiniLM-L6-v2"

# -----------------------------------------------------------------------------
# Processing Functions
# -----------------------------------------------------------------------------

def load_uniprot_metadata(tsv_path):
    """
    Loads UniProt metadata from the local TSV file.
    """
    if not os.path.exists(tsv_path):
        logging.error(f"Metadata file not found at: {tsv_path}")
        logging.error("Please run the ingestion script (ingest.py) first.")
        sys.exit(1)
        
    logging.info(f"Loading UniProt metadata from: {tsv_path}")
    proteins = []
    
    try:
        with open(tsv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter="\t")
            for row in reader:
                proteins.append(row)
        logging.info(f"Successfully loaded {len(proteins)} proteins.")
        return proteins
    except Exception as e:
        logging.error(f"Error reading TSV file: {e}")
        sys.exit(1)


def generate_chunks(proteins, seq_window_size=100, seq_overlap=20):
    """
    Generates text chunks from the loaded protein data.
    Creates two types of chunks:
    1. Metadata Chunk: Summarizes the accession, gene, name, and GO functional terms.
    2. Sequence Chunk: Sliding window slices of the amino acid sequence for motif lookup.
    
    Args:
        proteins (list): List of protein data dictionaries.
        seq_window_size (int): Size of sequence chunk windows.
        seq_overlap (int): Number of overlapping residues between adjacent windows.
    """
    logging.info("Generating semantic chunks...")
    chunks = []
    
    # UniProt columns in our TSV: Entry, Entry Name, Protein names, Gene Names, Sequence, Gene Ontology IDs
    for p in proteins:
        entry = p.get("Entry", "").strip()
        entry_name = p.get("Entry Name", "").strip()
        protein_names = p.get("Protein names", "").strip()
        gene_names = p.get("Gene Names", "").strip()
        sequence = p.get("Sequence", "").strip()
        go_ids = p.get("Gene Ontology IDs", "").strip()
        
        if not entry:
            continue
            
        # --- Type 1: Descriptive Metadata Chunk ---
        metadata_content = (
            f"Protein Name: {protein_names}\n"
            f"UniProt Accession: {entry}\n"
            f"Entry Name: {entry_name}\n"
            f"Gene Name(s): {gene_names}\n"
            f"Gene Ontology (GO) Annotations: {go_ids if go_ids else 'None available'}"
        )
        
        chunks.append({
            "id": f"{entry}_metadata",
            "uniprot_id": entry,
            "type": "metadata",
            "content": metadata_content,
            "metadata": {
                "gene_name": gene_names,
                "protein_name": protein_names,
                "entry_name": entry_name
            }
        })
        
        # --- Type 2: Overlapping Sequence Window Chunks ---
        if sequence:
            seq_len = len(sequence)
            step = seq_window_size - seq_overlap
            
            # If sequence is smaller than the window size, make a single chunk
            if seq_len <= seq_window_size:
                seq_content = (
                    f"Protein: {protein_names} ({entry})\n"
                    f"Sequence Fragment (Residues 1-{seq_len}): {sequence}"
                )
                chunks.append({
                    "id": f"{entry}_seq_1_{seq_len}",
                    "uniprot_id": entry,
                    "type": "sequence",
                    "content": seq_content,
                    "metadata": {
                        "start_residue": 1,
                        "end_residue": seq_len,
                        "sequence_length": seq_len
                    }
                })
            else:
                start = 0
                while start < seq_len:
                    end = min(start + seq_window_size, seq_len)
                    fragment = sequence[start:end]
                    
                    seq_content = (
                        f"Protein: {protein_names} ({entry})\n"
                        f"Sequence Fragment (Residues {start+1}-{end}): {fragment}"
                    )
                    chunks.append({
                        "id": f"{entry}_seq_{start+1}_{end}",
                        "uniprot_id": entry,
                        "type": "sequence",
                        "content": seq_content,
                        "metadata": {
                            "start_residue": start + 1,
                            "end_residue": end,
                            "sequence_length": seq_len
                        }
                    })
                    
                    # Stop if we've processed up to the end of the sequence
                    if end == seq_len:
                        break
                    start += step
                    
    logging.info(f"Generated {len(chunks)} total chunks (metadata + sequence).")
    return chunks


def compute_embeddings(chunks, model_name=DEFAULT_MODEL_NAME):
    """
    Computes vector embeddings for each chunk using SentenceTransformers.
    """
    logging.info(f"Loading SentenceTransformers model: {model_name}...")
    try:
        model = SentenceTransformer(model_name)
    except Exception as e:
        logging.error(f"Failed to load model {model_name}: {e}")
        sys.exit(1)
        
    logging.info("Encoding chunks (this may take a few seconds on CPU)...")
    texts = [c["content"] for c in chunks]
    
    # Encode all texts into a numpy array
    embeddings = model.encode(
        texts, 
        show_progress_bar=True, 
        convert_to_numpy=True
    )
    
    logging.info(f"Computed embeddings matrix of shape: {embeddings.shape}")
    return embeddings


def save_processed_data(chunks, embeddings, chunks_path, embeddings_path):
    """
    Saves the generated chunks to a JSON file and the embeddings matrix to a .npy file.
    """
    # Ensure processed directory exists
    os.makedirs(os.path.dirname(chunks_path), exist_ok=True)
    
    # Save chunks as JSON
    try:
        with open(chunks_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f, indent=2, ensure_ascii=False)
        logging.info(f"Saved chunks to: {chunks_path}")
    except Exception as e:
        logging.error(f"Failed to save chunks: {e}")
        
    # Save embeddings matrix as NumPy binary
    try:
        np.save(embeddings_path, embeddings)
        logging.info(f"Saved embeddings matrix to: {embeddings_path}")
    except Exception as e:
        logging.error(f"Failed to save embeddings: {e}")


def test_retrieval(query, chunks, embeddings, model_name=DEFAULT_MODEL_NAME, top_k=3):
    """
    Simulates a vector-search query against the built index.
    """
    logging.info(f"\n--- Testing Semantic Search Query: '{query}' ---")
    model = SentenceTransformer(model_name)
    query_emb = model.encode(query, convert_to_numpy=True)
    
    # Compute Cosine Similarity
    # cosine_sim = (A . B) / (||A|| * ||B||)
    norms = np.linalg.norm(embeddings, axis=1)
    query_norm = np.linalg.norm(query_emb)
    
    # Avoid division by zero
    if query_norm == 0 or np.any(norms == 0):
        logging.warning("Zero norm encountered in similarity calculation.")
        return
        
    similarities = np.dot(embeddings, query_emb) / (norms * query_norm)
    
    # Get top-k indices
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    for rank, idx in enumerate(top_indices):
        score = similarities[idx]
        chunk = chunks[idx]
        logging.info(f"Rank {rank + 1} (Score: {score:.4f}) | Chunk ID: {chunk['id']}")
        logging.info(f"Type: {chunk['type']} | Accession: {chunk['uniprot_id']}")
        logging.info("--- Content Content Preview ---")
        # Print a short preview of the content
        preview = chunk["content"].replace("\n", " | ")
        if len(preview) > 120:
            preview = preview[:120] + "..."
        logging.info(f"{preview}")
        logging.info("-------------------------------\n")


# -----------------------------------------------------------------------------
# Main Execution Flow
# -----------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="ProtMind Chunking and Embeddings generator for RAG."
    )
    parser.add_argument(
        "--seq-window", 
        type=int, 
        default=100, 
        help="Window size for protein sequence chunking."
    )
    parser.add_argument(
        "--seq-overlap", 
        type=int, 
        default=20, 
        help="Overlapping residues between sequence chunks."
    )
    parser.add_argument(
        "--model", 
        default=DEFAULT_MODEL_NAME, 
        help="SentenceTransformers model name."
    )
    parser.add_argument(
        "--test-query", 
        default="Which protein is related to transcription factors, c-Jun, and biological processes?", 
        help="A test query to search after indexing."
    )
    
    args = parser.parse_args()
    
    logging.info("=== Starting ProtMind Chunking & Embeddings Pipeline ===")
    
    # 1. Load data
    proteins = load_uniprot_metadata(INPUT_TSV_PATH)
    
    # 2. Generate Chunks
    chunks = generate_chunks(
        proteins=proteins, 
        seq_window_size=args.seq_window, 
        seq_overlap=args.seq_overlap
    )
    
    # 3. Generate Embeddings
    embeddings = compute_embeddings(chunks, model_name=args.model)
    
    # 4. Save
    save_processed_data(
        chunks=chunks, 
        embeddings=embeddings, 
        chunks_path=CHUNKS_JSON_PATH, 
        embeddings_path=EMBEDDINGS_NPY_PATH
    )
    
    # 5. Run a live retrieval test to prove it works!
    test_retrieval(
        query=args.test_query, 
        chunks=chunks, 
        embeddings=embeddings, 
        model_name=args.model
    )
    
    logging.info("=== Processing Pipeline Completed Successfully ===")


if __name__ == "__main__":
    main()
