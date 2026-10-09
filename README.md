# AI-Powered Personalized Academic Copilot 🎓

An AI-powered learning platform designed to help students study smarter through personalized explanations, AI-generated quizzes, weak-topic analysis, and adaptive study planning.

🔗 **Live Demo:** https://ai-personalized-academic-copilot.vercel.app/

## 📌 About the Project

The AI-Powered Personalized Academic Copilot helps students prepare for subjects and examinations using their own study materials. Students can upload PDFs, ask questions related to their materials, practice quizzes, identify areas that need improvement, and organize their learning with personalized study plans.

The platform combines Retrieval-Augmented Generation (RAG) with AI-powered question answering to provide responses grounded in the student's uploaded study materials.

## ✨ Features

- **User Authentication:** Register and log in to access personalized learning features.
- **Study Material Upload:** Upload PDF study materials and extract their text.
- **AI-Powered Academic Q&A:** Ask questions about uploaded study materials.
- **RAG-Based Responses:** Retrieve relevant content to ground AI-generated answers in study materials.
- **AI Quiz Generation:** Generate multiple-choice quizzes by selecting a study material, topic, and number of questions.
- **Quiz History:** Review previous quiz attempts and performance.
- **Weak Topic Analysis:** Identify topics that need additional practice.
- **Personalized Study Plans:** Organize study activities based on learning needs.
- **Profile Management:** Access your student profile.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- HTML5 and CSS3

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Spring AI
- Apache PDFBox

### AI and Data
- Google Gemini API
- Retrieval-Augmented Generation (RAG)
- Qdrant Vector Database
- PostgreSQL
- Embeddings and vector similarity search

### Deployment
- Vercel — Frontend
- Render — Backend
- Neon — PostgreSQL Database
- Qdrant Cloud — Vector Search

## 🔄 How It Works

1. Register or log in to the application.
2. Upload your study materials in PDF format.
3. Extract and process the PDF text.
4. Retrieve relevant content for academic questions using vector search and RAG.
5. Generate topic-specific quizzes using AI.
6. Review quiz performance and identify weak topics.
7. Use personalized study plans to guide further preparation.

## 🚀 Live Application

**Try the project:** https://ai-personalized-academic-copilot.vercel.app/

The application uses a deployed frontend and backend. Availability of AI features depends on the configured services and API limits.

## 💻 Run Locally

### Prerequisites

- Java 21
- Node.js and npm
- PostgreSQL
- Gemini API key
- Qdrant instance and API credentials

### 1. Clone the repository

```bash
git clone https://github.com/Sushma-Girugu/AI-Personalized-Academic-Copilot.git
cd AI-Personalized-Academic-Copilot
```

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd backend
```

Configure your database connection, Gemini API key, and Qdrant settings using environment variables or your local configuration.

Start the Spring Boot application:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell, use:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs on `http://localhost:8080` by default.

### 3. Configure and start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a local `.env` file and configure the backend URL:

```env
VITE_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

**Note:** Configure the required database, AI, and vector database credentials before running the complete application. Never commit API keys, passwords, or other secrets to GitHub.

## 🔐 Security

- Keep API keys and database credentials in environment variables.
- Do not commit `.env` files containing secrets.
- Use separate development and production configurations.

## 🎯 Project Objective

To make academic preparation more personalized and effective by combining AI, document processing, semantic search, and performance-based learning support.

## 👩‍💻 Author

**Girugu Sushma**

B.Tech — Artificial Intelligence and Data Science

Shri Vishnu Engineering College for Women

## ⭐ Support

If you find this project useful, consider giving the repository a star on GitHub!
