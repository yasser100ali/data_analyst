from api.utils.code_execution import DataAnalysisSession
from dotenv import load_dotenv
import os
import re
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI


load_dotenv()

# Initialize OpenAI client for the data analyst agent
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def extract_python_code(text: str) -> List[str]:
    """
    Extract Python code blocks from markdown text.
    
    Args:
        text: Text containing markdown code blocks
        
    Returns:
        List of Python code strings
    """
    # Pattern to match ```python or ``` followed by code
    pattern = r'```(?:python)?\n(.*?)```'
    matches = re.findall(pattern, text, re.DOTALL)
    return [match.strip() for match in matches if match.strip()]


def generate_python_code(instructions: str, files: Dict[str, str]) -> str:
    """
    Use an LLM to generate Python code based on natural language instructions.
    
    Args:
        instructions: Natural language instructions from orchestrator
        files: Dictionary of available files in the sandbox
        
    Returns:
        Generated Python code as a string
    """
    # Build the system prompt for the code generation agent
    system_prompt = """You are an expert Python data analyst. Your job is to write Python code to analyze data files.

You will receive:
1. Natural language instructions about what analysis to perform
2. A list of available data files in the sandbox

You should:
- Write complete, executable Python code
- Use pandas for data manipulation and analysis
- Include proper error handling
- Add print statements to show results
- Use matplotlib or seaborn for visualizations when appropriate
- Keep code clean and well-commented

Available files in the sandbox:
{files}

IMPORTANT: 
- Return ONLY the Python code wrapped in ```python code blocks
- Do not include explanations outside the code block
- Files are available in the current directory (no path needed)
- Always print your results clearly
""".format(files=json.dumps(list(files.keys()), indent=2))

    # Call the LLM to generate code
    response = client.chat.completions.create(
        model="gpt-5.1",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": instructions}
        ],
        temperature=0.1,  # Low temperature for consistent code generation
    )
    
    return response.choices[0].message.content


def execute_data_analysis(instructions: str, files: Dict[str, str]) -> Dict[str, Any]:
    """
    Execute data analysis based on natural language instructions from the orchestrator.
    This function uses an LLM to generate Python code, then executes it in a sandbox.
    
    Args:
        instructions: Natural language instructions from the orchestrator agent
                     e.g., "Write python code to find the most impactful features for 'pts' in nba_seasons.csv"
        files: Dict mapping sandbox filenames to file paths/URLs
               e.g., {"nba_seasons.csv": "https://blob.vercel.com/..."}
    
    Returns:
        Dictionary containing execution results
    """
    session: Optional[DataAnalysisSession] = None
    
    try:
        print(f"📊 Initializing E2B sandbox session...")
        
        # Initialize sandbox session with files
        session = DataAnalysisSession()
        session.init_session(files=files)
        print("✓ Session ready")
        
        print(f"🤖 Generating Python code from instructions...")
        
        # Use LLM to generate Python code from natural language instructions
        llm_response = generate_python_code(instructions, files)
        
        # Extract Python code from LLM response
        code_blocks = extract_python_code(llm_response)
        
        if not code_blocks:
            return {
                "success": False,
                "error": "LLM did not generate valid Python code",
                "stdout": [],
                "stderr": [],
                "llm_response": llm_response
            }
        
        print(f"✓ Generated {len(code_blocks)} code block(s)")
        
        # Execute each code block
        all_stdout = []
        all_stderr = []
        
        for idx, code in enumerate(code_blocks):
            print(f"⚙️  Executing code block {idx + 1}/{len(code_blocks)}...")
            stdout, stderr = session.execute_code(code)
            all_stdout.extend(stdout)
            all_stderr.extend(stderr)
        
        print("✓ Code execution complete")
        
        return {
            "success": len(all_stderr) == 0 or all(not err.strip() for err in all_stderr),
            "code": code_blocks,
            "stdout": all_stdout,
            "stderr": all_stderr
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            "success": False,
            "error": f"Execution failed: {str(e)}",
            "stdout": [],
            "stderr": []
        }
    
    finally:
        # Clean up session
        if session:
            session.close()
            print("✓ Session closed")
