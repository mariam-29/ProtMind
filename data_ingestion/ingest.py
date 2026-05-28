#!/usr/bin/env python3
"""
ProtMind Data Ingestion Pipeline - CCA 200 Protein Panel Setup
==============================================================
This script automates the creation of the local directory architecture and fetches:
1. UniProt Metadata (Accession, Entry Name, Protein Names, Gene Names, Sequence, GO IDs)
2. AlphaFold PDB 3D structure predictions

Designed to run locally for ProtMind MVP development.
"""

import os
import sys
import time
import json
import urllib.request
import urllib.parse
import urllib.error
import logging

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
# Script directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Required Folders
RAW_DATA_DIR = os.path.join(SCRIPT_DIR, "raw_data")
STRUCTURES_DIR = os.path.join(RAW_DATA_DIR, "structures")
METADATA_DIR = os.path.join(RAW_DATA_DIR, "metadata")
PROCESSED_CHUNKS_DIR = os.path.join(SCRIPT_DIR, "processed_chunks")

# Output File Paths
UNIPROT_TSV_PATH = os.path.join(METADATA_DIR, "cca_panel_uniprot.tsv")

# Mock subset of the Cancer-Associated (CCA) protein panel
# (Placeholder representing the full 200 CCA panel)
DEFAULT_UNIPROT_IDS = ['P01308', 'P04637', 'P62136', 'P01112', 'P05412']

# -----------------------------------------------------------------------------
# Ingestion Functions
# -----------------------------------------------------------------------------

def setup_folder_architecture():
    """
    Creates the required directory tree if it does not already exist:
    ├── data_ingestion/
    │   ├── raw_data/
    │   │   ├── structures/
    │   │   └── metadata/
    │   └── processed_chunks/
    """
    logging.info("Initializing ProtMind directory architecture...")
    dirs = [RAW_DATA_DIR, STRUCTURES_DIR, METADATA_DIR, PROCESSED_CHUNKS_DIR]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
            logging.info(f"Created directory: {d}")
        else:
            logging.info(f"Directory already exists: {d}")
    logging.info("Folder setup complete.")


def fetch_uniprot_metadata(uniprot_ids, output_path, chunk_size=50, delay=1.0):
    """
    Queries the UniProt REST API to fetch metadata for the specified list of accessions.
    Saves the fetched tabular data as a TSV file.
    
    Args:
        uniprot_ids (list): List of UniProt Accessions.
        output_path (str): Target output file path (TSV format).
        chunk_size (int): Max accessions per API request (prevents URL-length issues).
        delay (float): Time to sleep between chunk requests in seconds to respect rate limits.
    """
    logging.info(f"Starting UniProt metadata fetch for {len(uniprot_ids)} IDs...")
    
    headers = {
        "User-Agent": "ProtMind-Bioinformatics-Platform/1.0 (contact: engineering@protmind.org)"
    }
    
    all_rows = []
    header = None

    # Process accessions in chunks
    for i in range(0, len(uniprot_ids), chunk_size):
        chunk = uniprot_ids[i:i + chunk_size]
        logging.info(f"Fetching chunk {i//chunk_size + 1}: {chunk}")
        
        # Construct accession search query
        query_str = " OR ".join([f"accession:{uid}" for uid in chunk])
        
        # Request specific columns: accession, id (Entry name), protein_name, gene_names, sequence, go_id (Gene Ontology IDs)
        params = {
            "query": query_str,
            "format": "tsv",
            "fields": "accession,id,protein_name,gene_names,sequence,go_id"
        }
        
        url = f"https://rest.uniprot.org/uniprotkb/search?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers=headers)
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                content = response.read().decode("utf-8")
                lines = content.strip().split("\n")
                
                if lines:
                    # Capture header from first successful chunk
                    if not header:
                        header = lines[0]
                    # Append data rows (skipping header)
                    all_rows.extend(lines[1:])
                    logging.info(f"Fetched {len(lines) - 1} rows from chunk.")
                else:
                    logging.warning(f"No lines returned for chunk.")
                    
        except urllib.error.HTTPError as e:
            logging.error(f"UniProt HTTP Error {e.code} for chunk: {e.reason}")
        except urllib.error.URLError as e:
            logging.error(f"UniProt Connection Error for chunk: {e.reason}")
        except Exception as e:
            logging.error(f"Unexpected error parsing UniProt chunk: {e}")
            
        # Respect API rate limits between requests
        if i + chunk_size < len(uniprot_ids):
            time.sleep(delay)

    # Save outputs if any rows were successfully retrieved
    if all_rows and header:
        try:
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(header + "\n")
                for row in all_rows:
                    f.write(row + "\n")
            logging.info(f"Successfully saved combined TSV metadata to {output_path}")
        except Exception as e:
            logging.error(f"Failed to write metadata file: {e}")
    else:
        logging.error("Metadata fetch failed: No data retrieved.")


