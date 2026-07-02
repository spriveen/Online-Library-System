import React, { useEffect, useState } from "react";
import { signupStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../shared/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { studentSemesters, studentYears } from "../data/libraryData";

const stepList = [
  { id: 1, title: "Account" },
  { id: 2, title: "OTP" },
  { id: 3, title: "Profile" },
];

// ✅ FIX: missing highlight array
const signupHighlights = [
  "Secure student account creation",
  "OTP email verification",
  "3-step guided signup process",
  "Fast library access system",
];

const Signup = () => {
  const { registerStudent, verifyOtpCode, updateProfile, logout } = useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    otp: "",
    role: "user",
    department: "",
    stream: "",
    semester: "Semester 1",
    academicYear: "1st Year",
    rollNumber: "",
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, phone: digitsOnly }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStepOne = () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password.trim()
    ) {
      setError("Fill all account details first.");
      return false;
    }

    if (form.phone.length !== 10) {
      setError("Phone must be 10 digits.");
      return false;
    }

    return true;
  };

  const validateStepThree = () => {
    if (
      !form.department.trim() ||
      !form.stream.trim() ||
      !form.semester.trim() ||
      !form.academicYear.trim() ||
      !form.rollNumber.trim()
    ) {
      setError("Complete all profile fields.");
      return false;
    }
    return true;
  };

  const showToast = (message, tone = "success") => {
    setToast({ message, tone });
  };

  const goNext = async () => {
    setError("");

    if (step === 1) {
      if (!validateStepOne()) return;

      setLoading(true);
      const res = await registerStudent({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setLoading(false);

      if (!res?.ok) {
        setError(res?.error || "Registration failed");
        showToast(res?.error || "Error", "error");
        return;
      }

      showToast("OTP sent successfully");
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!form.otp.trim()) {
        setError("Enter OTP");
        return;
      }

      setLoading(true);
      const res = await verifyOtpCode({
        email: form.email,
        otp: form.otp,
      });
      setLoading(false);

      if (!res?.ok) {
        setError(res?.error || "OTP failed");
        showToast(res?.error || "Error", "error");
        return;
      }

      showToast("OTP verified");
      setStep(3);
    }
  };

  const goBack = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ FIXED LOGIC (no unnecessary step1 re-check)
    if (!form.otp.trim() || !validateStepThree()) {
      setError("Complete all steps first");
      return;
    }

    setLoading(true);

    const result = await updateProfile({
      email: form.email,
      department: form.department,
      stream: form.stream,
      semester: form.semester,
      academicYear: form.academicYear,
      rollNumber: form.rollNumber,
    });

    setLoading(false);

    if (!result?.ok) {
      setError(result?.error || "Failed");
      showToast(result?.error || "Error", "error");
      return;
    }

    showToast("Profile completed");

    setTimeout(() => {
      logout();
      navigate("/login", {
        replace: true,
        state: {
          signupEmail: form.email,
          signupPassword: form.password,
        },
      });
    }, 1000);
  };

  return (
    <div className={s.pageContainer}>
      {toast && (
        <div
          className={`${s.toastBase} ${
            toast.tone === "error" ? s.toastError : s.toastSuccess
          }`}
        >
          <div className={s.toastContent}>
            <CheckCircle2 size={18} />
            {toast.message}
          </div>
        </div>
      )}

      <div className={s.mainCard}>
        <section className={s.formPanel}>
          <div className={s.formInner}>
            <Link to="/" className={s.backLink}>
              Back to Home
            </Link>

            <h1 className={s.panelTitle}>
              Create your student library account.
            </h1>

            <p className={s.panelSubtitle}>
              Complete signup in 3 steps: account, OTP, profile
            </p>

            <div className={s.stepGrid}>
              {stepList.map((item) => (
                <div
                  key={item.id}
                  className={`${s.stepCard} ${
                    step >= item.id
                      ? s.stepCardCompleted
                      : s.stepCardPending
                  }`}
                >
                  <p className={s.stepLabel}>Step {item.id}</p>
                  <p className={s.stepTitle}>{item.title}</p>
                </div>
              ))}
            </div>

            <form className={s.form} onSubmit={handleSubmit}>
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <label className="block">
                    <span className={s.fieldLabel}>
                      <UserRound size={15} /> Full Name
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={s.input}
                    />
                  </label>

                  <label className="block">
                    <span className={s.fieldLabel}>
                      <Mail size={15} /> Email Address
                    </span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={s.input}
                    />
                  </label>

                  <label className="block">
                    <span className={s.fieldLabel}>
                      <Phone size={15} /> Mobile Number
                    </span>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={s.input}
                    />
                  </label>

                  <label className="block">
                    <span className={s.fieldLabel}>
                      <LockKeyhole size={15} /> Password
                    </span>
                    <div className={s.passwordWrapper}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className={s.passwordInput}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className={s.toggleButton}
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </label>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <p className={s.otpInfoText}>
                    OTP sent to <b>{form.email}</b>
                  </p>

                  <input
                    name="otp"
                    value={form.otp}
                    onChange={handleChange}
                    className={s.input}
                    placeholder="Enter OTP"
                  />
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className={s.input}
                    placeholder="Department"
                  />

                  <input
                    name="stream"
                    value={form.stream}
                    onChange={handleChange}
                    className={s.input}
                    placeholder="Stream"
                  />

                  <select
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className={s.select}
                  >
                    {studentSemesters.map((s1) => (
                      <option key={s1} value={s1}>
                        {s1}
                      </option>
                    ))}
                  </select>

                  <select
                    name="academicYear"
                    value={form.academicYear}
                    onChange={handleChange}
                    className={s.select}
                  >
                    {studentYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <input
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange}
                    className={s.input}
                    placeholder="Roll Number"
                  />
                </>
              )}

              {error && <div className={s.errorMessage}>{error}</div>}

              <div className={s.buttonGroup}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className={s.backButton}
                  >
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className={s.nextButton}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                ) : (
                  <button type="submit" className={s.submitButton}>
                    Complete Profile <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className={s.infoPanel}>
          <span className={s.infoBadge}>
            <Sparkles size={14} /> Step wise signup
          </span>

          <h2 className={s.infoTitle}>
            Simple 3-step registration process
          </h2>

          <div className={s.infoList}>
            {signupHighlights.map((item) => (
              <div key={item} className={s.infoListItem}>
                <BadgeCheck size={18} />
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;