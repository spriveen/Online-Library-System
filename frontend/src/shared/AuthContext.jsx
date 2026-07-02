import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

const AuthContext = createContext(null);

const SESSION_KEY = "library_auth_session";
const TOKEN_KEY = "library_auth_token";
const API_BASE_URL = "http://localhost:5000/api/auth";

const mapUserToFrontend = (user) => {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    department: user.department || "",
    stream: user.stream || "",
    academicYear: user.year || "",
    semester: user.semester || "",
    rollNumber: user.rollNo || "",
    studentId: user.studentId || `ST-${user._id?.slice(-6)}`,
    createdAt: user.createdAt,
  };
};

export const AuthProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  // =========================
  // ADMIN USERS
  // =========================
  const fetchRegisteredUsers = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data?.users) {
        const mapped = data.users.map(mapUserToFrontend);

        setAccounts(
          mapped.sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )
        );
      }
    } catch (err) {
      console.error("fetch users error:", err);
    }
  };

  // =========================
  // INIT AUTH
  // =========================
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const session = localStorage.getItem(SESSION_KEY);

      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (res.ok && data?.user) {
            const user = mapUserToFrontend(data.user);

            setCurrentUser(user);
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify(user)
            );

            if (user.role === "admin") {
              await fetchRegisteredUsers(token);
            }
          } else {
            logout();
          }
        } catch (err) {
          console.error("init auth error:", err);

          try {
            setCurrentUser(JSON.parse(session));
          } catch {
            logout();
          }
        }
      }

      setReady(true);
    };

    init();
  }, []);

  // =========================
  // LOGIN
  // =========================
  const login = async ({ email, password, role }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data?.message || "Login failed" };
      }

      const user = mapUserToFrontend(data.user);

      if (role && user.role !== role) {
        return {
          ok: false,
          error:
            role === "admin"
              ? "Not admin account"
              : "Not student account",
        };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(user)
      );

      setCurrentUser(user);

      if (user.role === "admin") {
        await fetchRegisteredUsers(data.token);
      }

      return { ok: true, user };
    } catch (err) {
      return { ok: false, error: "Server not reachable" };
    }
  };

  // =========================
  // REGISTER
  // =========================
  const registerStudent = async ({
    name,
    email,
    phone,
    password,
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          ok: false,
          error: data?.message || "Registration failed",
        };
      }

      return { ok: true, message: data.message };
    } catch {
      return { ok: false, error: "Server error" };
    }
  };

  // =========================
  // OTP VERIFY
  // =========================
  const verifyOtpCode = async ({ email, otp }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data?.message };
      }

      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }

      const user = mapUserToFrontend(data.user);

      setCurrentUser(user);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(user)
      );

      return { ok: true, message: data.message };
    } catch {
      return { ok: false, error: "OTP server error" };
    }
  };

  // =========================
  // UPDATE PROFILE
  // =========================
  const updateProfile = async (updates) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return { ok: false, error: "No token found" };
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/update-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          ok: false,
          error: data?.message || "Update failed",
        };
      }

      const user = mapUserToFrontend(data.user);

      setCurrentUser(user);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(user)
      );

      return { ok: true, user };
    } catch {
      return { ok: false, error: "Server error" };
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  const accountExists = (email) =>
    accounts.some(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase()
    );

  return (
    <AuthContext.Provider
      value={{
        accounts,
        currentUser,
        login,
        logout,
        ready,
        registerStudent,
        verifyOtpCode,
        updateProfile,
        accountExists,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};