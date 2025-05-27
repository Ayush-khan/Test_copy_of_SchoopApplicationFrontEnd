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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchInstallments();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchInstallments = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
          <div className="grid grid-cols-4 bg-gray-100 text-sm font-semibold text-gray-900 border-b border-gray-400">
            <div className=" w-full md:w-[50%] py-2 border-r border-gray-300 text-center">
              Sr No.
            </div>
            <div className="py-2 border-r border-gray-300 text-start">
              Account
            </div>
            <div className="py-2 border-r border-gray-300 text-center">
              Installment
            </div>
            <div className="py-2 text-center">Amount</div>
          </div>

          {/* Table Body */}
          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center py-8">
                <div className="text-center text-blue-600 text-lg font-semibold">
                  Please wait while data is loading...
                </div>
              </div>
            ) : filteredInstallments.length ? (
              filteredInstallments.map((installment, index) => (
                <div
                  key={`${installment.account}-${installment.installment}-${index}`}
                  className={`grid grid-cols-4 text-sm border-b border-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="w-full md:w-[50%] px-2 py-2 border-r border-gray-100 text-center text-gray-700">
                    {index + 1}
                  </div>
                  <div className="px-2 py-2 border-r border-gray-100 text-start text-gray-800">
                    {selectedAccount ? selectedAccount : installment.account}
                  </div>
                  <div className="px-2 py-2 border-r border-gray-100 text-center text-gray-800">
                    {installment.installment}
                  </div>
                  <div className="px-2 py-2 text-right text-gray-700">
                    {formatAmount(parseAmount(installment.amount))}
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex justify-center items-center py-8">
                <div className="text-center text-red-600 text-lg font-semibold">
                  Oops! No data found...
                </div>
              </div>
            )}
          </div>

          {/* Total Row */}
          {filteredInstallments.length > 0 && (
            <div className="grid grid-cols-4 bg-yellow-100 border-t border-gray-300 text-sm font-semibold text-gray-800">
              <div className="px-2 py-2 border-r border-gray-300"></div>
              <div className="px-2 py-2 border-r border-gray-300"></div>
              <div className="px-2 py-2 border-r border-gray-300 text-center">
                Total Amount
              </div>
              <div className="px-2 py-2 text-right text-blue-600">
                {formatAmount(
                  selectedAccount ? totalFilteredAmount : totalOverallAmount
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TableFeeCollectForFeependignList;
