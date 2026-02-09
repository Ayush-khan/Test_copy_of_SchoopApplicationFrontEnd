import Select from "react-select";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faRightToBracket } from "@fortawesome/free-solid-svg-icons";

function ImpersonateListing() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 
    const [isImpersonating, setIsImpersonating] = useState(false); // For impersonation
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 10;
    const previousPageRef = useRef(0);
    const prevSearchTermRef = useRef("");
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

    // Fetch roles only once
    useEffect(() => {
        const fetchRoles = async () => {
            const token = getAuthToken();
            if (!token) return;

            try {
                const response = await axios.get(
                    `${API_URL}/api/impersonate/get_roles`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRoles(response.data.data);
            } catch (error) {
                console.error("Error fetching roles:", error);
                toast.error("Failed to load roles");
            }
        };

        fetchRoles();
    }, [API_URL, getAuthToken]);

    // Single unified fetch function
    const fetchUsers = useCallback(async (roleId) => {
        const token = getAuthToken();
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/api/impersonate/get_users?role_id=${roleId || ''}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL, getAuthToken]);

    // Fetch users when role changes
    useEffect(() => {
        fetchUsers(selectedRole?.value);
    }, [selectedRole, fetchUsers]);

    // Memoized filtered users (derived state)
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        
        const searchLower = searchTerm.toLowerCase().trim();
        return users.filter(user => 
            user?.name?.toLowerCase().trim().includes(searchLower)
        );
    }, [users, searchTerm]);

    // Memoized page count
    const pageCount = useMemo(() => 
        Math.ceil(filteredUsers.length / pageSize),
        [filteredUsers.length, pageSize]
    );

    // Memoized displayed users
    const displayedUsers = useMemo(() => 
        filteredUsers.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        ),
        [filteredUsers, currentPage, pageSize]
    );

    // Handle search term changes with page reset
    useEffect(() => {
        const trimmedSearch = searchTerm.trim();
        const prevSearch = prevSearchTermRef.current;

        if (trimmedSearch && !prevSearch) {
            previousPageRef.current = currentPage;
            setCurrentPage(0);
        } else if (!trimmedSearch && prevSearch) {
            setCurrentPage(previousPageRef.current);
        }

        prevSearchTermRef.current = trimmedSearch;
    }, [searchTerm, currentPage]);

    // Impersonate handler with proper error handling
    const handleImpersonate = useCallback(async (userId) => {
        const token = getAuthToken();
        if (!token) return;

        setIsImpersonating(true);
        toast.info(`Impersonating user...`);

        try {
            const response = await axios.post(
                `${API_URL}/api/impersonate`,
                { user_id: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { success, token: newToken } = response.data;

            if (!success || !newToken) {
                toast.error("Impersonation failed");
                return;
            }

            localStorage.setItem("authTokenOld", token);
            localStorage.setItem("authToken", newToken);
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Impersonation error:", error);
            toast.error(error.response?.data?.message || 'Impersonation failed');
        } finally {
            setIsImpersonating(false);
        }
    }, [API_URL, getAuthToken]);

    const handlePageClick = useCallback((data) => {
        setCurrentPage(data.selected);
    }, []);

    // Utility function
    const toTitleCase = useCallback((name = "") =>
        name.toLowerCase().trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        []
    );

    // Role options memoized
    const roleOptions = useMemo(() => 
        roles.map(role => ({
            value: role.role_id,
            label: role.name,
        })),
        [roles]
    );

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
                    <div className=" card-header mb-4 flex justify-between items-center ">
                        <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                            List of Users
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
                        <div className="w-full md:w-[99%] flex flex-col md:flex-row justify-between items-start md:items-center mt-0 md:mt-2">
                            <div className="w-full flex flex-col md:flex-row gap-y-3 md:gap-y-0 md:gap-x-12">
                                <div className="w-full md:w-[40%] flex flex-col md:flex-row gap-y-2 md:gap-y-0 md:gap-x-2 mb-1 md:my-2">
                                    
                                    {/* Label */}
                                    <label
                                        htmlFor="studentSelect"
                                        className="
                                            w-full md:w-[25%]
                                            text-md
                                            pl-0 md:pl-5
                                            mt-0 md:mt-0
                                            flex
                                            items-center
                                            justify-start md:justify-end
                                            h-full
                                        "
                                        >
                                        Role <span className="text-red-500 ml-1">*</span>
                                    </label>

                                    {/* Select */}
                                    <div className="w-full md:w-[65%]">
                                    <Select
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        id="studentSelect"
                                        value={selectedRole}
                                        onChange={(option) => setSelectedRole(option)}
                                        options={roleOptions}
                                        placeholder="Select a role"
                                        isSearchable
                                        isClearable
                                        className="text-sm"
                                        isDisabled={isLoading}
                                    />
                                    </div>

                                    {/* Input */}
                                    <input
                                    type="text"
                                    className="form-control w-full md:w-56"
                                    placeholder="Search"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body w-full">
                        <div className="h-96 lg:h-96 overflow-y-scroll lg:overflow-x-hidden w-full  md:w-[100%] mx-auto">
                            <table className="min-w-full leading-normal table-fixed">
                                <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-2 w-full md:w-[4%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                        Sr. No
                                    </th>
                                    <th className="px-2 w-full md:w-[6%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                        Full Name
                                    </th>
                                    <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                        User id
                                    </th>
                                    <th className="px-2 w-full md:w-[15%] text-center lg:px-3 py-2 border border-gray-950 text-sm font-semibold text-gray-900 tracking-wider">
                                        Action
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                    {isLoading? (
                                        <tr>
                                            <td colSpan={4}>
                                                <div className="absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                                    <div className=" text-center text-xl text-blue-700">
                                                        Loading...
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : displayedUsers.length ? (
                                        displayedUsers.map((user, index) => (
                                        <tr
                                            key={user.user_id}
                                            className="text-sm"
                                        >
                                            <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                                {currentPage * pageSize + index + 1}
                                            </td>
                                            <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                                {toTitleCase(user.name)}
                                            </td>
                                            <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm break-words">
                                                {user.user_id}
                                            </td>
                                            <td className="px-2 text-center lg:px-3 py-2 border border-gray-950 text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => handleImpersonate(user.user_id)}
                                                    disabled={isImpersonating}
                                                    className="
                                                        inline-flex items-center gap-2
                                                        rounded-md border border-blue-200
                                                        px-3 py-1.5 text-sm font-medium
                                                        text-blue-600
                                                        hover:bg-blue-50 hover:text-blue-700
                                                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                                                        transition
                                                    "
                                                >
                                                    <FontAwesomeIcon icon={faRightToBracket} className="text-xs" />
                                                    <span>Impersonate</span>
                                                </button>
                                            </td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4}>
                                                <div className="absolute left-[1%] w-[100%]  text-center flex justify-center items-center mt-14">
                                                    <div className=" text-center text-xl text-red-700">
                                                        No user found for the selected role!
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className=" flex justify-center pt-2 -mb-3">
                            <ReactPaginate
                                previousLabel={"Previous"}
                                nextLabel={"Next"}
                                breakLabel={"..."}
                                breakClassName={"page-item"}
                                breakLinkClassName={"page-link"}
                                pageCount={pageCount}
                                marginPagesDisplayed={1}
                                pageRangeDisplayed={1}
                                onPageChange={handlePageClick}
                                containerClassName={"pagination"}
                                pageClassName={"page-item"}
                                pageLinkClassName={"page-link"}
                                previousClassName={"page-item"}
                                previousLinkClassName={"page-link"}
                                nextClassName={"page-item"}
                                nextLinkClassName={"page-link"}
                                activeClassName={"active"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ImpersonateListing;
