from agents import Agent 
from pydantic import BaseModel 


PROMPT = """


"""

class ResearchItem(BaseModel):
    code: str

ResearchAgent = Agent(
    name="research_agent",
    model="gpt-5.1",
    reasoning={"effort": "none"},
    instructions=PROMPT,
    output_type=ResearchItem
)