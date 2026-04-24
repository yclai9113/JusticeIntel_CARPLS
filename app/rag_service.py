from llama_index.core import Settings, StorageContext, load_index_from_storage
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
import re
import json
import asyncio
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import BaseRetriever
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core import QueryBundle
from llama_index.core import VectorStoreIndex
from llama_index.core.schema import Document
from app.extraction import pdf_extraction
from llama_index.core.chat_engine import ContextChatEngine

PERSIST_DIR = "./storage"

SYSTEM_PROMPT = """
You are a legal assistant that helps users understand legal documents and court-related information.

YOUR GOALS:
- Explain information clearly in plain, simple language.
- Be helpful, calm, and conversational.
- Prioritize accuracy based ONLY on the provided documents.
- Help the user understand what actions they may need to take.

KNOWLEDGE SOURCES:
You may receive information from:
1. General legal documents (global database)
2. Judge information documents
3. The user's uploaded case documents

RULES FOR USING SOURCES:
- If the question is about the user's case, prioritize the user's uploaded document.
- If the question is general (e.g., court process, definitions), prioritize the global database.
- If both are relevant, combine them clearly.
- Do NOT assume facts that are not in the documents.
- If the user ask about specific judge, refer to the judges info document.
- Always provide user tips of the observations from other courtgoers.

WHEN INFORMATION IS MISSING:
- If the answer is not found, say:
  "The documents do not contain enough information to answer this question."
- Ask the user to upload the missing document to get more information.

STYLE GUIDELINES:
- Use plain English (avoid legal jargon unless necessary).
- Keep answers short and clear.
- Break information into bullet points or numbered lists when helpful.
- Answers should be in markdown format. Always add markdown format for links.
- Make important words bold.

INTERACTION BEHAVIOR:
- If the user's question is vague, ask clarifying questions.
- If the situation is case-specific, guide the user to provide more details.
- Be conversational, not just a one-time answer generator.

OUTPUT FORMAT:
- Provide a clear answer first.
- At the end of the response, provide some questions the user can ask. Add a section exactly like this:
Follow-up questions:
1. Question one
2. Question two
- Do not include anything after the follow-up questions.
- Do not add formats to follow-up questions.


EXAMPLES:

User: What is this document about?
Assistant:
This document is a notice about your upcoming court hearing. It tells you when and where you need to appear.

Follow-up questions:
1. How to find court date in this document?
2. What should I bring to the hearing?

User: My judge is Judge Forti
Assistant:
Judge Lori Rosen is assigned to Courtroom 3001 at the Daley Courthouse.  
You can find more information about her on the Cook County Courts website: [https://www.cookcountycourtil.gov/judge/rosen-lori](https://www.cookcountycourtil.gov/judge/rosen-lori).  
It's also worth noting that other courtgoers have observed that Judge Rosen reminds litigants to "Complete every box on the forms. Do not leave any forms blank." This means it's a good idea to carefully review and fill out all sections of any documents you need to submit in your case.

Follow-up questions:
1. How to check my scheduled court date?
2. How to contact the court?
"""

# SYSTEM_PROMPT = """
# You are a legal document section extractor.
# Your job is to extract the correct section and present it in clean, readable format.

# GENERAL RULES:
# - Provide in a friendly tone.
# - Don't include too many legal terms. Use plain language and describe the problem in a way that anyone can understand.
# - Do NOT add new content.

# FORMAT NORMALIZATION RULES:
# - If a requirement label (e.g., (a), a., (i), etc.) is split from its text by a newline, join them into one line.
# - Ensure each requirement appears as a single paragraph.
# - Remove unnecessary line breaks inside a requirement.
# - Do NOT alter legal meaning.

# TASK — Requirements / Eligibility Questions:
# 1. Identify the section defining eligibility requirements.
# 2. Extract ONLY the section listing the legal requirements.
# 4. If the requirements is too long, try not to provide all at once. 
# 5. Keep the answer short and easy to understand.

# When you receive user case metadata (Judge, Courtroom, Case Date):
# 1. If the question asks about a specific judge, courtroom, case date, or case-specific detail, prioritize matching that information from the retrieved documents.
# 2. Use the provided case metadata to narrow down the relevant section.
# 3. If there is extra notes for the judge, provide it.
# 4. "nan" represents None for the information, do NOT include it.

# If the user ask about personal case related information, but the user case metadata is not provided:
# Guide the user to use "Upload" page to upload case related document for the system the extract information.

# If the answer is not found, respond exactly:
# "The documents do not contain enough information to answer this question."


# OUTPUT FORMAT:
# - Clean and readable format.
# - No extra commentary.
# - Short and easy to understand.
# - When showing list, use "1. 2. 3. ". DO NOT use "a. b. c. ".
# - At the end of the response, provide some questions the user can ask. Add a section exactly like this:
# Follow-up questions:
# 1. Question one
# 2. Question two
# - Do not include anything after the follow-up questions.
# """


