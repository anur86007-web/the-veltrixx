import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://the-veltrixx-backend.onrender.com/api/auth";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
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

  const handleSendOtp = async () => {
    if (!form.email) {
      alert("Please enter your registered email");
      return;
    }

    try {
      setLoading(true);

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
        alert(data.message || "Could not send OTP");
        return;
      }

      alert("OTP sent to your email");
      setForgotStep("otp");
    } catch (error) {
      console.log(error);
      alert("Something went wrong while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!form.email || !form.otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("OTP verified successfully");
      setForgotStep("password");
    } catch (error) {
      console.log(error);
      alert("OTP verification failed");
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

      const res = await fetch(`${API_URL}/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
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
      alert("Something went wrong while resetting password");
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setIsForgotPassword(false);
    setForgotStep("email");
    setForm({
      name: "",
      email: "",
      password: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  if (isForgotPassword) {
    return (
      <div className="authPage">
        <div className="authBox premiumForgotBox">
          <Link to="/" className="backLink">
            ← Back to shop
          </Link>

          {forgotStep === "email" && (
            <>
              <h1>Forgot Password?</h1>

              <p className="authSubText">
                Enter your registered email address. We will send an OTP to your
                email.
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

              <button onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {forgotStep === "otp" && (
            <>
              <h1>Verify OTP</h1>

              <p className="authSubText">
                We sent a 6-digit OTP to your registered email.
              </p>

              <input
                type="text"
                placeholder="Enter OTP"
                maxLength="6"
                value={form.otp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    otp: e.target.value,
                  })
                }
              />

              <button onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="switchAuthBtn"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            </>
          )}

          {forgotStep === "password" && (
            <>
              <h1>Create New Password</h1>

              <p className="authSubText">
                OTP verified. Now create your new password.
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
            </>
          )}

          <button
            type="button"
            className="switchAuthBtn"
            onClick={backToLogin}
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
            onClick={() => {
              setIsForgotPassword(true);
              setForgotStep("email");
            }}
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