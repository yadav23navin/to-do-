import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTasks } from "../hooks/useTasks.js";
import RichTextEditor from "../components/RichTextEditor.jsx";

function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, loading } = useTasks();

  // Find the task being edited from the already-loaded tasks list, rather
  // than making a separate network request — TasksProvider already fetched
  // every task on app mount, so it's already in memory here.
  const taskId = Number(id);
  const existingTask = tasks.find((task) => task.id === taskId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Low",
    status: "Pending",
    dueDate: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Once tasks have loaded and the matching task is found, populate the
  // form with its current values. Runs again if existingTask changes
  // (e.g. tasks refetch), but won't overwrite the form after the user
  // has started editing, since existingTask itself won't change mid-edit.
  useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description,
        category: existingTask.category,
        priority: existingTask.priority,
        status: existingTask.status,
        dueDate: existingTask.dueDate,
      });
    }
  }, [existingTask]);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setErrors({
      ...errors,
      [event.target.name]: "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    let newErrors = {};

    const plainDescription = formData.description
      .replace(/<[^>]*>/g, "")
      .trim();

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (
      formData.title.trim().length < 5 ||
      formData.title.trim().length > 15
    ) {
      newErrors.title = "Title must be between 5 and 15 characters";
    }

    if (!plainDescription) {
      newErrors.description = "Description is required";
    } else if (
      plainDescription.length < 10 ||
      plainDescription.length > 100
    ) {
      newErrors.description =
        "Description must be between 10 and 100 characters";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (
      formData.category.trim().length < 3 ||
      formData.category.trim().length > 8
    ) {
      newErrors.category = "Category must be between 3 and 8 characters";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    // Note: no "cannot be in the past" check here, unlike AddTask — an
    // existing task's due date may already legitimately be in the past
    // if it's overdue, and editing other fields shouldn't force the
    // user to also push the date forward.

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await updateTask(taskId, formData);
      navigate("/total-tasks");
    } catch (err) {
      setSubmitError(err.message || "Failed to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <p className="task-meta">Loading task...</p>;
  }

  if (!existingTask) {
    return <p className="task-meta">Task not found.</p>;
  }

  return (
    <section className="add-task-page">
      <h2>Edit Task</h2>

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <p className="error">{errors.title}</p>}

        <label>Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => {
            setFormData({
              ...formData,
              description: value,
            });
          }}
        />
        {errors.description && (
          <p className="error">{errors.description}</p>
        )}

        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          type="text"
          value={formData.category}
          onChange={handleChange}
        />
        {errors.category && <p className="error">{errors.category}</p>}

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

        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
        />
        {errors.dueDate && <p className="error">{errors.dueDate}</p>}

        {submitError && <p className="error">{submitError}</p>}

        <button
          className="button button-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default EditTask;