import { useEffect, useState } from "react";

import { API } from "./config";
function WeakTopics({ onBack, onPracticeTopic }) {

    const [weakTopics, setWeakTopics] = useState([]);
    const [studyPlan, setStudyPlan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadWeakTopics();
    }, []);


    // =========================================================
    // LOAD WEAK TOPICS + STUDY PLAN INFORMATION
    // =========================================================

    const loadWeakTopics = async () => {

        setLoading(true);
        setError("");

        try {

            const weakResponse = await fetch(
                `${API}/api/weak-topics`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const weakText =
                await weakResponse.text();

            if (!weakResponse.ok) {

                let message =
                    "Unable to load weak topics.";

                try {

                    const data =
                        JSON.parse(weakText);

                    if (data.message) {
                        message = data.message;
                    }

                } catch {
                    // Ignore parsing error
                }

                throw new Error(message);
            }

            const weakData =
                weakText
                    ? JSON.parse(weakText)
                    : [];


            // Load study-plan information as well.
            // It contains the relevant uploaded material
            // and extracted revision content.

            const planResponse = await fetch(
                `${API}/api/study-plan`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            const planText =
                await planResponse.text();


            let planData = [];


            if (planResponse.ok && planText) {

                try {

                    planData =
                        JSON.parse(planText);

                } catch {
                    planData = [];
                }

            }


            setWeakTopics(
                Array.isArray(weakData)
                    ? weakData
                    : []
            );


            setStudyPlan(
                Array.isArray(planData)
                    ? planData
                    : []
            );


        } catch (error) {

            console.error(
                "Weak topics error:",
                error
            );

            setError(
                error.message ||
                "Unable to load weak topics."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // FIND STUDY PLAN DATA FOR TOPIC
    // =========================================================

    const getPlanForTopic = (topic) => {

        if (!Array.isArray(studyPlan)) {
            return null;
        }


        return studyPlan.find(
            (plan) =>
                plan.topic?.toLowerCase() ===
                topic?.toLowerCase()
        );
    };


    // =========================================================
    // PRIORITY
    // =========================================================

    const getPriority = (percentage) => {

        if (percentage < 50) {
            return "HIGH";
        }

        if (percentage < 70) {
            return "MEDIUM";
        }

        return "LOW";
    };


    // =========================================================
    // PRIORITY CLASS
    // =========================================================

    const getPriorityClass = (priority) => {

        if (priority === "HIGH") {
            return "weak-priority high";
        }

        if (priority === "MEDIUM") {
            return "weak-priority medium";
        }

        return "weak-priority low";
    };


    // =========================================================
    // PRACTICE TOPIC
    // =========================================================

    const practiceTopic = (topic) => {

        if (onPracticeTopic) {

            onPracticeTopic(topic);

        }

    };


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="app">

            {/* HEADER */}

            <header className="header">

                <div>

                    <h1>
                        Academic Copilot
                    </h1>

                    <p>
                        Identify and improve your weak areas
                    </p>

                </div>

            </header>


            <main className="container">

                <section className="result-section">

                    {/* BACK */}

                    <button
                        className="back-button"
                        onClick={onBack}
                    >
                        ← Back to Dashboard
                    </button>


                    {/* PAGE HEADER */}

                    <div className="materials-page-header">

                        <h2>
                            📊 Weak Topics
                        </h2>

                        <p>
                            Topics where your quiz
                            performance needs improvement.
                        </p>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div className="empty-materials">

                            <h3>
                                Analyzing your performance...
                            </h3>

                            <p>
                                Finding your weak topics
                                and relevant study material.
                            </p>

                        </div>

                    )}


                    {/* ERROR */}

                    {!loading && error && (

                        <div className="error-message">
                            {error}
                        </div>

                    )}


                    {/* EMPTY */}

                    {!loading &&
                        !error &&
                        weakTopics.length === 0 && (

                            <div className="empty-materials">

                                <h3>
                                    No Weak Topics Yet
                                </h3>

                                <p>
                                    Complete an AI quiz to
                                    analyze your performance.
                                </p>

                            </div>

                        )}


                    {/* WEAK TOPICS */}

                    {!loading &&
                        !error &&
                        weakTopics.length > 0 && (

                            <div className="weak-topics-list">

                                {weakTopics.map(
                                    (topic, index) => {

                                        const percentage =
                                            Number(
                                                topic.averagePercentage
                                            ) || 0;


                                        const priority =
                                            getPriority(
                                                percentage
                                            );


                                        const plan =
                                            getPlanForTopic(
                                                topic.topic
                                            );


                                        return (

                                            <div
                                                className="weak-topic-card"
                                                key={index}
                                            >

                                                {/* TOP */}

                                                <div className="weak-topic-header">

                                                    <div>

                                                        <h2>
                                                            {topic.topic}
                                                        </h2>

                                                        <p>
                                                            Based on your
                                                            quiz performance
                                                        </p>

                                                    </div>


                                                    <span
                                                        className={
                                                            getPriorityClass(
                                                                priority
                                                            )
                                                        }
                                                    >
                                                        {priority}
                                                    </span>

                                                </div>


                                                {/* STATS */}

                                                <div className="weak-topic-stats">

                                                    <div>

                                                        <span>
                                                            Average Score
                                                        </span>

                                                        <strong>
                                                            {percentage.toFixed(1)}
                                                            %
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Attempts
                                                        </span>

                                                        <strong>
                                                            {topic.attempts}
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Status
                                                        </span>

                                                        <strong>
                                                            {topic.status}
                                                        </strong>

                                                    </div>

                                                </div>


                                                {/* STUDY MATERIAL */}

                                                {plan && (

                                                    <>

                                                        <div className="weak-study-material">

                                                            <h3>
                                                                📚 Study Material
                                                            </h3>

                                                            <p>

                                                                <strong>
                                                                    Material:
                                                                </strong>{" "}

                                                                {plan.materialTitle ||
                                                                    "No matching material"}

                                                            </p>


                                                            <p>

                                                                <strong>
                                                                    Subject:
                                                                </strong>{" "}

                                                                {plan.subject ||
                                                                    "Not specified"}

                                                            </p>

                                                        </div>


                                                        {/* REVISION */}

                                                        <div className="weak-revision-content">

                                                            <h3>
                                                                📖 What to Revise
                                                            </h3>

                                                            <p>
                                                                {plan.revisionContent ||
                                                                    "No relevant content found in the uploaded material."}
                                                            </p>

                                                        </div>

                                                    </>

                                                )}


                                                {/* ACTIONS */}

                                                <div className="weak-topic-actions">

                                                    <button
                                                        onClick={() =>
                                                            practiceTopic(
                                                                topic.topic
                                                            )
                                                        }
                                                    >
                                                        📝 Practice This Topic
                                                    </button>


                                                    {plan && (
                                                        <button
                                                            className="secondary-button"
                                                            onClick={() =>
                                                                window.scrollTo({
                                                                    top: 0,
                                                                    behavior: "smooth"
                                                                })
                                                            }
                                                        >
                                                            📖 Review Material
                                                        </button>
                                                    )}

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        )}

                </section>

            </main>


            {/* FOOTER */}

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

export default WeakTopics;