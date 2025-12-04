import os
from dotenv import load_dotenv
from e2b_code_interpreter import Sandbox
import requests
import re 
from typing import Optional 

load_dotenv()
api_key = os.environ.get("E2B_API_KEY")


class DataAnalysisSession:
    """
    Manages a persistent E2B sandbox session for analyzing files.
    Reuses the same sandbox across multiple queries for efficiency.
    """
    
    def __init__(self):
        self.api_key = api_key
        self.sandbox = None
    
    def init_session(self, files: dict = None):
        """
        Initialize sandbox and upload files once.
        
        Args:
            files: Dict mapping sandbox paths to local/blob file paths
                   e.g., {"data.csv": "https://blob.vercelusercontent.com/..."}
                   or {"data.csv": "/local/path/to/file.csv"}
        """
        self.sandbox = Sandbox.create(api_key=self.api_key)
        
        if files:
            for sandbox_path, source_path in files.items():
                # Handle blob URLs
                if source_path.startswith(("http://", "https://")):
                    response = requests.get(source_path)
                    self.sandbox.files.write(sandbox_path, response.content)
                # Handle local file paths
                else:
                    with open(source_path, 'rb') as f:
                        self.sandbox.files.write(sandbox_path, f)
        
        print(f"✓ Session initialized with {len(files) if files else 0} file(s)")
    
    def execute_code(self, code: str):
        """
        Execute code in the persistent sandbox.
        
        Args:
            code: Python code to execute
            
        Returns:
            tuple: (stdout, stderr) as lists of strings
        """
        if not self.sandbox:
            raise RuntimeError("Session not initialized. Call init_session() first.")
        
        execution = self.sandbox.run_code(code)
        return execution.logs.stdout, execution.logs.stderr
    
    def close(self):
        """Clean up and close the sandbox session."""
        if self.sandbox:
            # E2B Sandbox is managed as context manager, 
            # so it auto-closes when going out of scope
            self.sandbox = None
            print("✓ Session closed")


def extract_python(code_str:str) -> Optional[str]:
    PYTHON_FENCE = re.compile(
        r"```python\s*\n(.*?)```",
        flags=re.DOTALL | re.IGNORECASE
    )
    match = PYTHON_FENCE.seach(code_str)
    return match.group(1).strip() if match else None


# Example usage
if __name__ == "__main__":
    # Initialize session with file
    session = DataAnalysisSession()
    
    files_to_upload = {
        "all_seasons.csv": "/Users/yasser/Documents/Projects/data_analyst/api/uploads/all_seasons.csv"
    }
    
    session.init_session(files=files_to_upload)
    
    # Query 1: Analyze data
    code1 = """
import pandas as pd

df = pd.read_csv("all_seasons.csv")

print("Columns:", list(df.columns))

if "pts" not in df.columns:
    raise KeyError("Column 'pts' not found in CSV")

avg_pts = df["pts"].mean()
print("Average pts:", avg_pts)

corr = (
    df.select_dtypes(include=["number"])
      .corrwith(df["pts"])
      .sort_values(ascending=False)
)
print("Correlation with pts (top 10):")
print(corr.head(10))
"""
    
    stdout, stderr = session.execute_code(code1)
    print("=== Query 1 ===")
    print("STDOUT:")
    print("\n".join(stdout))
    if stderr:
        print("STDERR:")
        print("\n".join(stderr))
    
    # Query 2: Another analysis on same file (no re-upload needed!)
    code2 = """
print("Additional analysis on same file:")
print("Shape:", df.shape)
print("Data types:", df.dtypes.to_dict())
"""
    
    stdout, stderr = session.execute_code(code2)
    print("\n=== Query 2 ===")
    print("STDOUT:")
    print("\n".join(stdout))
    
    # Close session when done
    session.close()