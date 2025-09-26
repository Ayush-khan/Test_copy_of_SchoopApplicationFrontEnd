import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import bgImage from "../../../../../src/assets/HPC/SACS/STD 2 HPC COVER.jpg";
import AllAboutMe from "../../../../../src/assets/HPC/SACS/HPC_Cover/All about me_1.jpg";
import AboutMyself from "../../../../../src/assets/HPC/SACS/HPC_Cover/About myself_2.jpg";
import Language from "../../../../../src/assets/HPC/SACS/HPC_Cover/Language_3.jpg";
import MathEVS from "../../../../../src/assets/HPC/SACS/HPC_Cover/Math and EVS_4.jpg";
import PhysicalDomain from "../../../../../src/assets/HPC/SACS/HPC_Cover/Physical domain_5.jpg";
import Aesthetic from "../../../../../src/assets/HPC/SACS/HPC_Cover/Aesthetic domain_6.jpg";
import LearnerPeer from "../../../../../src/assets/HPC/SACS/HPC_Cover/learner feedback and peer feedback_7.jpg";
import TeacherParent from "../../../../../src/assets/HPC/SACS/HPC_Cover/Teacher observation Parents feed back_8.jpg";
import HpcRemark from "../../../../../src/assets/HPC/SACS/HPC_Cover/Class teachers remarks_9.jpg";
import BackCover from "../../../../../src/assets/HPC/SACS/HPC_Cover/BACK COVER_10.jpg";
import BeginnerImg from "../../../../../src/assets/HPC/SACS/images/Beginner - symbol seed.png";
import ProgressingImg from "../../../../../src/assets/HPC/SACS/images/Progressing - symbol plant.png";
import ProficientImg from "../../../../../src/assets/HPC/SACS/images/Proficient- symbol tree.png";

