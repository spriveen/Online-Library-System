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

const defaultAccounts = [];

const mapUserToFrontend = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    department: user.department || "General",
    stream: user.stream || "General",
    academicYear: user.year || "1st Year",
    semester: user.semester || "Semester 1",
    rollNumber: user.rollNo || "",
    studentId: user.studentId || `ST-${user._id.slice(-6)}`,
    createdAt: user.createdAt,
  };
};

export const AuthProvider = ({ children }) => {
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [currentUser, setCurrentUser] = useState(null);
  const [ready, setReady] = useState(false);

  // fetch users (admin)
  const fetchRegisteredUsers = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.users)) {
        const fetchedAccounts = data.users
          .map(mapUserToFrontend)
          .sort(
            (a, b) =>
              new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
          );

        setAccounts(fetchedAccounts);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // init auth
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const session = localStorage.getItem(SESSION_KEY);

      if (token && session) {
        try {
          const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.ok && data.success && data.user) {
            const mappedUser = mapUserToFrontend(data.user);
            setCurrentUser(mappedUser);
            localStorage.setItem(
              SESSION_KEY,
              JSON.stringify(mappedUser)
            );

            if (mappedUser.role === "admin") {
              await fetchRegisteredUsers(token);
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth init error:", error);
          try {
            setCurrentUser(JSON.parse(session));
          } catch {
            logout();
          }
        }
      }

      setReady(true);
    };

    initializeAuth();
  }, []);

  // login
  const login = async ({ email, password, role }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || "Invalid credentials",
        };
      }

      if (data.success && data.token && data.user) {
        const mappedUser = mapUserToFrontend(data.user);

        if (role && mappedUser.role !== role) {
          return {
            ok: false,
            error:
              role === "admin"
                ? "Not an admin account"
                : "Not a student account",
          };
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(mappedUser)
        );
        setCurrentUser(mappedUser);

        if (mappedUser.role === "admin") {
          await fetchRegisteredUsers(data.token);
        }

        return { ok: true, user: mappedUser };
      }

      return { ok: false, error: "Login failed" };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error: "Server not reachable",
      };
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  // register
  const registerStudent = async ({
    name,
    email,
    phone,
    password,
  }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.message || "Registration failed",
        };
      }

      return { ok: true, message: data.message };
    } catch (error) {
      return {
        ok: false,
        error: "Server error",
      };
    }
  };

  // OTP
  const verifyOtpCode = async ({ email, otp }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      return response.ok
        ? { ok: true, message: data.message }
        : { ok: false, error: data.message };
    } catch (error) {
      return {
        ok: false,
        error: "OTP server error",
      };
    }
  };

  // profile update
  const updateProfile = async (updates) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token)
      return { ok: false, error: "No token found" };

    try {
      const response = await fetch(
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

      const data = await response.json();

      if (response.ok && data.user) {
        const mappedUser = mapUserToFrontend(data.user);
        setCurrentUser(mappedUser);
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify(mappedUser)
        );
        return { ok: true, user: mappedUser };
      }

      return {
        ok: false,
        error: data.message,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Server error",
      };
    }
  };

  const accountExists = (email) =>
    accounts.some(
      (u) =>
        u.email.toLowerCase() ===
        email.toLowerCase()
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
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};