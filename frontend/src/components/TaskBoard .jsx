/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

axios.defaults.withCredentials = true;

const API_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

const TaskDetailModal = ({ task, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Task Details</h2>
      <p><strong>Title:</strong> {task.title}</p>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Priority:</strong> {task.priority}</p>
      <p><strong>Due Date:</strong>{" "}
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
      </p>
      <button
        onClick={onClose}
        className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all"
      >
        Close
      </button>
    </div>
  </div>
);

const EditTaskModal = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  const handleSave = () => {
    onSave(editedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md text-gray-900 dark:text-gray-100">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Edit Task</h2>
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) =>
            setEditedTask({ ...editedTask, title: e.target.value })
          }
          className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
        <textarea
          value={editedTask.description}
          onChange={(e) =>
            setEditedTask({ ...editedTask, description: e.target.value })
          }
          className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          rows="3"
        />
        <select
          value={editedTask.status}
          onChange={(e) =>
            setEditedTask({ ...editedTask, status: e.target.value })
          }
          className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          value={editedTask.priority}
          onChange={(e) =>
            setEditedTask({ ...editedTask, priority: e.target.value })
          }
          className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <input
          type="date"
          value={editedTask.dueDate ? editedTask.dueDate.split("T")[0] : ""}
          onChange={(e) =>
            setEditedTask({ ...editedTask, dueDate: e.target.value })
          }
          className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const TrelloBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);
  let color = "#ffffff";

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "#3498db",
  };

  //  Shortcut for dark mode (Ctrl + D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        document.documentElement.classList.toggle("dark");
        const isDark = document.documentElement.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/tasks`);
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [dispatch, navigate]);

  const columns = {
    todo: {
      id: "todo",
      title: "TODO",
      tasks: tasks.filter((task) => task.status === "To Do"),
    },
    inProgress: {
      id: "inProgress",
      title: "IN PROGRESS",
      tasks: tasks.filter((task) => task.status === "In Progress"),
    },
    done: {
      id: "done",
      title: "DONE",
      tasks: tasks.filter((task) => task.status === "Done"),
    },
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const task = columns[source.droppableId].tasks[source.index];
    const updatedTask = {
      ...task,
      status:
        destination.droppableId === "inProgress"
          ? "In Progress"
          : destination.droppableId === "done"
          ? "Done"
          : "To Do",
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${task._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const addNewTask = async () => {
    const newTask = {
      title: "New Task",
      description: "New Description",
      status: "To Do",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    };

    try {
      const response = await axios.post(`${API_URL}/api/v1/tasks`, newTask);
      dispatch(addTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${updatedTask._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center text-2xl dark:text-white">
        <h1>
          Using Free Hosting Service... Initial Loading (40–50s)
          <ClipLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </h1>
      </div>
    );

  if (error) return <div className="dark:text-red-400">Error: {error}</div>;

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
    if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const filteredColumns = {
    todo: {
      ...columns.todo,
      tasks: sortedTasks.filter((task) => task.status === "To Do"),
    },
    inProgress: {
      ...columns.inProgress,
      tasks: sortedTasks.filter((task) => task.status === "In Progress"),
    },
    done: {
      ...columns.done,
      tasks: sortedTasks.filter((task) => task.status === "Done"),
    },
  };

  return (
    <div className="p-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          onClick={addNewTask}
        >
          Add Task
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Recent</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-right">
         Press <b>Ctrl + D</b> to toggle Dark Mode
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-4">
          {Object.values(filteredColumns).map((column) => (
            <div key={column.id} className="flex-1 min-w-[250px]">
              <h2
                className={`font-bold mb-3 text-center p-2 rounded-xl text-white ${
                  column.title === "TODO"
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : column.title === "IN PROGRESS"
                    ? "bg-gradient-to-r from-blue-500 to-blue-700"
                    : "bg-gradient-to-r from-green-500 to-green-700"
                }`}
              >
                {column.title}
              </h2>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-3 rounded-xl min-h-[150px] transition-all duration-300"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-gray-700 p-3 mb-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                          >
                            <h3 className="font-semibold text-lg mb-1 dark:text-gray-100">
                              {task.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                              {task.description}
                            </p>

                            <div className="flex justify-between items-center text-xs mb-2">
                              <span
                                className={`px-2 py-1 rounded-full font-semibold ${
                                  task.status === "To Do"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : task.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {task.status}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  task.priority === "High"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "Medium"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 dark:text-gray-400">
                              Due:{" "}
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "Not set"}
                            </p>

                            <div className="flex justify-end mt-3">
                              <button
                                onClick={() => deleteTask(task._id)}
                                className="text-red-500 dark:text-red-400 mr-2 hover:scale-110 transition-transform"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => setEditTask(task)}
                                className="text-blue-500 dark:text-blue-400 mr-2 hover:scale-110 transition-transform"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => setViewTask(task)}
                                className="text-green-500 dark:text-green-400 hover:scale-110 transition-transform"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {viewTask && (
        <TaskDetailModal task={viewTask} onClose={() => setViewTask(null)} />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onSave={handleEditTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
};

export default TrelloBoard;
