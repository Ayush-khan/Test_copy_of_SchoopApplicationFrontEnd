// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const ShowReportCard = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   if (!state?.reportCardUrl) {
//     return (
//       <div className="text-center text-red-600 mt-10">
//         No report card data found.
//       </div>
//     );
//   }

//   const { reportCardUrl, academicYear, class_id, student_id } = state;

//   return (
//     // <div className="w-[80%] bg-white p-4 rounded-md">
//     //   <div className="flex items-center justify-between mb-4">
//     //     <h2 className="text-lg font-semibold">Report Card ({academicYear})</h2>

//     //     <button
//     //       onClick={() => navigate(-1)}
//     //       className="text-sm text-blue-600 hover:underline"
//     //     >
//     //       ← Back
//     //     </button>
//     //   </div>

//     //   <iframe
//     //     src={reportCardUrl}
//     //     title="Report Card Preview"
//     //     className="w-full h-[80vh] border-0 rounded"
//     //   />
//     // </div>
//     <div className="min-h-screen w-full flex justify-center items-center bg-gray-100">
//       <div className="w-[80%] bg-white p-4 rounded-md shadow-lg">
//         <iframe
//           src={reportCardUrl}
//           title="Report Card Preview"
//           className="w-full h-[85vh] border-0 rounded"
//         />
//       </div>
//     </div>
//   );
// };

// export default ShowReportCard;

// working correct
// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const ShowReportCard = () => {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   if (!state?.reportCardUrl) {
//     return (
//       <div className="text-center text-red-600 mt-10">
//         No report card data found.
//       </div>
//     );
//   }

//   const { reportCardUrl } = state;

//   return (
//     <div className="min-h-screen w-full flex justify-center items-start bg-white py-8">
//       <iframe
//         src={`${reportCardUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
//         title="Report Card Preview"
//         className="w-[80%] h-[90vh] border-none"
//       />
//     </div>
//   );
// };

// export default ShowReportCard;

