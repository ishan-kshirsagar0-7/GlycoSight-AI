<div align="center">
  <img src="https://github.com/ishan-kshirsagar0-7/GlycoSight-AI/blob/master/frontend/src/assets/logo.png" alt="GlycoSight AI Logo" width="120" />
  <h1>
    GlycoSight AI
  </h1>
  <p>
    <strong>Your advanced AI copilot for preliminary Type-2 Diabetes risk assessment using multimodal medical files.</strong>
  </p>
</div>

---

## 🚀 Live Application & Demo

- **Live Web App:** **[https://glycosight-ai.vercel.app/](https://glycosight-ai.vercel.app/)**
- **Video Demo:** A full demonstration video is attached below:

https://github.com/user-attachments/assets/3a2657e8-5495-46ee-ba0f-9f016c89f9d1

---

## 📸 Screenshots

| AI Diagnosis & Upload                                   | Diagnosis Results                                 |
| --------------------------------------------------- | ----------------------------------------------------- |
| <img src="https://github.com/user-attachments/assets/1127e954-8a37-4246-8822-2b97d171d300" alt="Upload Screen" width="400"/> | <img src="https://github.com/user-attachments/assets/b4f39088-0eec-480a-87f8-a5384e0a935f" alt="Results Page" width="400"/> |

| Diagnosis Results (Confidence Justification)                             | Diagnosis Results (Citations)                            |
| --------------------------------------------------- | ----------------------------------------------------- |
| <img src="https://github.com/user-attachments/assets/25ebab89-5dc0-42e8-8c54-c4f43ec243b9" alt="Justification" width="400"/> | <img src="https://github.com/user-attachments/assets/71254983-eeef-4a5a-be22-fb16cc9fb7c7" alt="Citations" width="400"/> |

---

## 📋 Project Overview

GlycoSight AI is a sophisticated, full-stack web application developed as a take-home assignment for **Karyon Bio**. It addresses the challenge of early Type-2 Diabetes detection by empowering users to upload various medical documents—including lab reports, clinical notes, and even retinal / pancreatic / MRI scans—to receive an AI-driven risk assessment.

The application leverages a powerful, stateful backend that intelligently extracts, analyzes, and retains user health data over time, providing a comprehensive and evolving diagnostic picture. The system is designed with a core focus on accuracy, user privacy, and clinical verifiability, making it a robust prototype for a real-world healthcare tool.

---

## ✨ Key Features

This project was built with a production-ready mindset, focusing on features that deliver trust, intelligence, and a seamless user experience.

*   **🔐 Secure & Private by Design:** Your sensitive information, such as the content of uploaded PDFs or scans, is **never stored** in the database. The system processes them in-memory to extract necessary parameters and then discards them.
*   **🧠 Stateful & Context-Aware:** GlycoSight AI remembers you. Context is **retained across multiple uploads in any order**, empowering real clinical workflows. Upload a lab report today and a retinal scan tomorrow—the AI will merge the insights to refine its diagnosis.
*   **📄 Multimodal Data Ingestion:** Go beyond simple forms. The system accepts a variety of formats including **PDFs, standard images (`.png`, `.jpg`), and even medical `.dcm` (DICOM) files**, intelligently routing each to the appropriate analysis pipeline.
*   **🔍 Verifiable & Explainable AI (XAI):** Trust is paramount. All LLM-generated explanations are backed by **source-linked citations and confidence justifications**. Users can trace the AI's reasoning back to established medical guidelines.
*   **🌐 Fully Deployed & Live:** This isn't just local code. The entire application—both the React frontend and the FastAPI backend—is professionally deployed on **Vercel**, demonstrating a complete development-to-production workflow.
*   **🔒 Robust Authentication:** A complete and secure authentication system supporting both traditional **email/password sign-up** and seamless **Google OAuth**, built with Supabase.

---

## 🏛️ Technology Stack & Architecture

This project utilizes a modern, robust technology stack to deliver a high-performance, scalable application. The architecture is designed for a clean separation of concerns between the frontend user experience and the backend's complex AI processing.


| Application Flow & User Journey                                   | Backend Agentic Workflow                                 |
| --------------------------------------------------- | ----------------------------------------------------- |
| <img src="https://github.com/user-attachments/assets/2b08af73-ae02-4a52-a191-6a42e7bc6b73" alt="frontend" width="400"/> | <img src="https://github.com/user-attachments/assets/935b988b-f971-4b09-83fd-aeac74252f22" alt="agentic flow" width="400"/> |

---

## 🧠 The AI Core: An Agentic, Multimodal Workflow

The backend is not a simple script; it's an advanced **agentic workflow** built with **LangGraph**. This architecture allows for a sophisticated, multi-step reasoning process that mimics how a team of specialists would analyze a case.

- **Intelligent Routing:** Upon receiving a file, the workflow first identifies the input type (`pdf`, `image`, `dicom`) and routes it to a specialized agent.
- **Image Classification Agent:** For images, a Vision Language Model (VLM) first determines if the image is a text-based report or a medical scan, branching the workflow accordingly.
- **Information Extraction Agent:** For text-based documents, a powerful Gemini-powered agent reads the unstructured text and extracts key clinical parameters into a standardized JSON schema.
- **Stateful Analysis:** The core diagnostic agents fetch the user's past analysis from a Supabase database. They consider both the newly extracted data and the historical context to provide a cumulative, more accurate diagnosis over time.
- **In-Context RAG:** Instead of relying on potentially brittle vector retrieval, the system provides the LLM with the full text of established medical guidelines (like the ADA's "Standards of Care in Diabetes") as in-prompt context. This leverages Gemini's large context window to ensure the highest fidelity and accuracy in its reasoning, directly comparing patient data against the authoritative source.

---

## 🔬 Model Selection: A Data-Driven Decision

While deploying a specialized, open-source medical model like `MedGemma-14b-it` is technically impressive, performance and reliability are paramount in healthcare.

A comparative analysis was conducted between a self-deployed MedGemma-14b-it instance on GCP and the Gemini API. The results were clear: **Google's Gemini API demonstrated on-par, and in some cases superior, accuracy and reliability in interpreting medical data, particularly for multimodal tasks like analyzing retinal scans.**

This data-driven decision led to the strategic choice to use the Gemini API for the core AI logic. This approach prioritizes **output quality, user safety, and lower latency** over the sheer complexity of self-hosting, ensuring the best possible result for the end-user.

---

## 🗺️ Future Roadmap

While the current application is a robust proof-of-concept, the architecture is designed for future expansion. Potential next steps include:

- **Multi-File Upload:** Allowing users to upload a batch of documents (e.g., five lab reports) at once, with the system processing them sequentially to build a comprehensive initial profile.
- **Contextual Editing & Removal:** Giving users the ability to review their extracted data and manually correct or remove specific documents from their analysis history, providing greater control over their health profile.
- **Conversational Doctor-Bot:** Implementing an interactive chat interface where users can provide additional symptoms or context conversationally. The bot would update the analysis in real-time, reflecting the new information instantly on the results page.
- **Advanced Visualization:** Integrating charting libraries to visualize trends in lab results (e.g., HbA1c over time) and provide a more dynamic view of the user's health journey.

---

## 🏁 Conclusion

GlycoSight AI successfully demonstrates the creation of a secure, intelligent, and user-centric full-stack application for preliminary medical diagnosis. By prioritizing a stateful, explainable AI core and making pragmatic, performance-driven technology choices, this project serves as a strong foundation for a real-world healthcare tool that can empower users to take proactive control of their health.
