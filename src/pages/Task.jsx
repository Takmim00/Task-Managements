import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaEdit, FaTrash } from "react-icons/fa";

const Task = ({ task, openEditModal, deleteTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-2 border-b flex justify-between items-center bg-gray-50 cursor-pointer"
    >
      <div {...attributes} {...listeners} className="flex-1">
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
          onClick={(event) => {
            event.stopPropagation();
            openEditModal(task);
          }}
        />
        <FaTrash
          className="text-red-500 cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            deleteTask(task._id, task.category);
          }}
        />
      </div>
    </div>
  );
};

export default Task;
