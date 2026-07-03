import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";

const initialForm = {
  title: "",
  description: "",
  category: "",
  priority: "Low",
  status: "Pending",
  dueDate: "",
};

function AddTask() {
  const navigate = useNavigate();
  const { addTask } = useTasks();

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  // Handles input changes
  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    // Remove error while typing
    setErrors({
      ...errors,
      [event.target.name]: "",
    });
  }

  // Handles form submission
  function handleSubmit(event) {
    event.preventDefault();

    let newErrors = {};

    // Title Validation (5-15 characters)
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (
      formData.title.trim().length < 5 ||
      formData.title.trim().length > 15
    ) {
      newErrors.title = "Title must be between 5 and 15 characters";
    }

    // Description Validation (15-25 characters)
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (
      formData.description.trim().length < 15 ||
      formData.description.trim().length > 25
    ) {
      newErrors.description =
        "Description must be between 15 and 25 characters";
    }

    // Category Validation (3-8 characters)
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (
      formData.category.trim().length < 3 ||
      formData.category.trim().length > 8
    ) {
      newErrors.category = "Category must be between 3 and 8 characters";
    }

    // Due Date Validation
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const today = new Date().toISOString().split("T")[0];

      if (formData.dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    setErrors(newErrors);

    // Stop submission if errors exist
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Add task
    addTask(formData);

    // Reset form
    setFormData(initialForm);
    setErrors({});

    // Navigate to Total Tasks
    navigate("/total-tasks");
  }

  return (
    <section className="add-task-page">
      <h2>Add New Task</h2>

      <form className="form" onSubmit={handleSubmit}>
        {/* Title */}
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p className="error">{errors.title}</p>}

        {/* Description */}
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
        />
        {errors.description && (
          <p className="error">{errors.description}</p>
        )}

        {/* Category */}
        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          type="text"
          value={formData.category}
          onChange={handleChange}
        />
        {errors.category && <p className="error">{errors.category}</p>}

        {/* Priority */}
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {/* Status */}
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Due Date */}
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
        {errors.dueDate && <p className="error">{errors.dueDate}</p>}

        <button className="button button-primary" type="submit">
          Add Task
        </button>
      </form>
    </section>
  );
}

export default AddTask;