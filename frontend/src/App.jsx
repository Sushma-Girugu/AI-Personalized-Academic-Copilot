import { useEffect, useState } from "react";
import "./App.css";

import Login from "./Login";
import Register from "./Register";
import Quiz from "./Quiz";
import Profile from "./Profile";
import QuizHistory from "./QuizHistory";
import WeakTopics from "./WeakTopics";
import StudyPlan from "./StudyPlan";
import AskAcademicCopilot from "./AskAcademicCopilot";

import { API } from "./config";
function App() {

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [showRegister, setShowRegister] = useState(false);

  const [user, setUser] = useState(null);


  // =====================================================
  // MATERIALS
  // =====================================================

  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] =
      useState(false);

  const [selectedMaterial, setSelectedMaterial] =
      useState(null);

  const [uploading, setUploading] =
      useState(false);

  const [uploadMessage, setUploadMessage] =
      useState("");

  const [uploadError, setUploadError] =
      useState("");


  // =====================================================
  // PAGE NAVIGATION
  // =====================================================

  const [showQuiz, setShowQuiz] =
      useState(false);

  const [showProfile, setShowProfile] =
      useState(false);

  const [showMaterials, setShowMaterials] =
      useState(false);

  const [showQuizHistory, setShowQuizHistory] =
      useState(false);

  const [showWeakTopics, setShowWeakTopics] =
      useState(false);

  const [showStudyPlan, setShowStudyPlan] =
      useState(false);

  const [showAsk, setShowAsk] =
      useState(false);


  // =====================================================
  // QUIZ
  // =====================================================

  const [quizTopic, setQuizTopic] =
      useState("");


  // =====================================================
  // MATERIAL TEXT MODAL
  // =====================================================

  const [showMaterialText, setShowMaterialText] =
      useState(false);

  const [materialText, setMaterialText] =
      useState("");

  const [loadingMaterialText, setLoadingMaterialText] =
      useState(false);


  // =====================================================
  // CHECK AUTHENTICATION WHEN APP OPENS
  // =====================================================

  useEffect(() => {

    checkAuthentication();

  }, []);


  const checkAuthentication = async () => {

    try {

      const response =
          await fetch(
              `${API}/api/auth/me`,
              {
                method: "GET",
                credentials: "include"
              }
          );


      if (response.ok) {

        const data =
            await response.json();

        setUser(data);

        setLoggedIn(true);

      } else {

        setUser(null);

        setLoggedIn(false);

      }

    } catch (error) {

      console.error(
          "Authentication check failed:",
          error
      );

      setUser(null);

      setLoggedIn(false);

    } finally {

      setCheckingAuth(false);

    }
  };


  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = (userData) => {

    setUser(userData);

    setLoggedIn(true);

    setShowRegister(false);

    setShowProfile(false);

    setShowMaterials(false);

    setShowQuiz(false);

    setShowQuizHistory(false);

    setShowWeakTopics(false);

    setShowStudyPlan(false);

    setShowAsk(false);

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {

    try {

      await fetch(
          `${API}/api/auth/logout`,
          {
            method: "POST",
            credentials: "include"
          }
      );

    } catch (error) {

      console.error(
          "Logout error:",
          error
      );

    }


    // Clear frontend session

    setLoggedIn(false);

    setUser(null);

    setMaterials([]);

    setSelectedMaterial(null);

    setShowQuiz(false);

    setShowProfile(false);

    setShowMaterials(false);

    setShowQuizHistory(false);

    setShowWeakTopics(false);

    setShowStudyPlan(false);

    setShowAsk(false);

    setQuizTopic("");

    setShowMaterialText(false);

    setMaterialText("");

  };


  // =====================================================
  // LOAD MATERIALS
  // =====================================================

  const loadMaterials = async () => {

    setLoadingMaterials(true);

    setUploadError("");

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


      setMaterials(
          Array.isArray(data)
              ? data
              : []
      );


    } catch (error) {

      console.error(
          "Materials error:",
          error
      );

      setUploadError(
          error.message ||
          "Unable to load study materials."
      );


    } finally {

      setLoadingMaterials(false);

    }
  };


  // =====================================================
  // OPEN MATERIALS PAGE
  // =====================================================

  const viewMaterials = async () => {

    setShowMaterials(true);

    setShowQuiz(false);

    setShowProfile(false);

    setShowQuizHistory(false);

    setShowWeakTopics(false);

    setShowStudyPlan(false);

    setShowAsk(false);

    await loadMaterials();

  };


  // =====================================================
  // UPLOAD MATERIAL
  // =====================================================

  const handleUpload = async (event) => {

    event.preventDefault();

    const form =
        event.target;

    const fileInput =
        form.elements.file;

    const titleInput =
        form.elements.title;

    const subjectInput =
        form.elements.subject;


    if (
        !fileInput.files ||
        fileInput.files.length === 0
    ) {

      setUploadError(
          "Please select a PDF file."
      );

      return;

    }


    const file =
        fileInput.files[0];


    if (
        !file.name
            .toLowerCase()
            .endsWith(".pdf")
    ) {

      setUploadError(
          "Only PDF files are supported."
      );

      return;

    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "title",
        titleInput.value
    );


    formData.append(
        "subjectName",
        subjectInput.value
    );


    setUploading(true);

    setUploadMessage("");

    setUploadError("");


    try {

      const response =
          await fetch(
              `${API}/api/files/upload`,
              {
                method: "POST",
                credentials: "include",
                body: formData
              }
          );


      const text =
          await response.text();


      if (!response.ok) {

        let message =
            "Upload failed.";

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


      let data = null;


      try {

        data =
            text
                ? JSON.parse(text)
                : null;

      } catch {

        data = null;

      }


      setUploadMessage(
          data?.message ||
          "Study material uploaded successfully."
      );


      form.reset();


      await loadMaterials();


    } catch (error) {

      console.error(
          "Upload error:",
          error
      );

      setUploadError(
          error.message ||
          "Unable to upload study material."
      );


    } finally {

      setUploading(false);

    }
  };


  // =====================================================
  // OPEN MATERIAL
  // =====================================================

  const openMaterial = async (material) => {

    setSelectedMaterial(material);

    setShowMaterialText(true);

    setMaterialText("");

    setLoadingMaterialText(true);


    try {

      const response =
          await fetch(
              `${API}/api/materials/${material.id}/text`,
              {
                method: "GET",
                credentials: "include"
              }
          );


      const text =
          await response.text();


      if (!response.ok) {

        let message =
            "Unable to load material text.";

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


      setMaterialText(
          text ||
          "No extracted text is available."
      );


    } catch (error) {

      console.error(
          "Material text error:",
          error
      );

      setMaterialText(
          error.message ||
          "Unable to load material text."
      );

    } finally {

      setLoadingMaterialText(false);

    }
  };


  // =====================================================
  // CLOSE MATERIAL
  // =====================================================

  const closeMaterialText = () => {

    setShowMaterialText(false);

    setSelectedMaterial(null);

    setMaterialText("");

  };


  // =====================================================
  // GO TO DASHBOARD
  // =====================================================

  const goToDashboard = () => {

    setShowQuiz(false);

    setShowProfile(false);

    setShowMaterials(false);

    setShowQuizHistory(false);

    setShowWeakTopics(false);

    setShowStudyPlan(false);

    setShowAsk(false);

  };


  // =====================================================
  // QUIZ COMPLETE
  // =====================================================

  const handleQuizComplete = () => {

    setQuizTopic("");

  };


  // =====================================================
  // AUTH CHECK LOADING
  // =====================================================

  if (checkingAuth) {

    return (

        <div className="app">

          <main className="container">

            <section className="result-section">

              <div className="empty-materials">

                <h2>
                  Loading Academic Copilot...
                </h2>

                <p>
                  Checking your session.
                </p>

              </div>

            </section>

          </main>

        </div>

    );

  }


  // =====================================================
  // REGISTER PAGE
  // =====================================================

  if (!loggedIn && showRegister) {

    return (

        <Register

            onRegister={() =>
                setShowRegister(false)
            }

            onLogin={() =>
                setShowRegister(false)
            }

        />

    );

  }


  // =====================================================
  // LOGIN PAGE
  // =====================================================

  // IMPORTANT:
  // If there is NO active backend session,
  // the user will ALWAYS see Login.

  if (!loggedIn) {

    return (

        <Login

            onLogin={handleLogin}

            onRegister={() =>
                setShowRegister(true)
            }

        />

    );

  }


  // =====================================================
  // PROFILE PAGE
  // =====================================================

  if (showProfile) {

    return (

        <Profile

            user={user}

            onBack={() =>
                setShowProfile(false)
            }

        />

    );

  }


  // =====================================================
  // ASK ACADEMIC COPILOT PAGE
  // =====================================================

  if (showAsk) {

    return (

        <AskAcademicCopilot

            onBack={() =>
                setShowAsk(false)
            }

        />

    );

  }


  // =====================================================
  // QUIZ PAGE
  // =====================================================

  if (showQuiz) {

    return (

        <Quiz

            onBack={() =>
                setShowQuiz(false)
            }

            initialTopic={quizTopic}

            onQuizComplete={
              handleQuizComplete
            }

        />

    );

  }


  // =====================================================
  // QUIZ HISTORY
  // =====================================================

  if (showQuizHistory) {

    return (

        <QuizHistory

            onBack={() =>
                setShowQuizHistory(false)
            }

        />

    );

  }


  // =====================================================
  // WEAK TOPICS
  // =====================================================

  if (showWeakTopics) {

    return (

        <WeakTopics

            onBack={() =>
                setShowWeakTopics(false)
            }

            onPracticeTopic={(topic) => {

              setQuizTopic(topic);

              setShowWeakTopics(false);

              setShowQuiz(true);

            }}

        />

    );

  }


  // =====================================================
  // STUDY PLAN
  // =====================================================

  if (showStudyPlan) {

    return (

        <StudyPlan

            onBack={() =>
                setShowStudyPlan(false)
            }


            onPracticeTopic={(topic) => {

              setQuizTopic(topic);

              setShowStudyPlan(false);

              setShowQuiz(true);

            }}


            onStudyMaterial={async (materialId) => {

              try {

                const response =
                    await fetch(
                        `${API}/api/materials/${materialId}`,
                        {
                          method: "GET",
                          credentials: "include"
                        }
                    );


                const text =
                    await response.text();


                if (!response.ok) {

                  throw new Error(
                      "Unable to load study material."
                  );

                }


                const material =
                    text
                        ? JSON.parse(text)
                        : null;


                if (!material) {

                  throw new Error(
                      "Study material not found."
                  );

                }


                setSelectedMaterial(
                    material
                );


                setShowStudyPlan(
                    false
                );


                setShowMaterials(
                    true
                );


                setShowMaterialText(
                    true
                );


                setMaterialText("");

                setLoadingMaterialText(
                    true
                );


                const textResponse =
                    await fetch(
                        `${API}/api/materials/${materialId}/text`,
                        {
                          method: "GET",
                          credentials: "include"
                        }
                    );


                const materialTextResponse =
                    await textResponse.text();


                if (!textResponse.ok) {

                  throw new Error(
                      "Unable to load material content."
                  );

                }


                setMaterialText(
                    materialTextResponse ||
                    "No extracted text is available."
                );


              } catch (error) {

                console.error(
                    "Study material error:",
                    error
                );


                setMaterialText(
                    error.message ||
                    "Unable to load study material."
                );


              } finally {

                setLoadingMaterialText(
                    false
                );

              }

            }}

        />

    );

  }


  // =====================================================
  // STUDY MATERIALS PAGE
  // =====================================================

  if (showMaterials) {

    return (

        <div className="app">

          <header className="header">

            <div>

              <h1>
                Academic Copilot
              </h1>

              <p>
                Your personalized study workspace
              </p>

            </div>


            <div className="header-actions">

              <button

                  className="profile-button"

                  onClick={() =>
                      setShowProfile(true)
                  }

              >
                👤 Profile
              </button>


              <button

                  className="logout-button"

                  onClick={handleLogout}

              >
                Logout
              </button>

            </div>

          </header>


          <main className="container">

            <section className="result-section">


              <button

                  className="back-button"

                  onClick={goToDashboard}

              >
                ← Back to Dashboard
              </button>


              <div className="materials-page-header">

                <h2>
                  📚 Study Materials
                </h2>

                <p>
                  Upload and manage your
                  personal study materials.
                </p>

              </div>


              <div className="upload-card">

                <h3>
                  Upload New Material
                </h3>


                <form
                    onSubmit={handleUpload}
                >

                  <div className="form-group">

                    <label>
                      Material Title
                    </label>

                    <input
                        name="title"
                        type="text"
                        placeholder="Example: Data Structures Notes"
                        required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Subject
                    </label>

                    <input
                        name="subject"
                        type="text"
                        placeholder="Example: Data Structures"
                        required
                    />

                  </div>


                  <div className="form-group">

                    <label>
                      PDF File
                    </label>

                    <input
                        name="file"
                        type="file"
                        accept=".pdf,application/pdf"
                        required
                    />

                  </div>


                  <button
                      type="submit"
                      disabled={uploading}
                  >

                    {uploading
                        ? "Uploading..."
                        : "Upload Material"}

                  </button>

                </form>


                {uploadMessage && (

                    <div className="success-message">

                      {uploadMessage}

                    </div>

                )}


                {uploadError && (

                    <div className="error-message">

                      {uploadError}

                    </div>

                )}

              </div>


              <div className="materials-list-section">

                <div className="section-title-row">

                  <div>

                    <h3>
                      Your Materials
                    </h3>

                    <p>
                      Only your uploaded
                      materials are shown.
                    </p>

                  </div>


                  <button

                      className="secondary-button"

                      onClick={
                        loadMaterials
                      }

                      disabled={
                        loadingMaterials
                      }

                  >

                    {loadingMaterials
                        ? "Refreshing..."
                        : "Refresh"}

                  </button>

                </div>


                {loadingMaterials && (

                    <div className="empty-materials">

                      <h3>
                        Loading materials...
                      </h3>

                    </div>

                )}


                {!loadingMaterials &&
                    materials.length === 0 && (

                        <div className="empty-materials">

                          <h3>
                            No Study Materials Yet
                          </h3>

                          <p>
                            Upload your first PDF
                            to start using
                            Academic Copilot.
                          </p>

                        </div>

                    )}


                {!loadingMaterials &&
                    materials.length > 0 && (

                        <div className="materials-grid">

                          {materials.map(
                              (material) => (

                                  <div

                                      className="material-card"

                                      key={
                                        material.id
                                      }

                                  >

                                    <h3>

                                      📄{" "}

                                      {material.title}

                                    </h3>


                                    <p>

                                      <strong>
                                        File:
                                      </strong>{" "}

                                      {material.fileName}

                                    </p>


                                    <p>

                                      <strong>
                                        Subject:
                                      </strong>{" "}

                                      {material.subject?.name ||
                                          "Not specified"}

                                    </p>


                                    <p>

                                      <strong>
                                        Uploaded:
                                      </strong>{" "}

                                      {material.uploadDate ||
                                          "Not available"}

                                    </p>


                                    <div className="material-actions">


                                      <button

                                          onClick={() =>
                                              openMaterial(
                                                  material
                                              )
                                          }

                                      >
                                        📖 View Material
                                      </button>


                                      <button

                                          className="secondary-button"

                                          onClick={() => {

                                            setQuizTopic("");

                                            setShowMaterials(
                                                false
                                            );

                                            setShowQuiz(
                                                true
                                            );

                                          }}

                                      >
                                        📝 Generate Quiz
                                      </button>

                                    </div>

                                  </div>

                              )
                          )}

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


          {showMaterialText && (

              <div className="modal-overlay">

                <div className="material-modal">


                  <div className="modal-header">

                    <div>

                      <h2>

                        📖{" "}

                        {selectedMaterial?.title}

                      </h2>

                      <p>

                        {selectedMaterial?.subject?.name ||
                            "Study Material"}

                      </p>

                    </div>


                    <button

                        className="modal-close"

                        onClick={
                          closeMaterialText
                        }

                    >
                      ✕
                    </button>

                  </div>


                  <div className="material-text">

                    {loadingMaterialText ? (

                        <div className="empty-materials">

                          <h3>
                            Loading material...
                          </h3>

                          <p>
                            Extracting the
                            study content.
                          </p>

                        </div>

                    ) : (

                        <p>
                          {materialText}
                        </p>

                    )}

                  </div>

                </div>

              </div>

          )}

        </div>

    );

  }


  // =====================================================
  // DASHBOARD
  // =====================================================

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


          <div className="header-actions">

            <button

                className="profile-button"

                onClick={() =>
                    setShowProfile(true)
                }

            >
              👤 Profile
            </button>


            <button

                className="logout-button"

                onClick={handleLogout}

            >
              Logout
            </button>

          </div>

        </header>


        <main className="container">


          <section className="welcome-section">

            <h2>

              Welcome to Academic Copilot

              {user?.name
                  ? `, ${user.name}`
                  : ""}

              !

            </h2>


            <p>

              Learn from your own study
              materials and improve your
              performance with AI.

            </p>

          </section>


          <section className="feature-grid">


            {/* STUDY MATERIALS */}

            <div className="feature-card">

              <div className="feature-icon">
                📚
              </div>

              <h3>
                Study Materials
              </h3>

              <p>
                Upload and manage your
                personal notes, PDFs and
                course materials.
              </p>

              <button
                  onClick={viewMaterials}
              >
                View Materials
              </button>

            </div>


            {/* AI QUIZ */}

            <div className="feature-card">

              <div className="feature-icon">
                📝
              </div>

              <h3>
                AI Quiz
              </h3>

              <p>
                Generate quizzes from your
                uploaded study material.
              </p>

              <button
                  onClick={() => {

                    setQuizTopic("");

                    setShowQuiz(true);

                  }}
              >
                Take Quiz
              </button>

            </div>


            {/* WEAK TOPICS */}

            <div className="feature-card">

              <div className="feature-icon">
                📊
              </div>

              <h3>
                Weak Topics
              </h3>

              <p>
                Identify the topics where
                you need more practice.
              </p>

              <button
                  onClick={() =>
                      setShowWeakTopics(true)
                  }
              >
                Analyze Weak Topics
              </button>

            </div>


            {/* STUDY PLAN */}

            <div className="feature-card">

              <div className="feature-icon">
                📅
              </div>

              <h3>
                Study Plan
              </h3>

              <p>
                Get a personalized plan
                based on your quiz performance.
              </p>

              <button
                  onClick={() =>
                      setShowStudyPlan(true)
                  }
              >
                View Study Plan
              </button>

            </div>


            {/* QUIZ HISTORY */}

            <div className="feature-card">

              <div className="feature-icon">
                📈
              </div>

              <h3>
                Quiz History
              </h3>

              <p>
                Track your quiz attempts,
                scores and progress.
              </p>

              <button
                  onClick={() =>
                      setShowQuizHistory(true)
                  }
              >
                View History
              </button>

            </div>


            {/* ASK ACADEMIC COPILOT */}

            <div className="feature-card">

              <div className="feature-icon">
                🤖
              </div>

              <h3>
                Ask Academic Copilot
              </h3>

              <p>
                Ask questions about your
                uploaded study materials.
              </p>

              <button
                  onClick={() =>
                      setShowAsk(true)
                  }
              >
                Ask AI
              </button>

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

export default App;