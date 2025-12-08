import json
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam
from pydantic import BaseModel
import base64
from typing import List, Optional
from pydantic import BaseModel
import os 

class ClientAttachment(BaseModel):
    name: str
    contentType: str
    url: str


class ClientMessage(BaseModel):
    role: str
    content: str
    experimental_attachments: Optional[List[ClientAttachment]] = None


def convert_to_openai_messages(messages: List[ClientMessage]) -> List[dict]:
    """
    Convert to Responses-friendly [{role, content}] messages:
    - Drop tool_calls, tool results, and role=='tool' messages
    - Flatten multi-part content to plain text (attachments omitted)
    """
    openai_messages: List[dict] = []

    for message in messages:
        # Flatten content + any text attachments into one string
        text_parts = [message.content or ""]
        if message.experimental_attachments:
            for a in message.experimental_attachments:
                # keep only text attachments as text; ignore images for now
                if a.contentType.startswith("text"):
                    text_parts.append(a.url)

        flat_text = "".join(text_parts).strip()

        # Skip any tool results entirely
        if message.role == "tool":
            continue

        openai_messages.append({
            "role": message.role,   # 'user' or 'assistant'
            "content": flat_text,
        })

    return openai_messages 


# Add helper function to extract files from messages
def extract_files_from_messages(messages: List[ClientMessage]) -> dict:
    """
    Extract uploaded files from message attachments.
    Returns dict mapping filename to local path.
    """
    files = {}
    for message in messages:
        if message.experimental_attachments:
            for attachment in message.experimental_attachments:
                # Check if it's a CSV or data file
                if attachment.contentType in ['text/csv', 'application/vnd.ms-excel']:
                    # Extract filename from URL (e.g., "http://127.0.0.1:8000/uploads/file.csv")
                    filename = attachment.name
                    local_path = f"api/uploads/{filename}"
                    
                    # Verify file exists locally
                    if os.path.exists(local_path):
                        files[filename] = local_path
    return files

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