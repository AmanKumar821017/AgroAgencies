import { useEffect, useState } from "react";
import api from "../api";

// onChange({ pincode, area, village }) deta hai, ya null jab pincode abhi poora/sahi nahi
export default function LocationPicker({ value, onChange, showVillage = true }) {
  const [pin, setPin] = useState(value?.pincode || "");
  const [info, setInfo] = useState(null); // { state, district, areas }
  const [area, setArea] = useState(value?.area || "");
  const [village, setVillage] = useState(value?.village || "");
  const [status, setStatus] = useState(""); // "" | "loading" | "notfound"

  useEffect(() => {
    if (pin.length !== 6) { setInfo(null); setStatus(""); return; }
    let live = true;
    setStatus("loading");
    api.get(`/location/pincode/${pin}`)
      .then(({ data }) => {
        if (!live) return;
        setInfo(data);
        setStatus("");
        setArea((a) => (data.areas.includes(a) ? a : data.areas[0] || ""));
      })
      .catch(() => {
        if (!live) return;
        setInfo(null);
        setStatus("notfound");
      });
    return () => { live = false; };
  }, [pin]);

  useEffect(() => {
    onChange(info ? { pincode: pin, area, village: village.trim() } : null);
  }, [info, pin, area, village]);

  const input = "w-full rounded-lg border p-2 text-sm outline-none focus:border-green-600";

  return (
    <div className="space-y-2">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Pincode</label>
        <input
          value={pin}
          inputMode="numeric"
          placeholder="6 digit pincode, jaise 800001"
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={input}
        />
        {status === "loading" && <p className="mt-1 text-xs text-gray-500">Dhoondh rahe hain...</p>}
        {status === "notfound" && <p className="mt-1 text-xs text-red-600">Ye pincode nahi mila, dobara check karo.</p>}
      </div>

      {info && (
        <>
          <div className="rounded-lg bg-green-50 p-2 text-sm text-green-800">
            📍 {info.district}, {info.state}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Area / post office</label>
            <select value={area} onChange={(e) => setArea(e.target.value)} className={input}>
              {info.areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {showVillage && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Gaon ka naam (optional)</label>
              <input value={village} maxLength={60} onChange={(e) => setVillage(e.target.value)}
                placeholder="Jaise: Rampur" className={input} />
            </div>
          )}
        </>
      )}
    </div>
  );
}