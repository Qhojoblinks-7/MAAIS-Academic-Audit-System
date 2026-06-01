# Agent Profile: AI Collaborator Context

This document provides a comprehensive overview of my technical profile, workflow preferences, and architectural philosophy. Use this as a foundational reference to ensure all code generation, architectural patterns, and solutions align directly with my established engineering practices.

---

## 🚀 Technical Stack & Philosophy

### Frontend Architecture
*   **Core Libraries:** React.js for web development, React Native (Expo) for mobile applications.
*   **Language Preference:** **Pure JavaScript (JS) and JSX only.** Do not generate TypeScript (TS/TSX) unless explicitly requested for a specific legacy integration.
*   **State Management & Data Fetching:** 
    *   **TanStack Query (React Query):** For server state, caching, and synchronization.
    *   **TanStack Router:** For robust, file-based frontend routing.
    *   **Zustand:** For lightweight, decoupled global client state.
*   **UI & Styling:** UI components built with **shadcn/ui** and styled using Tailwind CSS. Focus on clean, scannable interfaces; avoid visual clutter or overwhelming the user with too much information at once.

### Backend & Infrastructure Stack
*   **Core Custom Backend:** **Django** & **Django REST Framework (DRF)**. My primary domain for complex business logic, relational schemas, and heavy data processing.
*   **Backend as a Service (BaaS):** **Supabase**. Used for rapid prototyping, real-time client syncing, quick authentication flows, or serverless infrastructure where building a dedicated Django app isn't necessary.
*   **Database Management:** **PostgreSQL** for relational data integrity and production-ready local storage.
*   **Environment & DevOps:** **Docker** and **Docker Compose** for containerizing custom services, ensuring consistent local development environments and clean deployments.

---

## 🛠️ Domain Expertise & Focus Areas

When brainstorming features, database schemas, or system architectures, lean heavily toward these specific domains:

*   **FinTech for the Informal Sector:** Alternative credit scoring engines, mobile money integration logic (e.g., MTN MoMo, Telecel Cash), and financial tracking systems customized for SME traders and micro-businesses.
*   **Logistics & Delivery:** On-demand delivery mechanics, routing logic, and rider-dispatch workflows tailored for local transit ecosystems (including bicycle and informal courier networks).
*   **Bespoke Ecosystems:** Modular application architecture designed to scale, whether mapping out health data visualization pipelines or structural workflows for local enterprise platforms.

---

## 🧠 Work Style & Communication

*   **Tone:** Grounded, practical, and direct. I value a Stoic, analytical approach to problem-solving.
*   **Code Output:** Provide clean, production-grade JavaScript/JSX and Python. Ensure components are modular, re-usable, and follow modern best practices (e.g., custom React hooks for separating UI from data-fetching logic).
*   **UI/UX Design Guidance:** Prioritize clarity, accessibility, and high scannability. If a UI looks cluttered or contains too much information, call it out and suggest minimalist, high-impact alternatives.