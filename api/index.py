import os
import json
from typing import List, Optional
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from .utils.prompt import ClientMessage, convert_to_openai_messages
from .agents.coding_agent import codingAgent
from .agents.research_agent import ResearchAgent

import shutil
import os

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
        "https://dataanalyst-zeta.vercel.app",  # Production frontend
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
3. When analysis is needed, call the execute_data_analysis tool with clear, natural language instructions
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


# Define the data analysis tool for the agent
data_analysis_tool = {
    "type": "function",
    "function": {
        "name": "execute_data_analysis",
        "description": "Call an expert data analyst agent to analyze data files. Use this when the user asks questions about uploaded datasets, wants statistical analysis, visualizations, or data transformations. The tool will generate and execute the necessary Python code.",
        "parameters": {
            "type": "object",
            "properties": {
                "instructions": {
                    "type": "string",
                    "description": "Natural language instructions describing what analysis to perform. Be specific about what the user wants to know. The data analyst agent will generate the Python code. Example: 'Find the correlation between all features and the pts variable, and show the top 10 most correlated features.'"
                },
                "files": {
                    "type": "object",
                    "description": "Dictionary mapping filenames to their URLs/paths. E.g., {'nba_seasons.csv': 'http://127.0.0.1:8000/uploads/nba_seasons.csv'}",
                    "additionalProperties": {"type": "string"}
                }
            },
            "required": ["instructions", "files"]
        }
    }
}


def stream_text(messages: List[dict], protocol: str = "data"):
    # Pick a valid model. Examples: "gpt-5.1" (reasoning) or "gpt-4o-mini" (fast/cheap)
    model_name = "gpt-5.1"

    # Stream with tools enabled
    with client.responses.stream(
        model=model_name,
        instructions=instructions,
        input=messages,
        reasoning={"effort": "none"},
        # tools=[data_analysis_tool]
    ) as stream:
        for event in stream:
            et = getattr(event, "type", None)

            # Stream plain text deltas
            if et == "response.output_text.delta":
                yield "0:{text}\n".format(text=json.dumps(event.delta))



            # Optional: surface model/tool errors mid-stream
            elif et == "response.error":
                err = getattr(event, "error", {}) or {}
                msg = err.get("message", "unknown error")
                yield 'e:{{"finishReason":"error","message":{msg}}}\n'.format(
                    msg=json.dumps(msg)
                )

        # When the stream completes, you can fetch the final structured response
        final = stream.get_final_response()

        # Usage fields are on the final response (when available)
        usage = getattr(final, "usage", None)
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
async def handle_chat_data(request: Request, protocol: str = Query('data')):
    messages = request.messages
    openai_messages = convert_to_openai_messages(messages)

    response = StreamingResponse(stream_text(openai_messages, protocol))
    response.headers['x-vercel-ai-data-stream'] = 'v1'
    return response
