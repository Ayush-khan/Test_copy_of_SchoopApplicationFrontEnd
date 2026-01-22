import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

// The is the divisionlist module
function DefaulterStudentList() {
  const API_URL = import.meta.env.VITE_API_URL; // URL for host
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const [newSectionName, setNewSectionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [roleId, setRoleId] = useState("");

  const previousPageRef = useRef(0);
  const prevSearchTermRef = useRef("");

  const pageSize = 10;

  const fetchDefaulterList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        `${API_URL}/api/teachers/class-teacher/defaulter-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const raw = response.data;

      const actualData = raw?.data?.data || raw?.data || raw?.defaulters || raw;

      console.log("ACTUAL DATA FOUND:", actualData);

      let studentsList = [];

      if (actualData?.students?.length) {
        studentsList = actualData.students.map((student) => ({
          ...student,
          class_name: actualData.class_name,
          section_name: actualData.section_name,
        }));
      }

      setSections(studentsList);
      console.log("defaulter list", studentsList);

      //   setPageCount(Math.ceil(studentsList.length / pageSize));
    } catch (error) {
      // If backend sent a response
      if (error.response?.data) {
        const { status, message } = error.response.data;

        if (status === false) {
          toast.error(message); // "No data found for this teacher"
          return;
        }
      }

      // Fallback
      toast.error(error.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      // Fetch session data
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoleId(sessionResponse?.data?.user.role_id); // Store role_id
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchDefaulterList();
    fetchDataRoleId();
  }, []);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (trimmedSearch !== "" && prevSearchTermRef.current === "") {
      previousPageRef.current = currentPage;
      setCurrentPage(0);
    }

    if (trimmedSearch === "" && prevSearchTermRef.current !== "") {
      setCurrentPage(previousPageRef.current);
    }

    prevSearchTermRef.current = trimmedSearch;
  }, [searchTerm]);

  //   const filteredSections = sections.filter((leave) => {
  //     const searchLower = searchTerm.trim().toLowerCase();
  //     return leave.name.toLowerCase().includes(searchLower); // Filter by name
  //   });
  const filteredSections = sections.filter((leave) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const fullName = `${leave.first_name || ""} ${leave.mid_name || ""} ${leave.last_name || ""
      }`.toLowerCase();

    return (
      leave.first_name.toLowerCase().includes(searchLower) || // filter by name
      leave.roll_no.toString().includes(searchLower) || // filter by roll number
      leave.pending_fee.toString().includes(searchLower) || // optional: filter by pending fee
      leave.installment.toString().includes(searchLower) ||
      fullName.includes(searchLower)
    );
  });

  // const groupedStudents = Object.values(
  //   filteredSections.reduce((acc, item) => {
  //     const key = item.roll_no;

  //     if (!acc[key]) {
  //       acc[key] = {
  //         roll_no: item.roll_no,
  //         name: item.name,
  //         class_name: item.class_name,
  //         section_name: item.section_name,
  //         installments: [],
  //       };
  //     }

  //     acc[key].installments.push({
  //       installment: item.installment,
  //       pending_fee: item.pending_fee,
  //     });

  //     return acc;
  //   }, {})
  // ).map((student) => ({
  //   ...student,
  //   installments: student.installments.sort(
  //     (a, b) => a.installment - b.installment
  //   ),
  // }));

  const groupedStudents = Object.values(
    filteredSections.reduce((acc, item) => {
      const key = item.roll_no;

      if (!acc[key]) {
        acc[key] = {
          roll_no: item.roll_no,
          first_name: item.first_name,
          mid_name: item.mid_name,
          last_name: item.last_name,
          class_name: item.class_name,
          section_name: item.section_name,
          installments: [],
        };
      }

      acc[key].installments.push({
        installment: item.installment,
        pending_fee: item.pending_fee,
      });

      return acc;
    }, {}),
  ).map((student) => ({
    ...student,
    installments: student.installments.sort(
      (a, b) => a.installment - b.installment,
    ),
  }));

  useEffect(() => {
    setPageCount(Math.ceil(groupedStudents.length / pageSize));
  }, [groupedStudents, pageSize]);

  const displayedSections = groupedStudents.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const camelCase = (str) =>
    str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  //   const handlePageClick = (data) => {
  //     setCurrentPage(data.selected);
  //   };

  //   const filteredSections = sections.filter((leave) => {
  //     const searchLower = searchTerm.trim().toLowerCase();
  //     return leave.name.toLowerCase().includes(searchLower); // Filter by name
  //   });

  //   const groupedStudents = Object.values(
  //     filteredSections.reduce((acc, item) => {
  //       const key = item.roll_no;

  //       if (!acc[key]) {
  //         acc[key] = {
  //           roll_no: item.roll_no,
  //           name: item.name,
  //           class_name: item.class_name,
  //           section_name: item.section_name,
  //           installments: [],
  //         };
  //       }

  //       acc[key].installments.push({
  //         installment: item.installment,
  //         pending_fee: item.pending_fee,
  //       });

  //       return acc;
  //     }, {})
  //   ).map((student) => ({
  //     ...student,
  //     installments: student.installments.sort(
  //       (a, b) => a.installment - b.installment
  //     ),
  //   }));

  //   useEffect(() => {
  //     setPageCount(Math.ceil(groupedStudents.length / pageSize));
  //     setCurrentPage(0); // Reset to first page if data changes
  //   }, [groupedStudents, pageSize]);

  //   const displayedSections = groupedStudents
  //     .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  //     .map((student, index) => ({
  //       ...student,
  //       globalIndex: currentPage * pageSize + index + 1,
  //     }));

  return (
    <>
      <ToastContainer />

      <div className="container mt-4">
        <div className="card mx-auto lg:w-[70%] shadow-lg">
          <div className="p-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
              Defaulter List
            </h3>{" "}
            <div className="box-border flex md:gap-x-2 justify-end md:h-10">
              <div className=" w-1/2 md:w-fit mr-1">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <RxCross1
                className="float-end relative right-2 top-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                onClick={() => {
                  navigate("/Dashboard");
                }}
              />
            </div>
          </div>
          <div
            className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <div className="card-body w-full">
            <div className="h-96 lg:h-96 w-full md:w-[80%] mx-auto  overflow-y-scroll lg:overflow-x-hidden ">
              <div className="bg-white  rounded-lg shadow-xs ">
                <table className="min-w-full leading-normal table-auto ">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-2 w-full md:w-[7%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Sr. No.
                      </th>
                      <th className="px-2 w-full md:w-[9%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Roll No.
                      </th>
                      <th className=" -px-2  w-full md:w-[25%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Student Name
                      </th>

                      <th className=" -px-2  w-full md:w-[10%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Installment
                      </th>
                      <th className=" -px-2  w-full md:w-[15%] text-center py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                        Pending Fees
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-10 text-blue-700 text-xl"
                        >
                          Please wait while data is loading...
                        </td>
                      </tr>
                    ) : displayedSections.length > 0 ? (
                      displayedSections.map((student, sIndex) => (
                        <React.Fragment key={student.roll_no}>
                          {student.installments.map((inst, iIndex) => (
                            <tr
                              key={`${student.roll_no}-${iIndex}`}
                            //   className={
                            //     iIndex % 2 === 0 ? "bg-white" : "bg-white"
                            //   }
                            >
                              {iIndex === 0 && (
                                <td
                                  rowSpan={student.installments.length}
                                  className="text-center border border-gray-950 text-sm font-semibold p-2"
                                >
                                  {currentPage * pageSize + sIndex + 1}{" "}
                                </td>
                              )}

                              {iIndex === 0 && (
                                <td
                                  rowSpan={student.installments.length}
                                  className="text-center border border-gray-950 text-sm font-semibold p-2"
                                >
                                  {student.roll_no}
                                </td>
                              )}

                              {iIndex === 0 && (
                                <td
                                  rowSpan={student.installments.length}
                                  className="text-center border border-gray-950 text-sm font-semibold p-2"
                                >
                                  {/* {camelCase(student.first_name)}{" "}
                                  {camelCase(student.mid_name)}{" "}
                                  {camelCase(student.last_name)} */}
                                  {camelCase(
                                    student.first_name
                                      ? `${student.first_name} ${student.mid_name || ""
                                      } ${student.last_name || ""}`
                                      : student.name,
                                  )}
                                </td>
                              )}

                              <td className="text-center border border-gray-950 text-sm p-2">
                                {inst.installment}
                              </td>

                              <td className="text-center border border-gray-950 text-sm font-bold text-red-700">
                                {inst.pending_fee}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-10 text-red-700 text-xl"
                        >
                          Oops! No data found..
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className=" flex justify-center pt-2 -mb-3">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                activeClassName={"active"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DefaulterStudentList;
