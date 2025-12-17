from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv
from ..utils.code_execution import DataAnalysisSession, extract_python
from ..utils.prompt import _response_to_text
import pandas as pd 
import os 

# this agent will also be responsible for creating charts and visuals when they seem needed. 

load_dotenv() 
client = OpenAI() 

PROMPT = """
You are Atlas' dedicated Python coding agent.

Core rules:
- Input comes from the orchestrator and local files already in the working directory. NEVER download from URLs or the internet.
- ONLY load data if the query requires data analysis. For pure calculations (math, algorithms, etc.), do NOT load any datasets.
- When data loading IS needed: use pandas; on first read, sample with nrows (e.g., 200); print shape, dtypes, head(5), and tail(5).
- Validate upfront: check file existence; assert required columns before use; handle missing values explicitly.
- Output requirements: print ONLY what's relevant to answer the query. Keep output minimal and focused.
- For charts, ALSO emit an inline Markdown image using a base64 data URL so the frontend can render it: encode the PNG buffer with base64 and print `![chart](data:image/png;base64,<...>)`.
- Code style: respond with a single fenced ```python``` block only (no prose outside). Prefer small helper functions; keep code concise and readable.
- Safety and performance: avoid long-running operations or heavy memory use; do not mutate source files; avoid network calls.
- Errors: raise descriptive errors when expected columns/files are missing; fail fast with helpful messages.

Example for DATA ANALYSIS:
```python
import pandas as pd

df = pd.read_csv("data.csv", nrows=200)
print("Shape:", df.shape)
print("Dtypes:", df.dtypes.to_dict())
print(df.head())

# analysis
...
print("Result:", result)
```

Example for PURE CALCULATION (no data loading):
```python
def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

result = fib(18) * fib(41)
print(f"18th Fibonacci * 41st Fibonacci = {result}")
```
"""

class CodeArtifact(BaseModel):
    code: str



def get_python_response(query: str) -> str:
    # If files were uploaded, give the model a clear hint to read them locally
    # instead of trying to fetch from localhost/HTTP (which fails inside the sandbox).
    if query and isinstance(query, str):
        pass  # placeholder to keep original query unmodified below

    response = client.responses.create(
        model="gpt-5.1",
        instructions=PROMPT,
        input=query,
        reasoning={"effort": "none"},
    )
    
    response_text = _response_to_text(response)
    python_code_string = extract_python(response_text or "")

    if not python_code_string:
        raise ValueError("Model response did not include a Python code block.")

    return python_code_string

# add below get_python_response
def _summarize_files(files_to_upload: dict) -> str:
    """Build a short, safe summary of uploaded tabular files."""
    summaries = []
    for sandbox_name, source_path in (files_to_upload or {}).items():
        meta = [f"File: {sandbox_name}", f"Local path: {source_path}"]
        try:
            ext = os.path.splitext(source_path)[1].lower()
            if ext in [".xls", ".xlsx"]:
                df = pd.read_excel(source_path, nrows=50)
            else:
                df = pd.read_csv(source_path, nrows=50)
            cols = list(df.columns)
            col_list = ", ".join(cols[:50]) + (" ..." if len(cols) > 50 else "")
            dtypes = {c: str(t) for c, t in df.dtypes.items()}
            sample = df.head(2).to_dict(orient="records")
            meta.append(f"Shape preview: {df.shape}")
            meta.append(f"Columns ({len(cols)}): {col_list}")
            meta.append(f"Dtypes: {dtypes}")
            meta.append(f"Sample rows (head 2): {sample}")
        except Exception as e:
            meta.append(f"Could not summarize: {e}")
        summaries.append("\n".join(meta))
    return "\n\n".join(summaries)

def coding_agent(query, files_to_upload: dict = None):
    # When files are provided, append guidance so the model reads local copies.
    if files_to_upload:
        file_list = ", ".join(files_to_upload.keys())
        metadata = _summarize_files(files_to_upload=files_to_upload)
        query = (
            f"{query}\n\nYou already have these files locally in the working "
            f"directory: {file_list}. Read them directly by filename (do not "
            f"try to download via localhost URLs).\n\n"
            f"File metadata: \n{metadata}"
        )

        print("-"*40)
        print(f"QUERY: \n{query}\n")
        print("-"*40)

    # this may be inefficient creating a new session every time you execute -> look into better solution 
    python_string = get_python_response(query)
    session = DataAnalysisSession()
    session.init_session(files=files_to_upload or {})
    stdout, stderr = session.execute_code(python_string)
    print(f"LLM Answer given code: \n{python_string}")
    print("-" * 40)
    print("STDOUT:", stdout)
    print("STDERR:", stderr)
    print("-" * 40)
    session.close()

    return (stdout, stderr, python_string)