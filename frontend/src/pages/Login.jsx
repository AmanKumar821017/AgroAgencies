import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      saveLogin(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat hua");
    }
  };

  const input = "w-full rounded border p-2";

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 p-4">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && <p className="text-red-600">{error}</p>}
      <input type="email" placeholder="Email" className={input}
        onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Password" className={input}
        onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <button className="w-full rounded bg-green-700 p-2 text-white">Login</button>
    </form>
  );
}