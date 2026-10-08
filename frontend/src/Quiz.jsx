import { useEffect, useState } from "react";

const API = "http://localhost:8080";

function Quiz({
                  onBack,
                  onQuizComplete,
                  initialTopic = ""
              }) {

    const [materials, setMaterials] = useState([]);

    const [materialId, setMaterialId] =
        useState("");

    const [topic, setTopic] =
        useState(initialTopic);

    const [numberOfQuestions, setNumberOfQuestions] =
        useState(5);

    const [quiz, setQuiz] =
        useState(null);

    const [answers, setAnswers] =
        useState({});

    const [submitted, setSubmitted] =
        useState(false);

    const [result, setResult] =
        useState(null);

    const [loadingMaterials, setLoadingMaterials] =
        useState(true);

    const [generating, setGenerating] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [successMessage, setSuccessMessage] =
        useState("");


    useEffect(() => {
        loadMaterials();
    }, []);


    useEffect(() => {

        if (initialTopic) {
            setTopic(initialTopic);
        }

    }, [initialTopic]);


    // =========================================================
    // LOAD MATERIALS
    // =========================================================

    const loadMaterials = async () => {

        setLoadingMaterials(true);
        setError("");

        try {

            const response =
                await fetch(
                    `${API}/api/materials`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                let message =
                    "Unable to load study materials.";

                try {

                    const data =
                        JSON.parse(text);

                    if (data.message) {
                        message = data.message;
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

            const materialList =
                Array.isArray(data)
                    ? data
                    : [];

            setMaterials(materialList);

            if (
                materialList.length > 0 &&
                !materialId
            ) {

                setMaterialId(
                    String(
                        materialList[0].id
                    )
                );
            }

        } catch (error) {

            console.error(
                "Load materials error:",
                error
            );

            setError(
                error.message ||
                "Unable to load study materials."
            );

        } finally {

            setLoadingMaterials(false);

        }
    };


    // =========================================================
    // NORMALIZE GEMINI QUIZ RESPONSE
    // =========================================================

    const normalizeQuizData = (data) => {

        if (!data ||
            !Array.isArray(data.questions)) {

            return data;
        }

        const normalizedQuestions =
            data.questions.map(
                (question, index) => {

                    let rawOptions =
                        question.options;

                    // -------------------------------------------------
                    // Case 1:
                    // options is already an array
                    // -------------------------------------------------

                    if (
                        !Array.isArray(rawOptions)
                    ) {

                        // -------------------------------------------------
                        // Case 2:
                        // Gemini returned an object
                        //
                        // Example:
                        // {
                        //   "A": "10",
                        //   "B": "20",
                        //   "C": "30",
                        //   "D": "40"
                        // }
                        // -------------------------------------------------

                        if (
                            rawOptions &&
                            typeof rawOptions === "object"
                        ) {

                            rawOptions =
                                Object.entries(
                                    rawOptions
                                ).map(
                                    ([key, value]) => ({
                                        value: String(key),
                                        label: String(value)
                                    })
                                );

                        }

                            // -------------------------------------------------
                            // Case 3:
                            // Gemini returned a string
                        // -------------------------------------------------

                        else if (
                            typeof rawOptions === "string"
                        ) {

                            rawOptions =
                                rawOptions
                                    .split(/\n|,/)
                                    .map(
                                        option =>
                                            option.trim()
                                    )
                                    .filter(
                                        option =>
                                            option.length > 0
                                    );

                        }

                        else {

                            rawOptions = [];

                        }
                    }


                    // -------------------------------------------------
                    // Convert every option into:
                    //
                    // {
                    //     value,
                    //     label,
                    //     feedback
                    // }
                    // -------------------------------------------------

                    const normalizedOptions =
                        rawOptions.map(
                            (option, optionIndex) => {

                                if (
                                    typeof option ===
                                    "string"
                                ) {

                                    return {
                                        value: option,
                                        label: option,
                                        feedback: ""
                                    };
                                }


                                if (
                                    option &&
                                    typeof option ===
                                    "object"
                                ) {

                                    const value =
                                        option.value ??
                                        option.id ??
                                        option.key ??
                                        String(
                                            optionIndex
                                        );

                                    const label =
                                        option.label ??
                                        option.text ??
                                        option.option ??
                                        option.value ??
                                        String(
                                            value
                                        );

                                    return {
                                        ...option,
                                        value: String(value),
                                        label: String(label),
                                        feedback:
                                            option.feedback ??
                                            ""
                                    };
                                }


                                return {
                                    value:
                                        String(
                                            optionIndex
                                        ),
                                    label:
                                        String(
                                            option
                                        ),
                                    feedback: ""
                                };
                            }
                        );


                    // -------------------------------------------------
                    // Normalize correct answer
                    // -------------------------------------------------

                    let correctValues =
                        question.correctValues;

                    if (
                        !Array.isArray(
                            correctValues
                        )
                    ) {

                        if (
                            Array.isArray(
                                question.correctAnswers
                            )
                        ) {

                            correctValues =
                                question.correctAnswers;

                        } else if (
                            question.correctAnswer !==
                            undefined &&
                            question.correctAnswer !==
                            null
                        ) {

                            correctValues = [
                                question.correctAnswer
                            ];

                        } else if (
                            question.answer !==
                            undefined &&
                            question.answer !==
                            null
                        ) {

                            correctValues = [
                                question.answer
                            ];

                        } else {

                            correctValues = [];
                        }
                    }


                    // -------------------------------------------------
                    // Make sure correct values match
                    // option values
                    // -------------------------------------------------

                    correctValues =
                        correctValues.map(
                            value =>
                                String(value)
                        );


                    return {
                        ...question,

                        id:
                            question.id ||
                            `question-${index + 1}`,

                        question:
                            question.question ||
                            `Question ${index + 1}`,

                        type:
                            question.type ||
                            "single_choice",

                        options:
                        normalizedOptions,

                        correctValues:
                        correctValues
                    };
                }
            );


        return {
            ...data,
            questions:
            normalizedQuestions
        };
    };


    // =========================================================
    // GENERATE QUIZ
    // =========================================================

    const generateQuiz = async (event) => {

        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!materialId) {

            setError(
                "Please select a study material."
            );

            return;
        }

        if (!topic.trim()) {

            setError(
                "Please enter a topic."
            );

            return;
        }

        const count =
            Number(numberOfQuestions);

        if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > 10
        ) {

            setError(
                "Number of questions must be between 1 and 10."
            );

            return;
        }

        setGenerating(true);

        setQuiz(null);
        setAnswers({});
        setSubmitted(false);
        setResult(null);

        try {

            const params =
                new URLSearchParams();

            params.append(
                "materialId",
                materialId
            );

            params.append(
                "topic",
                topic.trim()
            );

            params.append(
                "numberOfQuestions",
                String(count)
            );

            const response =
                await fetch(
                    `${API}/api/quiz/generate?${params.toString()}`,
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                let message =
                    "Unable to generate quiz.";

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
                    : null;

            if (!data) {

                throw new Error(
                    "The server returned an empty quiz."
                );
            }

            if (
                !Array.isArray(
                    data.questions
                ) ||
                data.questions.length === 0
            ) {

                throw new Error(
                    "No quiz questions were generated."
                );
            }


            // =====================================================
            // IMPORTANT:
            // Normalize Gemini response before React renders it.
            // =====================================================

            const normalizedQuiz =
                normalizeQuizData(data);


            // Make sure every question has options.

            const invalidQuestion =
                normalizedQuiz.questions.some(
                    question =>
                        !Array.isArray(
                            question.options
                        ) ||
                        question.options.length === 0
                );


            if (invalidQuestion) {

                throw new Error(
                    "The AI generated an invalid quiz format. Please try generating the quiz again."
                );
            }


            setQuiz(normalizedQuiz);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(
                "Generate quiz error:",
                error
            );

            setError(
                error.message ||
                "Unable to generate quiz."
            );

        } finally {

            setGenerating(false);

        }
    };


    // =========================================================
    // ANSWER CHANGE
    // =========================================================

    const handleAnswerChange = (
        questionId,
        value,
        type
    ) => {

        setAnswers((previous) => {

            const updated = {
                ...previous
            };

            if (
                type ===
                "multi_select"
            ) {

                const current =
                    Array.isArray(
                        updated[questionId]
                    )
                        ? [
                            ...updated[
                                questionId
                                ]
                        ]
                        : [];

                if (
                    current.includes(value)
                ) {

                    updated[questionId] =
                        current.filter(
                            item =>
                                item !== value
                        );

                } else {

                    updated[questionId] = [
                        ...current,
                        value
                    ];
                }

            } else {

                updated[questionId] =
                    value;
            }

            return updated;
        });
    };


    // =========================================================
    // CALCULATE SCORE
    // =========================================================

    const calculateCorrectAnswers = () => {

        if (
            !quiz ||
            !Array.isArray(
                quiz.questions
            )
        ) {

            return 0;
        }

        let correctCount = 0;

        quiz.questions.forEach(
            (question) => {

                const selected =
                    answers[
                        question.id
                        ];

                const correctValues =
                    Array.isArray(
                        question.correctValues
                    )
                        ? question.correctValues
                        : [];

                if (
                    question.type ===
                    "multi_select"
                ) {

                    const selectedValues =
                        Array.isArray(selected)
                            ? [...selected].sort()
                            : [];

                    const expectedValues =
                        [...correctValues]
                            .sort();

                    if (
                        selectedValues.length ===
                        expectedValues.length &&
                        selectedValues.every(
                            (value, index) =>
                                value ===
                                expectedValues[
                                    index
                                    ]
                        )
                    ) {

                        correctCount++;
                    }

                } else {

                    if (
                        selected &&
                        correctValues.includes(
                            selected
                        )
                    ) {

                        correctCount++;
                    }
                }
            }
        );

        return correctCount;
    };


    // =========================================================
    // SUBMIT QUIZ
    // =========================================================

    const submitQuiz = async () => {

        if (!quiz) {
            return;
        }

        setError("");
        setSuccessMessage("");

        const correctAnswers =
            calculateCorrectAnswers();

        const studentAnswers =
            {};

        quiz.questions.forEach(
            (question) => {

                const value =
                    answers[
                        question.id
                        ];

                if (
                    question.type ===
                    "multi_select"
                ) {

                    studentAnswers[
                        question.id
                        ] =
                        Array.isArray(value)
                            ? value
                            : [];

                } else {

                    studentAnswers[
                        question.id
                        ] =
                        value || "";
                }
            }
        );

        setSubmitting(true);

        try {

            const response =
                await fetch(
                    `${API}/api/quiz/submit`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            materialId:
                                Number(
                                    materialId
                                ),

                            topic:
                                topic.trim(),

                            correctAnswers,

                            studentAnswers
                        })
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                let message =
                    "Unable to submit quiz.";

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
                    : null;

            setResult(data);

            setSubmitted(true);

            setSuccessMessage(
                "Quiz completed and your performance has been saved."
            );

            if (onQuizComplete) {
                onQuizComplete(data);
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {

            console.error(
                "Submit quiz error:",
                error
            );

            setError(
                error.message ||
                "Unable to submit quiz."
            );

        } finally {

            setSubmitting(false);
        }
    };


    // =========================================================
    // RESET QUIZ
    // =========================================================

    const resetQuiz = () => {

        setQuiz(null);
        setAnswers({});
        setSubmitted(false);
        setResult(null);
        setError("");
        setSuccessMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =========================================================
    // OPTION STYLE
    // =========================================================

    const getOptionClass = (
        question,
        option
    ) => {

        if (!submitted) {
            return "quiz-option";
        }

        const correctValues =
            Array.isArray(
                question.correctValues
            )
                ? question.correctValues
                : [];

        const selected =
            answers[
                question.id
                ];

        const isCorrect =
            correctValues.includes(
                option.value
            );

        const isSelected =
            question.type ===
            "multi_select"
                ? Array.isArray(selected) &&
                selected.includes(
                    option.value
                )
                : selected ===
                option.value;

        if (isCorrect) {
            return "quiz-option correct";
        }

        if (
            isSelected &&
            !isCorrect
        ) {
            return "quiz-option incorrect";
        }

        return "quiz-option";
    };


    // =========================================================
    // QUESTION RESULT STYLE
    // =========================================================

    const getQuestionResultClass = (
        question
    ) => {

        if (!submitted) {
            return "";
        }

        const selected =
            answers[
                question.id
                ];

        const correctValues =
            Array.isArray(
                question.correctValues
            )
                ? question.correctValues
                : [];

        if (
            question.type ===
            "multi_select"
        ) {

            const selectedValues =
                Array.isArray(selected)
                    ? [...selected].sort()
                    : [];

            const expectedValues =
                [...correctValues]
                    .sort();

            const correct =
                selectedValues.length ===
                expectedValues.length &&
                selectedValues.every(
                    (value, index) =>
                        value ===
                        expectedValues[
                            index
                            ]
                );

            return correct
                ? "question-card correct-question"
                : "question-card incorrect-question";
        }

        return correctValues.includes(
            selected
        )
            ? "question-card correct-question"
            : "question-card incorrect-question";
    };


    // =========================================================
    // ANSWERED COUNT
    // =========================================================

    const answeredCount = () => {

        if (!quiz) {
            return 0;
        }

        return quiz.questions.filter(
            (question) => {

                const value =
                    answers[
                        question.id
                        ];

                if (
                    question.type ===
                    "multi_select"
                ) {

                    return (
                        Array.isArray(value) &&
                        value.length > 0
                    );
                }

                return Boolean(value);
            }
        ).length;
    };


    // =========================================================
    // LOADING MATERIALS
    // =========================================================

    if (loadingMaterials) {

        return (
            <div className="app">

                <header className="header">

                    <div>

                        <h1>
                            Academic Copilot
                        </h1>

                        <p>
                            AI-powered personalized quiz
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

                        <div className="empty-materials">

                            <h2>
                                Loading study materials...
                            </h2>

                            <p>
                                Preparing your quiz workspace.
                            </p>

                        </div>

                    </section>

                </main>

            </div>
        );
    }


    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="app">

            <header className="header">

                <div>

                    <h1>
                        Academic Copilot
                    </h1>

                    <p>
                        AI-powered personalized quiz
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
                            📝 AI Quiz
                        </h2>

                        <p>
                            Generate a quiz from your
                            uploaded study material.
                        </p>

                    </div>


                    {/* =================================================
                        QUIZ GENERATOR
                    ================================================= */}

                    {!quiz && (

                        <div className="quiz-generator-card">

                            <h3>
                                Generate Your Quiz
                            </h3>


                            <form
                                onSubmit={
                                    generateQuiz
                                }
                            >

                                <div className="form-group">

                                    <label>
                                        Study Material
                                    </label>


                                    {materials.length === 0 ? (

                                        <div className="empty-materials">

                                            <h3>
                                                No Study Materials Found
                                            </h3>

                                            <p>
                                                Upload a PDF before
                                                generating a quiz.
                                            </p>

                                        </div>

                                    ) : (

                                        <select
                                            value={
                                                materialId
                                            }
                                            onChange={(event) =>
                                                setMaterialId(
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select study material
                                            </option>


                                            {materials.map(
                                                (material) => (

                                                    <option
                                                        key={
                                                            material.id
                                                        }
                                                        value={
                                                            material.id
                                                        }
                                                    >
                                                        {material.title}
                                                        {" - "}
                                                        {material.subject?.name ||
                                                            "No subject"}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    )}

                                </div>


                                <div className="form-group">

                                    <label>
                                        Topic
                                    </label>

                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(event) =>
                                            setTopic(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Example: Binary Search"
                                        required
                                    />


                                    {initialTopic && (
                                        <p className="field-help">
                                            This topic was selected
                                            from your weak topics.
                                            You can change it if needed.
                                        </p>
                                    )}

                                </div>


                                <div className="form-group">

                                    <label>
                                        Number of Questions
                                    </label>

                                    <select
                                        value={
                                            numberOfQuestions
                                        }
                                        onChange={(event) =>
                                            setNumberOfQuestions(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                    >

                                        <option value={5}>
                                            5 Questions
                                        </option>

                                        <option value={6}>
                                            6 Questions
                                        </option>

                                        <option value={7}>
                                            7 Questions
                                        </option>

                                        <option value={8}>
                                            8 Questions
                                        </option>

                                        <option value={9}>
                                            9 Questions
                                        </option>

                                        <option value={10}>
                                            10 Questions
                                        </option>

                                    </select>

                                </div>


                                {error && (
                                    <div className="error-message">
                                        {error}
                                    </div>
                                )}


                                <button
                                    type="submit"
                                    disabled={
                                        generating ||
                                        materials.length === 0
                                    }
                                >
                                    {generating
                                        ? "Generating Quiz..."
                                        : "Generate Quiz"}
                                </button>

                            </form>

                        </div>
                    )}


                    {/* =================================================
                        QUIZ QUESTIONS
                    ================================================= */}

                    {quiz && !submitted && (

                        <div className="quiz-container">

                            <div className="quiz-top-bar">

                                <div>

                                    <h3>
                                        {quiz.title ||
                                            `Quiz: ${topic}`}
                                    </h3>

                                    <p>
                                        Topic:{" "}
                                        <strong>
                                            {topic}
                                        </strong>
                                    </p>

                                </div>


                                <div className="quiz-progress">

                                    <span>
                                        Answered
                                    </span>

                                    <strong>
                                        {answeredCount()}
                                        /
                                        {quiz.questions.length}
                                    </strong>

                                </div>

                            </div>


                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}


                            <div className="quiz-questions">

                                {quiz.questions.map(
                                    (questionItem, index) => (

                                        <div
                                            className="question-card"
                                            key={
                                                questionItem.id ||
                                                index
                                            }
                                        >

                                            <div className="question-number">

                                                Question{" "}
                                                {index + 1}

                                            </div>


                                            <h3>
                                                {
                                                    questionItem.question
                                                }
                                            </h3>


                                            {questionItem.type ===
                                                "multi_select" && (
                                                    <p className="question-instruction">
                                                        Select all
                                                        correct answers.
                                                    </p>
                                                )}


                                            {questionItem.type ===
                                                "true_false" && (
                                                    <p className="question-instruction">
                                                        Select True or
                                                        False.
                                                    </p>
                                                )}


                                            <div className="quiz-options">

                                                {Array.isArray(
                                                        questionItem.options
                                                    ) &&
                                                    questionItem.options.map(
                                                        (option, optionIndex) => {

                                                            const selected =
                                                                answers[
                                                                    questionItem.id
                                                                    ];

                                                            const isSelected =
                                                                questionItem.type ===
                                                                "multi_select"
                                                                    ? Array.isArray(
                                                                        selected
                                                                    ) &&
                                                                    selected.includes(
                                                                        option.value
                                                                    )
                                                                    : selected ===
                                                                    option.value;


                                                            return (
                                                                <label
                                                                    className={
                                                                        getOptionClass(
                                                                            questionItem,
                                                                            option
                                                                        )
                                                                    }
                                                                    key={
                                                                        option.value ||
                                                                        optionIndex
                                                                    }
                                                                >

                                                                    <input
                                                                        type={
                                                                            questionItem.type ===
                                                                            "multi_select"
                                                                                ? "checkbox"
                                                                                : "radio"
                                                                        }
                                                                        name={
                                                                            questionItem.id
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        onChange={() =>
                                                                            handleAnswerChange(
                                                                                questionItem.id,
                                                                                option.value,
                                                                                questionItem.type
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            submitted
                                                                        }
                                                                    />

                                                                    <span>
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </span>

                                                                </label>
                                                            );
                                                        }
                                                    )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="quiz-submit-section">

                                <p>
                                    You have answered{" "}
                                    <strong>
                                        {answeredCount()}
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {quiz.questions.length}
                                    </strong>{" "}
                                    questions.
                                </p>


                                <button
                                    onClick={
                                        submitQuiz
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Quiz"}
                                </button>

                            </div>

                        </div>
                    )}


                    {/* =================================================
                        QUIZ RESULT
                    ================================================= */}

                    {submitted && result && (

                        <div className="quiz-result">

                            <div className="result-header">

                                <h2>
                                    🎉 Quiz Completed
                                </h2>

                                <p>
                                    Your performance has
                                    been saved.
                                </p>

                            </div>


                            <div className="score-card">

                                <div className="score-main">

                                    <span>
                                        Score
                                    </span>

                                    <strong>
                                        {result.correctAnswers}
                                        /
                                        {result.totalQuestions}
                                    </strong>

                                </div>


                                <div className="score-details">

                                    <div>

                                        <span>
                                            Correct
                                        </span>

                                        <strong>
                                            {
                                                result.correctAnswers
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Wrong
                                        </span>

                                        <strong>
                                            {
                                                result.wrongAnswers
                                            }
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Percentage
                                        </span>

                                        <strong>
                                            {Number(
                                                result.percentage
                                            ).toFixed(1)}
                                            %
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            {successMessage && (
                                <div className="success-message">
                                    {successMessage}
                                </div>
                            )}


                            <div className="quiz-review">

                                <h2>
                                    Review Your Answers
                                </h2>


                                {quiz.questions.map(
                                    (questionItem, index) => (

                                        <div
                                            className={
                                                getQuestionResultClass(
                                                    questionItem
                                                )
                                            }
                                            key={
                                                questionItem.id ||
                                                index
                                            }
                                        >

                                            <div className="question-number">

                                                Question{" "}
                                                {index + 1}

                                            </div>


                                            <h3>
                                                {
                                                    questionItem.question
                                                }
                                            </h3>


                                            <div className="quiz-options">

                                                {Array.isArray(
                                                        questionItem.options
                                                    ) &&
                                                    questionItem.options.map(
                                                        (option, optionIndex) => {

                                                            const selected =
                                                                answers[
                                                                    questionItem.id
                                                                    ];

                                                            const isSelected =
                                                                questionItem.type ===
                                                                "multi_select"
                                                                    ? Array.isArray(
                                                                        selected
                                                                    ) &&
                                                                    selected.includes(
                                                                        option.value
                                                                    )
                                                                    : selected ===
                                                                    option.value;


                                                            const correct =
                                                                Array.isArray(
                                                                    questionItem.correctValues
                                                                ) &&
                                                                questionItem.correctValues.includes(
                                                                    option.value
                                                                );


                                                            return (
                                                                <div
                                                                    className={
                                                                        getOptionClass(
                                                                            questionItem,
                                                                            option
                                                                        )
                                                                    }
                                                                    key={
                                                                        option.value ||
                                                                        optionIndex
                                                                    }
                                                                >

                                                                    <div className="review-option-label">

                                                                        <span>
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </span>


                                                                        {correct && (
                                                                            <span>
                                                                                ✓
                                                                            </span>
                                                                        )}


                                                                        {isSelected &&
                                                                            !correct && (
                                                                                <span>
                                                                                    ✕
                                                                                </span>
                                                                            )}

                                                                    </div>


                                                                    {option.feedback && (
                                                                        <p>
                                                                            {
                                                                                option.feedback
                                                                            }
                                                                        </p>
                                                                    )}

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                            </div>


                                            {questionItem.hint && (

                                                <details className="quiz-hint">

                                                    <summary>
                                                        💡 Hint
                                                    </summary>

                                                    <p>
                                                        {
                                                            questionItem.hint
                                                        }
                                                    </p>

                                                </details>
                                            )}

                                        </div>

                                    )
                                )}

                            </div>


                            <div className="quiz-result-actions">

                                <button
                                    onClick={
                                        resetQuiz
                                    }
                                >
                                    🔄 Take Another Quiz
                                </button>


                                <button
                                    className="secondary-button"
                                    onClick={onBack}
                                >
                                    ← Back to Dashboard
                                </button>

                            </div>

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

export default Quiz;