def download_alphafold_structures(uniprot_ids, output_dir, delay=1.0):
    """
    Downloads AlphaFold PDB files for each UniProt ID and saves them to the specified directory.
    Queries the AlphaFold API to find the exact up-to-date pdbUrl, and falls back to v4
    if the API query fails.
    
    Args:
        uniprot_ids (list): List of UniProt Accessions.
        output_dir (str): Target directory for .pdb files.
        delay (float): Time to sleep between downloads in seconds to respect rate limits.
    """
    logging.info(f"Starting AlphaFold structures download for {len(uniprot_ids)} IDs...")
    
    headers = {
        "User-Agent": "ProtMind-Bioinformatics-Platform/1.0 (contact: engineering@protmind.org)"
    }
    
    success_count = 0
    failure_count = 0

    for index, uid in enumerate(uniprot_ids):
        clean_uid = uid.strip().upper()
        pdb_filename = f"{clean_uid}.pdb"
        dest_path = os.path.join(output_dir, pdb_filename)
        
        logging.info(f"[{index+1}/{len(uniprot_ids)}] Ingesting AlphaFold structure for: {clean_uid}")
        
        # 1. First, attempt to query the AlphaFold DB API to get the correct, current URL
        api_url = f"https://alphafold.ebi.ac.uk/api/prediction/{clean_uid}"
        pdb_url = None
        
        try:
            req = urllib.request.Request(api_url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                api_data = json.loads(response.read().decode("utf-8"))
                if isinstance(api_data, list) and len(api_data) > 0:
                    pdb_url = api_data[0].get("pdbUrl")
                    if pdb_url:
                        logging.info(f"  Found structure URL via AlphaFold API: {pdb_url}")
                else:
                    logging.warning(f"  Empty or unexpected response from AlphaFold API for {clean_uid}")
        except Exception as e:
            logging.warning(f"  Failed to query AlphaFold API for {clean_uid}: {e}. Will attempt fallback URL.")
            
        # 2. Fall back to the manual model_v4.pdb url structure if not found via API
        if not pdb_url:
            pdb_url = f"https://alphafold.ebi.ac.uk/files/AF-{clean_uid}-F1-model_v4.pdb"
            logging.info(f"  Using default v4 structure URL: {pdb_url}")
            
        # 3. Download the file from pdb_url
        try:
            req = urllib.request.Request(pdb_url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as response:
                with open(dest_path, "wb") as f:
                    while True:
                        buffer = response.read(8192)
                        if not buffer:
                            break
                        f.write(buffer)
            logging.info(f"  Successfully downloaded: {pdb_filename}")
            success_count += 1
            
        except urllib.error.HTTPError as e:
            if e.code == 404:
                logging.warning(f"  Structure file not found (404) at: {pdb_url}. Skipping.")
            else:
                logging.error(f"  HTTP Error {e.code} downloading structure for {clean_uid}: {e.reason}")
            failure_count += 1
        except urllib.error.URLError as e:
            logging.error(f"  Connection Error downloading structure for {clean_uid}: {e.reason}")
            failure_count += 1
        except Exception as e:
            logging.error(f"  Unexpected error downloading structure for {clean_uid}: {e}")
            failure_count += 1
            
        # Respect AlphaFold DB API servers by adding a rate limit delay
        if index + 1 < len(uniprot_ids):
            time.sleep(delay)

    logging.info("AlphaFold ingestion task complete.")
    logging.info(f"Results Summary -> Success: {success_count}, Failed/Skipped: {failure_count}")


# -----------------------------------------------------------------------------
# Main Execution Flow
# -----------------------------------------------------------------------------

def main():
    """Main pipeline execution function."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="ProtMind Ingestion Pipeline: Setup structures and metadata folder ingestion."
    )
    parser.add_argument(
        "--ids", 
        nargs="+", 
        default=DEFAULT_UNIPROT_IDS, 
        help="List of UniProt Accessions to fetch. Defaults to mock CCA panel list."
    )
    parser.add_argument(
        "--uniprot-delay", 
        type=float, 
        default=1.0, 
        help="Rate-limit delay for UniProt API requests (seconds)."
    )
    parser.add_argument(
        "--alphafold-delay", 
        type=float, 
        default=0.5, 
        help="Rate-limit delay for AlphaFold API requests (seconds)."
    )
    
    args = parser.parse_args()
    
    logging.info("=== ProtMind Data Ingestion Pipeline Started ===")
    
    # 1. Directory Tree Setup
    setup_folder_architecture()
    
    # 2. Ingest Metadata
    fetch_uniprot_metadata(
        uniprot_ids=args.ids, 
        output_path=UNIPROT_TSV_PATH,
        delay=args.uniprot_delay
    )
    
    # 3. Ingest AlphaFold Structures
    download_alphafold_structures(
        uniprot_ids=args.ids, 
        output_dir=STRUCTURES_DIR,
        delay=args.alphafold_delay
    )
    
    logging.info("=== ProtMind Data Ingestion Pipeline Completed Successfully ===")


if __name__ == "__main__":
    main()
