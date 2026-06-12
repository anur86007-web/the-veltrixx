import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://the-veltrixx-backend.onrender.com/api/auth";

function Login({ setUser }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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

        <button onClick={handleAuth} disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
            ? "Register"
            : "Login"}
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