import  express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pg  from "pg";
import env from "dotenv";
env.config();


const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Database Connection
const db = new pg.Client({
  connectionString: process.env.PG_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
db.connect();

// Create Notes Table if not exists
db.query(
  `CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL
  );`
);

// Fetch all notes
app.get("/notes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new note
app.post("/notes", async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM notes WHERE id = $1", [id]);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
