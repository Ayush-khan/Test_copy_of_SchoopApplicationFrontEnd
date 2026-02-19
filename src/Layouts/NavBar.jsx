// working well with backend 5 modules comes from top with control + M sortcut with select menu and all thins working well just hide give a time for it.
import { useEffect, useRef, useState } from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { LiaEdit } from "react-icons/lia";
import { BiReset } from "react-icons/bi";
import "./NabarstyleBootstrap.css";
import styles from "../CSS/Navbar.module.css";
import { LuSchool } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import Sidebar from "./Sidebar";
import "./NavbarCss.css";
import AdminNavBar from "./AdminNavBar";
import { toast } from "react-toastify";
import "./styles.css";
import Select from "react-select";
import { RxCross1 } from "react-icons/rx";

function NavBar() {
  const API_URL = import.meta.env.VITE_API_URL; //thsis is test url
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState([]);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState({});
  const [isFocused, setIsFocused] = useState(false);
  // const [inputValueGR, setInputValueGR] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  // const [sessionData, setsessionData] = useState({});
  const [sessionData, setSessionData] = useState({});
  const [userProfileName, setuserProfilName] = useState("");
  const [inputValueGR, setInputValueGR] = useState("");
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState("");
  const [navItems, setNavItems] = useState([]);
  const [roleId, setRoleId] = useState(""); // Add roleId state
  const childItemRef = useRef(null);
  const [menuOptions, setMenuOptions] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isSidebar, setIsSidebar] = useState(false);
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userIdset, setUserIdset] = useState("");

  function getCurrentDate() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const monthIndex = today.getMonth();
    const year = String(today.getFullYear()).slice();

    const monthName = months[monthIndex];

    return `${day} ${monthName} ${year}`;
  }
  const reloadAndRedirect = () => {
    localStorage.setItem("shouldRedirectToDashboard", "true");
    window.location.reload();
  };

  useEffect(() => {
    const handleShortcut = (e) => {
      // ✅ Ctrl + M to focus "Search Menu"
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault(); // stop browser default
        if (selectRef.current) {
          // Focus React-Select search input
          selectRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const [sessionRes, acadRes, navRes, dropdownRes] = await Promise.all([
          axios.get(`${API_URL}/api/sessionData`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/getAcademicYear`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/navmenulisttest`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/get_navleafmenus`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const sdata = sessionRes.data;
        const school = sdata?.custom_claims?.school_name;
        if (school) {
          setSchoolName(school);
          document.title = school;
        }

        setSessionData(sdata);
        setSelectedYear(sdata?.custom_claims?.academic_year);
        setRoleId(sdata.user.role_id);

        localStorage.setItem(
          "academic_yr_from",
          sdata?.custom_claims?.settings?.academic_yr_from
        );
        localStorage.setItem(
          "academic_yr_to",
          sdata?.custom_claims?.settings?.academic_yr_to
        );

        setAcademicYear(acadRes.data.academic_years);
        setNavItems(navRes.data);

        // NEW: Set options for dropdown from /navlistingofMenusdropdown
        const formattedMenuOptions = dropdownRes?.data?.data?.map((item) => ({
          value: item.url,
          label: item.name,
        }));
        setMenuOptions(formattedMenuOptions); // this state powers the Select dropdown
      } catch (err) {
        const errMsg = err.response?.data?.message;
        if (errMsg === "Token has expired") {
          localStorage.removeItem("authToken");
          navigate("/");
          return;
        }
        console.error("Error in fetchData:", err);
      }
    };

    fetchData();
  }, []);

  const handleMenuSelect = (selectedOption) => {
    setSelectedMenu(selectedOption);
    if (selectedOption) {
      navigate(`/${selectedOption.value}`);
    }
  };
  const updateFrequentTabs = async (menu) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await axios.put(
        `${API_URL}/api/update_frequenttabs`,
        {
          menu_id: menu.menu_id,
          name: menu.name,
          url: menu.url,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Frequent tab updated:", menu.name);

      // Trigger sidebar refresh by updating a state
      setSidebarRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating frequent tab:", error);
    }
  };

  useEffect(() => {
    const shouldRedirect = localStorage.getItem("shouldRedirectToDashboard");
    if (shouldRedirect === "true") {
      localStorage.removeItem("shouldRedirectToDashboard"); // flag hata do
      navigate("/dashboard"); // dashboard pe redirect karo
    }
  }, [navigate]);

  const handleSelect = async (eventKey) => {
    setSelectedYear(eventKey);

    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      // toast.error("Authentication token not found Please login again");
      navigate("/"); // 👈 Redirect to login
      return; // 👈
    }
    // navigate("/dashboard");
    try {
      const response = await axios.post(
        `${API_URL}/api/update_academic_year`,
        {
          academic_year: eventKey,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("shouldRedirectToDashboard", "true");
      window.location.reload();
      // navigate("/dashboard?reload=true");
    } catch (error) {
      console.error("Error updating academic year:", error);
    }
  };
  // Take user name so call user prpofile api
  useEffect(() => {
    const fetcUSerProfilehData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/"); // 👈 Redirect to login
        return; // 👈
      }
      // console.log("jfdshfoisafhaios");
      try {
        const response = await axios.get(`${API_URL}/api/editprofile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log("the userporfile__________", response.data);
        const staff = response.data.user?.get_teacher;
        setuserProfilName(staff?.name);
        console.log(
          "the userupdate profile inside the navbar compoenent",
          staff
        );
        const errorMsg = response?.data?.message;
        // Handle expired token
        console.log("tokeneeee error--->", errorMsg, response?.data?.message);
        if (errorMsg === "Token has expired") {
          // toast.error("Session expired. Please login again.");
          localStorage.removeItem("authToken"); // Optional: clear old token
          navigate("/"); // Redirect to login
          return;
        }
      } catch (error) {
        // toast.error(error.response.data.message);
        console.error(
          "Error fetching profile data inside navbar component:",
          error
        );

        // working well code
        const errorMsg = error.response?.data?.message;
        // Handle expired token
        if (errorMsg === "Token has expired") {
          // toast.error("Session expired. Please login again.");
          localStorage.removeItem("authToken"); // Optional: clear old token
          navigate("/"); // Redirect to login
          return;
        }

        // Other error handling
        // toast.error(errorMsg || "Something went wrong.");
        console.error("Error fetching profile:", error);
      }
    };

    fetcUSerProfilehData();
  }, [API_URL]);

  // for GR number setup
  // Function to handle search based on GR number
  const handleSearch = async () => {
    console.log("GR Number Entered:", inputValueGR); // Debugging

    if (!inputValueGR) {
      toast.error("Please enter a GR number!");
      console.log("Error: Empty GR Number"); // Debugging
      return;
    }

    // Check if inputValueGR contains only digits
    if (!/^\d+$/.test(inputValueGR)) {
      toast.error("Invalid GR number! Please enter a valid numeric value.");
      console.log("Error: Invalid GR Number Format"); // Debugging
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/student_by_reg_no/${inputValueGR}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const studentList = response?.data?.student || [];
      console.log("Student List:", studentList); // Debugging

      if (studentList.length === 0) {
        // alert("Not students found with tis gr no");
        toast.error("No student found with this GR number.");
        console.log("Error: No student found"); // Debugging
      } else {
        navigate(`/StudentSearchUsingGRN`, {
          state: { studentData: studentList[0] },
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error fetching student details."
      );
      console.log("API Error:", error?.response?.data?.message); // Debugging
    } finally {
      setLoading(false);
    }
  };

  // Function to handle keypress (Enter) in the input field
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Function to handle the view of student details
  const handleView = (student) => {
    navigate(`/student/view/${student.student_id}`, {
      state: { student: student },
    });
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Logout API
      await axios.post(
        `${API_URL}/api/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("authToken");
      localStorage.removeItem("academicYear");
      localStorage.removeItem("user");
      localStorage.removeItem("settings");
      sessionStorage.removeItem("sessionData");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const handleInputChange = (event) => {
    setInputValueGR(event.target.value);
  };
  const toggleMenuDropdown = (menu) => {
    setMenuDropdownOpen((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const menuRef = useRef(null);
  const selectRef = useRef(null);

  const [openDropdowns, setOpenDropdowns] = useState([]);
  const [clickedDropdowns, setClickedDropdowns] = useState([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false); // 👈 NEW

  const toggleDropdown = (key, level) => {
    const newBranch = [...openDropdowns.slice(0, level)];
    const isAlreadyOpen = openDropdowns[level] === key;

    if (isAlreadyOpen) {
      // Close all at this level and deeper
      setOpenDropdowns(newBranch);
      setClickedDropdowns(newBranch);
    } else {
      const newOpen = [...newBranch, key];
      setOpenDropdowns(newOpen);
      setClickedDropdowns(newOpen);
    }
  };

  const hoverTimeouts = useRef({});

  const handleMouseEnter = (key, level) => {
    if (level === 0) return; // skip hover for top-level
    clearTimeout(hoverTimeouts.current[level]);
    const newPath = [...openDropdowns.slice(0, level), key];
    setOpenDropdowns(newPath);
    setClickedDropdowns([]); // reset clicked branch when hovering
  };

  const handleMouseLeave = (level) => {
    if (level === 0) return; // skip hover-out for top-level
    clearTimeout(hoverTimeouts.current[level]);
    hoverTimeouts.current[level] = setTimeout(() => {
      setOpenDropdowns((prev) =>
        prev.filter((key) => {
          const keyLevel = parseInt(key.split("-")[1]);
          return keyLevel < level || clickedDropdowns.includes(key);
        })
      );
    }, 200);
  };
  useEffect(() => {
    const handleTouchStart = () => setIsTouchDevice(true);
    const handleMouseMove = () => setIsTouchDevice(false);

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenDropdowns([]); // close all menus
        setClickedDropdowns([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const closeAllDropdowns = () => {
    setOpenDropdowns([]);
    setClickedDropdowns([]);
  };

  const renderDynamicMenu = () => {
    const renderDropdownItems = (items, level = 0) => {
      return items.map((item) => {
        const dropdownKey = `${item.menu_id}-${level}`;
        const isOpen = openDropdowns.includes(dropdownKey);

        if (item.sub_menus && item.sub_menus.length > 0) {
          return (
            <NavDropdown
              key={dropdownKey}
              title={<span className="nav-title-topIs">{item.name}</span>}
              className={`custom-nav-dropdown ${isOpen ? "show" : ""}`}
              show={isOpen}
              onClick={(e) => {
                e.preventDefault();
                toggleDropdown(dropdownKey, level);
              }}
              onMouseEnter={
                !isTouchDevice
                  ? () => handleMouseEnter(dropdownKey, level)
                  : undefined
              }
              onMouseLeave={
                !isTouchDevice ? () => handleMouseLeave(level) : undefined
              }
            >
              {item.sub_menus.map((subItem) => {
                const subKey = `${subItem.menu_id}-${level + 1}`;
                const isSubOpen = openDropdowns.includes(subKey);

                if (subItem.sub_menus && subItem.sub_menus.length > 0) {
                  return (
                    <NavDropdown
                      key={subKey}
                      title={
                        <span className="nav-dropdown-sub-new-Dynamic px-2">
                          {subItem?.name}
                        </span>
                      }
                      className={`nav-dropdown-sub-new dropend w-auto ${isSubOpen ? "show" : ""
                        }`}
                      show={isSubOpen}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isSubOpen) {
                          closeAllDropdowns();
                        } else {
                          // setOpenDropdowns([subKey]);
                          setOpenDropdowns([
                            `${item.menu_id}-${level}`,
                            subKey,
                          ]);
                        }
                      }}
                      onMouseEnter={
                        !isTouchDevice
                          ? () => handleMouseEnter(subKey, level + 1)
                          : undefined
                      }
                      onMouseLeave={
                        !isTouchDevice
                          ? () => handleMouseLeave(level + 1)
                          : undefined
                      }
                    >
                      {subItem.sub_menus.map((childItem) => {
                        const childKey = `${childItem.menu_id}-${level + 2}`;
                        const isChildOpen = openDropdowns.includes(childKey);

                        if (childItem.sub_menus?.length > 0) {
                          return (
                            <NavDropdown
                              key={childKey}
                              title={
                                <span
                                  style={{
                                    cursor: "pointer",
                                  }}
                                  className="  custom-hover-styleForchildLeve   px-2"
                                >
                                  {childItem.name}{" "}
                                </span>
                              }
                              // className={`dropend custom-submenuIs ${
                              //   isChildOpen ? "show" : ""
                              // }`}
                              className={`  nav-dropdown-sub-new dropend w-auto ${isSubOpen ? "show" : ""
                                } `}
                              show={isChildOpen}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                if (isChildOpen) {
                                  setOpenDropdowns([]);
                                  setClickedDropdowns([]);
                                } else {
                                  setOpenDropdowns([
                                    ...openDropdowns.slice(0, level + 2),
                                    childKey,
                                  ]);
                                  setClickedDropdowns([
                                    ...openDropdowns.slice(0, level + 2),
                                    childKey,
                                  ]);
                                }
                              }}
                              onMouseEnter={
                                !isTouchDevice
                                  ? () => handleMouseEnter(childKey, level + 2)
                                  : undefined
                              }
                              onMouseLeave={
                                !isTouchDevice
                                  ? () => handleMouseLeave(level + 2)
                                  : undefined
                              }
                            >
                              {childItem.sub_menus.map((grandChildItem) => (
                                <NavDropdown.Item
                                  key={grandChildItem.menu_id}
                                  onClick={() => {
                                    setOpenDropdowns([]);
                                    setClickedDropdowns([]);
                                    updateFrequentTabs(grandChildItem); // Call API
                                    navigate(grandChildItem.url);
                                  }}
                                >
                                  {grandChildItem.name}
                                </NavDropdown.Item>
                              ))}
                            </NavDropdown>
                          );
                        } else {
                          return (
                            <NavDropdown.Item
                              key={childKey}
                              onClick={() => {
                                setOpenDropdowns([]);
                                setClickedDropdowns([]);
                                updateFrequentTabs(childItem);

                                navigate(childItem.url);
                              }}
                              className="hover:bg-gray-100 hover:text-blue-600 text-sm flex flex-row gap-x-2"
                            >
                              {childItem.name}
                            </NavDropdown.Item>
                          );
                        }
                      })}
                      {/* </div> */}
                    </NavDropdown>
                  );
                } else {
                  return (
                    <NavDropdown.Item
                      key={subKey}
                      onClick={() => {
                        setOpenDropdowns([]);
                        setClickedDropdowns([]);
                        updateFrequentTabs(subItem); // Call API
                        navigate(subItem.url);
                      }}

                    // className="hover:bg-gray-100 hover:text-blue-600 text-sm"
                    >
                      {subItem.name}
                    </NavDropdown.Item>
                  );
                }
              })}
            </NavDropdown>
          );
        } else {
          return (
            <>
              {/* // <Nav.Link
            //   key={dropdownKey}
            //   onClick={() => {
            //     closeAllDropdowns();
            //     item.url && navigate(item.url);
            //   }}
            // >
            //   <span className="nav-title-top">{item.name}</span>
            // </Nav.Link> */}
              <Nav.Link
                key={dropdownKey}
                onClick={() => {
                  closeAllDropdowns();

                  // Call API
                  updateFrequentTabs(item);

                  if (item.url) navigate(item.url);
                }}
              >
                <span className="nav-title-top">{item.name}</span>
              </Nav.Link>
            </>
          );
        }
      });
    };

    return (
      <div ref={menuRef} className="flex items-center">
        {renderDropdownItems(navItems)}
      </div>
    );
  };

  const handleResetPassword = () => {
    setShowEditModal(true);
  };

  const handleUserIdChange = (e) => {
    setErrorMessage("");
    setUserIdset(e.target.value);
  };

  const handleSubmitResetPassword = async () => {
    if (isSubmitting) return;
    if (!userIdset || userIdset.trim() === "") {
      setErrorMessage("Please enter User Id");
      // toast.error("Please enter user ID");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Authentication token missing");
        setErrorMessage("Authentication token missing");
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/resetPasssword/${userIdset}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.status === 400) {
        toast.error("You are not authorised to change password for this user");
        return;
      }
      if (response?.data?.Status === 404) {
        setErrorMessage("Invalid User ID");
        return;
      }
      toast.success(
        response?.data?.Message || `Your password has been reset successfully.`
      );
      setShowEditModal(false);
      setErrorMessage("");
      handleCloseModal();
    } catch (error) {
      if (
        error.response &&
        error?.response?.data &&
        error?.response?.data?.Message
      ) {
        setErrorMessage(error?.response?.data?.Message);
        toast.error(error?.response?.data?.Message);
      } else {
        setErrorMessage("Failed to update password. Please try again.");
        toast.error("Failed to update password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal("");
    setUserIdset("");
    setErrorMessage("");
  };

  return (
    <>
      <div
        className=""
        style={{
          position: "fixed",
          top: "0px",
          zIndex: "10",
        }}
      >
        <div
          className={`${styles.navbar} w-screen flex items-center justify-between px-2  h-12`}
          style={{
            // background: "#C12D51"
            // background: "rgb(200, 35, 69) ",
            background: "#C03078",
          }}
        >
          <div>
            <LuSchool className=" text-white " style={{ fontSize: "2em" }} />
          </div>
          <div className="flex-grow ">
            <h1
              className={`${styles.headingSchool} flex justify-center items-center   lg:text-2xl  font-semibold   sm:font-bold  text-white `}
            >
              {schoolName}
              {" ("}
              {sessionData.custom_claims?.academic_year}
              {")"}
            </h1>
          </div>
          <h1 className="text-lg lg:text-sm text-white px-2 hidden lg:block mt-2">
            {getCurrentDate()}
          </h1>
          <div className="flex items-center ">
            <NavDropdown
              title={
                <span className="nav-dropdown-title">
                  {
                    <FaUserCircle
                      className="text-white"
                      style={{
                        fontSize: "1.5rem",
                        display: "inline",
                        marginLeft: "4px",
                        paddingRight: "4px",
                      }}
                    />
                  }
                </span>
              }
              className="  w-18 border-2 rounded-full border-white px-2 lg:px-4 ml-2 hover:rounded-lg "
            // menuAlign="left"
            >
              <NavDropdown.Item>
                <div
                  className="flex items-center gap-2"
                  onClick={() => {
                    navigate("/myprofile");
                  }}
                >
                  <FaUserCircle style={{ fontSize: "1.5rem" }} />
                  <span style={{ fontSize: ".8em" }}>
                    {/* {sessionData.user?.name} */}
                    {userProfileName}
                  </span>
                </div>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <div
                  className="flex items-center gap-2"
                  onClick={() => {
                    navigate("/changepassword");
                  }}
                >
                  <LiaEdit style={{ fontSize: "1.5rem" }} />
                  <span style={{ fontSize: ".8em" }}>Change Password</span>
                </div>
              </NavDropdown.Item>

              {roleId === "A" || roleId === "M" || roleId === "U" ? (
                <NavDropdown.Item>
                  <div
                    className="flex items-center gap-2"
                    onClick={() => handleResetPassword()}
                  >
                    <BiReset style={{ fontSize: "1.5rem" }} />

                    <span style={{ fontSize: ".8em" }}>Reset Password</span>
                  </div>
                </NavDropdown.Item>
              ) : null}

              <NavDropdown.Item onClick={handleLogout}>
                <div className="flex items-center gap-2">
                  <CiLogout style={{ fontSize: "1.5rem" }} />
                  <span style={{ fontSize: ".8em" }}>Logout</span>
                </div>
              </NavDropdown.Item>
            </NavDropdown>
          </div>
        </div>
        <div>
          <div
            className={` flex justify-between  shadow h-12  mx-2 bg-gray-200`}
          >
            <div
              onClick={() => setIsSidebar(true)}
              onMouseEnter={() => {
                if (!isSidebar) setIsSidebar(true);
              }}
              className="hover:cursor-pointer hidden lg:block"
            >
              <RxHamburgerMenu
                style={{
                  fontSize: "1.8em",
                  textAlign: "center",
                  display: "inline",
                  position: "relative",
                  top: "5px",
                  left: "10px",
                  paddingTop: "5px",
                }}
              />
            </div>
            {/* nav bar items */}

            <Navbar
              expand="lg"
              className={`${styles.navBarSide} flex justify-between pl-16 w-full custom-navbar `}
            >
              <div className="container-fluid flex items-center bg-gray-200 sm:w-40 box-border ">
                <Navbar.Toggle
                  aria-controls="basic-navbar-nav"
                  className="custom-toggler bg-transparent"
                />
                <Navbar.Collapse
                  id="basic-navbar-nav"
                  className="flex-grow-1 text-black "
                >
                  {/* Navbar start here */}
                  <Nav className="  mr-auto text-xs lg:text-sm ">
                    <div
                      onClick={() => {
                        navigate("/dashboard");
                      }}
                      style={{ fontWeight: "700" }}
                      className={`hover:cursor-pointer   DashbordText text-[1rem] md:pt-0 my-auto  text-black  md:relative right-2  `}
                    >
                      <FaHome className="inline mr-1 relative bottom-0.5  hover:text-black" />
                      Dashboard
                    </div>

                    {console.log("the Role id", roleId)}
                    {/* {roleId === "A" ? renderStaticMenu() : renderDynamicMenu()} */}
                    {renderDynamicMenu()}

                    {/* <RecursiveDropdown items={navItems} /> */}
                  </Nav>
                </Navbar.Collapse>{" "}
              </div>
            </Navbar>

            <div className="flex items-center w-full md:w-[40%] ">
              <div className="form-group w-full md:w-[85%] flex justify-start gap-x-1 md:gap-x-4">
                <div className="w-full md:w-[90%] my-2">
                  {/* working well with focus on contl+M but we have commented it */}
                  <div className="relative w-full md:w-[90%] my-2">
                    <Select
                      ref={selectRef}
                      value={selectedMenu}
                      onChange={handleMenuSelect}
                      options={menuOptions}
                      placeholder="Search Menu"
                      isSearchable
                      isClearable
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="text-sm"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          backgroundColor: "#f3f4f6",
                          borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
                          borderRadius: "0.75rem",
                          minHeight: "2.5rem",
                          fontSize: "0.875rem",
                          boxShadow: state.isFocused
                            ? "0 0 0 2px #3b82f6"
                            : "none",
                        }),
                      }}
                    />

                    {isFocused && (
                      <div className="absolute -left-8 bottom-full mb-2 w-max px-2  rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm flex items-center gap-1 z-50">
                        <span>Press</span>
                        <kbd className="px-1  bg-gray-200 text-pink-600 font-bold rounded-full border border-pink-300">
                          Ctrl
                        </kbd>
                        <span>+</span>
                        <kbd className="px-2   bg-gray-200 text-pink-600 font-bold rounded-full border border-pink-300">
                          M
                        </kbd>
                        <span>to search</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <input
                    type="text"
                    id="search"
                    name="search"
                    disabled
                    placeholder="GR NO"
                    value={inputValueGR}
                    onChange={(e) => {
                      setInputValueGR(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    style={{
                      display: "inline",
                      position: "relative",
                      zIndex: "2",
                      padding: "3px",
                      paddingRight: "4px",
                    }}
                    className={`w-12 lg:w-20 mr-4 outline-none border-1 border-gray-400 rounded-md py-0.5 text-xs lg:text-sm`}
                  // disabled={loading}
                  />
                </div>
              </div>{" "}
              <NavDropdown
                // title={selectedYear}
                title={
                  <span
                    className="nav-dropdown-title"
                    style={{ fontSize: "1em" }}
                  >
                    {selectedYear ? selectedYear : "Academic Year "}
                  </span>
                }
                className={`${styles.dropNaveBarAcademic} academic-dropdown outline-none border-1 border-gray-400 px-1 rounded-md py-0.5 text-xs lg:text-sm   `}
                style={{
                  boxSizing: "border-box",
                  width: "30%",
                  margin: "auto",
                  position: "relative",
                  right: "10px",
                  textAlign: "center",
                  fontWeight: "600",
                }}
                onSelect={handleSelect}
              >
                <div className=" text-start text-sm bg-gray-50 text-gray-300  h-28 overflow-y-scroll">
                  {/* new logic */}
                  {academicYear &&
                    academicYear.length > 0 &&
                    academicYear.map((year) => (
                      <NavDropdown.Item key={year} eventKey={year}>
                        {year}
                      </NavDropdown.Item>
                    ))}
                </div>
              </NavDropdown>
            </div>
          </div>
        </div>
      </div>
      <Sidebar
        isSidebar={isSidebar}
        setIsSidebar={setIsSidebar}
        refreshTrigger={sidebarRefreshTrigger} // ✅ pass refresh trigger
      />
      {/* <Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} /> */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="flex justify-between p-3">
                  <h5 className="modal-title">Reset Password</h5>
                  <RxCross1
                    className="float-end relative mt-2 right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                    onClick={() => handleCloseModal()}
                  />
                </div>
                <div
                  className="relative mb-3 h-1 w-[97%] mx-auto bg-red-700"
                  style={{ backgroundColor: "#C03078" }}
                ></div>

                <div className="modal-body">
                  {/* User ID Input */}
                  <div className="relative mb-3 flex justify-center mx-4">
                    <label htmlFor="userId" className="w-1/2 mt-2">
                      Enter User ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      className="form-control shadow-md w-full"
                      id="userId"
                      value={userIdset}
                      onChange={handleUserIdChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmitResetPassword();
                        }
                      }}
                    />
                    <div className="absolute top-9 left-1/3">
                      {errorMessage && (
                        <span className="text-danger text-xs">
                          {errorMessage}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pb-3 pr-3">
                  <button
                    type="button"
                    className="btn btn-primary px-3 "
                    onClick={handleSubmitResetPassword}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Reseting..." : "Reset"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NavBar;

// work well onlick also ...
// import { useEffect, useRef, useState } from "react";
// import { Navbar, Nav, NavDropdown } from "react-bootstrap";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { FaHome, FaUserCircle } from "react-icons/fa";
// import { CiLogout } from "react-icons/ci";
// import { LiaEdit } from "react-icons/lia";
// import "./NabarstyleBootstrap.css";
// import styles from "../CSS/Navbar.module.css";
// import { LuSchool } from "react-icons/lu";
// import { RxHamburgerMenu } from "react-icons/rx";
// import Sidebar from "./Sidebar";
// import "./NavbarCss.css";
// import AdminNavBar from "./AdminNavBar";
// import { toast } from "react-toastify";
// import "./styles.css";
// import Select from "react-select";

// function NavBar() {
//   const API_URL = import.meta.env.VITE_API_URL; //thsis is test url
//   const navigate = useNavigate();
//   const [isSidebar, setIsSidebar] = useState();
//   const [academicYear, setAcademicYear] = useState([]);
//   const [menuDropdownOpen, setMenuDropdownOpen] = useState({});
//   const [isFocused, setIsFocused] = useState(false);

//   // const [inputValueGR, setInputValueGR] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   // const [sessionData, setsessionData] = useState({});
//   const [sessionData, setSessionData] = useState({});
//   const [userProfileName, setuserProfilName] = useState("");
//   const [inputValueGR, setInputValueGR] = useState("");
//   const [loading, setLoading] = useState(false);
//   // const navigate = useNavigate();
//   const [schoolName, setSchoolName] = useState("");
//   const [navItems, setNavItems] = useState([]);
//   const [roleId, setRoleId] = useState(""); // Add roleId state
//   const childItemRef = useRef(null);
//   const [menuOptions, setMenuOptions] = useState([]);
//   const [selectedMenu, setSelectedMenu] = useState(null);

//   function getCurrentDate() {
//     const months = [
//       "January",
//       "February",
//       "March",
//       "April",
//       "May",
//       "June",
//       "July",
//       "August",
//       "September",
//       "October",
//       "November",
//       "December",
//     ];

//     const today = new Date();
//     const day = String(today.getDate()).padStart(2, "0");
//     const monthIndex = today.getMonth();
//     const year = String(today.getFullYear()).slice();

//     const monthName = months[monthIndex];

//     return `${day} ${monthName} ${year}`;
//   }
//   const reloadAndRedirect = () => {
//     localStorage.setItem("shouldRedirectToDashboard", "true");
//     window.location.reload();
//   };

//   // useEffect(() => {
//   //   const handleShortcut = (e) => {
//   //     // ✅ Ctrl + M to focus "Search Menu"
//   //     if (e.ctrlKey && e.key.toLowerCase() === "m") {
//   //       e.preventDefault(); // stop browser default
//   //       if (selectRef.current) {
//   //         // Focus React-Select search input
//   //         selectRef.current.focus();
//   //       }
//   //     }
//   //   };

//   //   window.addEventListener("keydown", handleShortcut);
//   //   return () => window.removeEventListener("keydown", handleShortcut);
//   // }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         navigate("/");
//         return;
//       }
//       try {
//         const [sessionRes, acadRes, navRes, dropdownRes] = await Promise.all([
//           axios.get(`${API_URL}/api/sessionData`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(`${API_URL}/api/getAcademicYear`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(`${API_URL}/api/navmenulisttest`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(`${API_URL}/api/get_navleafmenus`, {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         const sdata = sessionRes.data;
//         const school = sdata?.custom_claims?.school_name;
//         if (school) {
//           setSchoolName(school);
//           document.title = school;
//         }

//         setSessionData(sdata);
//         setSelectedYear(sdata?.custom_claims?.academic_year);
//         setRoleId(sdata.user.role_id);

//         localStorage.setItem(
//           "academic_yr_from",
//           sdata?.custom_claims?.settings?.academic_yr_from
//         );
//         localStorage.setItem(
//           "academic_yr_to",
//           sdata?.custom_claims?.settings?.academic_yr_to
//         );

//         setAcademicYear(acadRes.data.academic_years);
//         setNavItems(navRes.data);

//         // NEW: Set options for dropdown from /navlistingofMenusdropdown
//         const formattedMenuOptions = dropdownRes?.data?.data?.map((item) => ({
//           value: item.url,
//           label: item.name,
//         }));
//         setMenuOptions(formattedMenuOptions); // this state powers the Select dropdown
//       } catch (err) {
//         const errMsg = err.response?.data?.message;
//         if (errMsg === "Token has expired") {
//           localStorage.removeItem("authToken");
//           navigate("/");
//           return;
//         }
//         console.error("Error in fetchData:", err);
//       }
//     };

//     fetchData();
//   }, [API_URL, navigate]);

//   const handleMenuSelect = (selectedOption) => {
//     setSelectedMenu(selectedOption);
//     if (selectedOption) {
//       navigate(`/${selectedOption.value}`);
//     }
//   };

//   useEffect(() => {
//     const shouldRedirect = localStorage.getItem("shouldRedirectToDashboard");
//     if (shouldRedirect === "true") {
//       localStorage.removeItem("shouldRedirectToDashboard"); // flag hata do
//       navigate("/dashboard"); // dashboard pe redirect karo
//     }
//   }, [navigate]);

//   const handleSelect = async (eventKey) => {
//     setSelectedYear(eventKey);

//     const token = localStorage.getItem("authToken");

//     if (!token) {
//       console.error("No authentication token found");
//       // toast.error("Authentication token not found Please login again");
//       navigate("/"); // 👈 Redirect to login
//       return; // 👈
//     }
//     // navigate("/dashboard");
//     try {
//       const response = await axios.post(
//         `${API_URL}/api/update_academic_year`,
//         {
//           academic_year: eventKey,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       localStorage.setItem("authToken", response.data.token);
//       localStorage.setItem("shouldRedirectToDashboard", "true");
//       window.location.reload();
//       // navigate("/dashboard?reload=true");
//     } catch (error) {
//       console.error("Error updating academic year:", error);
//     }
//   };
//   // Take user name so call user prpofile api
//   useEffect(() => {
//     const fetcUSerProfilehData = async () => {
//       const token = localStorage.getItem("authToken");
//       if (!token) {
//         navigate("/"); // 👈 Redirect to login
//         return; // 👈
//       }
//       // console.log("jfdshfoisafhaios");
//       try {
//         const response = await axios.get(`${API_URL}/api/editprofile`, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         // console.log("the userporfile__________", response.data);
//         const staff = response.data.user?.get_teacher;
//         setuserProfilName(staff?.name);
//         console.log(
//           "the userupdate profile inside the navbar compoenent",
//           staff
//         );
//         const errorMsg = response?.data?.message;
//         // Handle expired token
//         console.log("tokeneeee error--->", errorMsg, response?.data?.message);
//         if (errorMsg === "Token has expired") {
//           // toast.error("Session expired. Please login again.");
//           localStorage.removeItem("authToken"); // Optional: clear old token
//           navigate("/"); // Redirect to login
//           return;
//         }
//       } catch (error) {
//         toast.error(error.response.data.message);
//         console.error(
//           "Error fetching profile data inside navbar component:",
//           error
//         );

//         // working well code
//         const errorMsg = error.response?.data?.message;
//         // Handle expired token
//         if (errorMsg === "Token has expired") {
//           // toast.error("Session expired. Please login again.");
//           localStorage.removeItem("authToken"); // Optional: clear old token
//           navigate("/"); // Redirect to login
//           return;
//         }

//         // Other error handling
//         toast.error(errorMsg || "Something went wrong.");
//         console.error("Error fetching profile:", error);
//       }
//     };

//     fetcUSerProfilehData();
//   }, [API_URL]);

//   // for GR number setup
//   // Function to handle search based on GR number
//   const handleSearch = async () => {
//     console.log("GR Number Entered:", inputValueGR); // Debugging

//     if (!inputValueGR) {
//       toast.error("Please enter a GR number!");
//       console.log("Error: Empty GR Number"); // Debugging
//       return;
//     }

//     // Check if inputValueGR contains only digits
//     if (!/^\d+$/.test(inputValueGR)) {
//       toast.error("Invalid GR number! Please enter a valid numeric value.");
//       console.log("Error: Invalid GR Number Format"); // Debugging
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.get(
//         `${API_URL}/api/student_by_reg_no/${inputValueGR}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const studentList = response?.data?.student || [];
//       console.log("Student List:", studentList); // Debugging

//       if (studentList.length === 0) {
//         // alert("Not students found with tis gr no");
//         toast.error("No student found with this GR number.");
//         console.log("Error: No student found"); // Debugging
//       } else {
//         navigate(`/StudentSearchUsingGRN`, {
//           state: { studentData: studentList[0] },
//         });
//       }
//     } catch (error) {
//       toast.error(
//         error?.response?.data?.message || "Error fetching student details."
//       );
//       console.log("API Error:", error?.response?.data?.message); // Debugging
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to handle keypress (Enter) in the input field
//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   // Function to handle the view of student details
//   const handleView = (student) => {
//     navigate(`/student/view/${student.student_id}`, {
//       state: { student: student },
//     });
//   };

//   const handleLogout = async () => {
//     try {
//       const token = localStorage.getItem("authToken");

//       // Logout API
//       await axios.post(
//         `${API_URL}/api/logout`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       localStorage.removeItem("authToken");
//       localStorage.removeItem("academicYear");
//       localStorage.removeItem("user");
//       localStorage.removeItem("settings");
//       sessionStorage.removeItem("sessionData");
//       navigate("/");
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };
//   const handleInputChange = (event) => {
//     setInputValueGR(event.target.value);
//   };
//   const toggleMenuDropdown = (menu) => {
//     setMenuDropdownOpen((prev) => ({
//       ...prev,
//       [menu]: !prev[menu],
//     }));
//   };

//   const menuRef = useRef(null);
//   const selectRef = useRef(null);

//   const [openDropdowns, setOpenDropdowns] = useState([]);
//   const [clickedDropdowns, setClickedDropdowns] = useState([]);
//   const [isTouchDevice, setIsTouchDevice] = useState(false); // 👈 NEW

//   const toggleDropdown = (key, level) => {
//     const newBranch = [...openDropdowns.slice(0, level)];
//     const isAlreadyOpen = openDropdowns[level] === key;

//     if (isAlreadyOpen) {
//       // Close all at this level and deeper
//       setOpenDropdowns(newBranch);
//       setClickedDropdowns(newBranch);
//     } else {
//       const newOpen = [...newBranch, key];
//       setOpenDropdowns(newOpen);
//       setClickedDropdowns(newOpen);
//     }
//   };

//   const hoverTimeouts = useRef({});

//   const handleMouseEnter = (key, level) => {
//     if (level === 0) return; // skip hover for top-level
//     clearTimeout(hoverTimeouts.current[level]);
//     const newPath = [...openDropdowns.slice(0, level), key];
//     setOpenDropdowns(newPath);
//     setClickedDropdowns([]); // reset clicked branch when hovering
//   };

//   const handleMouseLeave = (level) => {
//     if (level === 0) return; // skip hover-out for top-level
//     clearTimeout(hoverTimeouts.current[level]);
//     hoverTimeouts.current[level] = setTimeout(() => {
//       setOpenDropdowns((prev) =>
//         prev.filter((key) => {
//           const keyLevel = parseInt(key.split("-")[1]);
//           return keyLevel < level || clickedDropdowns.includes(key);
//         })
//       );
//     }, 200);
//   };
//   useEffect(() => {
//     const handleTouchStart = () => setIsTouchDevice(true);
//     const handleMouseMove = () => setIsTouchDevice(false);

//     window.addEventListener("touchstart", handleTouchStart, { passive: true });
//     window.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       window.removeEventListener("touchstart", handleTouchStart);
//       window.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setOpenDropdowns([]); // close all menus
//         setClickedDropdowns([]);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   const closeAllDropdowns = () => {
//     setOpenDropdowns([]);
//     setClickedDropdowns([]);
//   };

//   const renderDynamicMenu = () => {
//     const renderDropdownItems = (items, level = 0) => {
//       return items.map((item) => {
//         const dropdownKey = `${item.menu_id}-${level}`;
//         const isOpen = openDropdowns.includes(dropdownKey);

//         if (item.sub_menus && item.sub_menus.length > 0) {
//           return (
//             <NavDropdown
//               key={dropdownKey}
//               title={<span className="nav-title-topIs">{item.name}</span>}
//               className={`custom-nav-dropdown ${isOpen ? "show" : ""}`}
//               show={isOpen}
//               onClick={(e) => {
//                 e.preventDefault();
//                 toggleDropdown(dropdownKey, level);
//               }}
//               onMouseEnter={
//                 !isTouchDevice
//                   ? () => handleMouseEnter(dropdownKey, level)
//                   : undefined
//               }
//               onMouseLeave={
//                 !isTouchDevice ? () => handleMouseLeave(level) : undefined
//               }
//             >
//               {item.sub_menus.map((subItem) => {
//                 const subKey = `${subItem.menu_id}-${level + 1}`;
//                 const isSubOpen = openDropdowns.includes(subKey);

//                 if (subItem.sub_menus && subItem.sub_menus.length > 0) {
//                   return (
//                     <NavDropdown
//                       key={subKey}
//                       title={
//                         <span className="nav-dropdown-sub-new-Dynamic px-2">
//                           {subItem?.name}
//                         </span>
//                       }
//                       className={`nav-dropdown-sub-new dropend w-auto ${
//                         isSubOpen ? "show" : ""
//                       }`}
//                       show={isSubOpen}
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         if (isSubOpen) {
//                           closeAllDropdowns();
//                         } else {
//                           // setOpenDropdowns([subKey]);
//                           setOpenDropdowns([
//                             `${item.menu_id}-${level}`,
//                             subKey,
//                           ]);
//                         }
//                       }}
//                       onMouseEnter={
//                         !isTouchDevice
//                           ? () => handleMouseEnter(subKey, level + 1)
//                           : undefined
//                       }
//                       onMouseLeave={
//                         !isTouchDevice
//                           ? () => handleMouseLeave(level + 1)
//                           : undefined
//                       }
//                     >
//                       {subItem.sub_menus.map((childItem) => {
//                         const childKey = `${childItem.menu_id}-${level + 2}`;
//                         const isChildOpen = openDropdowns.includes(childKey);

//                         if (childItem.sub_menus?.length > 0) {
//                           return (
//                             <NavDropdown
//                               key={childKey}
//                               title={
//                                 <span
//                                   style={{
//                                     cursor: "pointer",
//                                   }}
//                                   className="  custom-hover-styleForchildLeve   px-2"
//                                 >
//                                   {childItem.name}{" "}
//                                 </span>
//                               }
//                               // className={`dropend custom-submenuIs ${
//                               //   isChildOpen ? "show" : ""
//                               // }`}
//                               className={`  nav-dropdown-sub-new dropend w-auto ${
//                                 isSubOpen ? "show" : ""
//                               } `}
//                               show={isChildOpen}
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 e.stopPropagation();

//                                 if (isChildOpen) {
//                                   setOpenDropdowns([]);
//                                   setClickedDropdowns([]);
//                                 } else {
//                                   setOpenDropdowns([
//                                     ...openDropdowns.slice(0, level + 2),
//                                     childKey,
//                                   ]);
//                                   setClickedDropdowns([
//                                     ...openDropdowns.slice(0, level + 2),
//                                     childKey,
//                                   ]);
//                                 }
//                               }}
//                               onMouseEnter={
//                                 !isTouchDevice
//                                   ? () => handleMouseEnter(childKey, level + 2)
//                                   : undefined
//                               }
//                               onMouseLeave={
//                                 !isTouchDevice
//                                   ? () => handleMouseLeave(level + 2)
//                                   : undefined
//                               }
//                             >
//                               {childItem.sub_menus.map((grandChildItem) => (
//                                 <NavDropdown.Item
//                                   key={grandChildItem.menu_id}
//                                   onClick={() => {
//                                     setOpenDropdowns([]);
//                                     setClickedDropdowns([]);
//                                     navigate(grandChildItem.url);
//                                   }}
//                                 >
//                                   {grandChildItem.name}
//                                 </NavDropdown.Item>
//                               ))}
//                             </NavDropdown>
//                           );
//                         } else {
//                           return (
//                             <NavDropdown.Item
//                               key={childKey}
//                               onClick={() => {
//                                 setOpenDropdowns([]);
//                                 setClickedDropdowns([]);
//                                 navigate(childItem.url);
//                               }}
//                               className="hover:bg-gray-100 hover:text-blue-600 text-sm flex flex-row gap-x-2"
//                             >
//                               {childItem.name}
//                             </NavDropdown.Item>
//                           );
//                         }
//                       })}
//                       {/* </div> */}
//                     </NavDropdown>
//                   );
//                 } else {
//                   return (
//                     <NavDropdown.Item
//                       key={subKey}
//                       onClick={() => {
//                         setOpenDropdowns([]);
//                         setClickedDropdowns([]);
//                         navigate(subItem.url);
//                       }}

//                       // className="hover:bg-gray-100 hover:text-blue-600 text-sm"
//                     >
//                       {subItem.name}
//                     </NavDropdown.Item>
//                   );
//                 }
//               })}
//             </NavDropdown>
//           );
//         } else {
//           return (
//             <Nav.Link
//               key={dropdownKey}
//               onClick={() => {
//                 closeAllDropdowns();
//                 item.url && navigate(item.url);
//               }}
//             >
//               <span className="nav-title-top">{item.name}</span>
//             </Nav.Link>
//           );
//         }
//       });
//     };

//     return (
//       <div ref={menuRef} className="flex items-center">
//         {renderDropdownItems(navItems)}
//       </div>
//     );
//   };

//   return (
//     <>
//       <div
//         className=""
//         style={{
//           position: "fixed",
//           top: "0px",
//           zIndex: "10",
//           // backgroundColor: "#D61D5E",
//         }}
//       >
//         <div
//           className={`${styles.navbar} w-screen flex items-center justify-between px-2  h-12`}
//           style={{
//             // background: "#C12D51"
//             // background: "rgb(200, 35, 69) ",
//             background: "#C03078",
//           }}
//         >
//           <div>
//             <LuSchool className=" text-white " style={{ fontSize: "2em" }} />
//           </div>
//           <div className="flex-grow ">
//             <h1
//               className={`${styles.headingSchool} flex justify-center items-center   lg:text-2xl  font-semibold   sm:font-bold  text-white `}
//             >
//               {schoolName}
//               {" ("}
//               {sessionData.custom_claims?.academic_year}
//               {")"}
//             </h1>
//           </div>
//           <h1 className="text-lg lg:text-sm text-white px-2 hidden lg:block mt-2">
//             {getCurrentDate()}
//           </h1>
//           <div className="flex items-center ">
//             <NavDropdown
//               title={
//                 <span className="nav-dropdown-title">
//                   {
//                     <FaUserCircle
//                       className="text-white"
//                       style={{
//                         fontSize: "1.5rem",
//                         display: "inline",
//                         marginLeft: "4px",
//                         paddingRight: "4px",
//                       }}
//                     />
//                   }
//                 </span>
//               }
//               className="  w-18 border-2 rounded-full border-white px-2 lg:px-4 ml-2 hover:rounded-lg "
//               // menuAlign="left"
//             >
//               <NavDropdown.Item>
//                 <div
//                   className="flex items-center gap-2"
//                   onClick={() => {
//                     navigate("/myprofile");
//                   }}
//                 >
//                   <FaUserCircle style={{ fontSize: "1.5rem" }} />
//                   <span style={{ fontSize: ".8em" }}>
//                     {/* {sessionData.user?.name} */}
//                     {userProfileName}
//                   </span>
//                 </div>
//               </NavDropdown.Item>
//               <NavDropdown.Item>
//                 <div
//                   className="flex items-center gap-2"
//                   onClick={() => {
//                     navigate("/changepassword");
//                   }}
//                 >
//                   <LiaEdit style={{ fontSize: "1.5rem" }} />
//                   <span style={{ fontSize: ".8em" }}>Change Password</span>
//                 </div>
//               </NavDropdown.Item>
//               <NavDropdown.Item onClick={handleLogout}>
//                 <div className="flex items-center gap-2">
//                   <CiLogout style={{ fontSize: "1.5rem" }} />
//                   <span style={{ fontSize: ".8em" }}>Logout</span>
//                 </div>
//               </NavDropdown.Item>
//             </NavDropdown>
//           </div>
//         </div>
//         <div>
//           <div
//             className={` flex justify-between  shadow h-12  mx-2 bg-gray-200`}
//           >
//             <div
//               onClick={() => setIsSidebar(true)}
//               onMouseEnter={() => {
//                 if (!isSidebar) setIsSidebar(true);
//               }}
//               className="hover:cursor-pointer hidden lg:block"
//             >
//               <RxHamburgerMenu
//                 style={{
//                   fontSize: "1.8em",
//                   textAlign: "center",
//                   display: "inline",
//                   position: "relative",
//                   top: "5px",
//                   left: "10px",
//                   paddingTop: "5px",
//                 }}
//               />
//             </div>
//             {/* nav bar items */}

//             <Navbar
//               expand="lg"
//               className={`${styles.navBarSide} flex justify-between pl-16 w-full custom-navbar `}
//             >
//               <div className="container-fluid flex items-center bg-gray-200 sm:w-40 box-border ">
//                 <Navbar.Toggle
//                   aria-controls="basic-navbar-nav"
//                   className="custom-toggler bg-transparent"
//                 />
//                 <Navbar.Collapse
//                   id="basic-navbar-nav"
//                   className="flex-grow-1 text-black "
//                 >
//                   {/* Navbar start here */}
//                   <Nav className="  mr-auto text-xs lg:text-sm ">
//                     <div
//                       onClick={() => {
//                         navigate("/dashboard");
//                       }}
//                       style={{ fontWeight: "700" }}
//                       className={`hover:cursor-pointer   DashbordText text-[1rem] md:pt-0 my-auto  text-black  md:relative right-2  `}
//                     >
//                       <FaHome className="inline mr-1 relative bottom-0.5  hover:text-black" />
//                       Dashboard
//                     </div>

//                     {console.log("the Role id", roleId)}
//                     {/* {roleId === "A" ? renderStaticMenu() : renderDynamicMenu()} */}
//                     {renderDynamicMenu()}

//                     {/* <RecursiveDropdown items={navItems} /> */}
//                   </Nav>
//                 </Navbar.Collapse>{" "}
//               </div>
//             </Navbar>

//             <div className="flex items-center w-full md:w-[40%] ">
//               <div className="form-group w-full md:w-[85%] flex justify-start gap-x-1 md:gap-x-4">
//                 <div className="w-full md:w-[90%] my-2">
//                   <Select
//                     value={selectedMenu}
//                     onChange={handleMenuSelect}
//                     options={menuOptions}
//                     placeholder="Search Menu"
//                     isSearchable
//                     isClearable
//                     className="text-sm"
//                     styles={{
//                       control: (base, state) => ({
//                         ...base,
//                         backgroundColor: "#f3f4f6",
//                         borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
//                         borderRadius: "0.75rem",
//                         minHeight: "2.5rem",
//                         fontSize: "0.875rem",
//                         boxShadow: state.isFocused
//                           ? "0 0 0 2px #3b82f6"
//                           : "none",
//                         transition:
//                           "border-color 0.2s ease, box-shadow 0.2s ease",
//                         "&:hover": {
//                           borderColor: "#9ca3af",
//                         },
//                       }),
//                       placeholder: (base) => ({
//                         ...base,
//                         color: "#6b7280",
//                         fontSize: "0.875rem",
//                       }),
//                       singleValue: (base) => ({
//                         ...base,
//                         fontSize: "0.875rem",
//                         color: "#111827",
//                       }),
//                       option: (base, { isFocused }) => ({
//                         ...base,
//                         fontSize: "0.875rem",
//                         backgroundColor: isFocused ? "#bfdbfe" : "white", // Hover = blue-200
//                         color: isFocused ? "#1e3a8a" : "#111827", // Hover text = blue-900
//                         cursor: "pointer",
//                         transition:
//                           "background-color 0.2s ease, color 0.2s ease", // smooth transition
//                       }),
//                       menu: (base) => ({
//                         ...base,
//                         borderRadius: "0.5rem",
//                         fontSize: "0.875rem",
//                         zIndex: 50,
//                         boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//                       }),
//                     }}
//                   />
//                   {/* working well with focus on contl+M but we have commented it */}
//                   {/* <div className="relative w-full md:w-[90%] my-2">
//                     <Select
//                       ref={selectRef}
//                       value={selectedMenu}
//                       onChange={handleMenuSelect}
//                       options={menuOptions}
//                       placeholder="Search Menu"
//                       isSearchable
//                       isClearable
//                       onFocus={() => setIsFocused(true)}
//                       onBlur={() => setIsFocused(false)}
//                       className="text-sm"
//                       styles={{
//                         control: (base, state) => ({
//                           ...base,
//                           backgroundColor: "#f3f4f6",
//                           borderColor: state.isFocused ? "#60a5fa" : "#d1d5db",
//                           borderRadius: "0.75rem",
//                           minHeight: "2.5rem",
//                           fontSize: "0.875rem",
//                           boxShadow: state.isFocused
//                             ? "0 0 0 2px #3b82f6"
//                             : "none",
//                         }),
//                       }}
//                     />

//                     {isFocused && (
//                       <div className="absolute -left-8 bottom-full mb-2 w-max px-2  rounded-lg shadow-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm flex items-center gap-1 z-50">
//                         <span>Press</span>
//                         <kbd className="px-1  bg-gray-200 text-pink-600 font-bold rounded-full border border-pink-300">
//                           Ctrl
//                         </kbd>
//                         <span>+</span>
//                         <kbd className="px-2   bg-gray-200 text-pink-600 font-bold rounded-full border border-pink-300">
//                           M
//                         </kbd>
//                         <span>to search</span>
//                       </div>
//                     )}
//                   </div> */}
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <div>
//                   <input
//                     type="text"
//                     id="search"
//                     name="search"
//                     disabled
//                     placeholder="GR NO"
//                     value={inputValueGR}
//                     onChange={(e) => {
//                       setInputValueGR(e.target.value);
//                     }}
//                     onKeyPress={handleKeyPress}
//                     style={{
//                       display: "inline",
//                       position: "relative",
//                       zIndex: "2",
//                       padding: "3px",
//                       paddingRight: "4px",
//                     }}
//                     className={`w-12 lg:w-20 mr-4 outline-none border-1 border-gray-400 rounded-md py-0.5 text-xs lg:text-sm`}
//                     // disabled={loading}
//                   />
//                 </div>
//               </div>{" "}
//               <NavDropdown
//                 // title={selectedYear}
//                 title={
//                   <span
//                     className="nav-dropdown-title"
//                     style={{ fontSize: "1em" }}
//                   >
//                     {selectedYear ? selectedYear : "Academic Year "}
//                   </span>
//                 }
//                 className={`${styles.dropNaveBarAcademic} academic-dropdown outline-none border-1 border-gray-400 px-1 rounded-md py-0.5 text-xs lg:text-sm   `}
//                 style={{
//                   boxSizing: "border-box",
//                   width: "30%",
//                   margin: "auto",
//                   position: "relative",
//                   right: "10px",
//                   textAlign: "center",
//                   fontWeight: "600",
//                 }}
//                 onSelect={handleSelect}
//               >
//                 <div className=" text-start text-sm bg-gray-50 text-gray-300  h-28 overflow-y-scroll">
//                   {/* new logic */}
//                   {academicYear &&
//                     academicYear.length > 0 &&
//                     academicYear.map((year) => (
//                       <NavDropdown.Item key={year} eventKey={year}>
//                         {year}
//                       </NavDropdown.Item>
//                     ))}
//                 </div>
//               </NavDropdown>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
//     </>
//   );
// }

// export default NavBar;
