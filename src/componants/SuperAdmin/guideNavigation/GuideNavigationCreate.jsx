import Select from "react-select";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRightToBracket, faTrash, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function GuideNavigationCreate() {
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    
    // State for form data
    const [guideName, setGuideName] = useState("");
    const [guideDescription, setGuideDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    
    // State for steps
    const [steps, setSteps] = useState([
        {
            id: Date.now(),
            menu_id: null,
            route: "",
            title: "",
            content: "",
            step_order: 1,
            is_active: true,
            isNew: true
        }
    ]);
    
    // State for menus dropdown
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Get token once with error handling
    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/login");
            return null;
        }
        return token;
    }, [navigate]);

    // Fetch menus for dropdown
    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/menus`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                // Format menus for react-select
                const formattedMenus = formatMenusForSelect(response.data);
                console.log(formattedMenus);
                setMenus(formattedMenus);
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
            toast.error("Failed to load menus");
        } finally {
            setLoading(false);
        }
    };

    // Format menus hierarchically for select dropdown
    const formatMenusForSelect = (menus, parentId = 0, level = 0) => {
        const filteredMenus = menus.filter(menu => menu.parent_id === parentId);
        let options = [];

        filteredMenus.forEach(menu => {
            // Add current menu
            options.push({
                value: menu.menu_id,
                label: `${'--'.repeat(level)} ${menu.name} ${menu.url ? `(${menu.url})` : ''}`,
                url: menu.url
            });

            // Add children recursively
            const children = formatMenusForSelect(menus, menu.menu_id, level + 1);
            options = [...options, ...children];
        });

        return options;
    };

    // Add new step
    const addNewStep = () => {
        const newStep = {
            id: Date.now() + Math.random(),
            menu_id: null,
            route: "",
            title: "",
            content: "",
            step_order: steps.length + 1,
            is_active: true,
            isNew: true
        };
        setSteps([...steps, newStep]);
    };

    // Remove step
    const removeStep = (stepId) => {
        if (steps.length <= 1) {
            toast.warning("At least one step is required");
            return;
        }
        
        const updatedSteps = steps
            .filter(step => step.id !== stepId)
            .map((step, index) => ({
                ...step,
                step_order: index + 1
            }));
        
        setSteps(updatedSteps);
    };

    // Update step field
    const updateStep = (stepId, field, value) => {
        const updatedSteps = steps.map(step => {
            if (step.id === stepId) {
                const updatedStep = { ...step, [field]: value };
                
                // If menu is selected, auto-fill the route from menu URL
                if (field === 'menu_id') {
                    const selectedMenu = menus.find(m => m.value === value);
                    if (selectedMenu && selectedMenu.url) {
                        updatedStep.route = selectedMenu.url;
                    }
                }
                
                return updatedStep;
            }
            return step;
        });
        
        setSteps(updatedSteps);
    };

    // Move step up or down
    const moveStep = (stepId, direction) => {
        const currentIndex = steps.findIndex(step => step.id === stepId);
        if (
            (direction === 'up' && currentIndex === 0) || 
            (direction === 'down' && currentIndex === steps.length - 1)
        ) {
            return;
        }

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const updatedSteps = [...steps];
        
        // Swap step_order values
        const tempOrder = updatedSteps[currentIndex].step_order;
        updatedSteps[currentIndex].step_order = updatedSteps[newIndex].step_order;
        updatedSteps[newIndex].step_order = tempOrder;
        
        // Swap positions in array
        [updatedSteps[currentIndex], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[currentIndex]];
        
        setSteps(updatedSteps);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!guideName.trim()) {
            toast.error("Please enter a guide name");
            return;
        }

        // Validate steps
        for (let step of steps) {
            if (!step.title.trim()) {
                toast.error("All steps must have a title");
                return;
            }
            if (!step.content.trim()) {
                toast.error("All steps must have content");
                return;
            }
            if (!step.route.trim()) {
                toast.error("All steps must have a route");
                return;
            }
        }

        const token = getAuthToken();
        if (!token) return;

        try {
            setSubmitting(true);

            // Create guide data
            const guideData = {
                name: guideName,
                description: guideDescription,
                is_active: isActive ? 1 : 0,
                steps: steps.map(step => ({
                    menu_id: step.menu_id,
                    route: step.route,
                    title: step.title,
                    content: step.content,
                    step_order: step.step_order,
                    is_active: step.is_active ? 1 : 0
                }))
            };

            const response = await axios.post(
                `${API_URL}/api/help-guides/create`,
                guideData,
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status) {
                toast.success("Help guide created successfully");
                setTimeout(() => {
                    navigate("/guideNavigations");
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to create help guide");
            }
        } catch (error) {
            console.error("Error creating help guide:", error);
            toast.error(error.response?.data?.message || "Failed to create help guide");
        } finally {
            setSubmitting(false);
        }
    };

    // Quill modules configuration
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link'],
            ['clean']
        ],
    };

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
                <form onSubmit={handleSubmit}>
                    <div className="card rounded-md ">
                        <div className="card-header mb-4 flex justify-between items-center">
                            <h5 className="text-gray-700 mt-1 text-md lg:text-lg">
                                Create New Help Guide
                            </h5>

                            <RxCross1
                                className="relative right-2 text-xl text-red-600 hover:cursor-pointer hover:bg-red-100"
                                onClick={() => {
                                    navigate("/guideNavigations");
                                }}
                            />
                        </div>
                        
                        <div
                            className="relative w-full -top-6 h-1 mx-auto"
                            style={{
                                backgroundColor: "#C03078",
                            }}
                        ></div>

                        {/* Guide Details */}
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Guide Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={guideName}
                                        onChange={(e) => setGuideName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C03078] focus:border-transparent"
                                        placeholder="Enter guide name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={guideDescription}
                                        onChange={(e) => setGuideDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C03078] focus:border-transparent"
                                        placeholder="Enter guide description"
                                        rows="3"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-4 h-4 text-[#C03078] border-gray-300 rounded focus:ring-[#C03078]"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            {/* Steps Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h6 className="text-lg font-semibold text-gray-800">Guide Steps</h6>
                                <button
                                    type="button"
                                    onClick={addNewStep}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#C03078] text-white rounded-md hover:bg-[#a02663] transition-colors"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    Add Step
                                </button>
                            </div>

                            {/* Steps List */}
                            <div className="space-y-6">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <h6 className="font-medium text-gray-700">
                                                Step {step.step_order}
                                            </h6>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => moveStep(step.id, 'up')}
                                                    disabled={index === 0}
                                                    className={`p-2 rounded-md ${
                                                        index === 0 
                                                            ? 'text-gray-400 cursor-not-allowed' 
                                                            : 'text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faArrowUp} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveStep(step.id, 'down')}
                                                    disabled={index === steps.length - 1}
                                                    className={`p-2 rounded-md ${
                                                        index === steps.length - 1
                                                            ? 'text-gray-400 cursor-not-allowed'
                                                            : 'text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faArrowDown} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStep(step.id)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-md"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Select Menu (Optional)
                                                </label>
                                                <Select
                                                    options={menus}
                                                    value={menus.find(m => m.value === step.menu_id) || null}
                                                    onChange={(option) => updateStep(step.id, 'menu_id', option?.value || null)}
                                                    isClearable
                                                    placeholder="Search and select menu..."
                                                    isLoading={loading}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Route <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={step.route}
                                                    onChange={(e) => updateStep(step.id, 'route', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C03078] focus:border-transparent"
                                                    placeholder="e.g., /subjectforReportcard"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Step Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={step.title}
                                                onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C03078] focus:border-transparent"
                                                placeholder="Enter step title"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Content <span className="text-red-500">*</span>
                                            </label>
                                            <div className="bg-white rounded-md">
                                                <ReactQuill
                                                    value={step.content}
                                                    onChange={(content) => updateStep(step.id, 'content', content)}
                                                    modules={quillModules}
                                                    className="h-64 mb-12"
                                                    placeholder="Write your help content here..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={step.is_active}
                                                    onChange={(e) => updateStep(step.id, 'is_active', e.target.checked)}
                                                    className="w-4 h-4 text-[#C03078] border-gray-300 rounded focus:ring-[#C03078]"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Step Active</span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate("/guideNavigations")}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-[#C03078] text-white rounded-md hover:bg-[#a02663] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Creating..." : "Create Help Guide"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default GuideNavigationCreate;