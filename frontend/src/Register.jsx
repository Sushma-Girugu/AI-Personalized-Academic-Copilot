import { useState } from "react";

import { API } from "./config";
function Register({ onRegister, onLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        if (
            !name.trim() ||
            !email.trim() ||
            !password.trim() ||
            !confirmPassword.trim()
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Registration failed."
                );
                return;
            }

            onRegister({
                userId: data.userId,
                name: data.name,
                email: data.email,
            });

        } catch (error) {
            console.error(error);

            setError(
                "Unable to connect to the backend. Please make sure Spring Boot is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-logo">
                    🤖
                </div>

                <h1>Academic Copilot</h1>

                <p className="auth-subtitle">
                    Your personalized AI learning assistant
                </p>

                <h2>Create Account</h2>

                <p className="auth-description">
                    Start your personalized learning journey.
                </p>

                <form onSubmit={handleRegister}>

                    <div className="auth-field">
                        <label>Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-field">
                        <label>Confirm Password</label>

                        <input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <div className="auth-switch">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={onLogin}
                    >
                        Login
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Register;