const HPCReportCard = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const { student, class_id, section_id } = location.state || {};
  const classID = student?.get_class?.class_id || null;
  const { id } = useParams();

  console.log("class....id", classID);
  console.log("Student data:", student);
  console.log("Class ID:", class_id);
  console.log("Section ID:", section_id);
  console.log("Student ID from URL:", id);

  const levelImages = {
    Beginner: BeginnerImg,
    Progressing: ProgressingImg,
    Proficient: ProficientImg,
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [studentNameWithClassId, setStudentNameWithClassId] = useState([]);

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [allstudent, setAllStudent] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [learner, setLearner] = useState([]);
  const [peerFeedback, setPeerFeedback] = useState([]);
  const [parentFeedback, setParentFeedback] = useState([]);
  const [classTeacher, setClassTeacher] = useState([]);

  const [subject, setSubject] = useState([]);

  const [loadingExams, setLoadingExams] = useState(false);

  const [loadingTermsData, setLoadingTermsData] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [academic, setAcademic] = useState("");

  const [roleId, setRoleId] = useState("");
  const [regId, setRegId] = useState("");

  useEffect(() => {
    fetchDataRoleId();
    fetchAllAboutMe();
    fetchSubjects();
    fetchLearnerFeedback();
    fetchPeerFeedback();
    fetchParentFeedback();
    fetchClassTeacherRemark();
  }, []);

  useEffect(() => {
    if (!roleId || !regId) return; // guard against empty
    fetchClasses(roleId, regId);
  }, [roleId, regId]);

  const fetchClasses = async (roleId, regId) => {
    const token = localStorage.getItem("authToken");
    setLoadingExams(true);

    try {
      if (roleId === "T") {
        const response = await axios.get(
          `${API_URL}/api/get_teacherclasseswithclassteacher?teacher_id=${regId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const mappedData = (response.data.data || [])
          .filter((item) => item.is_class_teacher === 1)
          .map((cls) => ({
            value: cls.class_id,
            class_id: cls.class_id,
            section_id: cls.section_id,
            classname: cls.classname,
            sectionname: cls.sectionname,
            label: `${cls.classname} ${cls.sectionname}`,
          }));

        setStudentNameWithClassId(mappedData || []);

        setStudentNameWithClassId(mappedData || []);
      } else {
        const response = await axios.get(`${API_URL}/api/g`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStudentNameWithClassId(response?.data || []);
      }
    } catch (error) {
      toast.error("Error fetching Classes");
      console.error("Error fetching Classes:", error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchAllAboutMe = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_allaboutmebystudentid?student_id=${id}&class_id=${classID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setData(response.data.data.allAboutMe);
      setAllStudent(response.data.data.student);
      setAttendance(response.data.data.attendance);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const fetchSubjects = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_domaindetailsbystudentid?student_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("student", response.data.data);
      setSubject(response.data.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const fetchLearnerFeedback = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_selfassessmentbystudentid?student_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("learner", response.data.data);
      setLearner(response.data.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const fetchPeerFeedback = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_peerfeedbackbystudentid?student_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("peer", response.data.data);
      setPeerFeedback(response.data.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const fetchParentFeedback = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_parentfeedbackbystudentid?student_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("parents", response.data.data);
      setParentFeedback(response.data.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const fetchClassTeacherRemark = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_URL}/api/get_classteacherremarkbystudentid?student_id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("classteacher", response.data.data);
      setClassTeacher(response.data.data);
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoadingTermsData(false);
    }
  };

  const fetchDataRoleId = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      return;
    }

    try {
      const sessionResponse = await axios.get(`${API_URL}/api/sessionData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role_id = sessionResponse.data.user.role_id;
      const reg_id = sessionResponse.data.user.reg_id;
      const academic_yr = sessionResponse.data.custom_claims.academic_year;

      setRoleId(role_id);
      setRegId(reg_id);
      setAcademic(academic_yr);

      console.log("roleIDis:", role_id);
      console.log("reg id:", reg_id);

      return { roleId, regId };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const toCamelCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pdfRef = useRef();

  // const handleDownloadPdf = async () => {
  //   const input = pdfRef.current;

  //   if (!input) {
  //     toast.error("No report content found to export.");
  //     return;
  //   }

  //   try {
  //     // Convert DOM → Canvas
  //     const canvas = await html2canvas(input, { scale: 2 });
  //     const imgData = canvas.toDataURL("image/png");

  //     // Create PDF (A4 portrait)
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();

  //     // Image size inside PDF
  //     const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = 0;

  //     // First page
  //     pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
  //     heightLeft -= pdfHeight;

  //     // Add extra pages if needed
  //     while (heightLeft > 0) {
  //       position = heightLeft - imgHeight;
  //       pdf.addPage();
  //       pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
  //       heightLeft -= pdfHeight;
  //     }

  //     pdf.save("student_portfolio.pdf");
  //   } catch (err) {
  //     console.error("Error generating PDF:", err);
  //     toast.error("Failed to generate PDF");
  //   }
  // };

  const handlePrint = () => {
    const printContent = pdfRef.current.innerHTML;
    const newWindow = window.open("", "", "width=800,height=600");
    newWindow.document.write(`
    <html>
      <head>
        <title>Student Portfolio</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .page-break {
            page-break-before: always;
          }

          .print-page {
            width: 1000px;
            aspect-ratio: 8 / 10;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            position: relative;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);
    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  const filteredSections = timetable.filter((section) => {
    const searchLower = searchTerm.toLowerCase();

    const regNo = section?.reg_no?.toLowerCase() || "";
    const admissionClass = section?.admission_class?.toLowerCase() || "";
    const studentName = section?.student_name.toLowerCase().trim() || "";

    const name = section?.name?.toLowerCase().trim() || "";

    return (
      regNo.includes(searchLower) ||
      admissionClass.includes(searchLower) ||
      studentName.includes(searchLower) ||
      name.includes(searchLower)
    );
  });

  const displayedSections = filteredSections.slice(currentPage * pageSize);
  console.log("display section", displayedSections);

  return (
    <>
      <div className={`transition-all duration-500 w-[70%] mx-auto p-4 `}>
        <ToastContainer />

        <div className="card rounded-md">
          <>
            <div className=" card-header mb-4 flex justify-between items-center ">
              <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                Report Card
              </h5>
              {/* <button
                onClick={handlePrint}
                // onClick={handleDownloadPdf}
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Download PDF
              </button> */}
              <RxCross1
                className="  relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                onClick={() => {
                  navigate("/dashboard");
                }}
              />
            </div>
            <div
              className=" relative w-[98%]   -top-6 h-1  mx-auto bg-red-700"
              style={{
                backgroundColor: "#C03078",
              }}
            ></div>
          </>
          <div ref={pdfRef}>
            {/* First Page */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span
                  className="absolute font-bold text-blue-900 p-1
             text-xl sm:text-2xl "
                  style={{
                    top: "58.5%",
                    left: "59.5%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {academic}
                </span>
              </div>
            </div>

            {/* All about Me */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${AllAboutMe})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute top-[13%] left-[10%] w-[80%] h-[65%] flex flex-col justify-start items-start p-6 ms-3 text-lg"
                  style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                >
                  {/* Q1 - My name is */}
                  <div className="flex justify-between items-center w-full md:mb-9">
                    <span className="font-bold text-blue-900 w-1/2">
                      My name is
                    </span>
                    <span className="text-gray-900 w-1/2 border-b text-center border-blue-900">
                      {allstudent
                        ? `${toCamelCase(allstudent.first_name)} ${toCamelCase(
                            allstudent.mid_name
                          )} ${toCamelCase(allstudent.last_name)}`
                        : ""}
                    </span>
                  </div>

                  {/* Q2 - I am in class */}
                  <div className="flex justify-between items-center w-full md:mb-9">
                    <span className="font-bold text-blue-900 w-1/2">
                      I am in class
                    </span>
                    <span className="text-gray-900 w-1/2 border-b text-center border-blue-900">
                      {allstudent
                        ? `${allstudent.classname} ${allstudent.sectionname}`
                        : ""}
                    </span>
                  </div>

                  {/* Q3 - My birthday is on */}
                  <div className="flex justify-between items-center w-full md:mb-9">
                    <span className="font-bold text-blue-900 w-1/2">
                      My birthday is on
                    </span>
                    <span className="text-gray-900 w-1/2 border-b text-center border-blue-900">
                      {allstudent?.dob
                        ? allstudent.dob.split("-").reverse().join("-")
                        : ""}
                    </span>
                  </div>

                  {/* Render the remaining questions dynamically */}

                  {Array.isArray(data) && (
                    <>
                      {(() => {
                        // Separate My Favourite items
                        const favouriteItems = data.filter(
                          (item) =>
                            item.name.startsWith("My favourite") ||
                            item.name.startsWith("My Favourite")
                        );

                        const otherItems = data.filter(
                          (item) =>
                            item.name !== "My name is" &&
                            item.name !== "I am in class" &&
                            item.name !== "My birthday is on" &&
                            !item.name.startsWith("My favourite") &&
                            !item.name.startsWith("My Favourite")
                        );

                        return (
                          <>
                            {/* ✅ Show all non-favourite items first */}
                            {otherItems.map((item) => (
                              <div
                                key={item.am_id}
                                className="flex justify-between items-center w-full md:mb-9"
                              >
                                <span className="font-bold text-blue-900 w-1/2">
                                  {item.name}
                                </span>
                                <span className="text-gray-900 w-1/2 border-b text-center border-blue-900">
                                  {item.aboutme_value}
                                </span>
                              </div>
                            ))}

                            {/* ✅ Show My Favourite group at the end */}
                            {favouriteItems.length > 0 && (
                              <div className="flex flex-col w-full ">
                                <span className="font-bold text-blue-900 w-full md:mb-9">
                                  My Favourite :
                                </span>
                                {favouriteItems.map((fav) => {
                                  const shortLabel = fav.name
                                    .replace(/My favourite\s*/i, "") // remove "My favourite"
                                    .trim();

                                  return (
                                    <div
                                      key={fav.am_id}
                                      className="flex justify-between items-center w-full md:mb-9"
                                    >
                                      <span className="font-bold text-blue-900 w-1/2">
                                        {shortLabel}
                                      </span>
                                      <span className="text-gray-900 w-1/2 border-b text-center border-blue-900">
                                        {fav.aboutme_value}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
                <div
                  className="absolute bottom-24 left-[10%] w-[80%]"
                  style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                >
                  <h2 className="text-blue-900 font-bold text-xl mb-2">
                    Attendance
                  </h2>
                  <div className="rounded-lg border border-gray-300 overflow-hidden">
                    <table className="w-full text-center ">
                      <thead>
                        <tr className="bg-gray-100">
                          {attendance.map((att, index) => (
                            <th
                              key={index}
                              className="border border-gray-300 p-2"
                            >
                              {att.term}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {attendance.map((att, index) => (
                            <td
                              key={index}
                              className="border border-gray-300 p-2"
                            >
                              {att.present} / {att.working}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Uploading */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${AboutMyself})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Student Image */}
                {allstudent?.studentimage && (
                  <div
                    className="absolute w-[40%] h-[250px] rounded-md shadow-lg overflow-hidden"
                    style={{
                      backgroundImage: `url(${allstudent.studentimage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      top: "18%",
                      left: "30%",
                    }}
                  ></div>
                )}

                {/* Family Image */}
                {allstudent?.familyimage && (
                  <div
                    className="absolute w-[40%] h-[250px] rounded-md shadow-lg overflow-hidden"
                    style={{
                      backgroundImage: `url(${allstudent.familyimage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      top: "58%",
                      left: "30%",
                    }}
                  ></div>
                )}
              </div>
            </div>

            {/* Domain :- Subject Language  */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2 print-page">
              {/* <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${Language})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute top-[14%] left-[10%] w-[75%] ml-3"
                  style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                >
                  {subject.map((subject, sIndex) => (
                    <div
                      key={sIndex}
                      className={`mb-6 rounded-lg border border-gray-300 overflow-hidden ${
                        sIndex > 0 ? "break-page" : ""
                      }`}
                    >
                      <table className="w-full text-left ">
                        <tbody>
                          <tr>
                            <td
                              rowSpan={
                                3 +
                                subject.competencies.reduce(
                                  (sum, comp) => sum + comp.details.length,
                                  0
                                )
                              }
                              className="border border-gray-300 p-2 text-center font-bold align-middle"
                              style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {subject.domainname}
                            </td>

                            <td
                              colSpan={4}
                              className="border border-gray-300 p-3 bg-gray-200 font-bold"
                            >
                              {subject.subjectname}
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan={4}
                              className="border border-gray-300 p-2 italic text-sm"
                            >
                              {subject.curriculum_goal}
                            </td>
                          </tr>

                          <tr className="bg-gray-100">
                            <td className="border border-gray-300 p-2 font-bold">
                              Competency
                            </td>
                            <td className="border border-gray-300 p-2 font-bold">
                              Learning Outcomes
                            </td>
                            <td className="border border-gray-300 p-2 font-bold">
                              Term 1
                            </td>
                            <td className="border border-gray-300 p-2 font-bold">
                              Term 2
                            </td>
                          </tr>

                          {subject.competencies.map((comp, cIndex) =>
                            comp.details.map((detail, dIndex) => (
                              <tr key={`${cIndex}-${dIndex}`}>
                                {dIndex === 0 && (
                                  <td
                                    rowSpan={comp.details.length}
                                    className="border border-gray-300 p-2 align-top font-semibold"
                                  >
                                    {comp.competency || "—"}
                                  </td>
                                )}

                                <td className="border border-gray-300 p-2">
                                  {detail.learning_outcomes}
                                </td>

                                <td className="border border-gray-300 p-2">
                                  {detail.parameter_value?.term1 || "—"}
                                </td>

                                <td className="border border-gray-300 p-2">
                                  {detail.parameter_value?.term2 || "—"}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div> */}
              <div className="md:ml-7 md:mr-7 flex flex-col items-center gap-4">
                {subject.map((subj, sIndex) => (
                  <div
                    key={sIndex}
                    className={`w-full md:w-[800px] lg:w-[785px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative ${
                      sIndex > 0 ? "break-page" : ""
                    }`}
                    style={{
                      backgroundImage: `url(${Language})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div
                      className="absolute top-[14%] left-[10%] w-[75%] ml-3"
                      style={{
                        fontFamily: '"Comic Sans MS", cursive, sans-serif',
                      }}
                    >
                      <div className="mb-6 rounded-lg border border-gray-300 overflow-hidden">
                        <table className="w-full text-left ">
                          <tbody>
                            {/* Row with Domain Name */}
                            <tr>
                              <td
                                rowSpan={
                                  3 +
                                  subj.competencies.reduce(
                                    (sum, comp) => sum + comp.details.length,
                                    0
                                  )
                                }
                                className="border border-gray-300 p-2 text-center font-bold align-middle"
                                style={{
                                  writingMode: "vertical-rl",
                                  transform: "rotate(180deg)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {subj.domainname}
                              </td>

                              {/* Subject Name row */}
                              <td
                                colSpan={4}
                                className="border border-gray-300 p-3 bg-gray-200 font-bold"
                              >
                                {subj.subjectname}
                              </td>
                            </tr>

                            {/* Curriculum Goal row */}
                            <tr>
                              <td
                                colSpan={4}
                                className="border border-gray-300 p-2 italic text-sm"
                              >
                                {subj.curriculum_goal}
                              </td>
                            </tr>

                            {/* Table Heading row */}
                            <tr className="bg-gray-100">
                              <td className="border border-gray-300 p-2 font-bold">
                                Competency
                              </td>
                              <td className="border border-gray-300 p-2 font-bold">
                                Learning Outcomes
                              </td>
                              <td className="border border-gray-300 p-2 font-bold">
                                Term 1
                              </td>
                              <td className="border border-gray-300 p-2 font-bold">
                                Term 2
                              </td>
                            </tr>

                            {/* Competency + Details */}
                            {subj.competencies.map((comp, cIndex) =>
                              comp.details.map((detail, dIndex) => (
                                <tr key={`${cIndex}-${dIndex}`}>
                                  {dIndex === 0 && (
                                    <td
                                      rowSpan={comp.details.length}
                                      className="border border-gray-300 p-2 align-top font-semibold"
                                    >
                                      {comp.competency || "—"}
                                    </td>
                                  )}
                                  <td className="border border-gray-300 p-2">
                                    {detail.learning_outcomes}
                                  </td>
                                  <td className="border border-gray-300 p-2">
                                    {detail.parameter_value?.[1] ? (
                                      <img
                                        src={
                                          levelImages[detail.parameter_value[1]]
                                        }
                                        alt={detail.parameter_value[1]}
                                        className="h-8 mx-auto"
                                      />
                                    ) : (
                                      "—"
                                    )}
                                  </td>

                                  <td className="border border-gray-300 p-2">
                                    {detail.parameter_value?.[2] ? (
                                      <img
                                        src={
                                          levelImages[detail.parameter_value[2]]
                                        }
                                        alt={detail.parameter_value[2]}
                                        className="h-8 mx-auto"
                                      />
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* {sIndex === subject.length - 1 && (
                        <div className="mt-6 rounded-lg border border-gray-300 overflow-hidden">
                          <table className="w-full text-center ">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2">
                                  Performance Level
                                </th>
                                <th className="border border-gray-300 p-2">
                                  Symbol
                                </th>
                                <th className="border border-gray-300 p-2">
                                  Interpretation
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300 p-2">
                                  Beginner
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <img
                                    src={BeginnerImg}
                                    alt="Beginner"
                                    className="h-8 mx-auto"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  Tries to achieve the competency and associated
                                  learning outcome with lot of support from
                                  teachers.
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-gray-300 p-2">
                                  Progressing
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <img
                                    src={ProgressingImg}
                                    alt="Progressing"
                                    className="h-8 mx-auto"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  Achieves the competency and associated
                                  learning outcomes with occasional/some support
                                  from teachers.
                                </td>
                              </tr>

                              <tr>
                                <td className="border border-gray-300 p-2">
                                  Proficient
                                </td>
                                <td className="border border-gray-300 p-2">
                                  <img
                                    src={ProficientImg}
                                    alt="Proficient"
                                    className="h-8 mx-auto"
                                  />
                                </td>
                                <td className="border border-gray-300 p-2">
                                  Achieves the competency and associated
                                  learning outcomes on his/her own.
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:ml-7 md:mr-7 flex justify-center mb-2">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${Language})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute top-[15%] left-[10%] w-[80%] p-2 space-y-8"
                  style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                >
                  <div>
                    <div className="rounded-lg border border-gray-300 overflow-hidden">
                      <table className="w-full text-center ">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">
                              Performance Level
                            </th>
                            <th className="border border-gray-300 p-2">
                              Symbol
                            </th>
                            <th className="border border-gray-300 p-2">
                              Interpretation
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2">
                              Beginner
                            </td>
                            <td className="border border-gray-300 p-2">
                              <img
                                src={BeginnerImg}
                                alt="Beginner"
                                className="h-8 mx-auto"
                              />
                            </td>
                            <td className="border border-gray-300 p-2">
                              Tries to achieve the competency and associated
                              learning outcome with lot of support from
                              teachers.
                            </td>
                          </tr>

                          <tr>
                            <td className="border border-gray-300 p-2">
                              Progressing
                            </td>
                            <td className="border border-gray-300 p-2">
                              <img
                                src={ProgressingImg}
                                alt="Progressing"
                                className="h-8 mx-auto"
                              />
                            </td>
                            <td className="border border-gray-300 p-2">
                              Achieves the competency and associated learning
                              outcomes with occasional/some support from
                              teachers.
                            </td>
                          </tr>

                          <tr>
                            <td className="border border-gray-300 p-2">
                              Proficient
                            </td>
                            <td className="border border-gray-300 p-2">
                              <img
                                src={ProficientImg}
                                alt="Proficient"
                                className="h-8 mx-auto"
                              />
                            </td>
                            <td className="border border-gray-300 p-2">
                              Achieves the competency and associated learning
                              outcomes on his/her own.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learners and Peer Feedback */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${LearnerPeer})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute top-[10%] left-[10%] w-[80%] p-2 space-y-8"
                  style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                >
                  {/* Learner's Feedback */}
                  <div>
                    <h2 className="text-blue-900 font-bold text-xl mb-2">
                      Learner's Feedback
                    </h2>
                    <div className="rounded-lg border border-gray-300 overflow-hidden">
                      <table className="w-full text-center ">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">
                              Parameter
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 1
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 2
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {learner.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">
                                {item.parameter}
                              </td>
                              {["1", "2"].map((term) => (
                                <td
                                  key={term}
                                  className="border border-gray-300 p-2"
                                >
                                  {item.parameter_values[term] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Peer Feedback */}
                  <div>
                    <h2 className="text-blue-900 font-bold text-xl mb-2">
                      Peer Feedback
                    </h2>
                    <div className="rounded-lg border border-gray-300 overflow-hidden">
                      <table className="w-full text-center ">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">
                              Parameter
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 1
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 2
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {peerFeedback.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">
                                {toCamelCase(item.parameter)}
                              </td>
                              {["1", "2"].map((term) => (
                                <td
                                  key={term}
                                  className="border border-gray-300 p-2"
                                >
                                  {item.parameter_values[term] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parents Feedback */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${LearnerPeer})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  className="absolute top-[10%] left-[10%] w-[80%] p-2 space-y-8"
                  style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}
                >
                  {/* Parent Feedback */}
                  <div>
                    <h2 className="text-blue-900 font-bold text-xl mb-2">
                      Parent Feedback
                    </h2>
                    <div className="rounded-lg border border-gray-300 overflow-hidden">
                      <table className="w-full text-center ">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">
                              Observation
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 1
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 2
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {parentFeedback.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">
                                {item.parameter}
                              </td>
                              {["1", "2"].map((term) => (
                                <td
                                  key={term}
                                  className="border border-gray-300 p-2"
                                >
                                  {item.parameter_values[term] || "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Class teacher remark */}
                  <div>
                    <h2 className="text-blue-900 font-bold text-xl mb-2">
                      Class Teacher Remark
                    </h2>
                    <div className="rounded-lg border border-gray-300 overflow-hidden">
                      <table className="w-full text-center ">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">
                              Parameter
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 1
                            </th>
                            <th className="border border-gray-300 p-2">
                              Term 2
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {classTeacher.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">
                                {toCamelCase(item.parameter)}
                              </td>
                              {["1", "2"].map((term) => {
                                const termData = item.parameter_values.find(
                                  (pv) => String(pv.term) === term
                                );
                                return (
                                  <td
                                    key={term}
                                    className="border border-gray-300 p-2"
                                  >
                                    {termData ? termData.value : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Cover */}
            <div className="md:ml-7 md:mr-7 flex justify-center mb-2">
              <div
                className="w-full md:w-[1000px] lg:w-[1000px] aspect-[8/10] rounded-md shadow-lg overflow-hidden relative"
                style={{
                  backgroundImage: `url(${BackCover})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HPCReportCard;
