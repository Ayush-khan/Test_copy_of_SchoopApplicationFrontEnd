// // 6th
// import { useState, useEffect } from "react";
// import axios from "axios";

// function ListFinal() {
//   const API_URL = import.meta.env.VITE_API_URL; // URL for host
//   const [accounts, setAccounts] = useState([]);
//   const [selectedAccount, setSelectedAccount] = useState("");
//   const [installments, setInstallments] = useState([]);

//   useEffect(() => {
//     const fetchAccounts = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const academicYr = localStorage.getItem("academicYear");
//         console.log("academic year", academicYr);
//         console.log("token is", token);

//         if (!token) {
//           throw new Error("No authentication token or academic year found");
//         }

//         const response = await axios.get(
//           `${API_URL}/api/get_bank_accountName`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "X-Academic-Year": academicYr,
//             },
//           }
//         );

//         if (response.data && Array.isArray(response.data.bankAccountName)) {
//           setAccounts(response.data.bankAccountName);
//         } else {
//           throw new Error("Invalid data format");
//         }
//       } catch (error) {
//         console.error("Error fetching accounts:", error);
//       }
//     };

//     fetchAccounts();
//   }, []);

//   useEffect(() => {
//     const fetchInstallments = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         const academicYr = localStorage.getItem("academicYear");
//         console.log("academic year", academicYr);
//         console.log("token is", token);

//         if (!token) {
//           throw new Error("No authentication token or academic year found");
//         }

//         const response = await axios.get(`${API_URL}/api/collected_fee_list`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "X-Academic-Year": academicYr,
//           },
//         });

//         if (response.data && typeof response.data === "object") {
//           setInstallments(response.data);
//         } else {
//           throw new Error("Invalid data format");
//         }
//       } catch (error) {
//         console.error("Error fetching installments:", error);
//       }
//     };

//     fetchInstallments();
//   }, []);

//   const filteredInstallments = selectedAccount
//     ? installments[selectedAccount] || []
//     : Object.entries(installments).flatMap(([account, data]) =>
//         data.map((installment) => ({ ...installment, account }))
//       );

//   return (
//     <div className="container m-0  p-2    lg:h-[18.2rem]">
//       <div className="header flex justify-between items-center bg-gray-200 rounded-t-lg mb-1 ">
//         <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500 mb-1">
//           Fee-Collection
//         </span>

//         <select
//           className="  px-1 text-sm text-gray-700 font-semibold hover:cursor-pointer bg-gray-50 mb-1"
//           value={selectedAccount}
//           onChange={(e) => setSelectedAccount(e.target.value)}
//         >
//           <option value="">Select Account</option>
//           {accounts.map((account) => (
//             <option key={account.id} value={account.account_name}>
//               {account.account_name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="table-container rounded-lg shadow-md">
//         <div className="flex flex-row w-full justify-between px-2 text-gray-500 bg-gray-200 border-b border-gray-200">
//           {!selectedAccount && <div className="cell font-bold">Account</div>}
//           <div className="cell font-bold ">Installment</div>
//           <div className="cell font-bold text-end">Amount</div>
//         </div>
//         {/* <div className="table-body h-52 overflow-y-scroll overflow-x-hidden">
//           {filteredInstallments.map((installment, index) => (
//             <div
//               key={`${installment.account}-${installment.installment}`}
//               className={`flex w-full px-2 justify-between py-1 border-b border-gray-200 ${
//                 index % 2 !== 0 ? "bg-gray-200" : "bg-white"
//               }`}
//             >
//               {!selectedAccount && (
//                 <div className="cell w-1/3 text-black/80 tracking-wide">
//                   {installment.account}
//                 </div>
//               )}
//               <div className="cell w-1/3 text-black/80 tracking-wide pl-2">
//                 {`installment-${installment.installment}`}
//               </div>
//               <div className="cell w-1/3 text-end text-black/70 tracking-wide">
//                 {installment.amount}
//               </div>
//             </div>
//           ))}
//         </div> */}
//         <div className="table-body h-52 overflow-y-scroll overflow-x-hidden">
//           {filteredInstallments.length === 0 ? (
//             <div className="w-full h-full flex justify-center items-center">
//               <div className="flex flex-col items-center justify-center text-center py-10 animate-bounce">
//                 <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
//                   Oops!{" "}
//                 </p>
//                 <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//                   No data available.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             filteredInstallments.map((installment, index) => (
//               <div
//                 key={`${installment.account}-${installment.installment}`}
//                 className={`flex w-full px-2 justify-between py-1 border-b border-gray-200 ${
//                   index % 2 !== 0 ? "bg-gray-200" : "bg-white"
//                 }`}
//               >
//                 {!selectedAccount && (
//                   <div className="cell w-1/3 text-black/80 tracking-wide">
//                     {installment.account}
//                   </div>
//                 )}
//                 <div className="cell w-1/3 text-black/80 tracking-wide pl-2">
//                   {`installment-${installment.installment}`}
//                 </div>
//                 <div className="cell w-1/3 text-end text-black/70 tracking-wide">
//                   {installment.amount}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ListFinal;
import React, { useEffect, useState } from "react";
import axios from "axios";

