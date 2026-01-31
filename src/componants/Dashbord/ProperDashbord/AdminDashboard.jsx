

// import { Link } from "react-router-dom";
// import React, { Suspense } from "react";

// import { FaUsersLine, FaUserGroup } from "react-icons/fa6";
// import { HiCollection } from "react-icons/hi";
// import { IoTicket } from "react-icons/io5";
// import { FaBirthdayCake } from "react-icons/fa";

// import Card from "../../common/Card";
// import CardStuStaf from "../../common/CardStuStaf";
// import EventCard from "../EventCard";
// import NoticeBord from "../NoticeBord";
// import HouseStudentChart from "../Charts/HouseStudentChart";
// import TableFeeCollect from "../TableFeeCollect";

// const StudentsChart = React.lazy(() => import("../Charts/StudentsChart"));

// const AdminDashboard = ({ data, roleId, sortName }) => {
//   if (!data?.data) return null;
//   const api = data.data;

//   /* ================= DATA MAPPING ================= */
//   const student = {
//     total: api.student?.total ?? 0,
//     present: api.student?.present ?? 0,
//     notMarked: api.student?.attendanceNotMarked?.notMarked ?? 0,
//   };

//   const teachingStaff = {
//     total: api.teachingStaff?.total ?? 0,
//     present: api.teachingStaff?.count ?? 0,
//   };

//   const nonTeachingStaff = {
//     total: api.non_teachingStaff?.total ?? 0,
//     present: api.non_teachingStaff?.count ?? 0,
//   };

//   const fees = {
//     collected: api.fees_collection?.["Collected Fees"] ?? 0,
//     pending: api.fees_collection?.["Pending Fees"] ?? 0,
//   };

//   const ticket = api.ticket_count ?? 0;
//   const birthday = api.birthday_count ?? 0;

//   /* ================= ICON STYLE ================= */
//   const iconStyle = (color) => ({
//     color,
//     backgroundColor: "#fff",
//     padding: "10px",
//     borderRadius: "50%",
//   });

//   /* ================= CARDS LIST ================= */
//   const cards = [
//     {
//       key: "students",
//       link: "/studentAbsent",
//       component: (
//         <CardStuStaf
//           title="Students"
//           TotalValue={student.total}
//           presentValue={student.present}
//           badge={student.notMarked}
//           color="#4CAF50"
//           icon={<FaUsersLine style={iconStyle("#4CAF50")} />}
//         />
//       ),
//     },
//     {
//       key: "teaching",
//       link: sortName === "HSCS" ? "#" : "/teacherList",
//       component: (
//         <CardStuStaf
//           title="Teaching Staff"
//           TotalValue={teachingStaff.total}
//           presentValue={teachingStaff.present}
//           color="#2196F3"
//           icon={<FaUserGroup style={iconStyle("#2196F3")} />}
//         />
//       ),
//       disabled: sortName === "HSCS",
//     },
//     {
//       key: "nonTeaching",
//       link: sortName === "HSCS" ? "#" : "/nonTeachingStaff",
//       component: (
//         <CardStuStaf
//           title="Non-Teaching Staff"
//           TotalValue={nonTeachingStaff.total}
//           presentValue={nonTeachingStaff.present}
//           color="#9C27B0"
//           icon={<FaUserGroup style={iconStyle("#9C27B0")} />}
//         />
//       ),
//       disabled: sortName === "HSCS",
//     },
//     {
//       key: "fees",
//       link: "/feependinglist",
//       component: (
//         <Card
//           title="Fee Collection"
//           value={fees.collected}
//           valuePendingFee={fees.pending}
//           color="#FF5722"
//           icon={<HiCollection style={iconStyle("#FF5722")} />}
//         />
//       ),
//     },
//     {
//       key: "ticket",
//       link: "/ticketList",
//       component: (
//         <Card
//           title="Tickets"
//           value={ticket}
//           color="#FFC107"
//           icon={<IoTicket style={iconStyle("#FFC107")} />}
//         />
//       ),
//     },
//     {
//       key: "birthday",
//       link: "/staffbirthlist",
//       component: (
//         <Card
//           title="Birthdays"
//           value={birthday}
//           color="#03A9F4"
//           icon={<FaBirthdayCake style={iconStyle("#03A9F4")} />}
//         />
//       ),
//     },
//   ];

