import { useState } from "react";
import axios from "axios";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { RxCross1 } from "react-icons/rx";
import { FiPrinter } from "react-icons/fi";
import Barcode from "react-barcode";
import JsBarcode from "jsbarcode";

const GenerateBarcode = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [toDate, setToDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");

  const [loadingForSearch, setLoadingForSearch] = useState(false);

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timetable, setTimetable] = useState([]);

  const pageSize = 10;
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentReport, setShowStudentReport] = useState(false);

  const handleSearch = async () => {
    setSearchTerm("");
    setTimetable([]);
    setPageCount(0);
    setIsSubmitting(true);
    setLoadingForSearch(true);
    setFromError("");
    setToError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication token missing!");
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      if (!fromDate && !toDate) {
        toast.error("Please select at least one to generate barcode.");
        setFromError("Please enter Accession No. From");
        setToError("Please enter Accession No. To");
        setLoadingForSearch(false);
        setIsSubmitting(false);
        return;
      }

      const handleResult = (data) => {
        if (!data || data.length === 0) {
          toast.error("Accession No. not found");
        }
        setTimetable(data || []);
      };

      if (!fromDate && toDate) {
        const params = { copy_id_to: toDate };
        const response = await axios.post(
          `${API_URL}/api/generate_barcode`,
          params,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        // console.log("testing");
        handleResult(response.data.data);
        return;
      }

      if (fromDate && !toDate) {
        const params = { copy_id_from: fromDate };

        const response = await axios.post(
          `${API_URL}/api/generate_barcode`,
          params,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        handleResult(response.data.data);
        return;
      }

      if (fromDate && toDate) {
        if (Number(fromDate) > Number(toDate)) {
          toast.error(
            "Accession No. To must be greater than Accession No. From",
          );
          setLoadingForSearch(false);
          setIsSubmitting(false);
          return;
        }
      }

      const params = {
        copy_id_from: fromDate,
        copy_id_to: toDate,
      };

      const response = await axios.post(
        `${API_URL}/api/generate_barcode`,
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      handleResult(response.data.data);
    } catch (error) {
      console.error("Error fetching Accession no.:", error);
      toast.error(
        error?.response?.data?.message ||
          "Error fetching accession no. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setLoadingForSearch(false);
    }
  };

  const generateBarcodeBase64 = (value) => {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value, { format: "CODE128" });
    return canvas.toDataURL("image/png");
  };

  const handlePrint = () => {
    const printTitle = `List of Barcode ${fromDate} to ${toDate}`;

    // Build rows with 2 barcodes per row
    const barcodeRows = (() => {
      let rows = "";
      for (let i = 0; i < displayedSections.length; i += 2) {
        const first = displayedSections[i];
        const second = displayedSections[i + 1];

        const firstBarcode = generateBarcodeBase64(String(first.copy_id));
        const secondBarcode = second
          ? generateBarcodeBase64(String(second.copy_id))
          : null;

        rows += `
      <tr style="border:1px solid black;">
        <td style="padding:10px; text-align:center;">
          <img src="${firstBarcode}" style="width:200px; height:150px;" />
          
        </td>

        <td style="padding:10px; text-align:center;">
          ${
            secondBarcode
              ? `<img src="${secondBarcode}" style="width:200px; height:150px;" />`
              : ""
          }
        </td>
      </tr>
    `;
      }
      return rows;
    })();

    // Main HTML for printing
    const printContent = `
    <div style="width:100%; text-align:center;">
      <h3 style="font-weight:bold; font-size:20px; margin-bottom:10px;">
        ${printTitle}
      </h3>

      <table style=" solid black; border-collapse; width:80%; margin:auto;">
        <tbody>
          ${barcodeRows}
        </tbody>
      </table>
    </div>
  `;

    // Open print window
    const printWindow = window.open("", "_blank", "width=1000,height=800");

    printWindow.document.write(`
    <html>
      <head>
        <title>${printTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 80%; margin: auto; border-collapse; }
          td, th { solid #000; padding: 8px; text-align: center; }
          img { display:block; margin:auto; }
          @page { size: A4; margin: 10mm; }
        </style>
      </head>

      <body>
        ${printContent}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  // console.log("row", timetable);

  const filteredSections = (Array.isArray(timetable) ? timetable : []).filter(
    (student) => {
      const searchLower = searchTerm.toLowerCase();

      const accessionNo = student?.copy_id || "";

      return accessionNo.includes(searchLower);
    },
  );

  const displayedSections = filteredSections.slice(currentPage * pageSize);

  return (
    <>
      <div
        className={`mx-auto p-4 transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] transform ${
          timetable.length > 0
            ? "w-full md:w-[90%] scale-100"
            : "w-full md:w-[80%] scale-[0.98]"
        }`}
      >
        <ToastContainer />
        <div className="card rounded-md ">
          <div className=" card-header mb-4 flex justify-between items-center ">
            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
              Generate Barcode
            </h5>
            <RxCross1
              className=" relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
              onClick={() => {
                navigate("/dashboard");
              }}
            />
          </div>
          <div
            className=" relative w-full   -top-6 h-1  mx-auto bg-red-700"
            style={{
              backgroundColor: "#C03078",
            }}
          ></div>

          <>
            <div
              className={`w-full flex flex-col md:flex-row md:items-end gap-4 pl-4 pr-4 ${
                timetable.length > 0 ? "md:w-[100%]" : "md:w-[100%]"
              }`}
            >
              <div className="w-full md:w-[100%] flex md:flex-row justify-between items-center mt-0 md:mt-4">
                <div
                  className={`  w-full gap-x-0 md:gap-x-8  flex flex-col gap-y-2 md:gap-y-0 md:flex-row ${
                    timetable.length > 0
                      ? "w-full md:w-[100%]  wrelative left-0"
                      : " w-full md:w-[95%] relative left-10"
                  }`}
                >
                  <div className="w-full md:w-[70%] gap-x-2 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[80%] text-md mt-1.5"
                      htmlFor="fromDate"
                    >
                      Accession No. From <span className="text-red-500">*</span>
                    </label>

                    <div className="w-[80%]">
                      <input
                        type="text"
                        id="fromDate"
                        value={fromDate}
                        maxLength={8}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          setFromError(""); // clear on typing
                        }}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                      />

                      {fromError && (
                        <p className="text-red-600 text-xs mt-1">{fromError}</p>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-[70%] gap-x-2 justify-between my-1 md:my-4 flex md:flex-row">
                    <label
                      className="ml-0 md:ml-4 w-full md:w-[70%] text-md mt-1.5"
                      htmlFor="toDate"
                    >
                      Accession No. To <span className="text-red-500">*</span>
                    </label>

                    <div className="w-[80%]">
                      <input
                        type="text"
                        id="toDate"
                        value={toDate}
                        maxLength={8}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          setToError(""); // clear on typing
                        }}
                        className="text-sm w-full border border-gray-300 rounded px-2 py-2"
                      />

                      {toError && (
                        <p className="text-red-600 text-xs mt-1">{toError}</p>
                      )}
                    </div>
                  </div>

                  {/* Browse Button */}
                  <div className="mt-1">
                    <button
                      type="search"
                      onClick={handleSearch}
                      style={{ backgroundColor: "#2196F3" }}
                      className={`btn h-10 w-18 md:w-auto btn-primary text-white font-bold py-1 border-1 border-blue-500 px-4 rounded ${
                        loadingForSearch ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loadingForSearch}
                    >
                      {loadingForSearch ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            ></path>
                          </svg>
                          Browsing...
                        </span>
                      ) : (
                        "Browse"
                      )}
                    </button>
                  </div>
                </div>
              </div>
              {timetable.length > 0 && (
                <div className="flex gap-2 items-end  bg-gray-100 p-2">
                  <input
                    type="text"
                    className="form-control border border-gray-300 rounded px-2 py-1 text-sm"
                    placeholder="Search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <button
                    onClick={handlePrint}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    <FiPrinter />
                  </button>
                </div>
              )}
            </div>

            {timetable.length > 0 && (
              <>
                <div className="w-full px-4 mt-4 mb-4">
                  <div className="card mx-auto lg:w-full shadow-lg">
                    <div className="card-body w-full">
                      {/* <div
                        className="h-96 lg:h-96 overflow-y-scroll overflow-x-scroll"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#C03178 transparent",
                        }}
                      > */}
                      <table className="min-w-full leading-normal table-auto">
                        <thead>
                          <tr className="bg-gray-100">
                            {/* lex items-center  bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border-l-4 border-r-4 border-pink-40 */}
                            <th className="px-2 text-center lg:px-3 py-1 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                              List of Barcode
                            </th>
                          </tr>
                        </thead>

                        {/* <tbody>
                            {displayedSections.length ? (
                              displayedSections.map((student) => (
                                <tr
                                  key={student.copy_id}
                                  className="border border-gray-300"
                                >
                                  <td className="px-2 py-2 text-center border border-gray-300">
                                    <Barcode
                                      value={String(student.copy_id)}
                                      width={1.5}
                                      height={60}
                                      fontSize={14}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={2}>
                                  <div className="text-center text-xl text-red-700 py-4">
                                    Oops! No data found..
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody> */}
                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {displayedSections.length ? (
                            displayedSections.map((item) => (
                              <div
                                key={item.copy_id}
                                className="border border-gray-300 p-3 flex flex-col items-center rounded-lg shadow-sm"
                              >
                                {/* Barcode */}
                                <Barcode
                                  value={String(item.copy_id)}
                                  width={2.5}
                                  height={100}
                                  fontSize={14}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center text-xl text-red-700 py-6">
                              Oops! No data found..
                            </div>
                          )}
                        </div>
                      </table>
                      {/* </div> */}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </div>
      </div>
    </>
  );
};

export default GenerateBarcode;
