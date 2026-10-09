import { useEffect, useState } from "react";

import { API } from "./config";
function StudyPlan({
                       onBack,
                       onPracticeTopic,
                       onStudyMaterial
                   }) {

    const [studyPlan, setStudyPlan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStudyPlan();
    }, []);

    const loadStudyPlan = async () => {

        setLoading(true);
        setError("");

        try {

            const response =
                await fetch(
                    `${API}/api/study-plan`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                let message =
                    "Unable to load study plan.";

                try {

                    const data =
                        JSON.parse(text);

                    if (data.message) {
                        message =
                            data.message;
                    }

                } catch {
                    // Ignore parsing error
                }

                throw new Error(message);
            }

            const data =
                text
                    ? JSON.parse(text)
                    : [];

            setStudyPlan(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                "Study plan error:",
                error
            );

            setError(
                error.message ||
                "Unable to load study plan."
            );

        } finally {

            setLoading(false);

        }
    };


    const getPriorityClass = (priority) => {

        if (priority === "HIGH") {
            return "plan-priority high";
        }

        if (priority === "MEDIUM") {
            return "plan-priority medium";
        }

        return "plan-priority low";
    };


    const practiceTopic = (topic) => {

        if (onPracticeTopic) {
            onPracticeTopic(topic);
        }

    };


    const studyMaterial = (materialId) => {

        if (
            onStudyMaterial &&
            materialId
        ) {

            onStudyMaterial(materialId);

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
                        Your personalized study roadmap
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
                            📅 Personalized Study Plan
                        </h2>

                        <p>
                            A study roadmap created from
                            your quiz performance and
                            uploaded study materials.
                        </p>

                    </div>


                    {loading && (

                        <div className="empty-materials">

                            <h3>
                                Creating your study plan...
                            </h3>

                            <p>
                                Analyzing your weak topics
                                and matching them with
                                your study materials.
                            </p>

                        </div>

                    )}


                    {!loading && error && (

                        <div className="error-message">
                            {error}
                        </div>

                    )}


                    {!loading &&
                        !error &&
                        studyPlan.length === 0 && (

                            <div className="empty-materials">

                                <h3>
                                    No Study Plan Yet
                                </h3>

                                <p>
                                    Complete some quizzes
                                    to generate a personalized
                                    study plan.
                                </p>

                            </div>

                        )}


                    {!loading &&
                        !error &&
                        studyPlan.length > 0 && (

                            <div className="study-plan-list">

                                {studyPlan.map(
                                    (plan, index) => (

                                        <div
                                            className="plan-day"
                                            key={
                                                `${plan.day}-${plan.topic}-${index}`
                                            }
                                        >

                                            {/* DAY HEADER */}

                                            <div className="plan-day-header">

                                                <div>

                                                    <h2>
                                                        Day{" "}
                                                        {plan.day}
                                                        {" — "}
                                                        {plan.topic}
                                                    </h2>

                                                    <p>
                                                        Focus on this
                                                        topic to improve
                                                        your performance.
                                                    </p>

                                                </div>


                                                <span
                                                    className={
                                                        getPriorityClass(
                                                            plan.priority
                                                        )
                                                    }
                                                >
                                                    {plan.priority}
                                                </span>

                                            </div>


                                            {/* SCORE */}

                                            <div className="plan-stats">

                                                <span>
                                                    Current Score:{" "}
                                                    <strong>
                                                        {Number(
                                                            plan.currentPercentage
                                                        ).toFixed(1)}
                                                        %
                                                    </strong>
                                                </span>

                                                <span>
                                                    Priority:{" "}
                                                    <strong>
                                                        {plan.priority}
                                                    </strong>
                                                </span>

                                            </div>


                                            {/* STUDY MATERIAL */}

                                            <div className="plan-material">

                                                <h3>
                                                    📚 Study Material
                                                </h3>


                                                <p>
                                                    <strong>
                                                        Material:
                                                    </strong>{" "}

                                                    {plan.materialTitle ||
                                                        "No matching material found"}
                                                </p>


                                                <p>
                                                    <strong>
                                                        Subject:
                                                    </strong>{" "}

                                                    {plan.subject ||
                                                        "Not available"}
                                                </p>


                                                {plan.materialId && (

                                                    <button
                                                        className="plan-study-button"
                                                        onClick={() =>
                                                            studyMaterial(
                                                                plan.materialId
                                                            )
                                                        }
                                                    >
                                                        📖 Study This Topic
                                                    </button>

                                                )}

                                            </div>


                                            {/* REVISION CONTENT */}

                                            <div className="revision-content">

                                                <h3>
                                                    📖 What You Should Revise
                                                </h3>

                                                <p>
                                                    {plan.revisionContent ||
                                                        "No specific revision content was found."}
                                                </p>

                                            </div>


                                            {/* ACTIVITIES */}

                                            <div className="plan-activities">

                                                <h3>
                                                    🎯 Recommended Activities
                                                </h3>


                                                {Array.isArray(
                                                    plan.activities
                                                ) &&
                                                plan.activities.length > 0 ? (

                                                    <ul>

                                                        {plan.activities.map(
                                                            (
                                                                activity,
                                                                activityIndex
                                                            ) => (

                                                                <li
                                                                    key={
                                                                        activityIndex
                                                                    }
                                                                >
                                                                    {activity}
                                                                </li>

                                                            )
                                                        )}

                                                    </ul>

                                                ) : (

                                                    <p>
                                                        Review the topic
                                                        and practice
                                                        related questions.
                                                    </p>

                                                )}

                                            </div>


                                            {/* ACTION BUTTONS */}

                                            <div className="plan-actions">

                                                {plan.materialId && (

                                                    <button
                                                        className="plan-material-action"
                                                        onClick={() =>
                                                            studyMaterial(
                                                                plan.materialId
                                                            )
                                                        }
                                                    >
                                                        📖 Study This Topic
                                                    </button>

                                                )}


                                                <button
                                                    className="plan-practice-action"
                                                    onClick={() =>
                                                        practiceTopic(
                                                            plan.topic
                                                        )
                                                    }
                                                >
                                                    📝 Practice Now
                                                </button>

                                            </div>

                                        </div>

                                    )
                                )}

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

export default StudyPlan;