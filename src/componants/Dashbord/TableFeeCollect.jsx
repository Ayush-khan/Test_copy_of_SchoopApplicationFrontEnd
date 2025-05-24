// import { useEffect, useState } from "react";
// import axios from "axios";

// function ListFinal() {
//   const API_URL = import.meta.env.VITE_API_URL;
//   const [accounts, setAccounts] = useState([]);
//   const [selectedAccount, setSelectedAccount] = useState("");
//   const [installments, setInstallments] = useState({}); // grouped by account

//   // ✅ Fetch Account Names
//   useEffect(() => {
//     fetchAccounts();
//     fetchInstallments();
//   }, []);

//   const fetchAccounts = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       if (!token) {
//         throw new Error("Missing token or academic year");
//       }

//       const response = await axios.get(`${API_URL}/api/get_bank_accountName`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       console.log("Account API Response:", response.data);

//       if (response.data && Array.isArray(response.data.bankAccountName)) {
//         setAccounts(response.data.bankAccountName);
//         console.log("Set Accounts:", response.data.bankAccountName);
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

//       if (!token) {
//         throw new Error("Missing token or academic year");
//       }

//       const response = await axios.get(`${API_URL}/api/collected_fee_list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       console.log("Installments API Response:", response.data);

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
//         console.log("Grouped Installments:", grouped);
//       } else {
//         throw new Error("Invalid installments data format");
//       }
//     } catch (error) {
//       console.error("Error fetching installments:", error);
//     }
//   };

//   // ✅ Filter logic
//   const filteredInstallments = selectedAccount
//     ? installments[selectedAccount] || []
//     : Object.entries(installments).flatMap(([account, data]) =>
//         data.map((installment) => ({ ...installment, account }))
//       );

//   return (
//     <div className="container m-0 p-2 lg:h-[18.2rem]">
//       <div className="header flex justify-between items-center bg-gray-200 rounded-t-lg mb-1 ">
//         <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500 mb-1">
//           Fee-Collection
//         </span>

//         <select
//           className="px-1 text-sm text-gray-700 font-semibold hover:cursor-pointer bg-gray-50 mb-1"
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

//       {/* Optional: Show raw account data for debugging */}
//       {/* <pre className="text-xs">{JSON.stringify(accounts, null, 2)}</pre> */}

//       <div className="table-container rounded-lg shadow-md">
//         <div className="flex flex-row w-full justify-between px-2 text-gray-500 bg-gray-200 border-b border-gray-200">
//           {!selectedAccount && <div className="cell font-bold">Account</div>}
//           <div className="cell font-bold">Installment</div>
//           <div className="cell font-bold text-end">Amount</div>
//         </div>

//         <div className="table-body h-52 overflow-y-scroll overflow-x-hidden">
//           {filteredInstallments.length === 0 ? (
//             <div className="w-full h-full flex justify-center items-center">
//               <div className="flex flex-col items-center justify-center text-center py-10 animate-bounce">
//                 <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
//                   Oops!
//                 </p>
//                 <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
//                   No data available.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             filteredInstallments.map((installment, index) => (
//               <div
//                 key={`${installment.account}-${installment.installment}-${index}`}
//                 className={`flex w-full px-2  justify-between py-1 border-b border-gray-200 ${
//                   index % 2 !== 0 ? "bg-gray-200" : "bg-white"
//                 }`}
//               >
//                 {!selectedAccount && (
//                   <div className="cell w-1/3 text-black/80 tracking-wide">
//                     {installment.account}
//                   </div>
//                 )}
//                 <div
//                   className={`cell w-1/3 text-black/80 tracking-wide ${
//                     selectedAccount ? "text-start ml-1" : "text-center"
//                   }`}
//                 >
//                   {`${installment.installment}`}
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
// This is try up for total
import { useEffect, useState } from "react";
import axios from "axios";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function ListFinal() {
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
    <div className="container m-0 p-2 lg:h-[18.2rem]">
      <div className="header flex justify-between items-center bg-gray-200 rounded-t-lg mb-1 px-2 py-1">
        <span className="lg:text-lg sm:text-xs font-semibold text-gray-500">
          Fee-Collection
        </span>

        <select
          className="px-2 py-1 text-sm text-gray-700 font-semibold bg-gray-50 border rounded-md"
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

      <div className="table-container rounded-lg shadow-md overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 px-2 text-gray-500 bg-gray-200 border-b border-gray-200 font-bold ">
          {!selectedAccount && <div>Account</div>}
          <div className={`${selectedAccount ? "col-start-1" : "text-center"}`}>
            Installment
          </div>
          <div className="text-end">Amount</div>
        </div>
        {/* Table Body */}
        <div className="relative">
          {/* Scrollable Data List */}
          {/* <div className="h-38 overflow-y-auto overflow-x-hidden">
            {filteredInstallments.length === 0 ? (
              <div className="w-full h-full flex justify-center items-center">
                <div className="flex flex-col items-center py-10 animate-bounce">
                  <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 mb-3">
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
                  className={`grid grid-cols-3 px-2 py-2 border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  {!selectedAccount && (
                    <div className="text-black/80">{installment.account}</div>
                  )}
                  <div
                    className={`text-black/80 ${
                      selectedAccount ? "col-start-1" : "text-center"
                    }`}
                  >
                    {installment.installment}
                  </div>
                  <div className="text-end text-black/70">
                    {formatAmount(parseAmount(installment.amount))}
                  </div>
                </div>
              ))
            )}
          </div> */}
          <div
            style={{ maxHeight: "10.5rem" }}
            className="  overflow-y-auto overflow-x-hidden"
          >
            {filteredInstallments.length === 0 ? (
              <div className="w-full h-full flex justify-center items-center">
                <div className="flex flex-col items-center py-10 animate-bounce">
                  <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 mb-3">
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
                  className={`grid grid-cols-3 px-2 py-2 border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }`}
                >
                  {!selectedAccount && (
                    <div className="text-black/80">{installment.account}</div>
                  )}
                  <div
                    className={`text-black/80 ${
                      selectedAccount ? "col-start-1" : "text-center"
                    }`}
                  >
                    {installment.installment}
                  </div>
                  <div className="text-end text-black/70">
                    {formatAmount(parseAmount(installment.amount))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ✅ TOTAL AMOUNT SECTION - Outside scroll, aligned below */}
          {filteredInstallments.length > 0 && (
            <div className=" bg-yellow-100  grid grid-cols-3 px-2 py-2  border-t border-gray-300 font-semibold text-gray-800">
              {!selectedAccount && <div></div>}
              <div
                className={`${selectedAccount ? "col-start-1" : "text-center"}`}
              >
                Total Amount
                {/* Grand Total */}
              </div>
              <div className="text-end text-blue-600 whitespace-no-wrap">
                {selectedAccount
                  ? formatAmount(totalFilteredAmount)
                  : formatAmount(totalOverallAmount)}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Total Amount */}
      </div>
    </div>
  );
}

export default ListFinal;
