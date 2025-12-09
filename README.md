# CompareLY (2)

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bibstarling-gmailcoms-projects/v0-compare-ly)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/Kfy2KiXkfb6)

1. Project Overview & Goal
This section quickly explains what the repository is and why it exists.

CompareLY: Mobile-First LLM Benchmarking MVP

This repository contains the Minimum Viable Product (MVP) frontend code for CompareLY, a mobile application designed for AI Engineers. The goal is to provide a structured, auditable workflow for comparing Large Language Models (LLMs) across multiple providers against domain-specific prompts.

Status: This codebase serves as the UI component library and style guide for the main mobile client (React Native). It aligns with the [[Product & UX Specification]] documentation.

2. Core Feature Set (MVP Scope)
List the key features the engineer will find built or partially built within this UI framework.

MVP Features (UI Coverage)
Provider Connection Flow: Screens for connecting to API services (OpenAI, OpenRouter, Custom Provider).

Custom Scenario Creation: Forms for defining test names and inputting domain-specific prompts.

Side-by-Side Test View: UI for displaying parallel model responses, along with Latency, Cost, and Token metrics.

Evaluation: UI for the Manual Scoring (3-star ratings) and displaying the results of the AI Evaluator System.

Results Dashboard: Final comparison screen showing Top Performer and score breakdowns.

Styling: Uses a clean, Dark Mode focused aesthetic.

3. Architectural Handoff & Technical Stack
This is crucial for the implementing engineer to know how the frontend fits into the overall architecture.

Technical Handoff
Architecture: This UI is the Mobile Client component of a Client-Server-External API architecture.

Backend Stack (API): Python (FastAPI/Django Async) or Node.js is recommended for the highly concurrent service layer.

Mobile Client Stack: The finalized mobile application will be built using React Native to leverage these components for cross-platform deployment.

Security Note: This repository is only the frontend. All sensitive API key management is handled exclusively by the secure Backend Service.

4. Development Setup & Deployment
Keep the existing v0.app information but frame it as the UI Prototyping Environment.

Local Setup (UI Prototyping)
Clone this repository.

Install dependencies (if applicable: npm install or yarn install).

Deployment: Your project is currently live at: https://vercel.com/bibstarling-gmailcoms-projects/v0-compare-ly

Note: For the final mobile application build, components from this repository must be migrated into the main React Native project as defined in the [[MVP Implementation Plan]].
