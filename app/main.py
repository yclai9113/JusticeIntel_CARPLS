from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from app.rag_service import RAGService
from fastapi.middleware.cors import CORSMiddleware
from app.extraction import pdf_extraction
from uuid import uuid4
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from llama_index.core import VectorStoreIndex
from llama_index.core.schema import Document

app = FastAPI()
rag_service = RAGService()

user_case_context = {}


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.get("/")
async def serve_react():
    return FileResponse("frontend/dist/index.html")



# @app.get("/")
# def read_root():
#     return {"message": "Backend is running"}


@app.post("/chat")
async def chat_endpoint(req: ChatRequest):

    case_context = user_case_context.get(req.session_id)

    result = await rag_service.chat(
        message=req.message,
        session_id=req.session_id,
        case_context=case_context
    )

    return result


# @app.post("/upload")
# async def upload_file(file: UploadFile = File(...)):
#     file_bytes = await file.read()
#     filename = file.filename.lower()
#     info, text = pdf_extraction(file_bytes, filename)

#     if not info:
#         return{"error": "Unsupported file type"}

#     session_id = str(uuid4())

#     user_case_context[session_id] = {
#         "info": info,
#         "text": text
#     }

#     return {
#         "success": True,
#         "session_id": session_id,
#         "info": info,
#         "text_preview": text[:1000]
#     }
    
    

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_bytes = await file.read()
    filename = file.filename.lower()
    info, text = pdf_extraction(file_bytes, filename)

    if not info:
        return {"error": "Unsupported file type"}

    session_id = str(uuid4())
    
    doc = Document(
        text=text,
        metadata={"source": filename}
    )
    
    user_index = VectorStoreIndex.from_documents([doc])

    user_case_context[session_id] = {
        "info": info,
        "text": text,
        "index": user_index
    }

    return {
        "success": True,
        "session_id": session_id,
        "info": info,
        "text_preview": text[:1000]
    }

