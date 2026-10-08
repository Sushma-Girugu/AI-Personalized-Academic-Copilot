import { useEffect, useState } from "react";

function Profile({ user, onBack }) {

    const [editing, setEditing] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [message, setMessage] = useState("");


    // =========================================================
    // LOAD USER DATA
    // =========================================================

    useEffect(() => {

        setName(
            user?.name ||
            user?.fullName ||
            user?.username ||
            ""
        );

        setEmail(
            user?.email ||
            ""
        );

    }, [user]);


    // =========================================================
    // SAVE PROFILE
    // =========================================================

    const saveProfile = () => {

        setEditing(false);

        setMessage(
            "Profile information updated for this session."
        );
    };


    // =========================================================
    // CANCEL EDITING
    // =========================================================

    const cancelEditing = () => {

        setName(
            user?.name ||
            user?.fullName ||
            user?.username ||
            ""
        );

        setEmail(
            user?.email ||
            ""
        );

        setMessage("");

        setEditing(false);
    };


    const displayName =
        name.trim() ||
        "Student";


    const avatarLetter =
        displayName
            .charAt(0)
            .toUpperCase();


    const userId =
        user?.userId ??
        user?.id ??
        user?.user?.id ??
        "N/A";


    return (

        <div className="profile-page">

            {/* =====================================================
                TOP NAVIGATION
            ===================================================== */}

            <div className="profile-container">

                <button
                    className="profile-back-button"
                    onClick={onBack}
                >
                    ← Back to Dashboard
                </button>


                {/* =================================================
                    PROFILE HEADER
                ================================================= */}

                <div className="profile-header-section">

                    <div className="profile-avatar-large">

                        {avatarLetter}

                    </div>


                    <h1>
                        {displayName}
                    </h1>


                    <p>
                        Academic Copilot Student
                    </p>

                </div>


                {/* =================================================
                    PROFILE CARD
                ================================================= */}

                <div className="profile-card">

                    <div className="profile-card-header">

                        <div>

                            <h2>
                                👤 Profile Information
                            </h2>

                            <p>
                                Manage your Academic
                                Copilot account information.
                            </p>

                        </div>

                    </div>


                    {message && (

                        <div className="profile-success">

                            ✓ {message}

                        </div>

                    )}


                    {/* =============================================
                        INFORMATION
                    ============================================= */}

                    <div className="profile-information">


                        {/* FULL NAME */}

                        <div className="profile-field">

                            <label>
                                Full Name
                            </label>

                            {editing ? (

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => {

                                        setName(
                                            event.target.value
                                        );

                                        setMessage("");

                                    }}
                                    placeholder="Enter your full name"
                                />

                            ) : (

                                <div className="profile-value">

                                    <span className="profile-field-icon">
                                        👤
                                    </span>

                                    <span>
                                        {name ||
                                            "Not provided"}
                                    </span>

                                </div>

                            )}

                        </div>


                        {/* EMAIL */}

                        <div className="profile-field">

                            <label>
                                Email Address
                            </label>

                            {editing ? (

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => {

                                        setEmail(
                                            event.target.value
                                        );

                                        setMessage("");

                                    }}
                                    placeholder="Enter your email"
                                />

                            ) : (

                                <div className="profile-value">

                                    <span className="profile-field-icon">
                                        ✉️
                                    </span>

                                    <span>
                                        {email ||
                                            "Not provided"}
                                    </span>

                                </div>

                            )}

                        </div>


                        {/* USER ID */}

                        <div className="profile-field">

                            <label>
                                User ID
                            </label>

                            <div className="profile-value">

                                <span className="profile-field-icon">
                                    🆔
                                </span>

                                <span>
                                    {userId}
                                </span>

                            </div>

                        </div>


                        {/* ACCOUNT STATUS */}

                        <div className="profile-field">

                            <label>
                                Account Status
                            </label>

                            <div className="profile-value">

                                <span className="profile-field-icon">
                                    🟢
                                </span>

                                <span className="account-active">
                                    Active
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ACTION BUTTONS
                    ================================================= */}

                    <div className="profile-actions">

                        {editing ? (

                            <>

                                <button
                                    className="save-profile-button"
                                    onClick={saveProfile}
                                >
                                    ✓ Save Changes
                                </button>


                                <button
                                    className="cancel-profile-button"
                                    onClick={
                                        cancelEditing
                                    }
                                >
                                    Cancel
                                </button>

                            </>

                        ) : (

                            <button
                                className="edit-profile-button"
                                onClick={() => {

                                    setMessage("");

                                    setEditing(true);

                                }}
                            >
                                ✏️ Edit Profile
                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    ACCOUNT INFORMATION
                ================================================= */}

                <div className="profile-info-box">

                    <div className="profile-info-icon">
                        🤖
                    </div>

                    <div>

                        <h3>
                            Academic Copilot Account
                        </h3>

                        <p>
                            Your account is used to securely
                            manage your study materials, quiz
                            attempts, weak topics and
                            personalized study plans.
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                INLINE PROFILE STYLES
                ===================================================== */}

            <style>{`

                .profile-page {
                    min-height: 100vh;
                    background:
                        linear-gradient(
                            135deg,
                            #f5f7ff 0%,
                            #eef2ff 50%,
                            #f8fafc 100%
                        );
                    padding: 40px 20px 70px;
                }

                .profile-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .profile-back-button {
                    border: none;
                    background: transparent;
                    color: #4f46e5;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 8px 0;
                    margin-bottom: 25px;
                }

                .profile-back-button:hover {
                    color: #3730a3;
                }

                .profile-header-section {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .profile-avatar-large {
                    width: 105px;
                    height: 105px;
                    margin: 0 auto 18px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(
                        135deg,
                        #4f46e5,
                        #7c3aed
                    );
                    color: white;
                    font-size: 42px;
                    font-weight: 800;
                    box-shadow:
                        0 15px 35px
                        rgba(79, 70, 229, 0.25);
                }

                .profile-header-section h1 {
                    margin: 0;
                    color: #172554;
                    font-size: 34px;
                    font-weight: 800;
                }

                .profile-header-section p {
                    margin: 8px 0 0;
                    color: #64748b;
                    font-size: 16px;
                }

                .profile-card {
                    background: white;
                    border-radius: 22px;
                    padding: 35px;
                    box-shadow:
                        0 20px 55px
                        rgba(15, 23, 42, 0.10);
                    border: 1px solid #e5e7eb;
                }

                .profile-card-header {
                    padding-bottom: 25px;
                    border-bottom: 1px solid #e5e7eb;
                    margin-bottom: 25px;
                }

                .profile-card-header h2 {
                    margin: 0;
                    color: #172554;
                    font-size: 24px;
                }

                .profile-card-header p {
                    margin: 7px 0 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .profile-success {
                    background: #ecfdf5;
                    border: 1px solid #a7f3d0;
                    color: #047857;
                    padding: 13px 16px;
                    border-radius: 10px;
                    margin-bottom: 25px;
                    font-size: 14px;
                    font-weight: 600;
                }

                .profile-information {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 22px;
                }

                .profile-field {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 18px;
                }

                .profile-field label {
                    display: block;
                    color: #64748b;
                    font-size: 13px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .profile-field input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 12px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 9px;
                    font-size: 15px;
                    outline: none;
                    background: white;
                }

                .profile-field input:focus {
                    border-color: #6366f1;
                    box-shadow:
                        0 0 0 3px
                        rgba(99, 102, 241, 0.12);
                }

                .profile-value {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #1e293b;
                    font-size: 16px;
                    font-weight: 600;
                    min-height: 24px;
                    word-break: break-word;
                }

                .profile-field-icon {
                    font-size: 17px;
                }

                .account-active {
                    color: #059669;
                    font-weight: 700;
                }

                .profile-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 28px;
                    padding-top: 25px;
                    border-top: 1px solid #e5e7eb;
                }

                .profile-actions button {
                    border: none;
                    border-radius: 10px;
                    padding: 13px 22px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s ease;
                }

                .edit-profile-button,
                .save-profile-button {
                    background: #4f46e5;
                    color: white;
                }

                .edit-profile-button:hover,
                .save-profile-button:hover {
                    background: #4338ca;
                    transform: translateY(-1px);
                }

                .cancel-profile-button {
                    background: #f1f5f9;
                    color: #334155;
                    border: 1px solid #cbd5e1 !important;
                }

                .cancel-profile-button:hover {
                    background: #e2e8f0;
                }

                .profile-info-box {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    margin-top: 22px;
                    padding: 22px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 18px;
                    box-shadow:
                        0 10px 30px
                        rgba(15, 23, 42, 0.06);
                }

                .profile-info-icon {
                    width: 45px;
                    height: 45px;
                    flex-shrink: 0;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #eef2ff;
                    font-size: 23px;
                }

                .profile-info-box h3 {
                    margin: 2px 0 6px;
                    color: #1e293b;
                    font-size: 17px;
                }

                .profile-info-box p {
                    margin: 0;
                    color: #64748b;
                    line-height: 1.6;
                    font-size: 14px;
                }

                @media (max-width: 700px) {

                    .profile-page {
                        padding: 25px 15px 50px;
                    }

                    .profile-card {
                        padding: 22px;
                    }

                    .profile-information {
                        grid-template-columns: 1fr;
                    }

                    .profile-header-section h1 {
                        font-size: 28px;
                    }

                    .profile-actions {
                        flex-direction: column;
                    }

                    .profile-actions button {
                        width: 100%;
                    }

                }

            `}</style>

        </div>
    );
}

export default Profile;