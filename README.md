# 🌟 CompareLY: Mobile-First LLM Benchmarking MVP

## 🎯 Project Overview & Goal

This repository contains the **Minimum Viable Product (MVP)** frontend code for **CompareLY**, a mobile application designed for **AI Engineers**.

The core goal is to transform the chaotic process of LLM selection into a structured, auditable workflow. This codebase serves as the **UI component library and style guide** for the main mobile client (React Native).

---

## ✨ MVP Features (UI Coverage)

The UI components developed here support the core features defined in the Product Specification:

* **Provider Connection Flow:** Screens for securely connecting to API services (OpenAI, OpenRouter, Custom Provider).
* **Custom Scenario Creation:** Forms for defining domain-specific test names and input prompts.
* **Side-by-Side Test View:** UI for displaying parallel model responses, along with **Latency, Cost, and Token** metrics.
* **Evaluation:** UI for **Manual Scoring** (3-star ratings) and displaying the results of the **AI Evaluator System** (automated scoring).
* **Results Dashboard:** Final comparison screen showing the **Top Performer** and score breakdowns.
* **Aesthetic:** Clean, professional **Dark Mode** focused aesthetic.

---

## 🏗️ Architectural Handoff & Technical Stack

This frontend codebase must be integrated into the final application adhering to the **[[Technical Handoff & Architecture]]** document.

### **Technical Stack**

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Mobile Client** | **React Native** (Leveraging these components) | Cross-platform speed and efficiency. |
| **Backend Service** | Python (FastAPI/Django Async) or Node.js | I/O performance for concurrent LLM API calls. |

### **Security Note**

**This UI is stateless.** All sensitive operations—API key management, secure data storage, cost calculation, and parallel execution—are handled exclusively by the Backend Service.

---

## ⚙️ Development Setup & Deployment

### **Prototyping Environment**

This repository is automatically synchronized with the v0.app prototyping environment.

* **Live Prototype:** [Insert the Vercel Deployment Link here, e.g., `https://vercel.com/.../v0-compare-ly`]
* **V0 Editor Link:** [Insert the V0 Editor Link here, e.g., `https://v0.app/chat/Kdy2fKtyXKb6`]

### **Local Setup (UI Migration)**

This repository provides the target components.

1.  Clone this repository.
2.  Review the component structure and styling (Tailwind CSS).
3.  **Action:** Components must be **migrated and integrated** into the main **React Native project** as defined in the **[[MVP Implementation Plan]]**.
