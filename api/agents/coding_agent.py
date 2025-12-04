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

def get_python_response(query: str) -> str:
    response = client.responses.create(
        model="gpt-5.1",
        instructions=PROMPT,
        input=query,
        reasoning={"effort": "none"},
    )

    # extract python extracts python portion of LLM output using regex -> outputs as string
    python_code_string = extract_python(response)
    return python_code_string

def coding_agent(query, files_to_upload: dict = None):
    python_string = get_python_response(query)
    session = DataAnalysisSession()
    session.init_session(files=files_to_upload or {})
    stdout, stderr = session.execute_code(python_string)
    session.close()

    return (stdout, stderr)