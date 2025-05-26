// import { useEffect, useState } from "react";
// import axios from "axios";

// const formatAmount = (amount) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 2,
//   }).format(amount);

// function TableFeeCollectForFeependignList() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [accounts, setAccounts] = useState([]);
//   const [selectedAccount, setSelectedAccount] = useState("");
//   const [installments, setInstallments] = useState({});

//   useEffect(() => {
//     fetchAccounts();
//     fetchInstallments();
//   }, []);

//   const fetchAccounts = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) throw new Error("Missing token");

//       const response = await axios.get(`${API_URL}/api/get_bank_accountName`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.data && Array.isArray(response.data.bankAccountName)) {
//         setAccounts(response.data.bankAccountName);
//       } else {
//         throw new Error("Invalid account data format");
//       }
//     } catch (error) {
//       console.error("Error fetching accounts:", error);
//     }
//   };

//   const fetchInstallments = async () => {
//     try {
//       const token = localStorage.getItem("authToken");
//       if (!token) throw new Error("Missing token");

//       const response = await axios.get(`${API_URL}/api/collected_fee_list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (Array.isArray(response.data)) {
//         const grouped = response.data.reduce((acc, curr) => {
//           if (!acc[curr.account]) acc[curr.account] = [];
//           acc[curr.account].push({
//             installment: curr.installment,
//             amount: curr.amount,
//           });
//           return acc;
//         }, {});
//         setInstallments(grouped);
//       } else {
//         throw new Error("Invalid installments data format");
//       }
//     } catch (error) {
//       console.error("Error fetching installments:", error);
//     }
//   };

//   const filteredInstallments = selectedAccount
//     ? installments[selectedAccount] || []
//     : Object.entries(installments).flatMap(([account, data]) =>
//         data.map((installment) => ({ ...installment, account }))
//       );

//   const parseAmount = (amt) => parseFloat(amt.replace(/,/g, "")) || 0;

//   const totalFilteredAmount = filteredInstallments.reduce(
//     (acc, curr) => acc + parseAmount(curr.amount),
//     0
//   );

//   const allInstallments = Object.values(installments).flat();
//   const totalOverallAmount = allInstallments.reduce(
//     (acc, curr) => acc + parseAmount(curr.amount),
//     0
//   );

//   return (
//     <>
//       <div className="container m-0 p-2 ">
//         <div className="header flex justify-end items-center bg-gray-200 rounded-t-lg mb-1 px-2 py-1">
//           {/* <span className="lg:text-lg sm:text-xs font-semibold text-gray-500">
//           Fee-Collection
//         </span> */}

