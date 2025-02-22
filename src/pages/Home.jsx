import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import io from "socket.io-client";
import { AuthContext } from "./../provider/AuthProvider";
import Task from "./Task";

const socket = io.connect("https://task-management-server-six-chi.vercel.app", {
  withCredentials: true,
  transports: ["websocket"],
});

const Home = () => {
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("todo");
  const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
  const [editTaskData, setEditTaskData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          "https://task-management-server-six-chi.vercel.app/tasks"
        );
        const data = await response.json();

        const categorizedTasks = { todo: [], inprogress: [], done: [] };
        data.forEach((task) => {
          categorizedTasks[task.category].push(task);
        });

        setTasks(categorizedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setTasks((prevTasks) => ({
        ...prevTasks,
        [data.category]: [...prevTasks[data.category], data],
      }));
    });

    socket.on("edit_task", (updatedTask) => {
      console.log(updatedTask);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [updatedTask.category]: prevTasks[updatedTask.category].map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        ),
      }));
    });
    socket.on("delete_task", (taskId) => {
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        Object.keys(updatedTasks).forEach((category) => {
          updatedTasks[category] = updatedTasks[category].filter(
            (task) => task._id !== taskId
          );
        });
        return updatedTasks;
      });
    });
    socket.on("update_tasks", ({ category, tasks }) => {
      setTasks((prevTasks) => ({ ...prevTasks, [category]: tasks }));
    });

    return () => {
      socket.off("receive_message");
      socket.off("delete_task");
      socket.off("edit_task");
    };
  }, [tasks]);

  const sendTask = async () => {
    if (task.trim() === "") return;
    if (!task.trim()) {
      toast.error("Task title is required!");
      return;
    }

    if (task.length > 50) {
      toast.error("Task title must be 50 characters or less!");
      return;
    }

    const taskData = {
      category,
      title: task,
      timestamp: new Date().toLocaleTimeString(),
      userEmail: user?.email,
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
    console.log("Edit button clicked", task);
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
  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `https://task-management-server-six-chi.vercel.app/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        socket.emit("delete_task", taskId);
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          Object.keys(updatedTasks).forEach((category) => {
            updatedTasks[category] = updatedTasks[category].filter(
              (task) => task._id !== taskId
            );
          });
          return updatedTasks;
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    let category;
    Object.keys(tasks).forEach((cat) => {
      if (tasks[cat].some((task) => task._id === active.id)) {
        category = cat;
      }
    });

    if (!category) return;

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      const categoryTasks = [...updatedTasks[category]];

      const oldIndex = categoryTasks.findIndex(
        (task) => task._id === active.id
      );
      const newIndex = categoryTasks.findIndex((task) => task._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const [movedTask] = categoryTasks.splice(oldIndex, 1);
        categoryTasks.splice(newIndex, 0, movedTask);
      }

      updatedTasks[category] = categoryTasks;

      // Emit the reorder event
      socket.emit("reorder_tasks", { category, tasks: categoryTasks });

      return updatedTasks;
    });
  };

  return (
    <div className="flex flex-col items-center p-6 min-h-screen ">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-4">Task Management</h2>

      {/* Task Input Section */}
      <div className=" shadow-md p-4 rounded-lg w-full max-w-md">
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
          maxLength={50}
          className="input input-bordered w-full mb-2"
        />
        <button className="btn btn-primary w-full" onClick={sendTask}>
          Add Task
        </button>
      </div>

      {/* Task Display Section */}
      <div className="grid md:grid-cols-3 grid-cols-1 gap-6 mt-6 w-full max-w-4xl">
        {["todo", "inprogress", "done"].map((cat) => (
          <div key={cat} className=" shadow-md p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 capitalize">
              {cat.replace("_", " ")}
            </h3>
            <DndContext
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks[cat].map((task) => task._id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks[cat].map((task) => (
                  <Task
                    key={task._id}
                    task={task}
                    openEditModal={openEditModal}
                    deleteTask={deleteTask}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
