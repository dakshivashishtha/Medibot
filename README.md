<div align="center">

# 🩺 MediVoice AI

### AI-Powered Medical Voice & Clinical Intelligence Platform

> Connect with 11 specialist AI doctors via real-time voice and text, analyze lab reports, triage symptoms, and manage family health profiles seamlessly.

<img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<br />

<img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" />
<img src="https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=neon&logoColor=white" />
<img src="https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
<img src="https://img.shields.io/badge/Vapi_Voice_AI-5B46E5?style=for-the-badge&logo=vapi&logoColor=white" />
<br />

<img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/OpenRouter-6566F1?style=for-the-badge&logo=openai&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />

</div>

---

# 📋 Table of Contents

- [📖 About The Project](#-about-the-project)
- [🎯 Problem It Solves](#-problem-it-solves)
- [✨ Key Features](#-key-features)
- [👨‍⚕️ AI Specialist Doctor Roster](#-ai-specialist-doctor-roster)
- [🧠 Core AI & Voice Workflow](#-core-ai--voice-workflow)
- [🏗️ Architecture & Resilience Layer](#️-architecture--resilience-layer)
- [⚙️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🗄️ Database Schema](#️-database-schema)
- [🔌 API Reference](#-api-reference)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🛤️ Development Roadmap](#️-development-roadmap)
- [🧪 Future Improvements](#-future-improvements)
- [🤝 Contributing](#-contributing)
- [👩‍💻 Author](#-author)
- [📜 License](#-license)

---

# 📖 About The Project

**MediVoice AI** is an AI-first clinical consultation and decision-support platform designed to improve primary healthcare accessibility. It connects users with **11 specialized AI doctors** through low-latency real-time voice (powered by Vapi) and an intelligent text chat fallback (powered by OpenRouter & Google Gemini).

The platform transforms raw patient consultations into structured clinical **SOAP notes** (Subjective, Objective, Assessment, Plan), extracts biomarker anomalies from uploaded lab reports, triages urgent symptoms using a custom Bernoulli Naive Bayes classifier and red-flag safety override engine, and manages multi-member family health timelines.

---

# 🎯 Problem It Solves

Traditional primary care access suffers from long wait times, fragmented medical history tracking, expensive specialist consultations, and difficult-to-understand lab test reports.

MediVoice AI bridges this gap by providing:

- 🎙️ **Immediate 24/7 Voice Consultations**: Talk naturally with domain-specialized AI doctors trained in distinct clinical communication styles.
- 📋 **Automated Clinical SOAP Summaries**: Convert spoken dialogues into structured medical records with differential diagnosis hypotheses and actionable next steps.
- 🧪 **AI Medical Report Vault**: Upload PDF or image lab reports to auto-extract biomarkers, spot out-of-range metrics, and visualize historical health trends.
- 🩺 **Smart Symptom Triage & ML Classifier**: Evaluate symptom severity (Emergency, Urgent, Routine) with red-flag detection and relative condition likelihood scoring.
- 👨‍👩‍👧‍👦 **Family Health Profiles**: Manage consultations, lab reports, and timelines for dependents (Spouse, Child, Parent) under a single primary account.

---

# ✨ Key Features

### 🎙️ 1. Real-Time Voice Consultation Engine
- Powered by **Vapi WebRTC SDK** with specialist-tailored voice models (Elliot, Savannah, Clara, Layla, Emma, Sid, Nico, Neil, Naina, Kai, Maya).
- Live transcript stream with real-time speech indicator waveforms.
- Instant fallback to text chat powered by a resilient multi-provider LLM chain.

### 📄 2. AI SOAP Report & Clinical Note Generator
- Automatically generates formatted medical notes following the universal **SOAP framework**:
  - **Subjective**: Patient symptoms, onset, and severity.
  - **Objective**: Reported vitals and physical signs.
  - **Assessment**: Differential diagnoses with probability indicators.
  - **Plan**: Recommended diagnostic tests, lifestyle modifications, and medication advice.
- Includes PDF generation, print summary, and 1-click shareable links.

### 🧪 3. Medical Report Vault & Biomarker Extraction
- Intelligent OCR & Vision-LLM analysis of lab test PDFs/images.
- Extracts key health parameters, reference ranges, and flags abnormalities (e.g., elevated HbA1c, low Vitamin D)[cite: 1].
- Provides actionable patient-friendly explanations and suggested specialist follow-ups[cite: 1].

### 📈 4. Longitudinal Health Timeline & Health Score
- Aggregates consultations, lab reports, and triage logs into an interactive chronological health timeline[cite: 1].
- Computes a dynamic **MediVoice Health Index Score (0–100)** based on recent symptoms, biomarker stability, and consultation recency[cite: 1].

### 🚨 5. Emergency Red-Flag Override & Mental Health Crisis Protocol
- Real-time regex and keyword interception (`emergencyDetector`) for acute cardiac, respiratory, neurological, trauma, and self-harm indicators[cite: 1].
- Immediately overrides generative chat with a high-priority safety modal displaying emergency numbers (`911`, `112`, `102`) and crisis helplines (`988`, `iCall`, `Crisis Text Line`) alongside consultation support with **Dr. Maya**[cite: 1].

### 👨‍👩‍👧‍👦 6. Family Profiles & Dependent Care
- Multi-member profile switcher for primary user and dependents (`Self`, `Spouse`, `Child`, `Parent`, `Sibling`)[cite: 1].
- Scopes consultation histories, lab vaults, and health timelines per family member[cite: 1].

### 🚑 7. Nearby Emergency Care & Doorstep Medicine Delivery
- **Live GPS Geolocation & Haversine Distance Calculator**: Computes accurate distance to hospitals, ICU facilities, and 24/7 pharmacies[cite: 1].
- **National Emergency Triage (`108`)**: One-touch direct dial for emergency ambulance and trauma dispatch[cite: 1].
- **Doorstep Medicine Express**: OTC and prescription medicine cart checkout with real-time order persistence in the User Profile[cite: 1].

### 📅 8. Specialist Doctor Appointment Scheduler
- Book 15-minute voice AI clinical consultation slots with any of the 11 AI specialist doctors[cite: 1].
- Dynamic slot availability engine filtering already booked appointments[cite: 1].

### 💊 9. Digital Prescription & Medication Tracker
- Automated prescription generation following AI consultations with medication name, dosage, frequency, and duration[cite: 1].
- Track active regimens, log daily doses taken, and request refills[cite: 1].

### 🩺 10. Real-Time Vitals Monitoring & Health Risk Metrics
- Record and monitor vital signs: Heart Rate (BPM), Blood Pressure (mmHg), SpO2 (%), Temperature (°F), and Blood Sugar (mg/dL) with automated risk classification (`Normal` / `Attention` / `Critical`)[cite: 1].

---

# 👨‍⚕️ AI Specialist Doctor Roster

MediVoice AI features **11 domain-specific AI Doctors**, each equipped with dedicated clinical prompt instructions, specialized voice synthesis personas, and custom avatars[cite: 1]:

| Avatar | Doctor Name | Specialization | Voice Persona | Key Focus Area |
| :---: | :--- | :--- | :--- | :--- |
| 👨‍⚕️ | **Dr. Elliot** | General Physician | Elliot (Warm Male) | Primary care, routine symptoms, preventative health[cite: 1] |
| 👩‍⚕️ | **Dr. Savannah** | Pediatrician | Savannah (Gentle Female) | Infant & child care, growth, pediatric fever[cite: 1] |
| 👩‍⚕️ | **Dr. Clara** | Dermatologist | Clara (Empathetic Female) | Skin rashes, lesions, acne, hair & nail disorders[cite: 1] |
| 👩‍⚕️ | **Dr. Layla** | Psychologist | Layla (Calming Female) | Mental wellness, stress, anxiety, emotional care[cite: 1] |
| 👩‍⚕️ | **Dr. Emma** | Nutritionist | Emma (Upbeat Female) | Diet plans, metabolic health, vitamin deficiencies[cite: 1] |
| 👨‍⚕️ | **Dr. Sid** | Cardiologist | Sid (Authoritative Male) | Heart health, blood pressure, cholesterol, ECGs[cite: 1] |
| 👨‍⚕️ | **Dr. Nico** | ENT Specialist | Nico (Reassuring Male) | Throat infections, ear pain, sinus, rhinitis[cite: 1] |
| 👨‍⚕️ | **Dr. Neil** | Orthopedic Specialist | Neil (Structured Male) | Joint pain, posture, fractures, sports injuries[cite: 1] |
| 👩‍⚕️ | **Dr. Naina** | Gynecologist | Naina (Compassionate Female) | Women's reproductive health, PCOS, maternal care[cite: 1] |
| 👨‍⚕️ | **Dr. Kai** | Dentist | Kai (Friendly Male) | Oral hygiene, tooth pain, gum disease, dental care[cite: 1] |
| 👩‍⚕️ | **Dr. Maya** | Mental Health Counsellor | Maya (Serene Female) | Crisis intervention, trauma support, heavy distress[cite: 1] |

---

# 🧠 Core AI & Voice Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Patient as 👤 Patient
    participant UI as 📱 Next.js Frontend
    participant Vapi as 🎙️ Vapi Voice WebRTC
    participant API as ⚡ API Route (/api/session-chat)
    participant LLM as 🧠 LLM Engine (OpenRouter / Gemini)
    participant DB as 🗄️ Neon Postgres DB

    Patient->>UI: Selects Doctor & Starts Voice Session
    UI->>Vapi: Initialize WebRTC Stream (Doctor Assistant ID)
    Vapi-->>Patient: Interactive Voice Consultation
    Vapi->>UI: Real-Time Audio & Transcript Callback
    Patient->>UI: End Consultation / View Summary
    UI->>API: POST /api/session-chat (Conversation Transcript)
    API->>LLM: Multi-model prompt (Extract SOAP + Vitals + Tests)
    LLM-->>API: Returns Structured SOAP JSON
    API->>DB: Save Session Record & Update User Health Score
    DB-->>UI: Return Finalized Medical Report Page