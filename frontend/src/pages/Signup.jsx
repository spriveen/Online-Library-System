import React, { useEffect, useState } from "react";
import { signupStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../shared/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const stepList = [
  { id: 1, title: "Account" },
  { id: 2, title: "OTP" },
  { id: 3, title: "Profile" },
];

const Signup = () => {
  const { registerStudent, verifyOtpCode, completeProfileData, logout } =
    useAuth();

  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [showPassword] = useState(false);
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
      return;
    }
  };

  const goBack = () => {
    setError("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateStepOne() || !form.otp.trim() || !validateStepThree()) {
      setError("Complete all steps first");
      return;
    }

    setLoading(true);

    const result = await completeProfileData({
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
        <div className={`${s.toastBase} ${
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
          Complete the student signup steps: accounts,OTP,a nd profile
          details
         </p>
         <div className={s.stepGrid}>
           {stepList.map((item)=>(
            <div className={`${s.stepCard} ${
              step >= item.id ? s.stepCardCompleted: s.stepCardPending
            }`} 
            >
             <p className={s.stepLabel}>Step{item.id}</p>
             <p className={s.stepTitle}>{item.title}</p>
            </div>
           ))}
         </div>
        </div>
       </section>
      </div>
    </div>
  );
};

export default Signup;