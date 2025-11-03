import taskModel from "../models/Task.js";

//  Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await taskModel.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks:", error.message);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

//  Create new task
const createTask = async (req, res) => {
  try {
    const task = new taskModel(req.body);
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error.message);

    // check the type of error and send proper response
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    if (error.code === 11000) {
      // Mongo duplicate key (if unique field exists)
      return res.status(409).json({ message: "Task already exists" });
    }

    // For any other unexpected errors
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

//  Update task
const updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTask = await taskModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(400).json({ message: "Failed to update task" });
  }
};

//  Delete task
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await taskModel.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(400).json({ message: "Failed to delete task" });
  }
};

//  Reorder tasks (update status/order)
const reorderTasks = async (req, res) => {
  const { tasks } = req.body;
  try {
    for (let task of tasks) {
      await taskModel.findByIdAndUpdate(task.id, { status: task.status });
    }
    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    console.error("Error reordering tasks:", error.message);
    res.status(400).json({ message: "Failed to reorder tasks" });
  }
};

export { getTasks, createTask, updateTask, deleteTask, reorderTasks };