//   return (
//     <>
//       {/* ================= TOP CARDS ================= */}
//       <div className="flex flex-col lg:flex-row gap-4 p-6">
//         {/* CARDS GRID */}
//         <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {cards.map((c) => (
//             <Link
//               key={c.key}
//               to={c.link}
//               className="no-underline"
//               style={c.disabled ? { pointerEvents: "none" } : {}}
//             >
//               {c.component}
//             </Link>
//           ))}
//         </div>

//         {/* EVENT CARD */}
//         <div className="w-full lg:w-1/3 h-3/4 border-4 border-red-900 bg-slate-100 rounded-lg shadow-md overflow-hidden">
//           <div className="h-full overflow-y-auto">
//             <EventCard />
//           </div>
//         </div>
//       </div>

//       {/* ================= CHART + NOTICE ================= */}
//       <div className="flex flex-col-reverse lg:flex-row gap-4 px-4">
//         <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
//           <Suspense fallback={<div className="p-6">Loading chart...</div>}>
//             <StudentsChart />
//           </Suspense>
//         </div>

//         <div className="w-full lg:w-1/3 bg-slate-50 rounded-lg shadow-md">
//           <NoticeBord />
//         </div>
//       </div>

//       {/* ================= EXTRA TABLE + HOUSE CHART ================= */}
//       <div className="flex flex-col-reverse lg:flex-row gap-4 px-4 mt-6">
//         <div className="w-full lg:w-1/3 bg-slate-50 rounded-lg shadow-md">
//           <TableFeeCollect />
//         </div>

//         <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
//           <HouseStudentChart />
//         </div>
//       </div>
//     </>
//   );
// };

// export default AdminDashboard;
import { Link } from "react-router-dom";
import React, { Suspense, useLayoutEffect, useState } from "react";

import { FaUsersLine, FaUserGroup } from "react-icons/fa6";
import { HiCollection } from "react-icons/hi";
import { IoTicket } from "react-icons/io5";
import { FaBirthdayCake } from "react-icons/fa";

import Card from "../../common/Card";
import CardStuStaf from "../../common/CardStuStaf";
import EventCard from "../EventCard";
import NoticeBord from "../NoticeBord";
import HouseStudentChart from "../Charts/HouseStudentChart";
import TableFeeCollect from "../TableFeeCollect";

const StudentsChart = React.lazy(() => import("../Charts/StudentsChart"));

