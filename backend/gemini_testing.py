# Testing a FREE API of Gemini LLM to compare its results with the open-source MedGemma-14b-it

from google import genai
from google.genai import types
import requests
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)
MODEL = "gemini-2.5-flash-preview-05-20"

diabetic_image_path = "https://i.ibb.co/s4gh2mb/image.png"
non_diabetic_image_path = "https://i.ibb.co/qYH3fSmX/image.png"
diabetic_img_bytes = requests.get(diabetic_image_path).content
non_diabetic_img_bytes = requests.get(non_diabetic_image_path).content

diabetic_img = types.Part.from_bytes(data=diabetic_img_bytes, mime_type="image/jpeg")
non_diabetic_img = types.Part.from_bytes(data=non_diabetic_img_bytes, mime_type="image/jpeg")

response_diabetic = client.models.generate_content(
    model=MODEL,
    contents=[
        "Analyze the given retinal scan and check for signs of diabetic retinopathy. Provide a detailed analysis, with an estimated decision on whether the patient has diabetic retinopathy or not, with a confidence score.",
        diabetic_img
    ]
).text

# print(response_diabetic)

response_non_diabetic = client.models.generate_content(
    model=MODEL,
    contents=[
        "Analyze the given retinal scan and check for signs of diabetic retinopathy. Provide a detailed analysis, with an estimated decision on whether the patient has diabetic retinopathy or not, with a confidence score.",
        non_diabetic_img
    ]
).text

# print(response_non_diabetic)

# RESULT - Turns out the Gemini API has the accuracy on par with the open-source model, but has a lower latency. Besides, the functionalities that this API provides such as Image Understanding, Structured Responses, Document Understanding clearly place it miles ahead of any open-source implementations (at least with context to this prototype of the app).