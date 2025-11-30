from api.utils.code_execution import DataAnalysisSession
from dotenv import load_dotenv
import os
import re
from typing import List, Dict, Any, Optional


load_dotenv()


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




def execute_data_analysis(instructions: str, files: Dict[str, str]) -> Dict[str, Any]:
    """
    Execute data analysis code based on instructions from the orchestrator agent.
    This is a tool function called by the main agent.
    
    Args:
        instructions: Code generation instructions from the main agent
        files: Dict mapping sandbox filenames to file paths/URLs
               e.g., {"data.csv": "https://blob.vercel.com/..."}
    
    Returns:
        Dictionary containing execution results
    """
    session: Optional[DataAnalysisSession] = None
    
    try:
        print(f"📊 Initializing E2B sandbox session...")
        
        # Initialize sandbox session
        session = DataAnalysisSession()
        session.init_session(files=files)
        print("✓ Session ready")
        
        print(f"🤖 Processing instructions...")
        
        # Extract Python code from instructions
        code_blocks = extract_python_code(instructions)
        
        if not code_blocks:
            return {
                "success": False,
                "error": "No executable code found in instructions",
                "stdout": [],
                "stderr": []
            }
        
        print(f"✓ Found {len(code_blocks)} code block(s) to execute")
        
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
