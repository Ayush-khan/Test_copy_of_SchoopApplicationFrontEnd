// secondtryimport { useEffect, useState } from "react";
import axios from "axios";
import { IoIosArrowForward } from "react-icons/io";
// import { RxCross1, RxCrosshair1 } from "react-icons/rx";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import NavBar from "../../Layouts/NavBar";
import TableFeeCollect from "../../componants/Dashbord/TableFeeCollect.jsx";
import { useState, useEffect } from "react";
import TableFeeCollectForFeependignList from "./TableFeeCollectForFeependignList.jsx";
function FeePendingList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [staffBirthday, setStaffBirthday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [totalPendingFee, setTotalPendingFee] = useState(0);

  const [activeTab, setActiveTab] = useState("Pending Fee List");

  useEffect(() => {
    const fetchStaffBirthday = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          throw new Error("No authentication token or academic year found");
        }

        const response = await axios.get(`${API_URL}/api/fee_collection_list`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response of the birthday list is", response.data);

        if (response.data && Array.isArray(response.data)) {
          setStaffBirthday(response.data);

          // ✅ Calculate and store total pending fee
          const total = response.data.reduce((acc, item) => {
            const feeStr = (item.pending_fee || "0").replace(/,/g, "");
            const fee = parseFloat(feeStr);
            return acc + (isNaN(fee) ? 0 : fee);
          }, 0);
          setTotalPendingFee(total);
        } else {
          throw new Error("Unexpected response data format");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffBirthday();
  }, []);

  console.log("the staffbirthlis", staffBirthday);

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Update the active tab state
  };
  return (
    <div className="container mt-4 ">
      <div className="  card mx-auto lg:w-3/4  shadow-lg ">
        {/* <div className="card mx-auto w-3/4"> */}
        <div className="card-header flex justify-between items-center">
          <h5 className="text-gray-700 mt-1  text-md lg:text-lg">
            Fee Pending & Collection Summary
          </h5>

          <RxCross1
            className="float-end relative  right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className=" relative w-[97%]   mb-3 h-1  mx-auto bg-red-700"
          style={{
            backgroundColor: "#C03078",
          }}
        ></div>
        <ul className="  w-full md:w-[98%] mx-auto grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row  ">
          {/* Tab Navigation */}
          {["Pending Fee List", "Fee Collection"].map((tab) => (
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

        <div className="card-body w-full md:w-[90%] mx-auto">
          <div className="bg-white rounded-lg shadow-xs  w-full md:w-[80%] mx-auto">
            <div className="bg-white rounded-lg  shadow-xs ">
              {activeTab === "Pending Fee List" ? (
                <>
                  {" "}
                  <table className="min-w-full leading-normal table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th
                          className={`px-0.5 text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider ${
                            !loading ? " md:w-[10%]" : "w-full"
                          }`}
                          // className=" w-full md:w-[10%] px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider"
                        >
                          S.No
                        </th>
                        <th className=" text-center px-2  lg:px-2 py-2   border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                          Account
                        </th>
                        <th
                          className={`px-0.5 text-center lg:px-1 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider ${
                            !loading ? " md:w-[10%]" : "w-full"
                          }`}
                        >
                          Installment
                        </th>

                        <th className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                          Pending Fee
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4}>
                            <div className="w-full text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-blue-700">
                                Please wait while data is loading...
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : staffBirthday.length ? (
                        <>
                          {staffBirthday.map((staff, index) => (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-white" : "bg-gray-100"
                              } hover:bg-gray-50`}
                            >
                              <td className="sm:px-0.5 text-center lg:px-1 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap text-center relative top-2">
                                  {index + 1}
                                </p>
                              </td>
                              <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {staff?.Account || " "}
                                </p>
                              </td>
                              <td className="text-center px-2 lg:px-2 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {staff?.installment || " "}
                                </p>
                              </td>
                              <td className="px-2 text-center lg:px-3 border border-gray-950 text-sm">
                                <p className="text-gray-900 whitespace-no-wrap relative top-2">
                                  {staff?.pending_fee || " "}
                                </p>
                              </td>
                            </tr>
                          ))}
                          {/* ✅ Total row here */}
                          <tr className="bg-yellow-100 font-semibold">
                            <td
                              colSpan={3}
                              className=" text-right px-4 py-2 border border-gray-950 text-sm"
                            >
                              Total Pending Fee
                            </td>
                            <td className="px-2 text-center lg:px-3 border border-gray-950 text-sm">
                              <p className="text-blue-600 font-medium whitespace-no-wrap relative top-2 right-2">
                                ₹{" "}
                                {Number(totalPendingFee).toLocaleString(
                                  "en-IN"
                                )}
                                .00
                              </p>
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={4}>
                            <div className="w-full text-center flex justify-center items-center mt-14">
                              <div className="text-center text-xl text-red-700">
                                Oops! No data found..
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
              ) : (
                <TableFeeCollectForFeependignList />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeePendingList;
