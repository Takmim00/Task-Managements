import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import io from "socket.io-client";

const socket = io.connect("https://task-management-server-six-chi.vercel.app", {
  withCredentials: true,
  transports: ["websocket"]
});

const Home = () => {
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("todo");
  const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
  const [editTaskData, setEditTaskData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [data.category]: [...prevTasks[data.category], data],
      }));
    });

    socket.on("delete_task", (data) => {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [data.category]: prevTasks[data.category].filter(
          (task) => task._id !== data._id
        ),
      }));
    });

    socket.on("edit_task", (updatedTask) => {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [updatedTask.category]: prevTasks[updatedTask.category].map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        ),
      }));
    });

    return () => {
      socket.off("receive_message");
      socket.off("delete_task");
      socket.off("edit_task");
    };
  }, []);

  const sendTask = async () => {
    if (task.trim() === "") return;

    const taskData = {
      category,
      title: task,
      timestamp: new Date().toLocaleTimeString(),
    };

    const response = await fetch(
      "https://task-management-server-six-chi.vercel.app/tasks",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      }
    );

    const newTask = await response.json();

    if (newTask._id) {
      socket.emit("send_task", newTask);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [category]: [...prevTasks[category], newTask],
      }));
    }

    setTask("");
  };

  const openEditModal = (task) => {
    setEditTaskData(task);
    setModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditTaskData({ ...editTaskData, title: e.target.value });
  };

  const updateTask = async () => {
    if (!editTaskData || !editTaskData._id) return;

    try {
      const response = await fetch(
        `https://task-management-server-six-chi.vercel.app/tasks/${editTaskData._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editTaskData.title }),
        }
      );

      const updatedTask = await response.json();

      if (updatedTask._id) {
        socket.emit("edit_task", updatedTask);
        console.log(updatedTask);
        setTasks((prevTasks) => ({
          ...prevTasks,
          [updatedTask.category]: prevTasks[updatedTask.category].map((task) =>
            task._id === updatedTask._id ? updatedTask : task
          ),
        }));
      }

      setModalOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (_id, category) => {
    if (!_id) {
      console.error("Error: Task _id is undefined!");
      return;
    }

    try {
      const response = await fetch(
        `https://task-management-server-six-chi.vercel.app/tasks/${_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      console.log(data.message);
      if (data.deletedCount > 0) {
        socket.emit("delete_task", { _id, category });
        setTasks((prevTasks) => ({
          ...prevTasks,
          [category]: prevTasks[category].filter((task) => task._id !== _id),
        }));
        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Task Management</h2>

      {/* Task Input Section */}
      <div className="bg-white shadow-md p-4 rounded-lg w-full max-w-md">
        <select
          className="select select-bordered w-full mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="todo">To-Do</option>
          <option value="inprogress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <input
          type="text"
          placeholder="Enter Task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="input input-bordered w-full mb-2"
        />
        <button className="btn btn-primary w-full" onClick={sendTask}>
          Add Task
        </button>
      </div>

      {/* Task Display Section */}
      <div className="grid grid-cols-3 gap-6 mt-6 w-full max-w-4xl">
        {["todo", "inprogress", "done"].map((cat) => (
          <div key={cat} className="bg-white shadow-md p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              {cat.replace("_", " ")}
            </h3>
            {tasks[cat].map((task) => (
              <div
                key={task._id}
                className="p-2 border-b flex justify-between items-center"
              >
                <div>
                  <p>{task.title}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(task.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <FaEdit
                    className="text-blue-500 cursor-pointer"
                    onClick={() => openEditModal(task)}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer"
                    onClick={() => deleteTask(task._id)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <input
              type="text"
              value={editTaskData?.title || ""}
              onChange={handleEditChange}
              className="input input-bordered w-full mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={updateTask}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
