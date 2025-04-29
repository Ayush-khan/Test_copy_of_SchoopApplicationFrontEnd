// secondtryimport { useEffect, useState } from "react";
import axios from "axios";
import { IoIosArrowForward } from "react-icons/io";
// import { RxCross1, RxCrosshair1 } from "react-icons/rx";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Layouts/NavBar";
import { useState, useEffect } from "react";
function StaffBirthdayTabList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [staffBirthday, setStaffBirthday] = useState([]);
  const [studentBirthday, setStudentBirthday] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("student");

  // useEffect(() => {
  //   const fetchStaffBirthday = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");

  //       if (!token) {
  //         throw new Error("No authentication token or academic year found");
  //       }

  //       const response = await axios.get(`${API_URL}/api/staffbirthdaylist`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });
  //       console.log("resposne of the birthday list is", response);
  //       // Ensure the data is an array
  //       if (response.data && Array.isArray(response.data.staffBirthday)) {
  //         setStaffBirthday(response.data.staffBirthday);
  //       } else {
  //         throw new Error("Unexpected response data format");
  //       }
  //       // setStaffBirthday(response.data);
  //     } catch (error) {
  //       setError(error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchStaffBirthday();
  // }, []);
  useEffect(() => {
    fetchBirthdayList();
  }, []);
  const fetchBirthdayList = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/staffbirthdaylist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Birthday list response:", response.data);

      // Destructure API response
      const { staffBirthday, studentBirthday, studentcount, teachercount } =
        response.data;

      // Set individual states
      setStaffBirthday(Array.isArray(staffBirthday) ? staffBirthday : []);
      setStudentBirthday(Array.isArray(studentBirthday) ? studentBirthday : []);
      setStudentCount(studentcount || 0);
      setTeacherCount(teachercount || 0);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state

    //  // Call handleSearch only if the tab is "Manage"
    //  if (tab === "Students") {
    //    fetchBirthdayList();
    //  }
  };

  // return (
  //   <>

  //     <div className="container mt-4 ">
  //       <div className="  card mx-auto lg:w-[90%]  shadow-lg ">
  //         {/* <div className="card mx-auto w-3/4"> */}
  //         <div className="card-header flex justify-between items-center">
  //           <h5 className="text-gray-700 mt-1  text-md lg:text-lg">
  //             {/* Staff Birthday List */}
  //             Today's Birthday List
  //           </h5>

  //           <RxCross1
  //             className="float-end relative  right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
  //             onClick={() => {
  //               navigate("/dashboard");
  //             }}
  //           />
  //         </div>
  //         <div
  //           className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
  //           style={{
  //             backgroundColor: "#C03078",
  //           }}
  //         ></div>

  //         <div className="card-body w-full">
  //           <div className=" h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden ">
  //             <div className="bg-white rounded-lg  shadow-xs ">
  //               <table className="min-w-full leading-normal table-auto">
  //                 <thead>
  //                   <tr className="bg-gray-100">
  //                     <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
  //                       S.No
  //                     </th>
  //                     <th className="text-center px-2  lg:px-2 py-2   border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
  //                       Student's Name
  //                     </th>
  //                     <th className="sm:px-0.5 lg:px-2 py-2 text-center border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
  //                       Class
  //                     </th>
  //                     <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
  //                       Mobile
  //                     </th>
  //                     <th className="px-2  lg:px-3 lg:text-start py-2 border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
  //                       Email
  //                     </th>
  //                   </tr>
  //                 </thead>
  //                 <tbody>
  //                   {loading ? (
  //                     <div className=" absolute left-[4%] w-[100%]  text-center flex justify-center items-center mt-14">
  //                       <div className=" text-center text-xl text-blue-700">
  //                         Please wait while data is loading...
  //                       </div>
  //                     </div>
  //                   ) : staffBirthday.length ? (
  //                     staffBirthday.map((staff, index) => (
  //                       <tr
  //                         key={staff?.teacher_id}
  //                         className={`${
  //                           index % 2 === 0 ? "bg-white" : "bg-gray-100"
  //                         } hover:bg-gray-50  `}
  //                       >
  //                         <td className=" sm:px-0.5 text-center lg:px-1   border  border-gray-950   text-sm">
  //                           <p className="text-gray-900 whitespace-no-wrap text-center relative top-2 ">
  //                             {index + 1}
  //                           </p>
  //                         </td>
  //                         <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
  //                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
  //                             {staff?.name}
  //                           </p>
  //                         </td>
  //                         <td className="sm:px-0.5  lg:px-3 py-2 text-center border border-gray-950  text-sm">
  //                           <p className="text-gray-900 whitespace-no-wrap">
  //                             {staff?.classname} {staff?.sectionname}
  //                           </p>
  //                         </td>
  //                         <td className="px-2 text-center lg:px-3  border border-gray-950  text-sm">
  //                           <p className="text-gray-900 whitespace-no-wrap relative top-2">
  //                             {staff?.phone}
  //                           </p>
  //                         </td>
  //                         <td
  //                           className="text-start sm:text-start px-2 lg:px-3  border border-gray-950 text-sm  "
  //                           style={{ textAlign: "middle" }}
  //                         >
  //                           <p className="text-gray-900 whitespace-no-wrap relative top-2 ">
  //                             {staff?.email}
  //                           </p>
  //                         </td>
  //                       </tr>
  //                     ))
  //                   ) : (
  //                     <div className=" absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
  //                       <div className=" text-center text-xl text-red-700">
  //                         Oops! No data found..
  //                       </div>
  //                     </div>
  //                   )}
  //                 </tbody>
  //               </table>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     {/* </div> */}
  //   </>
  // );
  return (
    <>
      <div className="md:mx-auto md:w-[70%] p-4 bg-white mt-4 ">
        <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
          Today's Birthday List
        </h3>

        <div
          className="relative mb-8 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        {/* Tab Navigation */}
        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row  -top-4">
          {/* Tab Navigation */}
          {["Students Birthday", "Staff Birthday"].map((tab) => (
            <li
              key={tab}
              className={`md:-ml-7 shadow-md ${
                activeTab === tab ? "text-blue-500 font-bold" : ""
              }`}
            >
              <button
                onClick={() => handleTabChange(tab)}
                className="px-2 md:px-4 py-1 hover:bg-gray-200 text-[1em] md:text-sm text-nowrap"
              >
                {tab.replace(/([A-Z])/g, " $1")}
              </button>
            </li>
          ))}
        </ul>

        {/* Tab Content */}
        <div className="bg-white rounded-md -mt-5">
          {loading ? (
            <div className="text-center py-10 text-blue-700">
              Please wait while data is loading...
            </div>
          ) : activeTab === "Students Birthday" ? (
            <>
              <table className="min-w-full leading-normal table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className=" px-0.5 w-full md:w-[8%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      S.No
                    </th>
                    <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Student's name
                    </th>
                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Class
                    </th>
                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Mobile
                    </th>
                    <th className="px-2  py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentBirthday.length > 0 ? (
                    studentBirthday.map((student, index) => (
                      <tr
                        key={student.student_id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } hover:bg-gray-50  `}
                      >
                        <td className=" sm:px-0.5 text-center lg:px-1   border  border-gray-950   text-sm">
                          <p className="text-gray-900 whitespace-no-wrap text-center relative top-2 ">
                            {index + 1}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {`${student.first_name || ""} ${
                              student.mid_name || ""
                            } ${student.last_name || ""}`.trim()}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {" "}
                            {student.classname} {student.sectionname}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {" "}
                            {student.guardian_mobile ||
                              student.emergency_contact ||
                              " "}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {student.email || " "}
                          </p>
                        </td>
                        <td className="text-start border border-gray-950 text-sm"></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-xl py-5 text-red-700"
                      >
                        Oops! No student birthdays today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>{" "}
              {studentBirthday.length > 0 ? (
                <div className="text-blue-500 relative top-3 text-[1.1em] font-medium text-center w-full">
                  Total Students Birthday: {studentCount}
                </div>
              ) : (
                " "
              )}
            </>
          ) : (
            <>
              {" "}
              <table className="min-w-full leading-normal table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-1 w-full md:w-[8%] mx-auto py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      S.No
                    </th>
                    <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Staff name
                    </th>

                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Mobile
                    </th>
                    <th className="px-2 py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffBirthday.length > 0 ? (
                    staffBirthday.map((staff, index) => (
                      <tr
                        key={staff.teacher_id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        } hover:bg-gray-50  `}
                      >
                        <td className=" sm:px-0.5 text-center lg:px-1   border  border-gray-950   text-sm">
                          <p className="text-gray-900 whitespace-no-wrap text-center relative top-2 ">
                            {index + 1}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {staff?.name || " "}
                          </p>
                        </td>

                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {staff?.phone || " "}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {staff?.email || " "}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-xl py-5 text-red-700"
                      >
                        Oops! No staff birthdays today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {staffBirthday.length > 0 ? (
                <div className="text-blue-500 relative top-3 text-[1.1em] font-medium text-center w-full">
                  Total Staff Birthday: {teacherCount}
                </div>
              ) : (
                ""
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default StaffBirthdayTabList;
