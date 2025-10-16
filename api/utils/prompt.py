import json
from enum import Enum
from openai.types.chat.chat_completion_message_param import ChatCompletionMessageParam
from pydantic import BaseModel
import base64
from typing import List, Optional, Any
from .attachment import ClientAttachment

class ToolInvocationState(str, Enum):
    CALL = 'call'
    PARTIAL_CALL = 'partial-call'
    RESULT = 'result'

class ToolInvocation(BaseModel):
    state: ToolInvocationState
    toolCallId: str
    toolName: str
    args: Any
    result: Any


class ClientMessage(BaseModel):
    role: str
    content: str
    experimental_attachments: Optional[List[ClientAttachment]] = None
    toolInvocations: Optional[List[ToolInvocation]] = None


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