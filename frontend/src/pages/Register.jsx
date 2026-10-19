import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "customer",
  });
  const [error, setError] = useState("");
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      saveLogin(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat hua");
    }
  };

  const input = "w-full rounded border p-2";

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-3 p-4">
      <h1 className="text-2xl font-bold">Register</h1>
      {error && <p className="text-red-600">{error}</p>}
      <input name="name" placeholder="Naam" className={input} onChange={change} required />
      <input name="email" type="email" placeholder="Email" className={input} onChange={change} required />
      <input name="phone" placeholder="Phone" className={input} onChange={change} />
      <input name="password" type="password" placeholder="Password" className={input} onChange={change} required />
      <select name="role" className={input} onChange={change} value={form.role}>
        <option value="customer">Customer</option>
        <option value="businessman">Businessman</option>
        <option value="farmer">Farmer</option>
      </select>
      <button className="w-full rounded bg-green-700 p-2 text-white">Register</button>
    </form>
  );
}