//           <select
//             className="px-2 py-1 text-sm text-gray-700 font-semibold bg-gray-50 border rounded-md"
//             value={selectedAccount}
//             onChange={(e) => setSelectedAccount(e.target.value)}
//           >
//             <option value="">Select Account</option>
//             {accounts.map((account) => (
//               <option key={account.id} value={account.account_name}>
//                 {account.account_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="table-container rounded-lg shadow-md overflow-hidden">
//           {/* Table Header */}
//           <div className="grid grid-cols-3 px-2 text-gray-500 bg-gray-200 border-b border-gray-200 font-bold ">
//             {!selectedAccount && <div>Account</div>}
//             <div
//               className={`${selectedAccount ? "col-start-1" : "text-center"}`}
//             >
//               Installment
//             </div>
//             <div className="text-end">Amount</div>
//           </div>
//           {/* Table Body */}
//           <div className="relative">
//             {/* Scrollable Data List */}
//             {/* <div className="h-38 overflow-y-auto overflow-x-hidden">
//             {filteredInstallments.length === 0 ? (
//               <div className="w-full h-full flex justify-center items-center">
//                 <div className="flex flex-col items-center py-10 animate-bounce">
//                   <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 mb-3">
//                     Oops!
//                   </p>
//                   <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//                     No data available.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               filteredInstallments.map((installment, index) => (
//                 <div
//                   key={`${installment.account}-${installment.installment}-${index}`}
//                   className={`grid grid-cols-3 px-2 py-2 border-b border-gray-200 ${
//                     index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                   }`}
//                 >
//                   {!selectedAccount && (
//                     <div className="text-black/80">{installment.account}</div>
//                   )}
//                   <div
//                     className={`text-black/80 ${
//                       selectedAccount ? "col-start-1" : "text-center"
//                     }`}
//                   >
//                     {installment.installment}
//                   </div>
//                   <div className="text-end text-black/70">
//                     {formatAmount(parseAmount(installment.amount))}
//                   </div>
//                 </div>
//               ))
//             )}
//           </div> */}
//             <div
//               // style={{ maxHeight: "10.5rem" }}
//               className="  overflow-y-auto overflow-x-hidden"
//             >
//               {filteredInstallments.length === 0 ? (
//                 <div className="w-full h-full flex justify-center items-center">
//                   <div className="flex flex-col items-center py-10 animate-bounce">
//                     <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 mb-3">
//                       Oops!
//                     </p>
//                     <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//                       No data available.
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 filteredInstallments.map((installment, index) => (
//                   <div
//                     key={`${installment.account}-${installment.installment}-${index}`}
//                     className={`grid grid-cols-3 px-2 py-2 border-b border-gray-200 ${
//                       index % 2 === 0 ? "bg-white" : "bg-gray-100"
//                     }`}
//                   >
//                     {!selectedAccount && (
//                       <div className="text-black/80">{installment.account}</div>
//                     )}
//                     <div
//                       className={`text-black/80 ${
//                         selectedAccount ? "col-start-1" : "text-center"
//                       }`}
//                     >
//                       {installment.installment}
//                     </div>
//                     <div className="text-end text-black/70">
//                       {formatAmount(parseAmount(installment.amount))}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* ✅ TOTAL AMOUNT SECTION - Outside scroll, aligned below */}
//             {filteredInstallments.length > 0 && (
//               <div className=" bg-yellow-100  grid grid-cols-3 px-2 py-2  border-t border-gray-300 font-semibold text-gray-800">
//                 {!selectedAccount && <div></div>}
//                 <div
//                   className={`${
//                     selectedAccount ? "col-start-1" : "text-center"
//                   }`}
//                 >
//                   Total Amount
//                   {/* Grand Total */}
//                 </div>
//                 <div className="text-end text-blue-600 whitespace-no-wrap">
//                   {selectedAccount
//                     ? formatAmount(totalFilteredAmount)
//                     : formatAmount(totalOverallAmount)}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* ✅ Total Amount */}
//         </div>
//       </div>
//     </>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function TableFeeCollectForFeependignList() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [installments, setInstallments] = useState({});

  useEffect(() => {
    fetchAccounts();
    fetchInstallments();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing token");

      const response = await axios.get(`${API_URL}/api/get_bank_accountName`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.bankAccountName)) {
        setAccounts(response.data.bankAccountName);
      } else {
        throw new Error("Invalid account data format");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchInstallments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing token");

      const response = await axios.get(`${API_URL}/api/collected_fee_list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      } else {
        throw new Error("Invalid installments data format");
      }
    } catch (error) {
      console.error("Error fetching installments:", error);
    }
  };

  const filteredInstallments = selectedAccount
    ? installments[selectedAccount] || []
    : Object.entries(installments).flatMap(([account, data]) =>
        data.map((installment) => ({ ...installment, account }))
      );

  const parseAmount = (amt) => parseFloat(amt.replace(/,/g, "")) || 0;

  const totalFilteredAmount = filteredInstallments.reduce(
    (acc, curr) => acc + parseAmount(curr.amount),
    0
  );

  const allInstallments = Object.values(installments).flat();
  const totalOverallAmount = allInstallments.reduce(
    (acc, curr) => acc + parseAmount(curr.amount),
    0
  );

  return (
    <>
      <div className="container m-0 p-2">
        <div className="flex justify-between items-center bg-gray-100 rounded-t-lg mb-1 px-3 py-2 border border-gray-300">
          <span className="lg:text-lg sm:text-xs font-semibold text-gray-500">
            Fee-Collection
          </span>
          <select
            className="px-3 py-1 text-sm text-gray-700 font-semibold bg-white border border-gray-400 rounded-md shadow-sm"
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

        <div className="border border-gray-300 rounded-b-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-gray-100 text-sm font-semibold text-gray-900 border-b border-gray-400">
            {!selectedAccount && (
              <div className="px-2 py-2 text-center border-r border-gray-300">
                Account
              </div>
            )}
            <div
              className={`px-2 py-2 ${
                selectedAccount ? "col-start-1" : "text-center"
              } border-r border-gray-300`}
            >
              Installment
            </div>
            <div className="px-2 py-2 text-center">Amount</div>
          </div>

          {/* Table Body */}
          <div className="overflow-y-auto max-h-64">
            {filteredInstallments.length === 0 ? (
              <div className="w-full h-full flex justify-center items-center py-8">
                <div className="text-center text-red-600 text-lg font-semibold">
                  Oops! No data found...
                </div>
              </div>
            ) : (
              filteredInstallments.map((installment, index) => (
                <div
                  key={`${installment.account}-${installment.installment}-${index}`}
                  className={`grid grid-cols-3 text-sm border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {!selectedAccount && (
                    <div className="px-2 py-2 text-center text-gray-800 border-r border-gray-100">
                      {installment.account}
                    </div>
                  )}
                  <div
                    className={`px-2 py-2 text-gray-800 ${
                      selectedAccount ? "col-start-1" : "text-center"
                    } border-r border-gray-100`}
                  >
                    {installment.installment}
                  </div>
                  <div className="px-2 py-2 text-right text-gray-700">
                    {formatAmount(parseAmount(installment.amount))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total Row */}
          {filteredInstallments.length > 0 && (
            <div className="grid grid-cols-3 bg-yellow-100 border-t border-gray-300 text-sm font-semibold text-gray-800">
              {!selectedAccount && (
                <div className="px-2 py-2 border-r border-gray-300"></div>
              )}
              <div
                className={`px-2 py-2 ${
                  selectedAccount ? "col-start-1" : "text-center"
                } border-r border-gray-300`}
              >
                Total Amount
              </div>
              <div className="px-2 py-2 text-right text-blue-600">
                {selectedAccount
                  ? formatAmount(totalFilteredAmount)
                  : formatAmount(totalOverallAmount)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TableFeeCollectForFeependignList;
