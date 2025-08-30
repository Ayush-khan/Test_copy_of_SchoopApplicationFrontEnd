// secondtryimport { useEffect, useState } from "react";
import axios from "axios";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Select from "react-select";

function FeesStructure() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [staffBirthday, setStaffBirthday] = useState([]);
  const [studentBirthday, setStudentBirthday] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("View Fees Allotment");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classError, setClassError] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [divisionError, setDivisionError] = useState('');
  const [loadingForSearch, setLoadingForSearch] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [divisionOptions, setdivisionOptions] = useState([]);
  const [installmentOptions, setInstallmentOptions] = useState([]);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [installmentDetails, setInstallmentDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchFeesAllotment();
    fetchClassOptions();
  }, []);
  const fetchFeesAllotment = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/get_feescategoryallotmentview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudentBirthday(response.data.data);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const fetchClassOptions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_feescategory`, {
        headers: { Authorization: `Bearer ${token}` },
      }); // Update endpoint as per your API
      const classOptions = response.data.data.map((cls) => ({
        value: cls.fees_category_id,
        label: cls.name,
      }));
      setClassOptions(classOptions);
    } catch (error) {
      console.error('Failed to load class options:', error);
    }
  };

  const fetchInstallments = async (feesCategoryId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/get_feescategoryinstallmentdropdown/${feesCategoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }); 
      const options = response.data.data;
      setInstallmentOptions(options);

      const defaultSelected = options.find((opt) => opt.selected === true);
      setSelectedInstallment(defaultSelected || null);
    } catch (error) {
      console.error('Failed to load installment options:', error.message);
    }
  };

  const fetchInstallmentDetails = async (feesCategoryId, installment) => {
    setLoadingDetails(true);
  try {
    const token = localStorage.getItem("authToken");
      // const response = await axios.get(`${API_URL}/api/get_feescategoryinstallmentdropdown/${feesCategoryId}`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // }); 
      const response = await axios.get(
    `${API_URL}/api/get_feescategoryallotmentinstallment`,
    {
      params: {
        fee_allotment_id: feesCategoryId,
        installment: installment,
      },
      headers: {
        Authorization: `Bearer ${token}`, // token must be a valid JWT or auth token string
      },
    }
  );

    console.log("Installment details:", response.data);
    setInstallmentDetails(response.data.data || []);
  } catch (error) {
    console.error("Failed to fetch installment details:", error.message);
  } finally {
    setLoadingForSearch(false);
    setLoadingDetails(false);
  }
};

  const handleDivisionChange = (selectedOption) => {
    setSelectedInstallment(selectedOption);
    
  };
  const handleDivisionSelect = (selectedOption) => {
  setSelectedInstallment(selectedOption);
  
};
  const handleTabChange = (tab) => {
    setActiveTab(tab); 
  };
   const handleClassSelect = (selectedOption) => {
    setClassError(""); 
    setSelectedClass(selectedOption);
    setSelectedClassId(selectedOption?.value);
    setInstallmentOptions([]); // reset installment dropdown
    setSelectedInstallment(null); // reset selected value
    if (selectedOption?.value) {
      fetchInstallments(selectedOption.value);
    }

    
  };

const handleSubmit = () => {
  if (!selectedClass) {
    setClassError('Please select a class');
  } else {
    setClassError('');
  }
  if (!selectedDivision) {
    setDivisionError('Please select a division');
  } else {
    setDivisionError('');
  }
};
const handleSearch = () => {
  // Example logic – customize as needed
  setLoadingForSearch(false);
  if (!selectedClass) {
    setClassError('Please select a category');
    setLoadingForSearch(false);
  } else {
    setClassError('');
  }
  if (!selectedInstallment) {
    setDivisionError('Please select an installment');
    setLoadingForSearch(false);
  } else {
    setDivisionError('');
  }
 console.log('feeallotmentid',selectedInstallment)
  const feeAllotmentId = selectedInstallment?.fee_allotment_id; 
  const installment = selectedInstallment?.value;
  
  if (feeAllotmentId && installment) {
    setLoadingForSearch(true);
    fetchInstallmentDetails(feeAllotmentId, installment);
    
  }
};

  return (
    <>
      <div className="md:mx-auto md:w-[85%] p-4 bg-white mt-4 ">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
           Allot Fees
          </h3>
          <RxCross1
            className="float-end relative  -top-1 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
            onClick={() => {
              navigate("/dashboard");
            }}
          />
        </div>
        <div
          className="relative mb-8 h-1 mx-auto bg-red-700"
          style={{ backgroundColor: "#C03078" }}
        ></div>

        {/* Tab Navigation */}
        <ul className="grid grid-cols-2 gap-x-10 relative -left-6 md:left-0 md:flex md:flex-row  -top-4">
          {/* Tab Navigation */}
          {["View Fees Allotment", "Installment Details"].map((tab) => (
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
            <div className="text-center text-xl py-10 text-blue-700">
              Please wait while data is loading...
            </div>
          ) : activeTab === "View Fees Allotment" ? (
            <>
              <table className="min-w-full leading-normal table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className=" px-0.5 w-full md:w-[8%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      S.No
                    </th>
                    <th className=" px-0.5 w-full md:w-[30%] mx-auto text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Category Name
                    </th>
                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Admission fees
                    </th>
                    <th className=" px-0.5 text-center lg:px-1 py-2  border border-gray-950 text-sm font-semibold text-gray-900  tracking-wider">
                      Installment 1
                    </th>
                    <th className="px-2  py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Installment 2
                    </th>
                    <th className="px-2  py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Installment 3
                    </th>
                    <th className="px-2  py-2 border border-gray-950 text-sm font-semibold text-center text-gray-900">
                      Total
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
                            {`${student.category || ""}`}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                            {" "}
                            {student?.admission_fee || " "}
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                           
                            {student.installment_1 }
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                           {student.installment_2 }
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                           {student.installment_3 }
                          </p>
                        </td>
                        <td className="text-center px-2 lg:px-2  border border-gray-950  text-sm">
                          <p className="text-gray-900 whitespace-no-wrap relative top-2">
                           {student.total }
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
              </table>
            </>
          ) : (
            <>
              {" "}
              <div className="w-full  md:w-[90%] gap-x-0  md:gap-x-12 flex flex-col gap-y-2 md:gap-y-0 md:flex-row">
                  {/* Class Dropdown */}
                  <div className="w-full md:w-[full] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[50%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="classSelect"
                    >
                      Select a Category <span className="text-sm text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[50%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="classSelect"
                        value={selectedClass}
                        onChange={handleClassSelect}
                        options={classOptions}
                        placeholder={loading ? "Loading..." : "Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loading}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for selected value
                            minHeight: "30px", // Reduce height
                          }),
                          menu: (provided) => ({
                            ...provided,
                            fontSize: "1em", // Adjust font size for dropdown options
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for each option
                          }),
                        }}
                      />
                      {classError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {classError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-[full] gap-x-2 justify-around my-1 md:my-4 flex md:flex-row">
                    <label
                      className="w-full md:w-[50%] text-md pl-0 md:pl-5 mt-1.5"
                      htmlFor="divisionSelect"
                    >
                      Select Installments<span className="text-sm text-red-500">*</span>
                    </label>
                    <div className="w-full md:w-[50%]">
                      <Select
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        id="divisionSelect"
                        value={selectedInstallment}
                        onChange={handleDivisionSelect}
                        options={installmentOptions}
                        placeholder={loading ? "Loading..." : "Select"}
                        isSearchable
                        isClearable
                        className="text-sm"
                        isDisabled={loading}
                        styles={{
                          control: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for selected value
                            minHeight: "30px", // Reduce height
                          }),
                          menu: (provided) => ({
                            ...provided,
                            fontSize: "1em", // Adjust font size for dropdown options
                          }),
                          option: (provided) => ({
                            ...provided,
                            fontSize: ".9em", // Adjust font size for each option
                          }),
                        }}
                      />
                      {divisionError && (
                        <div className="h-8 relative ml-1 text-danger text-xs">
                          {divisionError}
                        </div>
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
                          Searching...
                        </span>
                      ) : (
                        "Search"
                      )}
                    </button>
                  </div>
                </div>
              
              {installmentDetails?.fee_details?.length > 0 && (
  <div className="w-[full] mt-4">
    <div className="card mx-auto lg:w-full shadow-lg">
      <div className="p-2 px-3 bg-gray-100 border-none flex justify-between items-center">
        <div className="w-full flex flex-row justify-between mr-0 md:mr-4">
          <h3 className="text-gray-700 mt-1 text-[1.2em] lg:text-xl text-nowrap">
            Installment Fee Details
          </h3>
          <p className="text-gray-600 text-sm mt-2 font-medium">
            Due Date: <span className="text-red-700 font-semibold">{installmentDetails.due_date}</span>
          </p>
        </div>

        
      </div>

      <div className="relative w-[97%] mb-3 h-1 mx-auto bg-pink-700"></div>

      <div className="card-body w-full">
        <div
          className="h-96 overflow-y-scroll overflow-x-scroll"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#C03178 transparent",
          }}
        >
          <table className="min-w-full leading-normal table-auto">
            <thead>
              <tr className="bg-gray-100">
                {["Sr No.", "Fee Type", "Amount (₹)"].map((header, index) => (
                  <th
                    key={index}
                    className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {installmentDetails.fee_details.map((fee, index) => (
                <tr key={fee.fee_type_id} className="border border-gray-300">
                  <td className="px-2 py-2 text-center border border-gray-300">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 text-center border border-gray-300">
                    {fee.name}
                  </td>
                  <td className="px-2 py-2 text-center border border-gray-300">
                    ₹{fee.amount?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-200 font-semibold">
                <td className="px-2 py-2 text-center border border-gray-300" colSpan={2}>
                  Total
                </td>
                <td className="px-2 py-2 text-center border border-gray-300">
                  ₹{installmentDetails.total?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default FeesStructure;
