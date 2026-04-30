# 🏫 Saraswati Vidyamandir (SVM) Portal

A high-performance, AI-powered task management system designed specifically for the staff of **Saraswati Vidyamandir, Ambala Cantt**. This application streamlines school operations by synchronizing daily tasks with Google Sheets and providing intelligent productivity insights.

---

## ✨ Features

-   **AI Priority Sync**: Integrates with **Google Gemini AI** to analyze pending tasks and suggest the most impactful one to tackle first.
-   **Cloud Synchronization**: Real-time background syncing with **Google Sheets** via **Google Apps Script**.
-   **Mobile-Optimized UI**: A sleek, glassmorphic dark-mode interface built for speed and responsiveness.
-   **Optimistic Updates**: Instant UI feedback for task completion, ensuring a lag-free experience even on slower connections.
-   **Dynamic User Profiles**: Automatically loads user-specific task lists via URL parameters.

---

## 🛠️ Technology Stack

### Frontend
-   **React** (Vite)
-   **Tailwind CSS** (for layout and styling)
-   **Lucide React** (for minimalist iconography)
-   **Google Generative AI SDK** (Gemini Pro integration)

### Backend
-   **Google Apps Script** (GAS) - Serves as a serverless REST API.
-   **Google Sheets** - Acts as the primary database for persistence.

---

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   NPM or Yarn
-   A Google account (for Sheets/GAS setup)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd "Saraswati Vidyamandir Ambala Cantt"
    ```

2.  **Frontend Setup**:
    ```bash
    cd Frontend
    npm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the `Frontend` directory:
    ```env
    VITE_GAS_URL=your_google_apps_script_url
    VITE_API_KEY=your_internal_api_key
    VITE_GEMINI_KEY=your_google_gemini_api_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## ☁️ Backend (Google Apps Script) Setup

The backend logic resides in a Google Apps Script linked to a Google Sheet.

1.  Create a Google Sheet with headers: `taskName`, `score`, `type`, `status`, etc.
2.  Open **Extensions > Apps Script**.
3.  Implement `doGet(e)` to fetch tasks and `doPost(e)` to update task status.
4.  Deploy as a **Web App** with access set to "Anyone".

---

## 📂 Project Structure

```
Saraswati Vidyamandir Ambala Cantt/
├── Frontend/           # React + Vite application
│   ├── src/            # Components, Hooks, and App logic
│   ├── public/         # Static assets
│   └── .env            # Local configuration (Ignored by Git)
├── .gitignore          # Root-level ignore rules
└── README.md           # Project documentation
```

---

## 📝 License

This project is developed for the internal use of **Saraswati Vidyamandir, Ambala Cantt**. All rights reserved.
