// Second try WIth API calling
import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
const TicketForDashboard = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <div className="h-full md:h-72">
      <div className="flex flex-row justify-between items-center bg-gray-200 p-1">
        <span className="lg:text-lg sm:text-xs sm:font-semibold text-gray-500">
          Ticket
        </span>
      </div>{" "}
      <div className="text-center flex justify-center items-center relative top-[30%] text-xl text-blue-500 font-medium">
        Today's Appointment
      </div>
    </div>
  );
};

export default TicketForDashboard;
