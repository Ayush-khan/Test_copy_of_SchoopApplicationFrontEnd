import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../../common/Card.jsx";
import StudentsChart from "../Charts/StudentsChart.jsx";
import TableFeeCollect from "../TableFeeCollect.jsx";

const AdminDashboardProper = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [studentData, setStudentData] = useState({ total: 0, present: 0 });
    const [feeData, setFeeData] = useState({ pending: 0, collected: 0 });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;

            const [studentRes, feeRes] = await Promise.all([
                axios.get(`${API_URL}/api/studentss`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/feecollection`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            setStudentData({ total: studentRes.data.count, present: studentRes.data.present });
            setFeeData({ pending: feeRes.data["Pending Fees"], collected: feeRes.data["Collected Fees"] });
        };
        fetchData();
    }, []);

    return (
        <div className="dashboard">
            <div className="cards-grid">
                <Card title="Students" TotalValue={studentData.total} presentValue={studentData.present} />
                <Card title="Fees" value={feeData.collected} valuePendingFee={feeData.pending} />
            </div>
            <StudentsChart />
            <TableFeeCollect />
        </div>
    );
};

export default AdminDashboardProper;
