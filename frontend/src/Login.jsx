import { useState } from "react";

const API = "http://localhost:8080";

function Login({ onLogin, onRegister }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setLoading(true);

        try {

            const response =
                await fetch(
                    `${API}/api/auth/login`,
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            email: email.trim(),
                            password
                        })
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {

                let message =
                    "Invalid email or password.";

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
                    : null;

            onLogin(data);

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                error.message ||
                "Unable to login."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-background">

                <div className="auth-card">

                    {/* BRAND */}

                    <div className="auth-brand">

                        <div className="auth-logo">
                            🤖
                        </div>

                        <h1>
                            Academic Copilot
                        </h1>

                        <p>
                            Your personalized AI learning
                            assistant
                        </p>

                    </div>


                    {/* LOGIN CONTENT */}

                    <div className="auth-content">

                        <h2>
                            Welcome Back
                        </h2>

                        <p className="auth-subtitle">
                            Login to continue your
                            learning journey.
                        </p>


                        {/* ERROR */}

                        {error && (

                            <div className="auth-error">
                                {error}
                            </div>

                        )}


                        {/* LOGIN FORM */}

                        <form
                            className="auth-form"
                            onSubmit={handleSubmit}
                        >

                            {/* EMAIL */}

                            <div className="auth-form-group">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="auth-form-group">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                />

                            </div>


                            {/* LOGIN BUTTON */}

                            <button
                                className="auth-submit"
                                type="submit"
                                disabled={loading}
                            >
                                {loading
                                    ? "Logging in..."
                                    : "Login"}
                            </button>

                        </form>


                        {/* DIVIDER */}

                        <div className="auth-divider">

                            <span>
                                New to Academic Copilot?
                            </span>

                        </div>


                        {/* REGISTER */}

                        <button
                            className="auth-register"
                            onClick={onRegister}
                            type="button"
                        >
                            Create Account
                        </button>

                    </div>


                    {/* FOOTER */}

                    <div className="auth-footer">

                        <p>
                            AI-Powered Personalized
                            Academic Copilot
                        </p>

                        <span>
                            B.Tech - AI & Data Science
                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;