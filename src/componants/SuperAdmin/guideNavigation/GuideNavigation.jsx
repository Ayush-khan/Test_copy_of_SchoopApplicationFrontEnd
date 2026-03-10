import Select from "react-select";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faPlus, faRightToBracket } from "@fortawesome/free-solid-svg-icons";

function GuideNavigation() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    // Get token once with error handling
    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return null;
        }
        return token;
    }, [navigate]);

    return (
        <>
            <div
                className="
                transition-all duration-500
                w-[95%] sm:w-[90%] md:w-[80%]
                mx-auto
                p-4 sm:p-3 md:p-4
                mt-6 sm:mt-4 md:mt-0
                "
            >
                <ToastContainer />
                <div className="card rounded-md ">
                    <div className=" card-headerflex justify-between items-center ">
                        <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                            List of created helpers
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
                    <div className="w-full flex justify-center flex-col md:flex-row gap-x-1">
                        <div className="w-full md:w-[99%] flex flex-col md:flex-row justify-between items-start md:items-center mt-0">
                            <div className="w-full flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:gap-x-12">
                                <div className="w-full flex justify-end flex-col md:flex-row gap-y-2 md:gap-y-0 md:gap-x-2 mb-1 md:my-2">
                                    <button
                                        className="btn btn-primary btn-sm md:h-9 text-xs md:text-sm"
                                        onClick={() => navigate('/guideNavigations/create')}
                                    >
                                        <FontAwesomeIcon
                                        icon={faPlus}
                                        style={{ marginRight: "5px" }}
                                        />
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GuideNavigation;
