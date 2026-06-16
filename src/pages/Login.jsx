import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "https://the-veltrixx-backend.onrender.com/api/auth";

function Login({ setUser }) {
  const navigate = useNavigate();
  const { token } = useParams();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleAuth = async () => {
    if (!form.email || !form.password || (isRegister && !form.name)) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isRegister ? "/register" : "/login";

      const payload = isRegister
        ? {
            name: form.name,
            email: form.email,
            password: form.password,
          }
        : {
            email: form.email,
            password: form.password,
          };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Something went wrong");
        return;
      }

      localStorage.setItem("veltrixx_user", JSON.stringify(data.user));
      localStorage.setItem("veltrixx_token", data.token);

      setUser(data.user);

      alert(isRegister ? "Register successful" : "Login successful");

      navigate("/");
    } catch (error) {
      alert("Backend not connected. Please check server.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      alert("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setResetLink("");

      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Could not generate reset link");
        return;
      }

      setResetLink(data.resetUrl || "");
      alert("Reset link generated successfully");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.newPassword || !form.confirmPassword) {
      alert("Please fill both password fields");
      return;
    }

    if (form.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      alert("Password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/reset-password/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Password reset failed");
        return;
      }

      localStorage.setItem("veltrixx_user", JSON.stringify(data.user));
      localStorage.setItem("veltrixx_token", data.token);

      setUser(data.user);

      alert("Password reset successful. You are logged in.");

      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <div className="authPage">
        <div className="authBox premiumForgotBox">
          <Link to="/" className="backLink">
            ← Back to shop
          </Link>

          <h1>Create New Password</h1>

          <p className="authSubText">
            Enter your new password below. After reset, your account will login
            automatically.
          </p>

          <input
            type="password"
            placeholder="New password"
            value={form.newPassword}
            onChange={(e) =>
              setForm({
                ...form,
                newPassword: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword: e.target.value,
              })
            }
          />

          <button onClick={handleResetPassword} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            className="switchAuthBtn"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="authPage">
        <div className="authBox premiumForgotBox">
          <Link to="/" className="backLink">
            ← Back to shop
          </Link>

          <h1>Forgot Password?</h1>

          <p className="authSubText">
            Enter your registered email address. We will generate a secure reset
            link for your account.
          </p>

          <input
            type="email"
            placeholder="Enter registered email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <button onClick={handleForgotPassword} disabled={loading}>
            {loading ? "Generating..." : "Get Reset Link"}
          </button>

          {resetLink && (
            <div className="resetLinkBox">
              <p>Your reset link is ready:</p>

              <Link to={resetLink.replace(window.location.origin, "")}>
                Open Reset Password Page
              </Link>

              <small>
                This link will expire in 15 minutes. Use it to create a new
                password.
              </small>
            </div>
          )}

          <button
            type="button"
            className="switchAuthBtn"
            onClick={() => {
              setIsForgotPassword(false);
              setResetLink("");
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="authPage">
      <div className="authBox">
        <Link to="/" className="backLink">
          ← Back to shop
        </Link>

        <h1>{isRegister ? "Create Account" : "Login"}</h1>

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        {!isRegister && (
          <button
            type="button"
            className="forgotPasswordBtn"
            onClick={() => setIsForgotPassword(true)}
          >
            Forgot Password?
          </button>
        )}

        <button onClick={handleAuth} disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <button
          type="button"
          className="switchAuthBtn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have an account? Login"
            : "New customer? Create account"}
        </button>
      </div>
    </div>
  );
}

export default Login;