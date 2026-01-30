useSessionData import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const useSessionData = () => {
    const [roleId, setRoleId] = useState(null);
    const [regId, setRegId] = useState(null);
    const [sortName, setSortName] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            const token = localStorage.getItem("authToken");
            if (!token) {
                toast.error("Authentication token not found. Please login again");
                navigate("/");
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/api/sessionData`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRoleId(response?.data?.user?.role_id);
                setRegId(response?.data?.user?.reg_id);
                setSortName(response?.data?.custom_claims?.short_name);
            } catch (err) {
                console.error("Error fetching session:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, []);

    return { roleId, regId, sortName, loading };
};

export default useSessionData;
