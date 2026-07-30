const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, category, priority, status, due_date AS "dueDate"
       FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to read tasks", error: err.message });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, category, priority, status, due_date AS "dueDate"
       FROM tasks WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to read task", error: err.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, category, priority, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, category, priority, status, due_date AS "dueDate"`,
      [req.user.id, title.trim(), description || "", category || "", priority || "Medium", status || "Pending", dueDate || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate } = req.body;

    const existing = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: "Task not found" });
    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE tasks SET
        title = $1, description = $2, category = $3, priority = $4, status = $5, due_date = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, title, description, category, priority, status, due_date AS "dueDate"`,
      [
        title ?? current.title,
        description ?? current.description,
        category ?? current.category,
        priority ?? current.priority,
        status ?? current.status,
        dueDate ?? current.due_date,
        req.params.id,
        req.user.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted", task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
});

module.exports = router;