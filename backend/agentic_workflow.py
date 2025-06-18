from typing import TypedDict, Optional, Literal, Dict, Any
from langgraph.graph import StateGraph, END
from utils import (
    extract_patient_parameters_from_pdf,
    identify_image_type,
    convert_dicom_to_jpeg,
    extract_patient_parameters_from_image,
    rag_from_corpus,
    vlm_analysis_for_scans
)

class AgenticWorkflowState(TypedDict):
    user_id: str
    file_path: str
    input_type: Literal["pdf", "image", "dicom"]
    image_type: Optional[Literal["TRUE", "FALSE", "NEITHER"]] = None
    structured_data: Optional[Dict[str, Any]] = None
    final_response: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


def entry_point_node(state: AgenticWorkflowState) -> dict:
    print("---NODE: Workflow Started---")
    return {}

def process_pdf_document(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Processing PDF Document---")
    file_path = state["file_path"]
    try:
        structured_data = extract_patient_parameters_from_pdf(file_path)
        return {"structured_data": structured_data}
    except Exception as e:
        return {"error_message": f"Failed to process PDF: {str(e)}"}

def classify_image_content(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Classifying Image Content---")
    file_path = state["file_path"]
    try:
        image_type = identify_image_type(file_path)
        cleaned_image_type = image_type.strip().upper()
        return {"image_type": cleaned_image_type}
    except Exception as e:
        return {"error_message": f"Failed to classify image: {str(e)}"}

def process_dicom_file(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Processing DICOM File---")
    file_path = state["file_path"]
    try:
        jpeg_path = file_path + ".jpg" 
        converted_path = convert_dicom_to_jpeg(file_path, jpeg_path)
        return {"file_path": converted_path}
    except Exception as e:
        return {"error_message": f"Failed to convert DICOM file: {str(e)}"}

def extract_data_from_report_image(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Extracting Data from Report Image---")
    file_path = state["file_path"]
    try:
        structured_data = extract_patient_parameters_from_image(file_path)
        return {"structured_data": structured_data}
    except Exception as e:
        return {"error_message": f"Failed to extract data from image: {str(e)}"}

def generate_text_based_diagnosis(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Generating Diagnosis from Text/PDF---")
    user_id = state["user_id"]
    structured_data = state["structured_data"]
    try:
        final_response = rag_from_corpus(user_id, structured_data)
        return {"final_response": final_response}
    except Exception as e:
        return {"error_message": f"Failed to generate text-based diagnosis: {str(e)}"}

def generate_scan_based_diagnosis(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Generating Diagnosis from Scan---")
    user_id = state["user_id"]
    file_path = state["file_path"]
    try:
        final_response = vlm_analysis_for_scans(user_id, file_path)
        return {"final_response": final_response}
    except Exception as e:
        return {"error_message": f"Failed to generate scan-based diagnosis: {str(e)}"}

def handle_unsupported_file(state: AgenticWorkflowState) -> Dict[str, Any]:
    print("---NODE: Handling Unsupported File Type---")
    return {"error_message": "The uploaded image is neither a recognized medical report nor a scan."}


def route_initial_input(state: AgenticWorkflowState) -> str:
    """This function is a router. It returns a string that is a key in our path map."""
    input_type = state["input_type"]
    print(f"---ROUTING: Initial input type is '{input_type}'---")
    if input_type == "pdf":
        return "process_pdf_document"
    elif input_type == "image":
        return "classify_image_content"
    elif input_type == "dicom":
        return "process_dicom_file"
    else:
        return "handle_unsupported_file"

def route_image_type(state: AgenticWorkflowState) -> str:
    """This function is a router. It decides how to handle an image after classification."""
    image_type = state["image_type"]
    print(f"---ROUTING: Classified image type is '{image_type}'---")
    if image_type == "TRUE":
        return "extract_data_from_report_image"
    elif image_type == "FALSE":
        return "generate_scan_based_diagnosis"
    else:
        return "handle_unsupported_file"


workflow = StateGraph(AgenticWorkflowState)

workflow.add_node("entry_point", entry_point_node)
workflow.add_node("process_pdf_document", process_pdf_document)
workflow.add_node("classify_image_content", classify_image_content)
workflow.add_node("process_dicom_file", process_dicom_file)
workflow.add_node("extract_data_from_report_image", extract_data_from_report_image)
workflow.add_node("generate_text_based_diagnosis", generate_text_based_diagnosis)
workflow.add_node("generate_scan_based_diagnosis", generate_scan_based_diagnosis)
workflow.add_node("handle_unsupported_file", handle_unsupported_file)
workflow.set_entry_point("entry_point")

workflow.add_conditional_edges(
    "entry_point",
    route_initial_input,
    {
        "process_pdf_document": "process_pdf_document",
        "classify_image_content": "classify_image_content",
        "process_dicom_file": "process_dicom_file",
        "handle_unsupported_file": "handle_unsupported_file"
    }
)

workflow.add_conditional_edges(
    "classify_image_content",
    route_image_type,
    {
        "extract_data_from_report_image": "extract_data_from_report_image",
        "generate_scan_based_diagnosis": "generate_scan_based_diagnosis",
        "handle_unsupported_file": "handle_unsupported_file"
    }
)

workflow.add_edge("process_pdf_document", "generate_text_based_diagnosis")
workflow.add_edge("extract_data_from_report_image", "generate_text_based_diagnosis")
workflow.add_edge("process_dicom_file", "generate_scan_based_diagnosis")
workflow.add_edge("generate_text_based_diagnosis", END)
workflow.add_edge("generate_scan_based_diagnosis", END)
workflow.add_edge("handle_unsupported_file", END)

app = workflow.compile()