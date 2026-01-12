import { useState, useEffect } from "react";
import axios from "axios";
import Styles from "../../CSS/DashbordCss/NoticeBord.module.css";
import { useNavigate } from "react-router-dom";
import Loader from "../common/LoaderFinal/DashboardLoadder/Loader";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

function TodoListandRemainders() {
  const API_URL = import.meta.env.VITE_API_URL; // url for host
  const [activeTab, setActiveTab] = useState("todolist");

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [todoForm, setTodoForm] = useState({
    title: "",
    dueDate: "",
    description: "",
  });

  const [todoMode, setTodoMode] = useState("view");
  const [todoList, setTodoList] = useState([]);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [deleteTodoId, setDeleteTodoId] = useState(null);

  const [todoAll, setTodoAll] = useState([]);

  const [remainderlist, setRemaindersList] = useState({
    incomplete_lesson_plan_for_next_week: [],
    notice_for_teacher: [],
    todoForToday: [],
  });

  const fetchTodoRemainders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      // Fetch parent notices
      const parentResponse = await axios.get(`${API_URL}/api/daily_todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodoList(parentResponse.data.data);

      // Fetch staff notices
      const staffResponse = await axios.get(
        `${API_URL}/api/teachers/dashboard/reminders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRemaindersList(staffResponse.data?.data);
    } catch (error) {
      setError(error.message);
      const errorMsg = error.response?.data?.message;

      if (errorMsg === "Token has expired") {
        localStorage.removeItem("authToken");
        navigate("/");
        return;
      }
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");

      const apiUrl = `${API_URL}/api/daily_todos/all`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTodoAll(response.data.data || []);
    } catch (error) {
      console.error("Error fetching todos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodoRemainders();
    fetchTodosAll();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleEditTodo = async (todo) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.get(
        `${API_URL}/api/daily_todos/${todo.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;

      setTodoForm({
        title: data.title || "",
        description: data.description || "",
        dueDate: data.due_date
          ? data.due_date.split(" ")[0] // yyyy-mm-dd
          : "",
      });

      setEditingTodoId(todo.id);
      setTodoMode("edit"); // switch to edit mode
    } catch (error) {
      console.error(error);
      toast.error("Failed to load todo details");
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`${API_URL}/api/daily_todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Todo deleted");
      setDeleteTodoId(null);
      fetchTodoRemainders();
    } catch (error) {
      toast.error("Failed to delete todo");
    }
  };

  const hasLessonPlans =
    remainderlist.incomplete_lesson_plan_for_next_week.length > 0;
  // const hasLessonPlans =
  //   remainderlist.incomplete_lesson_plan_for_next_week?.some((cls) =>
  //     cls.subjects?.some(
  //       (sub) => Array.isArray(sub.lesson_plans) && sub.lesson_plans.length > 0
  //     )
  //   );

  const hasNotices = remainderlist.notice_for_teacher.length > 0;

  const hasTodos = remainderlist.todoForToday.length > 0;

  const lessonPlanCount =
    remainderlist?.incomplete_lesson_plan_for_next_week?.length || 0;

  const noticeCount = remainderlist?.notice_for_teacher?.length || 0;

  const todoCount = remainderlist?.todoForToday?.length || 0;

  const totalRemaindersCount = lessonPlanCount + noticeCount + todoCount;

  const handleToggleTodoStatus = async (todo) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/api/daily_todos/${todo.id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Todo status updated");

        // Refresh list
        fetchTodoRemainders();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while updating status");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTodoForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveTodo = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    if (!todoForm.title || !todoForm.dueDate) {
      toast.error("Title and Due Date are required!");
      return;
    }

    try {
      let response;

      if (todoMode === "edit" && editingTodoId) {
        // 🔹 UPDATE TODO
        response = await axios.put(
          `${API_URL}/api/daily_todos/${editingTodoId}`,
          {
            title: todoForm.title,
            description: todoForm.description,
            due_date: todoForm.dueDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // 🔹 ADD NEW TODO
        response = await axios.post(
          `${API_URL}/api/daily_todos`,
          {
            title: todoForm.title,
            description: todoForm.description,
            due_date: todoForm.dueDate,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (response.data.status === "success") {
        toast.success(
          todoMode === "edit"
            ? "Todo updated successfully!"
            : "Todo added successfully!"
        );

        setTodoForm({ title: "", dueDate: "", description: "" });
        setTodoMode("view");
        setEditingTodoId(null);
        fetchTodoRemainders();
      } else {
        toast.error("Failed to save todo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-1 flex flex-col h-full">
      <div className="flex justify-between mb-1 w-full">
        {/* <button
          className={`${
            Styles.tab
          } flex items-center justify-center gap-3 w-full font-bold p-2 text-sm ${
            activeTab === "todolist" ? Styles.active : ""
          } sm:w-1/2`}
          onClick={() => {
            handleTabChange("todolist");
            setTodoMode("view");
          }}
        >
          <span>Todo List</span>
          <span
            className="text-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setTodoMode("add");
            }}
          >
            ➕
          </span>
          <span
            className="text-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setTodoMode("view");
            }}
          >
            👁️
          </span>
          <span
            className="text-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setTodoMode("viewall");
            }}
          >
            👁️
          </span>
        </button> */}

        <button
          className={`${Styles.tab
            } flex items-center justify-between w-full font-bold p-2 text-sm ${activeTab === "todolist" ? Styles.active : ""
            } sm:w-1/2`}
          onClick={() => {
            handleTabChange("todolist");
            setTodoMode("view");
          }}
        >
          <span>Todo List</span>

          <div className="flex items-center gap-3 text-sm">
            <span
              title="Add Todo"
              className={`cursor-pointer ${todoMode === "add" ? "text-green-500" : ""
                }`}
              onClick={(e) => {
                e.stopPropagation();
                setTodoMode("add");
              }}
            >
              ➕
            </span>

            <span
              title="View Today Todos"
              className={`cursor-pointer ${todoMode === "view" ? "text-blue-500" : ""
                }`}
              onClick={(e) => {
                e.stopPropagation();
                setTodoMode("view");
              }}
            >
              👁️
            </span>

            <span
              title="View All Todos"
              className={`cursor-pointer ${todoMode === "viewall" ? "text-purple-500" : ""
                }`}
              onClick={(e) => {
                e.stopPropagation();
                setTodoMode("viewall");
              }}
            >
              📋
            </span>
          </div>
        </button>

        <button
          className={`${Styles.tab
            } flex items-center justify-center gap-2 w-full font-bold p-2 text-sm ${activeTab === "remainders" ? Styles.active : ""
            } sm:w-1/2`}
          onClick={() => handleTabChange("remainders")}
        >
          <span>Reminders</span>

          <span className="relative">
            🔔
            {totalRemaindersCount > 0 && (
              <span className="absolute -top-3 -right-2 bg-red-500 text-white text-[11px] font-bold rounded-full px-1.5">
                {totalRemaindersCount}
              </span>
            )}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === "todolist" &&
          (todoMode === "add" || todoMode === "edit") && (
            <div className="bg-white p-4 rounded-xl shadow mb-2">
              {/* Title */}
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={todoForm.title}
                  onChange={handleChange}
                  placeholder="Enter todo title"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Due Date */}
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  min={today}
                  value={todoForm.dueDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={todoForm.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional description"
                  className="w-full border border-gray-300 p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                {todoMode === "edit" && (
                  <button
                    onClick={() => {
                      setTodoMode("view");
                      setTodoForm({ title: "", dueDate: "", description: "" });
                    }}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                )}

                <button
                  onClick={handleSaveTodo}
                  className="bg-pink-500 text-white px-5 py-2 rounded hover:bg-pink-600"
                >
                  {todoMode === "edit" ? "Update" : "Save"}
                </button>
              </div>
            </div>
          )}

        {activeTab === "todolist" &&
          todoMode === "view" &&
          (todoList.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              {todoList.map((todo) => (
                <div
                  key={todo.id}
                  className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition p-3 flex flex-col justify-between border-l-4 border-pink-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-medium text-gray-800">
                      {todo.title}
                    </h3>

                    <div className="flex gap-2">
                      <button
                        title="Edit"
                        onClick={() => handleEditTodo(todo)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaEdit />
                      </button>
                      {todo.is_completed === 0 && (
                        <>
                          <button
                            title="Delete"
                            onClick={() => setDeleteTodoId(todo.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}

                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={todo.is_completed === 1}
                          onChange={() => handleToggleTodoStatus(todo)}
                          className="sr-only peer"
                        />

                        <div className="w-7 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 relative transition">
                          <div className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                      {todo.description || "No description"}
                    </p>

                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <span className="text-xs font-semibold text-gray-500">
                        📅 {formatDate(todo.due_date)}
                      </span>

                      {todo.is_completed === 1 ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {deleteTodoId === todo.id && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
                      <p className="text-sm font-semibold text-gray-800 mb-3">
                        Delete this todo {todo.title}?
                      </p>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeleteTodoId(null)}
                          className="px-4 py-1 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="px-4 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!
                </p>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  No data available.
                </p>
              </div>
            </div>
          ))}

        {activeTab === "todolist" &&
          todoMode === "viewall" &&
          (todoAll.length > 0 ? (
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              {todoAll.map((todo) => (
                <div
                  key={todo.id}
                  className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition p-3 flex flex-col justify-between border-l-4 border-pink-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-semibold text-gray-800">
                      {todo.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                      {todo.description || "No description"}
                    </p>

                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <span className="text-xs font-semibold text-gray-500">
                        📅 {formatDate(todo.due_date)}
                      </span>

                      {todo.is_completed === 1 ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                  Oops!
                </p>
                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                  No data available.
                </p>
              </div>
            </div>
          ))}

        {activeTab === "remainders" && (
          <>
            {remainderlist.incomplete_lesson_plan_for_next_week.length > 0 ||
              remainderlist.notice_for_teacher.length > 0 ||
              remainderlist.todoForToday.length > 0 ? (
              <div className="space-y-5">
                {hasTodos && (
                  <div>
                    <h2 className="text-base font-semibold text-blue-600 ">
                      ✅ Todo For Today
                    </h2>

                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                      {remainderlist.todoForToday.map((todo, index) => (
                        <div
                          key={`todo-${index}`}
                          className="bg-white rounded-xl shadow-md p-2 border-l-4 border-blue-400 hover:shadow-lg transition flex flex-col"
                        >
                          <div className="text-sm font-bold text-gray-800 mb-2">
                            {todo.title}
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">
                              📅 {formatDate(todo.due_date)}
                            </span>

                            {todo.is_completed === 1 ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                                Completed
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                                Pending
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-3">
                            {todo.description || "No description"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasNotices && (
                  <div>
                    <h2 className="text-base font-semibold text-purple-600 mb-3">
                      📢 Notices for Teacher
                    </h2>

                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                      {remainderlist.notice_for_teacher.map((notice, index) => (
                        <div
                          key={`notice-${index}`}
                          className="bg-white rounded-xl shadow-md p-2 border-l-4 border-purple-400 hover:shadow-lg transition"
                        >
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            📅 {formatDate(notice.notice_date)}
                          </div>

                          <div className="text-sm font-bold text-gray-800 mb-1">
                            {notice.subject}
                          </div>

                          <span className="text-xs text-gray-500 mb-2 block">
                            {notice.title}
                          </span>

                          <p className="text-sm text-gray-600 line-clamp-3">
                            {notice.notice_desc || "No description"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasLessonPlans && (
                  <div>
                    <h2 className="text-base font-semibold text-pink-600 mb-3">
                      📘 Incomplete Lesson Plans
                    </h2>

                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                      {/* {remainderlist.incomplete_lesson_plan_for_next_week.map(
                        (item, index) => (
                          <div
                            key={`lesson-${index}`}
                            className="bg-white rounded-xl shadow-md p-2 border-l-4 border-pink-400 hover:shadow-lg transition"
                          >
                            <div className="text-xs font-semibold text-gray-500 mb-1">
                              📅 {item.week_date}
                            </div>

                            <div className="text-sm font-bold text-gray-800 mb-2">
                              {item.title}
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-3">
                              {item.description || "No description"}
                            </p>
                          </div>
                        )
                      )} */}

                      {/* working for meenakshi */}
                      {/* {remainderlist.incomplete_lesson_plan_for_next_week.map(
                        (cls, cIdx) => (
                          <div
                            key={`class-${cIdx}`}
                            className="bg-white rounded-xl shadow-md p-3 border-l-4 border-pink-400"
                          >
                            <div className="text-base font-semibold text-gray-500 mb-1">
                              📘 Class {cls.class_name} - {cls.section_name}
                            </div>

                            {cls.subjects.map((sub, sIdx) => (
                              <div key={`sub-${sIdx}`} className="mt-2">
                                <h3 className="text-sm font-bold text-pink-600">
                                  {sub.subject_name}
                                </h3>

                                {sub.lesson_plans.map((plan, pIdx) => (
                                  <div
                                    key={`plan-${pIdx}`}
                                    className="mt-2 p-2 bg-gray-50 rounded-md"
                                  >
                                    <div className="text-sm font-semibold text-gray-500 mb-1">
                                      📅 {plan.week_date}
                                    </div>

                                    <div className="text-sm font-bold text-gray-800 mb-1">
                                      📖 Chapter Name - {plan.chapter_name}
                                    </div>

                                    <p className="text-sm text-gray-600">
                                      Status:- {plan.status}
                                      {plan.Status === "C" ? (
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                                          Completed
                                        </span>
                                      ) : (
                                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                                          Incomplete
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )
                      )} */}

                      {/* correct work for all */}
                      {/* {remainderlist.incomplete_lesson_plan_for_next_week.map(
                        (cls, cIdx) => (
                          <div
                            key={`class-${cIdx}`}
                            className="bg-white rounded-xl shadow-md p-3 border-l-4 border-pink-400"
                          >
                            <div className="text-base font-semibold text-gray-500 mb-1">
                              📘 Class {cls.class_name} - {cls.section_name}
                            </div>

                            {cls.subjects.map((sub, sIdx) => (
                              <div key={`sub-${sIdx}`} className="mt-2">
                                <h3 className="text-sm font-bold text-pink-600">
                                  {sub.subject_name}
                                </h3>

                                {sub.lesson_plans &&
                                sub.lesson_plans.length > 0 ? (
                                  sub.lesson_plans.map((plan, pIdx) => (
                                    <div
                                      key={`plan-${pIdx}`}
                                      className="mt-2 p-2 bg-gray-50 rounded-md"
                                    >
                                      <div className="text-sm font-semibold text-gray-500 mb-1">
                                        📅 {plan.week_date}
                                      </div>
                                      <div className="text-sm font-bold text-gray-800 mb-1">
                                        📖 Chapter Name - {plan.chapter_name}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        Status:{" "}
                                        {plan.status === "C"
                                          ? "Completed"
                                          : "Incomplete"}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-600 mt-1 italic">
                                    {" "}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      )} */}

                      {remainderlist.incomplete_lesson_plan_for_next_week.map(
                        (cls, cIdx) => {
                          // Collect subjects with empty lesson plans
                          const emptySubjects = cls.subjects
                            .filter(
                              (sub) =>
                                !sub.lesson_plans ||
                                sub.lesson_plans.length === 0
                            )
                            .map((sub) => sub.subject_name);

                          // Collect subjects with lesson plans
                          const subjectsWithPlans = cls.subjects.filter(
                            (sub) =>
                              sub.lesson_plans && sub.lesson_plans.length > 0
                          );

                          return (
                            <div
                              key={`class-${cIdx}`}
                              className="bg-white rounded-xl shadow-md p-2 border-l-4 border-pink-400"
                            >
                              <div className="text-base font-semibold text-gray-700 mb-2">
                                🏫 Class {cls.class_name} - {cls.section_name}
                              </div>

                              {/* Subjects with lesson plans */}
                              {subjectsWithPlans.map((sub, sIdx) => (
                                <div key={`sub-${sIdx}`} className="mt-2">
                                  <h3 className="text-sm font-bold text-pink-600">
                                    {sub.subject_name}
                                  </h3>

                                  {sub.lesson_plans.map((plan, pIdx) => (
                                    <div
                                      key={`plan-${pIdx}`}
                                      className="mt-2 p-2 bg-gray-50 rounded-md"
                                    >
                                      <div className="text-sm font-semibold text-gray-500 mb-1">
                                        📅 {plan.week_date}
                                      </div>

                                      <div className="text-sm font-bold text-gray-800 mb-1">
                                        📖 Chapter Name - {plan.chapter_name}
                                      </div>

                                      {/* <p className="text-sm text-gray-600">
                                        Status:{" "}
                                        {plan.status === "C"
                                          ? "Completed"
                                          : "Incomplete"}
                                      </p> */}
                                      <p className="text-sm text-gray-600">
                                        Status:- {plan.status}
                                        {plan.Status === "C" ? (
                                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                                            Completed
                                          </span>
                                        ) : (
                                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold">
                                            Incomplete
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ))}

                              {/* Subjects without lesson plans */}
                              {emptySubjects.length > 0 && (
                                <p className="text-sm text-gray-600 mt-2 ">
                                  <span className="text-sm font-bold">
                                    Subjects :{" "}
                                  </span>
                                  {emptySubjects.join(", ")}
                                </p>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative left-[1%] w-[100%] text-center flex justify-center items-center mt-10">
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-pink-500 drop-shadow-md mb-3">
                    Oops!
                  </p>
                  <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
                    No data available.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TodoListandRemainders;
