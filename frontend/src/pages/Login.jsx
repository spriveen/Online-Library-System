import React, { useEffect, useState } from "react";
import { loginStyles as s } from "../assets/dummyStyles";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/AuthContext.jsx";

const roleChoices = [
  { value: "user", label: "Student", icon: UserRound },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.signupEmail || location.state?.signupPassword) {
      setForm((current) => ({
        ...current,
        email: location.state?.signupEmail ?? "",
        password: location.state?.signupPassword ?? "",
      }));
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", {
        email: form.email,
        role: form.role,
      });

      const result = await login(form);

      console.log("Login result:", result);

      if (!result.ok) {
        setError(result.error || "Login failed");
        setLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 100));

      const fallbackPath =
        form.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard";

      let target = location.state?.from || fallbackPath;

      if (
        form.role === "user" &&
        typeof target === "string" &&
        target.startsWith("/admin")
      ) {
        target = fallbackPath;
      }

      if (
        form.role === "admin" &&
        typeof target === "string" &&
        target.startsWith("/user")
      ) {
        target = fallbackPath;
      }

      navigate(target, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.mainCard}>
        <section className={s.infoPanel}>
          <span className={s.roleBadge}>College role login</span>
          <h1 className={s.infoTitle}>
            Choose student or admin first
          </h1>
          <p className={s.infoDescription}>
            Select role and login with your account.
          </p>

          <div className={s.infoBoxesContainer}>
            <div className={s.infoBox}>
              <p className={s.infoBoxTitle}>
                <UserRound size={16} /> Student Sign In
              </p>
              <p className={s.infoBoxText}>
                Student accounts for library access.
              </p>
            </div>

            <div className={s.infoBox}>
              <p className={s.infoBoxTitle}>
                <ShieldCheck size={16} /> Admin Access
              </p>
              <p className={s.infoBoxText}>
                Admin dashboard access.
              </p>
            </div>
          </div>
        </section>

        <section className={s.formPanel}>
          <div className={s.formInner}>
            <Link to="/" className={s.backLink}>
              Back to Home
            </Link>

            <h2 className={s.formTitle}>Login</h2>

            <form className={s.form} onSubmit={handleSubmit}>
              <div className={s.roleContainer}>
                <p className={s.roleLabel}>Choose role</p>

                <div className={s.roleGrid}>
                  {roleChoices.map((choice) => {
                    const Icon = choice.icon;
                    return (
                      <label
                        key={choice.value}
                        className={`${s.roleOption} ${
                          form.role === choice.value
                            ? s.roleOptionSelected
                            : s.roleOptionUnselected
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={choice.value}
                          checked={form.role === choice.value}
                          onChange={handleChange}
                          className={s.roleRadio}
                        />

                        <span className={s.roleIconLabel}>
                          <Icon size={16} /> {choice.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                 <span className={s.fieldLabel}>
                    <Mail size={16} /> 
                    Email Address
                 </span>
                 <input 
                 type="email" 
                 name="email" 
                 value={form.email} 
                 onChange={handleChange} 
                 placeholder="student@campus.edu"
                className={s.input}
                 />
              </label>

              <label className="block">
                <span className={s.fieldLabel}>
                    <LockKeyhole size={16} /> 
                    Password
                 </span>
                 <div className={s.passwordWrapper}>
                  <input 
                 type={showPassword ? "text" : "password"} 
                 name="password" 
                 value={form.password} 
                 onChange={handleChange} 
                 placeholder="enter Password"
                className={s.passwordInput}
                 />

                 <button type="button" onClick={()=> setShowPassword((current)=> !current)}
                    className={s.togglePasswordButton}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}  
                    </button>
              </div>
            </label>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;