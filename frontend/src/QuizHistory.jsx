import { useEffect, useState } from "react";

import { API } from "./config";
function QuizHistory({ onBack }) {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {

        setLoading(true);
        setError("");

        try {

            const response = await fetch(
                `${API}/api/quiz/history`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const text = await response.text();

            if (!response.ok) {

                let message =
                    "Unable to load quiz history.";

                try {
                    const data = JSON.parse(text);

                    if (data.message) {
                        message = data.message;
                    }
                } catch {
                    // Ignore parsing error
                }

                throw new Error(message);
            }

            const data =
                text ? JSON.parse(text) : [];

            setHistory(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to load quiz history."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="app">

            <header className="header">

                <div>
                    <h1>
                        Academic Copilot
                    </h1>

                    <p>
                        Your quiz performance history
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
                            📝 Quiz History
                        </h2>

                        <p>
                            Review your previous quiz attempts
                            and track your progress.
                        </p>

                    </div>


                    {loading && (
                        <p>
                            Loading quiz history...
                        </p>
                    )}


                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    {!loading &&
                        !error &&
                        history.length === 0 && (

                            <div className="empty-materials">

                                <h3>
                                    No Quiz Attempts
                                </h3>

                                <p>
                                    Complete a quiz to see
                                    your performance here.
                                </p>

                            </div>
                        )}


                    {!loading &&
                        history.length > 0 && (

                            <div className="quiz-history-list">

                                {history.map((attempt) => (

                                    <div
                                        className="quiz-history-item"
                                        key={attempt.id}
                                    >

                                        <h3>
                                            {attempt.topic}
                                        </h3>

                                        <p>
                                            <strong>
                                                Score:
                                            </strong>{" "}
                                            {attempt.correctAnswers}
                                            {" / "}
                                            {attempt.totalQuestions}
                                        </p>

                                        <p>
                                            <strong>
                                                Percentage:
                                            </strong>{" "}
                                            {Number(
                                                attempt.percentage
                                            ).toFixed(1)}
                                            %
                                        </p>

                                        <p>
                                            <strong>
                                                Correct:
                                            </strong>{" "}
                                            {attempt.correctAnswers}
                                        </p>

                                        <p>
                                            <strong>
                                                Wrong:
                                            </strong>{" "}
                                            {attempt.wrongAnswers}
                                        </p>

                                        <p>
                                            <strong>
                                                Attempted:
                                            </strong>{" "}
                                            {attempt.attemptedAt
                                                ? new Date(
                                                    attempt.attemptedAt
                                                ).toLocaleString()
                                                : "Unknown"}
                                        </p>

                                    </div>

                                ))}

                            </div>

                        )}

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

export default QuizHistory;