from pydantic import BaseModel, Field
from typing import Optional, List, Union

class LabResultDetail(BaseModel):
    value: Optional[Union[float, int]] = None
    unit: Optional[str] = None
    status_flag: Optional[str] = None

class PatientInfo(BaseModel):
    name: Optional[str] = None
    age_years: Optional[int] = None
    gender: Optional[str] = None
    report_date: Optional[str] = None

class LabResults(BaseModel):
    hba1c: LabResultDetail = Field(default_factory=LabResultDetail)
    fasting_plasma_glucose: LabResultDetail = Field(default_factory=LabResultDetail)
    two_hr_ogtt_glucose: LabResultDetail = Field(default_factory=LabResultDetail)
    random_plasma_glucose: LabResultDetail = Field(default_factory=LabResultDetail)
    bmi: LabResultDetail = Field(default_factory=LabResultDetail)

class SymptomsHistory(BaseModel):
    polyuria: Optional[bool] = None
    polydipsia: Optional[bool] = None
    polyphagia: Optional[bool] = None
    unexplained_weight_loss: Optional[bool] = None
    fatigue: Optional[bool] = None
    blurred_vision: Optional[bool] = None
    slow_healing_sores_infections: Optional[bool] = None
    family_history_diabetes: Optional[bool] = None
    ethnicity: Optional[str] = None
    history_gestational_diabetes: Optional[bool] = None
    history_prediabetes: Optional[bool] = None
    history_hypertension: Optional[bool] = None
    history_dyslipidemia: Optional[bool] = None
    history_pcos: Optional[bool] = None
    current_medications_keywords: List[str] = Field(default_factory=list)
    other_relevant_medical_history: Optional[str] = None

class DiabetesClinicalData(BaseModel):
    patient_info: PatientInfo = Field(default_factory=PatientInfo)
    lab_results: LabResults = Field(default_factory=LabResults)
    symptoms_history: SymptomsHistory = Field(default_factory=SymptomsHistory)

class ConfidenceScore(BaseModel):
    score: int
    justification: str

class ParameterAnalysis(BaseModel):
    parameter_name: str
    analysis_text: str

class Citations(BaseModel):
    id: int
    reference: str
    url: str

class RAGDiagnosisResponse(BaseModel):
    summary: str
    analysis: List[ParameterAnalysis]
    citations: List[Citations]
    final_diagnosis: str
    confidence_score: ConfidenceScore
    alert_color: str