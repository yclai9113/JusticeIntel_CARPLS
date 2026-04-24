from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import re
import pandas as pd
from rapidfuzz import process, fuzz
from datetime import datetime

judges = pd.read_csv("./data/judge_info/judges_daley.csv")
JudgeNames = judges["Judge Name"].str.lower().tolist()


def normalize_text(text: str) -> str:
    # Fix common OCR junk
    text = text.replace("\x0c", " ")
    text = text.replace("\r", "\n")

    # Join broken words like "Indirec! t"
    text = re.sub(r'([A-Za-z])\n([a-z])', r'\1\2', text)

    # Collapse whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n+', '\n', text)

    return text

def find_judge(text: str):
    text_lower = text.lower()

    match = process.extractOne(
        text_lower,
        JudgeNames,
        scorer=fuzz.partial_ratio,
        score_cutoff=80  # tune 75–90
    )

    if not match:
        return "", None

    judge_name = match[0]
    row = judges[judges["Judge Name"].str.lower() == judge_name].iloc[0]
    return judge_name.title(), row

def find_courtroom(text: str):
    patterns = [
        r'courtroom\s*(\d{3,4})',
        r'room\s*(\d{3,4})',
        r'court\s*room\s*(\d{3,4})',
    ]

    for p in patterns:
        m = re.search(p, text, re.I)
        if m:
            return m.group(1)

    return ""


def find_date_time(text: str):

    # Allow minor OCR errors in "hearing"
    hearing_keywords = [
        r'set\s+for\s+h[ea][ad]ring',      # set for hearing
        r'hearing\s+on',                # hearing on
        r'returnable\s+on',             # rule returnable on
    ]

    # Date pattern: 3/10/26 or 03/10/2026
    date_pattern = r'(\d{1,2}/\d{1,2}/\d{2,4})'

    # Time pattern: 9:45 AM, 9:45AM, 9:45
    time_pattern = r'(\d{1,2}:\d{2})'
    
    for keyword in hearing_keywords:
        pattern = rf'{keyword}.*?{date_pattern}.*?at\s*{time_pattern}'
        match = re.search(pattern, text, re.I)

        if match:
            date_str = match.group(1)
            time_str = match.group(2)
            return (date_str, time_str)
            
        pattern = rf'{keyword}.*?{date_pattern}'
        match = re.search(pattern, text, re.I)
        if match:
            date_str = match.group(1)
            time_match = re.search(time_pattern, text, re.I)
            time_str = time_match.group()
            return (date_str, time_str)

    return ("", "")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""

    try:
        with fitz.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.get_text() or ""
    except Exception:
        pass


    # fallback OCR if text empty
    if len(text.strip()) < 20:
        text = extract_text_from_pdf_ocr(file_bytes)

    return text

def extract_text_from_pdf_ocr(file_bytes: bytes) -> str:
    text = ""
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    for page in doc:
        pix = page.get_pixmap(dpi=200)
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        text += pytesseract.image_to_string(img)

    return text

def extract_text_from_image(file_bytes: bytes) -> str:
    img = Image.open(io.BytesIO(file_bytes))
    return pytesseract.image_to_string(img)

def parse_case_info(text: str):
    clean = normalize_text(text)
    
    # --- judge via fuzzy ---
    judge_name, judge_row = find_judge(clean)

    # --- courtroom ---
    courtroom = find_courtroom(clean)

    # --- case type ---
    # case_type = find_case_type(clean)

    # --- courthouse ---
    courthouse = ""
    
    date, time = find_date_time(clean)
    date_time = ""
    if date:
        date_time = f'{date} at {time}'

    # --- if judge matched, trust CSV ---
    if judge_row is not None:
        courtroom = judge_row.get("Courtroom", courtroom)
        courthouse = judge_row.get("COURTHOUSE", courthouse)
        return {
            "courthouse": courthouse,
            "courtroom": str(courtroom),
            "date": f'{date} {time}',
            "judge": judge_name,
            "link": str(judge_row.get("Link", "")),
        }

    # --- fallback ---
    return {
        "courthouse": courthouse,
        "courtroom": courtroom,
        "date": date_time,
        "judge": judge_name,
        "link": "",
    }
    
def pdf_extraction(file_bytes, filename):
    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        text = extract_text_from_image(file_bytes)
    elif filename.endswith(".txt"):
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        return None

    info = parse_case_info(text)
    return info, text
  
  
if __name__ == "__main__":
    # file = "all_data/OrderOnRTSC.pdf"
    file = "test_data/summons.pdf"
    with open(file, "rb") as f:
        pdf_bytes = f.read()
        text = extract_text_from_pdf(pdf_bytes)
        # print(text)
        info = parse_case_info(text)
        print(info)
