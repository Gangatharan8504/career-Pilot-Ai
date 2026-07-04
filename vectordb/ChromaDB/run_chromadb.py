import os
import sys
import subprocess

def main():
    print("=== CareerPilot AI - ChromaDB Local Runner ===")
    
    # 1. Verify/Install chromadb package
    try:
      import chromadb
      print("✓ chromadb is already installed.")
    except ImportError:
      print("Installing 'chromadb' package via pip...")
      try:
          subprocess.check_call([sys.executable, "-m", "pip", "install", "chromadb"])
          print("✓ chromadb package installed successfully!")
      except Exception as e:
          print(f"Error: Failed to install chromadb package. Details: {e}")
          print("Please run: pip install chromadb")
          sys.exit(1)

    # 2. Define db persistence directory
    db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "chroma_data"))
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
        print(f"Created persistence directory at: {db_dir}")

    # 3. Launch ChromaDB Server
    # chroma run --host localhost --port 8000 --path ./chroma_data
    print(f"Starting ChromaDB server at http://localhost:8000 with path: {db_dir}")
    print("Press Ctrl+C to stop the database server.")
    
    try:
        # We start the chroma server directly using its CLI module
        # Equivalent to running command shell: chroma run
        subprocess.run([
            sys.executable, "-m", "chromadb.cli.cli", "run", 
            "--host", "localhost", 
            "--port", "8000", 
            "--path", db_dir
        ])
    except KeyboardInterrupt:
        print("\nChromaDB server stopped by user.")
    except Exception as e:
        print(f"Error launching ChromaDB CLI module: {e}")
        print("Alternative command to start server: chroma run --path ./chroma_data")

if __name__ == "__main__":
    main()
