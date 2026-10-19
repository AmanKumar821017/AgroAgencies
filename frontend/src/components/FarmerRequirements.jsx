import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function FarmerRequirements() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [form, setForm] = useState({ pricePerKg: "", message: "", phone: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/requirements/open");
      setList(Array.isArray(data) ? data : []);
    } catch {
      setError("Requirements load nahi hui");
    }
  };

  useEffect(() => { load(); }, []);

  const openReply = (r) => {
    setReplyId(r._id);
    setError("");
    setMsg("");
    setForm({
      pricePerKg: r.myResponse?.pricePerKg ?? "",
      message: r.myResponse?.message ?? "",
      phone: r.myResponse?.phone || user?.phone || "",
    });
  };

  const send = async (e, id) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const { data } = await api.post(`/requirements/${id}/respond`, form);
      setMsg(data.message + " ✅");
      setReplyId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Jawab nahi ja paya");
    } finally {
      setSending(false);
    }
  };

  const shown = list.filter((r) =>
    `${r.cropName} ${r.location}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  const input = "w-full rounded-lg border p-2 text-sm outline-none focus:border-green-600";

  return (
    <div>
      <h2 className="mb-1 text-lg font-bold">
        Businessman ki requirements <span className="text-sm font-normal text-gray-500">({list.length})</span>
      </h2>
      <p className="mb-3 text-xs text-gray-500">Bulk mein bechne ka mauka. Jo aap de sakte ho, usme jawab do.</p>

      <input value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Crop ya location se dhoondho" className={`${input} mb-3`} />

      {msg && <p className="mb-3 rounded-lg bg-green-50 p-2 text-sm text-green-700">{msg}</p>}
      {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}

      {shown.length === 0 && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center">
          <div className="text-4xl">📭</div>
          <p className="mt-2 text-sm text-gray-600">
            {list.length === 0 ? "Abhi koi requirement nahi aayi." : "Is search mein kuch nahi mila."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {shown.map((r) => (
          <div key={r._id} className="rounded-xl border bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold">{r.cropName} • {r.quantity} kg</p>
                <p className="text-lg font-extrabold text-green-700">
                  ₹{r.pricePerKg}<span className="text-xs font-normal text-gray-500">/kg tak</span>
                </p>
              </div>
              {r.myResponse && (
                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Aapne jawab diya ✓
                </span>
              )}
            </div>

            <div className="mt-1 space-y-0.5 text-sm text-gray-700">
              <p>📍 Delivery: {r.location}</p>
              {r.neededBy && <p>📅 Kab tak chahiye: {fmt(r.neededBy)}</p>}
              <p>🏢 Businessman: {r.businessman?.name}</p>
              {r.details && <p className="rounded bg-gray-50 p-2 text-gray-600">{r.details}</p>}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${r.phone}`}
                className="rounded-lg border border-green-700 px-4 py-1.5 text-sm font-semibold text-green-700">
                📞 Call karo • {r.phone}
              </a>
              {replyId !== r._id && (
                <button onClick={() => openReply(r)}
                  className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-semibold text-white">
                  {r.myResponse ? "Jawab badlo" : "Main de sakta hoon"}
                </button>
              )}
            </div>

            {replyId === r._id && (
              <form onSubmit={(e) => send(e, r._id)} className="mt-3 grid gap-2 border-t pt-3">
                <input type="number" min="0" value={form.pricePerKg}
                  onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                  placeholder="Aapka rate (₹/kg), optional" className={input} />
                <textarea rows={2} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Kitna de sakte ho, kab tak, quality (optional)" className={input} />
                <input value={form.phone} required inputMode="numeric" pattern="[0-9]{10}"
                  title="10 digit phone number"
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="Aapka phone (10 digit)" className={input} />
                <div className="flex gap-2">
                  <button disabled={sending}
                    className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                    {sending ? "Bhej rahe hain..." : "Businessman ko bhejo"}
                  </button>
                  <button type="button" onClick={() => setReplyId(null)} className="rounded-lg border px-4 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}