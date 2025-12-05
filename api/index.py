import os
import json
from typing import List, Optional
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from .utils.prompt import ClientMessage, convert_to_openai_messages, extract_files_from_messages
from .agents.coding_agent import coding_agent 
#from .agents.research_agent import ResearchAgent

import shutil
import os
import glob 

load_dotenv()

app = FastAPI()

# Mount the uploads directory to serve files statically
# Ensure the directory exists
os.makedirs("api/uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="api/uploads"), name="uploads")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://127.0.0.1:3000",  # Local development (loopback)
        "https://dataanalyst-zeta.vercel.app",  # Production frontend
        "https://atlasanalyst.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)


class Request(BaseModel):
    messages: List[ClientMessage]


instructions = """
You are the Atlas Data Analyst Agent, a full stack project built by AI Engineer Yasser.

You are an intelligent orchestrator that helps users analyze data. Your role is to:

1. Understand user questions about their data
2. Decide when data analysis is needed vs when you can answer directly
3. When analysis is needed, call the coding_agent tool with clear, natural language instructions
4. Present results from the analysis tool to the user in a helpful, clear manner

IMPORTANT:
- You are NOT responsible for writing Python code yourself
- When the user asks for data analysis, call the tool with natural language instructions
- The tool contains an expert data analyst agent that will generate and execute the code
- Your job is to orchestrate and communicate, not to code

Example:
- User: "Find the most impactful features for pts scored"
- You should call the tool with instructions like: "Analyze the dataset to find which features have the strongest correlation with the 'pts' variable. Show the top features ranked by their impact."

You are helpful, analytical, and focused on providing accurate data insights.
""".strip()


tools = [
    {
        "type": "function",
        "name": "coding_agent",
        "description": "Write and execute Python code to analyze data based on user instructions.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The natural language instruction for the analysis (e.g. 'Calculate average points per game')"
                }
            },
            "required": ["query"]
        
        }
    }
]

def stream_text(messages: List[dict], files_dict: dict = None):
    # Pick a valid model. Examples: "gpt-5.1" (reasoning) or "gpt-4o-mini" (fast/cheap)
    model_name = "gpt-5.1"
    input_list = messages.copy()

    max_iteration = 5
    iteration = 0
    while iteration < max_iteration:
        has_function_call = False 
        # Stream with tools enabled
        with client.responses.stream(
            model=model_name,
            instructions=instructions,
            input=input_list,
            reasoning={"effort": "none"},
            tools=tools
        ) as stream:
            for event in stream:
                et = getattr(event, "type", None)
                print(f"EVENT TYPE: {et}", flush=True)
                # Stream plain text deltas
                if et == "response.output_text.delta":
                    yield "0:{text}\n".format(text=json.dumps(event.delta))

                # Optional: surface model/tool errors mid-stream
                elif et == "response.error":
                    print(f"❌ ERROR: {event}", flush=True)
                    err = getattr(event, "error", {}) or {}
                    msg = err.get("message", "unknown error")
                    yield 'e:{{"finishReason":"error","message":{msg}}}\n'.format(
                        msg=json.dumps(msg)
                    )

            # When the stream completes, you can fetch the final structured response
            final_response = stream.get_final_response()
            input_list += final_response.output
            # function calls 
            for item in final_response.output:
                if item.type == "function_call":
                    has_function_call = True 
                    if item.name == "coding_agent":
                        args = json.loads(item.arguments)
                        analysis_query = args.get("query")
                        
                        stdout, stderr, code_str = coding_agent(analysis_query, files_dict)

                        output_section = "\n".join(stdout) if stdout else ""
                        if stderr:
                            output_section += ("\n\nErrors:\n" if output_section else "Errors:\n") + "\n".join(stderr)

                        # Prepare the tool result for the MODEL context
                        # We can just use the text output for the model to reason about.
                        # The model doesn't necessarily need the code repeated back to it in the tool output, 
                        # but it helps if it needs to debug.
                        # Let's include code in the context but plain.
                        result_text_for_context = f"Output:\n{output_section}\n\nCode Executed:\n{code_str}"

                        # Inject the code block into the CLIENT stream
                        # This makes it appear in the chat UI.
                        if code_str:
                            code_block_markdown = f"\n```python\n{code_str}\n```\n\n"
                            yield '0:{text}\n'.format(text=json.dumps(code_block_markdown))
                        
                        # Add function result to input for next iteration
                        input_list.append({
                            "type": "function_call_output",
                            "call_id": item.call_id,
                            "output": result_text_for_context
                        })
        if not has_function_call:
            break 

        iteration += 1

    if final_response:
        usage = getattr(final_response, "usage", None)
        # The Responses API reports tokens typically as input_tokens/output_tokens
        prompt_tokens = getattr(usage, "input_tokens", None) if usage else None
        completion_tokens = getattr(usage, "output_tokens", None) if usage else None
        
        # Send your terminal event line (no tools here)
        yield 'e:{{"finishReason":"stop","usage":{{"promptTokens":{prompt},"completionTokens":{completion}}},"isContinued":false}}\n'.format(
            prompt=json.dumps(prompt_tokens),
            completion=json.dumps(completion_tokens),
        )
    
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = f"api/uploads/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Construct URL suitable for local dev
    # In production, this would need to use the actual domain
    url = f"http://127.0.0.1:8000/uploads/{file.filename}"
    
    return {"url": url, "name": file.filename, "type": file.content_type}


@app.post("/api/chat")
async def handle_chat_data(request: Request):
    print("\n🚀 /api/chat endpoint hit!", flush=True)
    messages = request.messages
    print(f"📨 Received {len(messages)} messages", flush=True)
    
    # Extract uploaded files from message attachments
    files_dict = extract_files_from_messages(messages)
    print(f"📁 Extracted {len(files_dict)} files: {list(files_dict.keys())}", flush=True)
    
    # Convert to OpenAI format
    openai_messages = convert_to_openai_messages(messages)
    print(f"✅ Converted to {len(openai_messages)} OpenAI messages", flush=True)

    response = StreamingResponse(
        stream_text(openai_messages, files_dict),
        media_type="text/plain",
    )
    response.headers['x-vercel-ai-data-stream'] = 'v1'
    response.headers['Cache-Control'] = 'no-cache'
    return response