const AdminDashboard = ({ data, roleId, sortName }) => {
  const [ready, setReady] = useState(false);

  if (!data?.data) return null;
  const api = data.data;

  /* ========= UX FIX =========
     useLayoutEffect runs BEFORE browser paint
     so cards become visible in ONE frame
  */
  useLayoutEffect(() => {
    setReady(true);
  }, []);

  /* ================= DATA MAPPING ================= */
  const student = {
    total: api.student?.total ?? 0,
    present: api.student?.present ?? 0,
    notMarked: api.student?.attendanceNotMarked?.notMarked ?? 0,
  };

  const teachingStaff = {
    total: api.teachingStaff?.total ?? 0,
    present: api.teachingStaff?.count ?? 0,
  };

  const nonTeachingStaff = {
    total: api.non_teachingStaff?.total ?? 0,
    present: api.non_teachingStaff?.count ?? 0,
  };

  const fees = {
    collected: api.fees_collection?.["Collected Fees"] ?? 0,
    pending: api.fees_collection?.["Pending Fees"] ?? 0,
  };

  const ticket = api.ticket_count ?? 0;
  const birthday = api.birthday_count ?? 0;

  /* ================= ICON STYLE ================= */
  const iconStyle = (color) => ({
    color,
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "50%",
  });

  /* ================= CARDS LIST ================= */
  const cards = [
    {
      key: "students",
      link: "/studentAbsent",
      component: (
        <CardStuStaf
          title="Students"
          TotalValue={student.total}
          presentValue={student.present}
          badge={student.notMarked}
          color="#4CAF50"
          icon={<FaUsersLine style={iconStyle("#4CAF50")} />}
        />
      ),
    },
    {
      key: "teaching",
      link: sortName === "HSCS" ? "#" : "/teacherList",
      disabled: sortName === "HSCS",
      component: (
        <CardStuStaf
          title="Teaching Staff"
          TotalValue={teachingStaff.total}
          presentValue={teachingStaff.present}
          color="#2196F3"
          icon={<FaUserGroup style={iconStyle("#2196F3")} />}
        />
      ),
    },
    {
      key: "nonTeaching",
      link: sortName === "HSCS" ? "#" : "/nonTeachingStaff",
      disabled: sortName === "HSCS",
      component: (
        <CardStuStaf
          title="Non-Teaching Staff"
          TotalValue={nonTeachingStaff.total}
          presentValue={nonTeachingStaff.present}
          color="#9C27B0"
          icon={<FaUserGroup style={iconStyle("#9C27B0")} />}
        />
      ),
    },
    {
      key: "fees",
      link: "/feependinglist",
      component: (
        <Card
          title="Fee Collection"
          value={fees.collected}
          valuePendingFee={fees.pending}
          color="#FF5722"
          icon={<HiCollection style={iconStyle("#FF5722")} />}
        />
      ),
    },
    {
      key: "ticket",
      link: "/ticketList",
      component: (
        <Card
          title="Tickets"
          value={ticket}
          color="#FFC107"
          icon={<IoTicket style={iconStyle("#FFC107")} />}
        />
      ),
    },
    {
      key: "birthday",
      link: "/staffbirthlist",
      component: (
        <Card
          title="Birthdays"
          value={birthday}
          color="#03A9F4"
          icon={<FaBirthdayCake style={iconStyle("#03A9F4")} />}
        />
      ),
    },
  ];

  return (
    <>
      {/* ================= TOP SECTION ================= */}
      <div className="flex flex-col lg:flex-row gap-4 p-6">
        {/* CARDS GRID (UX FIX HERE) */}
        <div
          className={`w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
          ${ready ? "opacity-100" : "opacity-0"}`}
        >
          {cards.map((c) => (
            <Link
              key={c.key}
              to={c.link}
              className="no-underline"
              style={c.disabled ? { pointerEvents: "none" } : {}}
            >
              {c.component}
            </Link>
          ))}
        </div>

        {/* EVENT CARD */}
        <div className="w-full lg:w-1/3 h-64  overflow-y-auto  bg-slate-100 rounded-lg shadow-md overflow-hidden">
          <div className=" rounded-lg">
            <EventCard />
          </div>
        </div>
      </div>

      {/* ================= CHART + NOTICE ================= */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 px-4">
        <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
          <Suspense fallback={<div className="p-6">Loading chart...</div>}>
            <StudentsChart />
          </Suspense>
        </div>

        <div className="w-full lg:w-1/3 bg-slate-50 rounded-lg shadow-md">
          <NoticeBord />
        </div>
      </div>

      {/* ================= EXTRA ================= */}
      <div className="flex flex-col-reverse lg:flex-row gap-4 px-4 mt-6">
        <div className="w-full lg:w-1/3 bg-slate-50 rounded-lg shadow-md">
          <TableFeeCollect />
        </div>

        <div className="w-full lg:w-2/3 bg-slate-50 rounded-lg shadow-md">
          <HouseStudentChart />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