function ListFinal() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [installments, setInstallments] = useState({}); // grouped by account

  // ✅ Fetch Account Names
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const academicYr = localStorage.getItem("academicYear");

        if (!token) {
          throw new Error("Missing token or academic year");
        }

        const response = await axios.get(
          `${API_URL}/api/get_bank_accountName`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Academic-Year": academicYr,
            },
          }
        );

        console.log("Account API Response:", response.data);

        if (response.data && Array.isArray(response.data.bankAccountName)) {
          setAccounts(response.data.bankAccountName);
          console.log("Set Accounts:", response.data.bankAccountName);
        } else {
          throw new Error("Invalid account data format");
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  // ✅ Fetch and group Installments
  useEffect(() => {
    const fetchInstallments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const academicYr = localStorage.getItem("academicYear");

        if (!token) {
          throw new Error("Missing token or academic year");
        }

        const response = await axios.get(`${API_URL}/api/collected_fee_list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Academic-Year": academicYr,
          },
        });

        console.log("Installments API Response:", response.data);

        if (Array.isArray(response.data)) {
          const grouped = response.data.reduce((acc, curr) => {
            if (!acc[curr.account]) acc[curr.account] = [];
            acc[curr.account].push({
              installment: curr.installment,
              amount: curr.amount,
            });
            return acc;
          }, {});
          setInstallments(grouped);
          console.log("Grouped Installments:", grouped);
        } else {
          throw new Error("Invalid installments data format");
        }
      } catch (error) {
        console.error("Error fetching installments:", error);
      }
    };

    fetchInstallments();
  }, []);

  // ✅ Filter logic
  const filteredInstallments = selectedAccount
    ? installments[selectedAccount] || []
    : Object.entries(installments).flatMap(([account, data]) =>
        data.map((installment) => ({ ...installment, account }))
      );

  return (
    <div className="container m-0 p-2 lg:h-[18.2rem]">
      <div className="header flex justify-between items-center bg-gray-200 rounded-t-lg mb-1 ">
        <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500 mb-1">
          Fee-Collection
        </span>

        <select
          className="px-1 text-sm text-gray-700 font-semibold hover:cursor-pointer bg-gray-50 mb-1"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          <option value="">Select Account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.account_name}>
              {account.account_name}
            </option>
          ))}
        </select>
      </div>

      {/* Optional: Show raw account data for debugging */}
      {/* <pre className="text-xs">{JSON.stringify(accounts, null, 2)}</pre> */}

      <div className="table-container rounded-lg shadow-md">
        <div className="flex flex-row w-full justify-between px-2 text-gray-500 bg-gray-200 border-b border-gray-200">
          {!selectedAccount && <div className="cell font-bold">Account</div>}
          <div className="cell font-bold">Installment</div>
          <div className="cell font-bold text-end">Amount</div>
        </div>

        <div className="table-body h-52 overflow-y-scroll overflow-x-hidden">
          {filteredInstallments.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center">
              <div className="flex flex-col items-center justify-center text-center py-10 animate-bounce">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!
                </p>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  No data available.
                </p>
              </div>
            </div>
          ) : (
            filteredInstallments.map((installment, index) => (
              <div
                key={`${installment.account}-${installment.installment}-${index}`}
                className={`flex w-full px-2 justify-between py-1 border-b border-gray-200 ${
                  index % 2 !== 0 ? "bg-gray-200" : "bg-white"
                }`}
              >
                {!selectedAccount && (
                  <div className="cell w-1/3 text-black/80 tracking-wide">
                    {installment.account}
                  </div>
                )}
                <div className="cell w-1/3 text-black/80 tracking-wide pl-2">
                  {`Installment-${installment.installment}`}
                </div>
                <div className="cell w-1/3 text-end text-black/70 tracking-wide">
                  {installment.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ListFinal;
