# HealthTrack AI — Autonomous Multi-Agent Clinical Intelligence Platform

[![Build Status](https://img.shields.io/badge/Build-Passing%20(1.99s)-emerald.svg)](https://github.com/yogisomanaboina-datapirate/Health-agent)
[![Tests](https://img.shields.io/badge/Tests-70%2F70%20Passed%20(100%25)-blue.svg)](https://github.com/yogisomanaboina-datapirate/Health-agent)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%205%20%7C%20Tailwind-indigo.svg)](https://github.com/yogisomanaboina-datapirate/Health-agent)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20REST-green.svg)](https://github.com/yogisomanaboina-datapirate/Health-agent)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Featherless%20(Qwen%202.5%207B)-purple.svg)](https://featherless.ai)
[![Security](https://img.shields.io/badge/Security-Cryptographic%20JWT%20%7C%20Isolated%20Vaults-red.svg)](https://github.com/yogisomanaboina-datapirate/Health-agent)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20Serverless%20Ready-black.svg)](https://vercel.com)

> **GitHub Repository**: [https://github.com/yogisomanaboina-datapirate/Health-agent](https://github.com/yogisomanaboina-datapirate/Health-agent)

---

## 📌 Executive Summary

**HealthTrack AI** is an end-to-end autonomous clinical intelligence and patient health management platform. It transforms fragmented, complex medical records into unified clinical action through specialized **autonomous AI agents** (Triage, Pharmacology Interaction, Lab Diagnostics, Emergency Bed Logistics, and Insurance Pre-Authorization) paired with **strict multi-user data privacy**.

---

## 🚀 The Core Problem & Our Solution

| The Problem in Modern Healthcare | HealthTrack AI Autonomous Solution |
|---|---|
| **Fragmented Health Records**: Patients juggle disparate PDFs, physical slips, and multiple hospital apps. | **Unified Clinical Vault**: Consolidates diagnostic reports, prescriptions, and timeline events in one encrypted dashboard. |
| **Dangerous Drug Interactions**: Prescriptions from different specialists often clash with existing regimens. | **Autonomous Pharma Agent**: Automatically checks drug-drug interactions and dietary contraindications in real time. |
| **Emergency Bed Availability Delays**: Patients spend critical golden-hour minutes calling hospitals to find ICU beds. | **1-Click Emergency Dispatch**: Calculates hospital distance (Haversine), reserves an ICU bed, and dispatches an ALS ambulance. |
| **Complex Lab Reports**: Patients receive numerical biomarker tables they cannot interpret. | **Biomarker Diagnostics Engine**: Parses CBC, CMP, Lipid, and Thyroid panels into clear clinical explanations and action plans. |
| **Insurance Claim Friction**: Legitimate claims are delayed or rejected due to missing pre-authorizations. | **Autonomous Claims Adjudicator**: Evaluates diagnosis and ICD procedure codes against policy rules to predict approval likelihood. |

---

## 🧠 Autonomous Multi-Agent System Architecture

```mermaid
graph TD
    User["👤 Patient / Clinical User"] -->|HTTP / REST (JWT)| API["⚡ Express API Gateway"]

    subgraph "Autonomous Multi-Agent Hub"
        API --> Coordinator["🎯 Coordinator Orchestrator Agent"]
        Coordinator --> Triage["🚨 Emergency Triage Agent (Acuity Scoring)"]
        Coordinator --> Pharma["💊 Pharmacology & Interaction Agent"]
        Coordinator --> Diagnostic["🔬 Lab Report & Biomarker Agent"]
        Coordinator --> Bed["🏥 Bed Allocation & Ambulance Agent"]
        Coordinator --> Insurance["📋 Insurance Claims & Policy Agent"]
        Coordinator --> Assistant["💬 Contextual Clinical AI Assistant"]
    end

    subgraph "AI Inference Engine"
        Triage & Pharma & Diagnostic & Bed & Insurance & Assistant --> LLM["🤖 Featherless AI (Qwen 2.5 7B Instruct)"]
    end

    subgraph "Secure Storage Layer"
        API --> DB[("🔒 Isolated Persistent Vault (database.json)")]
    end
```

### The 6 Autonomous Clinical Agents

1. **Coordinator Agent (`coordinatorAgent.js`)**: Master workflow orchestrator that listens for uploaded records, triage alerts, and medication changes, delegating tasks across specialized sub-agents.
2. **Emergency Triage Agent (`triageAgent.js`)**: Evaluates real-time patient symptoms against vital signs to compute clinical acuity levels (Emergent, Urgent, Non-Urgent) and recommend appropriate clinical interventions.
3. **Pharmacology & Tablet Agent (`medicationAgent.js`)**: Cross-references newly prescribed tablets against active prescriptions and food contraindications to eliminate adverse drug events.
4. **Lab Report Analyzer Agent (`reportAnalyzerAgent.js`)**: Parses clinical lab tests (CBC, CMP, Lipid, Thyroid), compares values against reference ranges, and flags abnormal findings with patient-friendly clinical summaries.
5. **Bed Allocation & Dispatch Agent (`bedAllocationAgent.js`)**: Calculates GPS distances to regional network hospitals, checks live ICU capacity, and coordinates emergency ambulance dispatch.
6. **Insurance Adjudication Agent (`insuranceAgent.js`)**: Automates pre-authorization assessment and validates insurance policies against procedure estimates.

---

## 🔒 Security, Privacy & Multi-User Isolation

HealthTrack AI enforces **zero-data-leakage architecture**:
* **Cryptographic JWT Authentication**: All clinical endpoints (`/dashboard`, `/records`, `/medications`, `/doses`, `/symptoms`, `/reminders`) require valid `Authorization: Bearer <token>`.
* **Database-Level User Scoping**: Queries and mutations filter strictly by `req.user.id`. Patient A is cryptographically barred from querying or modifying Patient B's records.
* **Anti-Tampering Enforcement**: Cross-user tampering attempts (e.g. attempting to delete another patient's dose) are rejected with `404 Not Found / Access Denied`.
* **Protected Demographics**: Sensitive password hashes are stripped before profile responses are transmitted.

---

## 👥 Demo Patient Accounts Stored in Database

The system comes pre-seeded with 5 distinct clinical profiles for live demonstration:

| Patient Name | Email | Password | Blood Group | Health Score | Clinical Focus & Chronic Conditions |
|---|---|---|---|---|---|
| **Priya Sharma** *(Demo Card)* | `priya.sharma@email.com` | `password123` | `O+` | **78** | Diabetic & Preventive Health *(Prediabetes, Rhinitis)* |
| **Rahul Verma** | `rahul.verma@email.com` | `password123` | `B+` | **84** | Cardiovascular Care *(Primary Hypertension)* |
| **Ananya Iyer** | `ananya.iyer@email.com` | `password123` | `A+` | **91** | Endocrine Wellness *(Subclinical Hypothyroidism)* |
| **Vikramaditya Rao** | `vikram.rao@email.com` | `password123` | `AB+` | **69** | Joint & Orthopedic Health *(Bilateral Knee Osteoarthritis)* |
| **Sneha Patel** | `sneha.patel@email.com` | `password123` | `O-` | **88** | Fitness & Pulmonary Care *(Exercise Bronchospasm)* |

> [!TIP]
> On the login page, simply click the **"Fill Credentials"** button to instantly populate Priya Sharma's demo account details.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 18, Vite 5, Tailwind CSS, Lucide Icons, Web Speech Synthesis API |
| **Backend API** | Node.js (v24), Express 4, RESTful Architecture, CORS, Multer |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt password hashing, Custom Auth Middleware |
| **AI / LLM** | Featherless AI API running `Qwen/Qwen2.5-7B-Instruct` |
| **Data Layer** | Persistent JSON Relational Store (`database.json`) with in-memory serverless cache |
| **Deployment** | Vercel Serverless Functions (`api/index.js`), Vercel Edge CDN |

---

## 💻 Local Quick Start Guide

### Prerequisites
* **Node.js** v18 or higher
* **npm** v9 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/yogisomanaboina-datapirate/Health-agent.git
cd Health-agent
```

### 2. Install All Dependencies
```bash
npm run install-all
```

### 3. Start Both Backend and Frontend
```bash
npm run dev
```
* **Frontend Application**: [http://localhost:5173](http://localhost:5173)
* **Backend API Engine**: [http://localhost:5000](http://localhost:5000)
* **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Comprehensive Automated Test Results

The entire platform was rigorously verified using an end-to-end automated test runner:

```
================================================================
       HEALTH TRACK AI — COMPREHENSIVE OVERALL SYSTEM TEST      
================================================================
TOTAL TESTS EXECUTED : 70
PASSED               : 70
FAILED               : 0
SUCCESS RATE         : 100.0%
SYSTEM STATUS        : FULLY OPERATIONAL & PRODUCTION READY
================================================================
```

### Test Coverage Highlights
* **Authentication**: 5/5 user logins, password validation, new patient registration, profile updates.
* **Privacy Isolation**: Zero cross-account data leaks; unauthenticated requests blocked (401).
* **Clinical Operations**: Records CRUD, Medication management, Dose scheduling & completion, Lab reports, Hospital bed allocation, Vitals trends, Lifestyle reminders.
* **Multi-Agent Engine**: Hospital distance/ETA calculation, Autonomous triage & bed locking, Insurance pre-auth prediction, Doctor handover summary package.
* **Production Build**: Vite build completed cleanly in **1.99s** with 0 errors.

---

## ☁️ Deployment on Vercel

The repository includes a ready-to-deploy **Vercel Serverless** configuration:

1. Import the repository on [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `./` (Default).
3. Set **Framework Preset** to `Other` (or Vite).
4. Add environment variables:
   * `JWT_SECRET`: `healthtrack_ai_secure_jwt_token_2026`
   * `FEATHERLESS_API_KEY`: `your_featherless_api_key_here`
   * `FEATHERLESS_MODEL`: `Qwen/Qwen2.5-7B-Instruct`
5. Click **Deploy**.

---

## 📄 License & Attribution

Developed with ❤️ by the HealthTrack AI Team. Built for next-generation clinical decision support and personalized patient health optimization.