// Exact working like this i want
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const ShowReportCard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [reportCardUrl, setReportCardUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const student = state?.student || JSON.parse(localStorage.getItem("student"));
  const academicYrParam =
    state?.academicYr || localStorage.getItem("academicYr");

  useEffect(() => {
    if (state?.student)
      localStorage.setItem("student", JSON.stringify(state.student));
    if (state?.academicYr) localStorage.setItem("academicYr", state.academicYr);
  }, [state]);

  useEffect(() => {
    if (!student || !academicYrParam) {
      toast.error("Required data missing");
      setIsLoading(false);
      return;
    }

    const fetchReportCard = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/api/show_report_card`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            class_id: student.class_id,
            academic_yr: academicYrParam,
            student_id: student.student_id,
          },
          responseType: "blob", // important
        });

        // Only create URL if we got data
        if (response.data.size > 0) {
          const fileURL = URL.createObjectURL(response.data);
          setReportCardUrl(
            `${fileURL}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
          );
        } else {
          toast.error("Report card file is empty");
        }
      } catch (err) {
        console.error("API error:", err);
        toast.error("Failed to fetch report card");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportCard();
  }, [student, academicYrParam]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(`${API_URL}/api/show_report_card`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          class_id: student.class_id,
          academic_yr: academicYrParam,
          student_id: student.student_id,
        },
        responseType: "blob",
      });

      // Create downloadable file
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `RC_${student.first_name}_${student.mid_name}_${student.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download report card");
      setIsDownloading(false);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!student || !academicYrParam) {
    return (
      <div className="text-center text-red-600 mt-10">
        No report card data found.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-700 mt-10">
        Loading report card...
      </div>
    );
  }

  return (
    // <div className="min-h-screen w-[80%] flex justify-center items-start bg-white py-8 mt-4 ml-28">
    //   {/* <div className="flex items-center justify-between mb-4">
    //     <div className=" card-header  flex justify-between items-center  ">
    //       <h3 className=" mt-1 text-[1.2em] lg:text-xl text-nowrap">
    //         Report Card
    //       </h3>
    //     </div>
    //     <RxCross1
    //       className="float-end  text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
    //       onClick={() => {
    //         navigate("/dashboard");
    //       }}
    //     />
    //     <div
    //       className=" relative  mb-8   h-1  mx-auto bg-red-700"
    //       style={{
    //         backgroundColor: "#C03078",
    //       }}
    //     ></div>
    //   </div>
    //   {reportCardUrl ? (
    //     <iframe
    //       src={reportCardUrl}
    //       title="Report Card Preview"
    //       className="w-[80%] h-[90vh] border-none"
    //     />
    //   ) : (
    //     <div className="text-center text-red-600 mt-10">
    //       Report card not available
    //     </div>
    //   )} */}
    //   {/* Header */}
    //   <div className="w-full max-w-[80%] mx-auto mb-4">
    //     <div className="flex items-center justify-between">
    //       <h3 className="text-[1.2em] lg:text-xl font-semibold text-nowrap">
    //         Report Card
    //       </h3>

    //       <RxCross1
    //         className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded-full p-1"
    //         onClick={() => navigate("/dashboard")}
    //       />
    //     </div>

    //     {/* Divider */}
    //     <div
    //       className="mt-2 h-[2px] w-full"
    //       style={{ backgroundColor: "#C03078" }}
    //     />
    //   </div>

    //   {/* Preview */}
    //   {reportCardUrl ? (
    //     <div className="w-full flex justify-center">
    //       <iframe
    //         src={reportCardUrl}
    //         title="Report Card Preview"
    //         className="w-[80%] h-[90vh] border-none"
    //       />
    //     </div>
    //   ) : (
    //     <div className="text-center text-red-600 mt-10">
    //       Report card not available
    //     </div>
    //   )}
    // </div>
    // <div className="min-h-screen w-[80%] flex justify-center bg-white py-6 mt-4 ml-28">

    //   <div className="w-[80%] bg-white">

    //     <div className="flex items-center justify-between mb-2">
    //       <h3 className="text-[1.2em] lg:text-xl font-semibold">Report Card</h3>

    //       <RxCross1
    //         className="text-xl text-red-600 cursor-pointer hover:bg-red-100 rounded-full p-1"
    //         onClick={() => navigate("/dashboard")}
    //       />
    //     </div>

    //     <div
    //       className="h-[2px] w-full mb-4"
    //       style={{ backgroundColor: "#C03078" }}
    //     />

    //     {reportCardUrl ? (
    //       <div className="flex justify-center">
    //         <iframe
    //           src={reportCardUrl}
    //           title="Report Card Preview"
    //           className="w-full h-[90vh] border-none"
    //         />
    //       </div>
    //     ) : (
    //       <div className="text-center text-red-600 mt-10">
    //         Report card not available
    //       </div>
    //     )}
    //   </div>
    // </div>

    <>
      <ToastContainer />
      <div className="md:mx-auto md:w-[80%] rounded-md  bg-white mt-4 p-2 ">
        <div className=" card-header  flex justify-between items-center  ">
          <h3 className=" mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Report Card
          </h3>
          <div className="flex flex-row space-x-2 justify-center items-center p-1">
            <div className="w-1/2 md:w-fit mr-1">
              {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Download
              </button> */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`px-4 py-2 rounded-md text-white transition
    ${isDownloading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>

            <RxCross1
              className="float-end   text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/manageStudent");
              }}
            />
          </div>
        </div>
        <div
          className=" relative  mb-8   h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>

        {reportCardUrl ? (
          <div className="flex justify-center ">
            <iframe
              src={reportCardUrl}
              title="Report Card Preview"
              className="w-[90%] h-[90vh] border-none"
            />
          </div>
        ) : (
          <div className="text-center text-red-600 mt-10">
            Report card not available
          </div>
        )}
      </div>
    </>
  );
};

export default ShowReportCard;