class RAGService:
    def __init__(self):
        self.chat_engines = {}
        
        Settings.embed_model = HuggingFaceEmbedding(
            model_name="BAAI/bge-base-en-v1.5"
        )

        Settings.llm = Ollama(
            model="llama3.1",
            request_timeout=360.0,
            context_window=8000,
            temperature=0.0
        )
        
        Settings.node_parser = SentenceSplitter(
            chunk_size=600,
            chunk_overlap=50,
        )

        storage_context = StorageContext.from_defaults(
            persist_dir=PERSIST_DIR
        )

        self.index = load_index_from_storage(storage_context)
        
    async def chat(self, message, session_id=None, case_context=None):
        
        retrievers = []

        # global retriever
        global_retriever = self.index.as_retriever()
        retrievers.append(global_retriever)

        # user document retriever
        if case_context and "index" in case_context:
            user_retriever = case_context["index"].as_retriever(similarity_top_k=4)
            retrievers.append(user_retriever)

        # combine retrievers
        class HybridRetriever(BaseRetriever):
            def __init__(self, retrievers, top_k=4):
                self.retrievers = retrievers
                self.top_k = top_k

            def _retrieve(self, query_bundle: QueryBundle):
                all_nodes = []

                for r in self.retrievers:
                    all_nodes.extend(r.retrieve(query_bundle))

                # deduplicate
                seen = set()
                unique_nodes = []
                for n in all_nodes:
                    if n.node.node_id not in seen:
                        seen.add(n.node.node_id)
                        unique_nodes.append(n)

                # sort
                unique_nodes.sort(key=lambda x: x.score or 0, reverse=True)

                return unique_nodes[:self.top_k]

        hybrid_retriever = HybridRetriever(retrievers)
        
        query_engine = RetrieverQueryEngine.from_args(
            hybrid_retriever,
            llm=Settings.llm,
        )
        chat_engine = ContextChatEngine.from_defaults(
            retriever=hybrid_retriever,
            llm=Settings.llm,
            system_prompt=SYSTEM_PROMPT
        )
        
        

        prompt = ""
        # if case_context and case_context.get("info"):
        #     prompt += f"""My Case Information:
        #     Judge: {case_context["info"].get('judge')}
        #     Courtroom: {case_context["info"].get('courtroom')}
        #     Court Date: {case_context["info"].get('date')}
        #     """
        #     print("USER CASE INFO")
        #     print(case_context["info"])

        full_prompt = prompt + "\nUser Question:\n" + message
        print("===== FULL USER PROMPT =====")
        print(full_prompt)
        print("============================")
        print("Session ID:", session_id)
        

        # response = query_engine.query(full_prompt)
        # text = response.response
        response = chat_engine.chat(full_prompt)
        text = str(response)
        
        print(text)
        # print(repr(text))
        
        # print("\n===== SOURCES USED =====")

        # for i, node in enumerate(response.source_nodes):
        #     print(f"\n--- Source {i+1} ---")
        #     print("Score:", node.score)
        #     print("Metadata:", node.node.metadata)
        #     print("Text preview:", node.node.text[:200])
            
        answer = text
        parts = text.split("Follow-up questions:")
        answer = parts[0].strip()
        followups = []
        if len(parts) > 1:
            questions = re.findall(r'\d+\.\s*(.+)', parts[1])
            followups = questions[:2]

        if answer[-2] == '*':
            answer = answer[:-2]

        return {
            "answer": answer,
            "followups": followups
        }



def build_case_from_pdf(pdf_path: str):
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    filename = pdf_path.lower()

    info, text = pdf_extraction(file_bytes, filename)

    if not info:
        raise ValueError("Unsupported file type")

    doc = Document(
        text=text,
        metadata={"source": filename}
    )

    user_index = VectorStoreIndex.from_documents([doc])

    return {
        "info": info,
        "text": text,
        "index": user_index
    }
    
async def main():
    rag_service = RAGService()

    case_context = build_case_from_pdf("user_data/APR.pdf")

    print("PDF loaded successfully")
    # print("Extracted info:", case_context["info"])
    # case_context = None

    user_input = input("User: ")
    while user_input:
        print("Waiting for response...")


        result = await rag_service.chat(
            message=user_input,
            session_id="test_session",
            case_context=case_context
        )

        print("\nAssistant:", result["answer"])

        user_input = input("\nUser: ")
        
        
'''
async def main():
    rag_service = RAGService()
    user_input = input("User: ")
    while user_input:
        print("Waiting for response...")
        # judge_info = find_judge(user_input)
        # extra_context = ""
        # if judge_info:
        #     extra_context = format_judge_info(judge_info)
            
        # final_prompt = f"""
        # {extra_context}

        # {expand_query(user_input)}
        # """

        result = await rag_service.chat(
            message=user_input,
            session_id=0,
        )

        # print("\n", result)
        user_input = input("\nUser: ")
'''

if __name__ == "__main__":
    asyncio.run(main())
    # rag_service = RAGService()
    # user_input = input("User: ")
    # while user_input:
    #     print("Waiting for response...")

    #     result = await rag_service.chat(
    #         message=user_input,
    #         session_id=0,
    #     )

    #     print("\n", result["answer"])
    #     user_input = input("\nUser: ")

        