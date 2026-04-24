import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.schema import Document
import pandas as pd
import fitz  # PyMuPDF
import re

PERSIST_DIR = "./storage"

Settings.embed_model = HuggingFaceEmbedding(
    model_name="BAAI/bge-base-en-v1.5"
)

Settings.llm = Ollama(
    model="llama3.1",
    request_timeout=360.0,
    context_window=8000,
)

Settings.node_parser = SentenceSplitter(
    chunk_size=600,
    chunk_overlap=50,
)


def clean_text(text: str) -> str:
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)

    return text.strip()

def load_clean_pdfs(folder_path):
    documents = []

    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".txt"):
                file_path = os.path.join(root, file)

                with open(file_path, 'r', encoding='utf-8') as f:
                    cleaned = f.read()
                # print(cleaned)
                documents.append(
                    Document(
                        text=cleaned,
                        metadata={"source": file}
                    )
                )
                print(f"Completed: {file_path}")
            # if file.endswith(".pdf"):
            #     file_path = os.path.join(root, file)
            #     pdf = fitz.open(file_path)

            #     full_text = ""
            #     for page in pdf:
            #         full_text += page.get_text("text") + "\n"

            #     cleaned = clean_text(full_text)
            #     documents.append(
            #         Document(
            #             text=cleaned,
            #             metadata={"source": file}
            #         )
            #     )
            #     print(f"Completed: {file_path}")

    return documents

documents = load_clean_pdfs("data")
df = pd.read_csv("data/judge_info/judges_daley.csv")

for _, row in df.iterrows():
    text = f"""
    Judge Name: {row['Judge Name']}
    Courthouse: {row['COURTHOUSE']}
    Courtroom: {row['Courtroom']}
    Calendar: {row['Calendar']}
    Link: {row['Link']}
    Note: {row['Note']}
    Extra Note: {row['Extra Notes ']}
    """
    
    cleaned = clean_text(text)

    documents.append(
        Document(
            text=cleaned,
            metadata={"source": "judges_daley.csv"}
        )
    )

index = VectorStoreIndex.from_documents(
    documents,
    show_progress=True
)
index.storage_context.persist(persist_dir=PERSIST_DIR)

print("Index built and saved.")