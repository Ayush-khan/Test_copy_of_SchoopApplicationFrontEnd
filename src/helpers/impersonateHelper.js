import { toast } from "react-toastify";

export const handleApiError = (error, options = {}) => {
  const {
    defaultMessage = "Server error. Please try again later.",
    conflictMessage = "Internal server error",
  } = options;

  console.error("API Error:", error);

  const status = error?.response?.status;
  const data = error?.response?.data;

  // 🔐 Impersonation Read Only Check
  if (data?.error_code === "IMPERSONATION_READ_ONLY") {
    toast.error("Action blocked.");
    return;
  }

  // ⚠️ 409 Conflict
  if (status === 409) {
    toast.error(data?.message || conflictMessage);
    return;
  }

  // Generic fallback
  toast.error(data?.message || defaultMessage);
};