import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const DeliveryContext = createContext(null);
export const useDelivery = () => useContext(DeliveryContext);

export function DeliveryProvider({ children }) {
  const { user } = useAuth();
  const [pincode, setPincodeState] = useState(() => {
    try { return localStorage.getItem("deliveryPin") || ""; } catch { return ""; }
  });
  const [place, setPlace] = useState(null); // { district, state }

  const setPincode = (p) => {
    setPincodeState(p);
    try {
      if (p) localStorage.setItem("deliveryPin", p);
      else localStorage.removeItem("deliveryPin");
    } catch {}
  };

  // Pincode nahi hai to profile ki location se bharo
  useEffect(() => {
    if (pincode || !user || user.role === "farmer") return;
    api.get("/profile/location")
      .then(({ data }) => { if (data.place?.pincode) setPincode(data.place.pincode); })
      .catch(() => {});
  }, [user]);

  // 6 digit hote hi zila / rajya pata karo
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) { setPlace(null); return; }
    let live = true;
    api.get(`/location/pincode/${pincode}`)
      .then(({ data }) => live && setPlace({ district: data.district, state: data.state }))
      .catch(() => live && setPlace(null));
    return () => { live = false; };
  }, [pincode]);

  return (
    <DeliveryContext.Provider value={{ pincode, setPincode, place }}>
      {children}
    </DeliveryContext.Provider>
  );
}