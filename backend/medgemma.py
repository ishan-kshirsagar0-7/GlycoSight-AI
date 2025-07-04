# Testing out a medical fine-tuned LLM called MedGemma-14b-it by deploying an instance on GCP.

from google.cloud import aiplatform

def get_medgemma_chat_prediction(project_id, endpoint_id, region, messages, max_output_tokens=1024, temperature=0.7):
    aiplatform.init(project=project_id, location=region)
    endpoint = aiplatform.Endpoint(f"projects/{project_id}/locations/{region}/endpoints/{endpoint_id}")

    instances = [
        {
            "@requestFormat": "chatCompletions",
            "messages": messages,
            "max_tokens": max_output_tokens
        }
    ]

    parameters = {
        "temperature": temperature,
    }

    response = endpoint.predict(instances=instances, parameters=parameters)
    
    return response.predictions["choices"][0]["message"]["content"]


# text_only_messages = [
#     {"role": "user", "content": [{"type": "text", "text": "What are the early symptoms of Type 2 Diabetes?"}]}
# ]

# text_output = get_medgemma_chat_prediction(
#     project_id=my_project_id,
#     endpoint_id=my_endpoint_id,
#     region=my_region,
#     messages=text_only_messages,
#     max_output_tokens=200
# )
# print(text_output)

multimodal_messages = [
    {"role": "system", "content": [{"type": "text", "text": "You are an expert doctor."}]},
    {"role": "user", "content": [
        {"type": "text", "text": "Analyze the given retinal scan and check for signs of diabetic retinopathy."},
        {"type": "image_url", "image_url": {"url": "https://i.ibb.co/nN3dcz8Q/image.png"}}
    ]}
]

image_output = get_medgemma_chat_prediction(
    project_id=my_project_id,
    endpoint_id=my_endpoint_id,
    region=my_region,
    messages=multimodal_messages,
    max_output_tokens=1024
)
print(image_output)

# RESULT - The outputs generated by this model are pretty accurate but it does cost both money and time - due to the latency as well as GCP's pricing policies for deployed models on Vertex AI (costs will be incurred on a per-hour basis even if no API calls are made to our deployed model). However, the outputs of Gemini API are slightly better in accuracy or quality as compared to this one, therefore I decided to stick to Gemini.