import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agentic_workflow import app as agentic_app

app = FastAPI(
    title="GlycoSight AI API",
    description="API for the GlycoSight AI diabetes risk assessment workflow.",
    version="1.0.0"
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

@app.post("/diagnose")
async def diagnose(
    user_id: str = Form(...),
    input_type: str = Form(...),
    file: UploadFile = File(...)
):
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        initial_state = {
            "user_id": user_id,
            "file_path": file_path,
            "input_type": input_type,
        }

        print(f"--- API: Invoking workflow for user {user_id} with file {file.filename} ---")

        final_state = await agentic_app.ainvoke(initial_state)

        print(f"--- API: Workflow finished for user {user_id} ---")

        if error_message := final_state.get("error_message"):
            raise HTTPException(status_code=400, detail=error_message)

        if final_response := final_state.get("final_response"):
            return final_response
        else:
            raise HTTPException(status_code=500, detail="Workflow did not produce a final response.")


@app.get("/")
def read_root():
    return {"status": "GlycoSight AI API is running"}