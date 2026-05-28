import os
import json
import logging
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

# Configure logger
logger = logging.getLogger("protmind.rag")

class ProtMindRAG:
    """
    RAG Service for ProtMind Bioinformatics Platform.
    Integrates FAISS vector database search over UniProt/AlphaFold chunks
    and builds augmented prompts for downstream LLM generation.
    """
    def __init__(
        self, 
        chunks_path: str = None, 
        embeddings_path: str = None, 
        model_name: str = "all-MiniLM-L6-v2"
    ):
        # Resolve default paths relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
        
        self.chunks_path = chunks_path or os.path.join(
            project_root, "data_ingestion", "processed_chunks", "cca_panel_chunks.json"
        )
        self.embeddings_path = embeddings_path or os.path.join(
            project_root, "data_ingestion", "processed_chunks", "cca_panel_embeddings.npy"
        )
        self.model_name = model_name
        
        self.model = None
        self.chunks = []
        self.embeddings = None
        self.index = None
        
        # Load the index
        self._initialize_index()

    def _initialize_index(self):
        """
        Loads the precomputed chunks and embeddings, and initializes the FAISS Index.
        """
        logger.info("Initializing ProtMind RAG vector index...")
        
        if not os.path.exists(self.chunks_path) or not os.path.exists(self.embeddings_path):
            logger.warning(
                f"Vector database files not found at:\n"
                f"  Chunks: {self.chunks_path}\n"
                f"  Embeddings: {self.embeddings_path}\n"
                f"Please run the ingest.py and chunk_and_embed.py pipelines first."
            )
            return

        try:
            # Load metadata chunks
            with open(self.chunks_path, "r", encoding="utf-8") as f:
                self.chunks = json.load(f)
            
            # Load numpy embeddings
            self.embeddings = np.load(self.embeddings_path).astype("float32")
            
            # Load sentence transformer model
            self.model = SentenceTransformer(self.model_name)
            
            # Build FAISS index for Cosine Similarity (IndexFlatIP on normalized vectors)
            faiss.normalize_L2(self.embeddings)
            dimension = self.embeddings.shape[1]
            
            # Flat Inner Product index
            self.index = faiss.IndexFlatIP(dimension)
            self.index.add(self.embeddings)
            
            logger.info(
                f"FAISS index loaded successfully with {self.index.ntotal} vectors "
                f"of dimension {dimension}."
            )
        except Exception as e:
            logger.error(f"Failed to initialize FAISS index: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Queries the FAISS index and returns the top-k most similar protein metadata/sequence chunks.
        
        Args:
            query (str): The search query.
            top_k (int): Number of top results to retrieve.
            
        Returns:
            list: List of dicts representing the retrieved chunks with score and metadata.
        """
        if self.index is None or self.model is None or not self.chunks:
            logger.error("RAG Index is not initialized. Cannot perform search.")
            return []
            
        # 1. Encode query
        query_vector = self.model.encode(query, convert_to_numpy=True).astype("float32")
        query_vector = np.expand_dims(query_vector, axis=0)
        
        # 2. Normalize for Cosine Similarity
        faiss.normalize_L2(query_vector)
        
        # 3. Perform search
        scores, indices = self.index.search(query_vector, top_k)
        
        results = []
        for rank in range(top_k):
            idx = indices[0][rank]
            score = scores[0][rank]
            
            # Skip invalid index markers (e.g., -1 when index has fewer vectors than top_k)
            if idx < 0 or idx >= len(self.chunks):
                continue
                
            chunk = self.chunks[idx].copy()
            chunk["similarity_score"] = float(score)
            results.append(chunk)
            
        return results

    def generate_augmented_prompt(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Constructs an augmented prompt containing the user query and the retrieved database context.
        
        Args:
            query (str): The researcher's natural language question.
            retrieved_chunks (list): List of retrieved chunk dictionaries.
            
        Returns:
            str: The fully formatted augmented prompt.
        """
        context_blocks = []
        
        for idx, chunk in enumerate(retrieved_chunks):
            chunk_type = chunk.get("type", "unknown").upper()
            chunk_id = chunk.get("id", "unknown")
            score = chunk.get("similarity_score", 0.0)
            content = chunk.get("content", "").strip()
            
            block = (
                f"Source [{idx + 1}] | {chunk_type} (Accession: {chunk.get('uniprot_id')}) | "
                f"Similarity: {score:.4f} | Chunk ID: {chunk_id}\n"
                f"--------------------------------------------------\n"
                f"{content}\n"
                f"--------------------------------------------------"
            )
            context_blocks.append(block)
            
        context_str = "\n\n".join(context_blocks) if context_blocks else "No relevant context found in database."
        
        prompt = (
            f"You are ProtMind AI, an expert biomedical AI and bioinformatics research assistant. "
            f"Your focus is on a panel of Cancer-Associated (CCA) proteins (such as TP53, HRAS, JUN, Insulin, etc.).\n\n"
            f"Use the following retrieved database context to formulate a scientifically accurate, detailed, "
            f"and structured answer to the user's query. If the context does not contain the answer, "
            f"use your deep knowledge of structural biology and bioinformatics, but make sure to clearly distinguish "
            f"between information retrieved from the ProtMind database vs. general scientific knowledge.\n\n"
            f"RETRIEVED DATABASE CONTEXT:\n"
            f"==================================================\n"
            f"{context_str}\n"
            f"==================================================\n\n"
            f"USER QUERY: {query}\n\n"
            f"BIOINFORMATICS REPORT & ANSWER:"
        )
        
        return prompt
