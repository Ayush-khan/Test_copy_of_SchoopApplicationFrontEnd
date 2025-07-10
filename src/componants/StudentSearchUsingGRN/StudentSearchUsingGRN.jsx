// desing code with page close effects
import { useState } from "react";
import {
  FaUser,
  FaCommentDots,
  FaCertificate,
  FaHeartbeat,
} from "react-icons/fa";
import PersonalProfile from "./PersonalProfile";
import RemarksObservation from "./RemarksObservation";
import ReportCardCertificates from "./ReportCardCertificates";
import HealthActivityRecord from "./HealthActivityRecord";
import { RxCross1 } from "react-icons/rx";
import { useNavigate, useLocation } from "react-router-dom";

export default function StudentSearchUsingGRN() {
  const [activeTab, setActiveTab] = useState("profile");
  const [closing, setClosing] = useState(false);
  const [contentClosing, setContentClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.studentData || {};

  const tabs = [
    {
      id: "profile",
      label: "Personal Profile",
      icon: <FaUser />,
      bgColor: "bg-pink-500",
    },
    {
      id: "remarks",
      label: "Remark & Observation",
      icon: <FaCommentDots />,
      bgColor: "bg-pink-500",
    },
    {
      id: "reportCard",
      label: "Report Card & Certificates",
      icon: <FaCertificate />,
      bgColor: "bg-gray-400",
    },
    {
      id: "health",
      label: "Health & Activity Record",
      icon: <FaHeartbeat />,
      bgColor: "bg-pink-500",
    },
  ];

  const handleTabClick = (tabId) => {
    if (tabId !== activeTab) {
      setContentClosing(true);
      setTimeout(() => {
        setActiveTab(tabId);
        setContentClosing(false);
      }, 400);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <PersonalProfile />;
      case "remarks":
        return <RemarksObservation />;
      case "reportCard":
        return <ReportCardCertificates />;
      case "health":
        return <HealthActivityRecord />;
      default:
        return <PersonalProfile />;
    }
  };

  return (
    <div
      className={`transition-all duration-500 ${
        closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
      } w-full md:W-[95%] mx-auto p-4`}
    >
      <div className="card p-3 rounded-md">
        <div
          className="relative w-full -top-6 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>
        <div className="flex bg-gray-100">
          {/* Left Side - Tabs */}
          <div className="w-[15%] bg-white shadow-lg border-r p-6 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="text-center item-center">
                <img
                  src={`${student?.student_image_url}`}
                  alt={`${student?.image_name}`}
                  className="w-24 h-24 mx-auto rounded-full border-4 border-pink-500"
                />
                <h2 className="text-sm font-semibold mt-3">
                  {student?.student_name} - {student?.get_class?.name} (
                  {student?.get_division?.name})
                </h2>
              </div>

              <div className="w-full text-sm flex flex-col gap-3">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-white transition-all duration-300 transform ${
                      activeTab === tab.id
                        ? "bg-blue-500 scale-105 shadow-lg"
                        : tab.bgColor
                    } hover:bg-blue-400`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div
            className={`w-[85%] bg-gray-50 
               p-1 shadow-md rounded-lg max-h-[calc(100vh-150px)] overflow-y-auto relative transition-all duration-500 ${
                 contentClosing ? "scale-90 opacity-0" : "scale-100 opacity-100"
               }`}
          >
            {/* <RxCross1
              className="absolute top-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100 rounded-full p-1"
              onClick={handleClose}
            /> */}
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
// Tab page not close with effect bs yahi code mai improment nahi hai abbki sab top hai

// import { useState } from "react";
// import {
//   FaUser,
//   FaCommentDots,
//   FaCertificate,
//   FaHeartbeat,
// } from "react-icons/fa";
// import PersonalProfile from "./PersonalProfile";
// import RemarksObservation from "./RemarksObservation";
// import ReportCardCertificates from "./ReportCardCertificates";
// import HealthActivityRecord from "./HealthActivityRecord";
// import { RxCross1 } from "react-icons/rx";
// import { useNavigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// export default function StudentSearchUsingGRN() {
//   const [activeTab, setActiveTab] = useState("profile");
//   const navigate = useNavigate();
//   const location = useLocation();
//   const student = location.state?.studentData || {};
//   console.log("response of the students is------>>>", student);
//   const tabs = [
//     {
//       id: "profile",
//       label: "Personal Profile",
//       icon: <FaUser />,
//       bgColor: "bg-pink-500",
//     },
//     {
//       id: "remarks",
//       label: "Remark & Observation",
//       icon: <FaCommentDots />,
//       bgColor: "bg-pink-500",
//     },
//     {
//       id: "reportCard",
//       label: "Report Card & Certificates",
//       icon: <FaCertificate />,
//       bgColor: "bg-gray-400",
//     },
//     {
//       id: "health",
//       label: "Health & Activity Record",
//       icon: <FaHeartbeat />,
//       bgColor: "bg-pink-500",
//     },
//   ];

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "profile":
//         return <PersonalProfile />;
//       case "remarks":
//         return <RemarksObservation />;
//       case "reportCard":
//         return <ReportCardCertificates />;
//       case "health":
//         return <HealthActivityRecord />;
//       default:
//         return <PersonalProfile />;
//     }
//   };

//   return (
//     <>
//       <div className="w-full md:W-[95%] mx-auto p-4">
//         <div className="card p-3 rounded-md">
//           {/* <div className="card-header mb-4 flex justify-between items-center">
//             <h5 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
//               Student Personal Profile
//             </h5>
//             <RxCross1
//               className="float-end relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
//               onClick={() => navigate("/dashboard")}
//             />
//           </div> */}
//           <div
//             className="relative w-full -top-6 h-1 mx-auto bg-red-700"
//             style={{ backgroundColor: "#C03078" }}
//           ></div>
//           <div className="flex  bg-gray-100 ">
//             {/* Left Side - Tabs */}
//             <div className="w-[15%] bg-white shadow-lg border-r p-6  rounded-lg">
//               <div className="flex flex-col items-center  gap-2">
//                 <div className="text-center item-center ">
//                   <img
//                     src={`${student?.student_image_url}`}
//                     alt={`${student?.image_name}`}
//                     className="w-24 h-24 mx-auto rounded-full border-4 border-pink-500"
//                   />
//                   <h2 className="text-sm font-semibold mt-2">
//                     {student?.student_name}- {student?.get_class?.name}
//                     {"("}
//                     {student?.get_division?.name}
//                     {")"}
//                     ASHWATI - 11(D - Commerce & Arts)
//                   </h2>
//                 </div>

//                 <div className="w-full text-sm flex flex-col gap-3">
//                   {tabs.map((tab) => (
//                     <button
//                       key={tab.id}
//                       className={`w-full flex items-center gap-2 p-2 rounded-lg text-white
//                                     transition-all duration-300
//                                     ${
//                                       activeTab === tab.id
//                                         ? "bg-blue-500 shadow-md"
//                                         : tab.bgColor
//                                     }
//                                     hover:bg-blue-400`}
//                       onClick={() => setActiveTab(tab.id)}
//                     >
//                       {tab.icon}
//                       {tab.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right Side - Content */}
//             <div className="w-[85%] bg-white p-4 shadow-md rounded-lg  max-h-[calc(100vh-150px)] overflow-y-auto">
//               {renderTabContent()}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
