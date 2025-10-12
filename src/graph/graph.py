from langchain_openai import ChatOpenAI
from langchain_google_genai import GoogleGenerativeAI
from dotenv import load_dotenv
from pydantic import BaseModel

class QuestionGeneratorOutput(BaseModel):
    question: str
    correct_answer: str
    answers: list[str]

load_dotenv()

question_generator_client = GoogleGenerativeAI(model="gemini-2.5-flash").with_structured_output(QuestionGeneratorOutput)



