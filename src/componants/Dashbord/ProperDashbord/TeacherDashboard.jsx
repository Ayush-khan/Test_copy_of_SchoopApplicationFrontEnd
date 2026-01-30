import { useEffect, useState } from "react";
import Card from "../../common/Card.jsx";
import TimeTableForTeacherDashbord from "../TimeTableForTeacherDashbord.jsx";
import TodoListandRemainders from "../TodoListandRemainders.jsx";
import ClassWiseAcademicPerformance from "../ClassWiseAcademicPerformance.jsx";
import HouseStudentChart from "../Charts/HouseStudentChart.jsx";

const TeacherDashboard = ({ regId }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [cards, setCards] = useState({});

    useEffect(() => {
        const fetchTeacherData = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) return;
            const res = await axios.get(`${API_URL}/api/teachers/${regId}/dashboard/summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCards(res.data.data);
        };
        fetchTeacherData();
    }, [regId]);

    return (
        <div>
            <div className="cards-grid">
                <Card title="Homework" value={cards.homeworkCard?.countOfHomeworksDueToday || 0} />
                <Card title="Defaulter" value={cards.defaulterCount?.totalNumberOfDefaulters || 0} />
                <Card title="Birthday" value={cards.birthDayCard?.countOfBirthdaysToday || 0} />
            </div>
            <TimeTableForTeacherDashbord />
            <TodoListandRemainders />
            <ClassWiseAcademicPerformance />
            <HouseStudentChart />
        </div>
    );
};

export default TeacherDashboard;
