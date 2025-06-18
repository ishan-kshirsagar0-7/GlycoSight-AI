from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import pathlib
import json
from prompts import patient_json_maker_prompt, is_image_prompt, final_rag_prompt, visual_rag_prompt
from schemas import DiabetesClinicalData, RAGDiagnosisResponse
import pydicom
from PIL import Image
from supabase import create_client, Client
from datetime import datetime
import copy
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
MODEL = "gemini-2.5-flash-preview-05-20"
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


def fetch_user_profile(user_id: str):
    try:
        response = supabase.table('user_health_profiles').select('*').eq('id', user_id).single().execute()
    except Exception as e:
        response = f"No past records found for this user. Here's the error: {e}"

    return response.data


def _get_report_date(data: dict):
    date_str = data.get('patient_info', {}).get('report_date')
    if date_str:
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
    return None


def merge_clinical_data(existing_data: dict, new_data: dict):
    if not existing_data:
        return new_data
    if not new_data:
        return existing_data

    existing_date = _get_report_date(existing_data)
    new_date = _get_report_date(new_data)

    if new_date and (not existing_date or new_date > existing_date):
        latest_record = new_data
        older_record = existing_data
    else:
        latest_record = existing_data
        older_record = new_data
    
    merged = copy.deepcopy(latest_record)

    for category, items in older_record.items():
        if category not in merged:
            merged[category] = {}

        for key, old_value in items.items():
            current_merged_value = merged.get(category, {}).get(key)

            if isinstance(old_value, dict) and 'value' in old_value:
                if isinstance(current_merged_value, dict) and current_merged_value.get('value') is None and old_value.get('value') is not None:
                    merged[category][key] = old_value
            else:
                if current_merged_value is None and old_value is not None:
                    merged[category][key] = old_value
    
    return merged


def upsert_user_profile(user_id: str, final_structured_data: dict, final_diagnostic_response: dict):
    data_to_upsert = {
        'id': user_id,
        'structured_clinical_data': final_structured_data,
        'latest_diagnostic_response': final_diagnostic_response,
        'updated_at': 'now()'
    }
    
    supabase.table('user_health_profiles').upsert(data_to_upsert).execute()


def extract_patient_parameters_from_pdf(pdf_path):
    filepath = pathlib.Path(pdf_path)
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(
                data=filepath.read_bytes(),
                mime_type="application/pdf",
            ),
            patient_json_maker_prompt
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": DiabetesClinicalData
        }
    ).text

    final_dict = json.loads(response)
    return final_dict


def extract_patient_parameters_from_image(image_path):
    imgpath = client.files.upload(file=image_path)
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            imgpath,
            patient_json_maker_prompt
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": DiabetesClinicalData
        }
    ).text

    final_dict = json.loads(response)
    return final_dict


def identify_image_type(image_path):
    imgpath = client.files.upload(file=image_path)
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            imgpath,
            is_image_prompt
        ]
    ).text

    return response


def rag_from_corpus(userid, json_params):
    filepath = pathlib.Path("assets/ADA.pdf")
    try:
        patient_past_data = fetch_user_profile(userid)
    except Exception as e:
        patient_past_data = None

    if patient_past_data:
        latest_json_params = merge_clinical_data(patient_past_data["structured_clinical_data"], json_params)
        past_analysis = patient_past_data["latest_diagnostic_response"]
    else:
        latest_json_params = json_params
        past_analysis = {}

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(
                data=filepath.read_bytes(),
                mime_type="application/pdf",
            ),
            f"{final_rag_prompt}\n{latest_json_params}\nHere's the past analysis:\n{past_analysis}"
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": RAGDiagnosisResponse
        }
    ).text

    parsed_response = json.loads(response)

    upsert_user_profile(userid, latest_json_params, parsed_response)
    return parsed_response


def convert_dicom_to_jpeg(dicom_path, jpeg_path):
    dicom_file = pydicom.dcmread(dicom_path)
    pixel_array = dicom_file.pixel_array
    image = Image.fromarray(pixel_array)
    image.save(jpeg_path, "JPEG")
    return jpeg_path


def vlm_analysis_for_scans(userid, image_path):
    file_extension = pathlib.Path(image_path).suffix.lower()
    path_to_upload = image_path

    if file_extension == ".dcm":
        print("---VLM_NODE: Detected DICOM, converting to JPEG...---")
        jpeg_path = image_path + ".jpg"
        path_to_upload = convert_dicom_to_jpeg(image_path, jpeg_path)

    imgpath = client.files.upload(file=path_to_upload)
    filepath = pathlib.Path("assets/VisualRAG.pdf")
    try:
        patient_past_data = fetch_user_profile(userid)
    except Exception as e:
        patient_past_data = None

    if patient_past_data:
        json_params = patient_past_data["structured_clinical_data"]
        past_analysis = patient_past_data["latest_diagnostic_response"]
    else:
        json_params = {
            "patient_info": {
                "name": None,
                "age_years": None,
                "gender": None,
                "report_date": None
            },
            "lab_results": {
                "hba1c": {
                    "value": None,
                    "unit": None,
                    "status_flag": None
                },
                "fasting_plasma_glucose": {
                    "value": None,
                    "unit": None,
                    "status_flag": None
                },
                "two_hr_ogtt_glucose": {
                    "value": None,
                    "unit": None,
                    "status_flag": None
                },
                "random_plasma_glucose": {
                    "value": None,
                    "unit": None,
                    "status_flag": None
                },
                "bmi": {
                    "value": None,
                    "unit": None,
                    "status_flag": None
                }
            },
            "symptoms_history": {
                "polyuria": None,
                "polydipsia": None,
                "polyphagia": None,
                "unexplained_weight_loss": None,
                "fatigue": None,
                "blurred_vision": None,
                "slow_healing_sores_infections": None,
                "family_history_diabetes": None,
                "ethnicity": None,
                "history_gestational_diabetes": None,
                "history_prediabetes": None,
                "history_hypertension": None,
                "history_dyslipidemia": None,
                "history_pcos": None,
                "current_medications_keywords": [],
                "other_relevant_medical_history": None
            }
        }
        past_analysis = {}
    
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            imgpath,
            types.Part.from_bytes(
                data=filepath.read_bytes(),
                mime_type="application/pdf",
            ),
            f"{visual_rag_prompt}\n{past_analysis}"
        ],
        config={
            "response_mime_type": "application/json",
            "response_schema": RAGDiagnosisResponse
        }
    ).text

    final_dict = json.loads(response)
    upsert_user_profile(userid, json_params, final_dict)
    return final_dict