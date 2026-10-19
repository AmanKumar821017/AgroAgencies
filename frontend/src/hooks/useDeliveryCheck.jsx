import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const empty = { results: {}, dest: null, error: "", loading: false };

// ids: crop ids ki list, pincode: 6 digit
export default function useDeliveryCheck(ids, pincode) {
  const { user } = useAuth();
  const [state, setState] = useState(empty);
  const key = ids.join(",");

  useEffect(() => {
    if (!/^\d{6}$/.test(pincode) || ids.length === 0) { setState(empty); return; }
    let live = true;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api.post("/delivery/check", { pincode, cropIds: ids, role: user?.role })
      .then(({ data }) => live && setState({ results: data.results, dest: data.destination, error: "", loading: false }))
      .catch((e) => live && setState({ ...empty, error: e.response?.data?.message || "Check nahi ho paya" }));
    return () => { live = false; };
  }, [key, pincode, user?.role]);

  return state;
}