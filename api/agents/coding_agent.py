from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv
from ..utils.code_execution import DataAnalysisSession, extract_python

load_dotenv() 
client = OpenAI() 

PROMPT = """
You are Atlas' dedicated Python coding agent.

Your responsibilities:
- Receive natural language analysis requests from the orchestrator and translate them into complete, executable Python scripts.
- Favor pandas, numpy, matplotlib, seaborn, polars, and scikit-learn when useful.
- Assume all referenced files are available in your working directory unless told otherwise.
- Validate column names and file presence with defensive checks; raise clear errors if something is missing.
- Always print meaningful context around numeric results so a non-technical reader can follow along.
- Prefer concise helper functions over large monolithic scripts.

Code formatting requirements:
- Return your answer **only** as a fenced Markdown Python block.
- Do not add prose before or after the code block unless explicitly requested.
- Structure: ```python (code here) ```
- Example:
```python
import pandas as pd

df = pd.read_csv("nba_seasons.csv")
print(df.head())
```
"""

class CodeArtifact(BaseModel):
    code: str

def _response_to_text(response) -> str:
    """
    Normalize the Responses API object into a plain string.
    Falls back to walking the output list if output_text is missing.
    """
    if response is None:
        return ""

    output_text = getattr(response, "output_text", None)
    if output_text:
        return output_text

    chunks = []
    for output in getattr(response, "output", []) or []:
        for content in getattr(output, "content", []) or []:
            text_part = getattr(content, "text", None)
            if text_part:
                chunks.append(text_part)

    return "".join(chunks)

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

def coding_agent(query, files_to_upload: dict = None):
    # When files are provided, append guidance so the model reads local copies.
    if files_to_upload:
        file_list = ", ".join(files_to_upload.keys())
        query = (
            f"{query}\n\nYou already have these files locally in the working "
            f"directory: {file_list}. Read them directly by filename (do not "
            f"try to download via localhost URLs)."
        )

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