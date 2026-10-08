import { useState } from "react";

const API = "http://localhost:8080";

function AskAcademicCopilot({ onBack }) {

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState("");

    const askQuestion = async (event) => {

        event.preventDefault();

        if (!question.trim()) {

            setError(
                "Please enter a question."
            );

            return;
        }

        setAsking(true);
        setError("");
        setAnswer("");

        try {

            const response =
                await fetch(
                    `${API}/api/ask`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            question:
                                question.trim()
                        })
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                let message =
                    "Unable to get an answer.";

                try {

                    const data =
                        JSON.parse(text);

                    if (data.message) {
                        message =
                            data.message;
                    }

                } catch {
                    // Ignore JSON parsing error
                }

                throw new Error(message);
            }

            const data =
                text
                    ? JSON.parse(text)
                    : {};

            setAnswer(
                data.answer ||
                "No answer was returned."
            );

        } catch (error) {

            console.error(
                "Ask AI error:",
                error
            );

            setError(
                error.message ||
                "Unable to get an answer."
            );

        } finally {

            setAsking(false);
        }
    };

    const clearQuestion = () => {

        setQuestion("");
        setAnswer("");
        setError("");
    };

    return (

        <div className="app">

            <header className="header">

                <div>

                    <h1>
                        Academic Copilot
                    </h1>

                    <p>
                        Your personalized AI-powered
                        learning assistant
                    </p>

                </div>

            </header>


            <main className="container">

                <section className="result-section">

                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>


                    <div className="materials-page-header">

                        <h2>
                            🤖 Ask Academic Copilot
                        </h2>

                        <p>
                            Ask questions about your
                            uploaded study materials.
                        </p>

                    </div>


                    <div className="ask-page-card">


                        <div className="ask-page-intro">

                            <div className="ask-page-icon">
                                🤖
                            </div>

                            <h3>
                                Your AI Study Assistant
                            </h3>

                            <p>
                                Ask a question and Academic
                                Copilot will search your
                                uploaded study materials
                                and provide an answer.
                            </p>

                        </div>


                        <form
                            className="ask-form"
                            onSubmit={askQuestion}
                        >

                            <div className="form-group">

                                <label>
                                    Your Question
                                </label>

                                <textarea
                                    value={question}
                                    onChange={(event) =>
                                        setQuestion(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Example: Explain the concept of binary search..."
                                    rows="7"
                                />

                            </div>


                            {error && (

                                <div className="error-message">

                                    {error}

                                </div>

                            )}


                            <div className="ask-page-actions">

                                <button
                                    type="submit"
                                    disabled={asking}
                                >

                                    {asking
                                        ? "Thinking..."
                                        : "🤖 Ask Academic Copilot"}

                                </button>


                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={clearQuestion}
                                    disabled={
                                        asking ||
                                        (
                                            !question &&
                                            !answer &&
                                            !error
                                        )
                                    }
                                >

                                    Clear

                                </button>

                            </div>

                        </form>


                        {answer && (

                            <div className="answer-card ask-page-answer">

                                <div className="answer-header">

                                    <h3>
                                        💡 Academic Copilot Answer
                                    </h3>

                                </div>

                                <p>
                                    {answer}
                                </p>

                            </div>

                        )}

                    </div>

                </section>

            </main>


            <footer>

                <p>
                    AI-Powered Personalized
                    Academic Copilot
                </p>

                <span>
                    B.Tech - AI & Data Science
                </span>

            </footer>

        </div>
    );
}

export default AskAcademicCopilot;