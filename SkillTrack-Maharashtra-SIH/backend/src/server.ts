import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch {
    res.json({
      status: "ok",
      database: "not-connected",
      message: "API is running; configure PostgreSQL.",
    });
  }
});

/* =========================================================
   DEMO LOGIN
========================================================= */

app.post("/api/auth/demo-login", (req, res) => {
  const token = jwt.sign(
    {
      email: req.body.email || "admin@skilltrack.gov.in",
      role: "admin",
    },
    process.env.JWT_SECRET || "dev-secret",
    {
      expiresIn: "2h",
    },
  );

  res.json({
    token,
    user: {
      name: "Government Admin",
      role: "admin",
    },
  });
});

/* =========================================================
   DASHBOARD
========================================================= */

app.get("/api/dashboard", async (_req, res) => {
  try {
    const [candidatesResult, employedResult, skillsResult, districtsResult] =
      await Promise.all([
        pool.query(`
        SELECT COUNT(*)::int AS count
        FROM users
        WHERE role = 'trainee'
      `),

        pool.query(`
        SELECT COUNT(*)::int AS count
        FROM employment_records
        WHERE status = 'Active'
      `),

        pool.query(`
        SELECT
          name,
          demand_count,
          supply_count
        FROM skills
        ORDER BY
          (demand_count - supply_count) DESC
      `),

        pool.query(`
        SELECT
          district,
          SUM(enrolled)::int AS trained,
          SUM(placed)::int AS placed,
          ROUND(
            SUM(placed) * 100.0 /
            NULLIF(SUM(enrolled), 0),
            1
          )::float AS rate
        FROM training_programs
        GROUP BY district
        ORDER BY rate DESC
      `),
      ]);

    res.json({
      candidates: candidatesResult.rows[0].count,

      employed: employedResult.rows[0].count,

      skillGaps: skillsResult.rows,

      districts: districtsResult.rows,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    res.status(500).json({
      message: "Database unavailable.",
    });
  }
});

/* =========================================================
   SKILLS
========================================================= */

app.get("/api/skills", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM skills
      ORDER BY
        (demand_count - supply_count) DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Skills API error:", error);

    res.status(500).json({
      message: "Database unavailable",
    });
  }
});

/* =========================================================
   EMPLOYMENT
   GET
========================================================= */

app.get("/api/employment", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        trainee_name,
        employer,
        job_title,
        district,
        salary,
        joining_date,
        status
      FROM employment_records
      ORDER BY joining_date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Employment API error:", error);

    res.status(500).json({
      message: "Database unavailable",
    });
  }
});

/* =========================================================
   EMPLOYMENT
   CREATE
========================================================= */

app.post("/api/employment", async (req, res) => {
  try {
    const {
      trainee_name,
      employer,
      job_title,
      district,
      salary,
      joining_date,
      status,
    } = req.body;

    if (!trainee_name || !employer || !job_title) {
      return res.status(400).json({
        message: "Candidate name, employer and job title are required.",
      });
    }

    const salaryValue =
      salary === "" || salary === null || salary === undefined
        ? null
        : Number(salary);

    if (
      salaryValue !== null &&
      (!Number.isInteger(salaryValue) || salaryValue < 0)
    ) {
      return res.status(400).json({
        message: "Salary must be a valid positive whole number.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO employment_records
        (
          trainee_name,
          employer,
          job_title,
          district,
          salary,
          joining_date,
          status
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING
          id,
          trainee_name,
          employer,
          job_title,
          district,
          salary,
          joining_date,
          status
      `,
      [
        trainee_name.trim(),
        employer.trim(),
        job_title.trim(),
        district?.trim() || null,
        salaryValue,
        joining_date || null,
        status?.trim() || "Active",
      ],
    );

    res.status(201).json({
      message: "Employment record created successfully.",
      employment: result.rows[0],
    });
  } catch (error) {
    console.error("Create employment error:", error);

    res.status(500).json({
      message: "Unable to create employment record.",
    });
  }
});

/* =========================================================
   EMPLOYMENT
   UPDATE
========================================================= */

app.put("/api/employment/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid employment ID.",
      });
    }

    const {
      trainee_name,
      employer,
      job_title,
      district,
      salary,
      joining_date,
      status,
    } = req.body;

    if (!trainee_name || !employer || !job_title) {
      return res.status(400).json({
        message: "Candidate name, employer and job title are required.",
      });
    }

    const salaryValue =
      salary === "" || salary === null || salary === undefined
        ? null
        : Number(salary);

    if (
      salaryValue !== null &&
      (!Number.isInteger(salaryValue) || salaryValue < 0)
    ) {
      return res.status(400).json({
        message: "Salary must be a valid positive whole number.",
      });
    }

    const result = await pool.query(
      `
        UPDATE employment_records
        SET
          trainee_name = $1,
          employer = $2,
          job_title = $3,
          district = $4,
          salary = $5,
          joining_date = $6,
          status = $7
        WHERE id = $8
        RETURNING
          id,
          trainee_name,
          employer,
          job_title,
          district,
          salary,
          joining_date,
          status
      `,
      [
        trainee_name.trim(),
        employer.trim(),
        job_title.trim(),
        district?.trim() || null,
        salaryValue,
        joining_date || null,
        status?.trim() || "Active",
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employment record not found.",
      });
    }

    res.json({
      message: "Employment record updated successfully.",
      employment: result.rows[0],
    });
  } catch (error) {
    console.error("Update employment error:", error);

    res.status(500).json({
      message: "Unable to update employment record.",
    });
  }
});

/* =========================================================
   EMPLOYMENT
   DELETE
========================================================= */

app.delete("/api/employment/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid employment ID.",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM employment_records
        WHERE id = $1
        RETURNING
          id,
          trainee_name,
          employer
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employment record not found.",
      });
    }

    res.json({
      message: "Employment record deleted successfully.",
      employment: result.rows[0],
    });
  } catch (error) {
    console.error("Delete employment error:", error);

    res.status(500).json({
      message: "Unable to delete employment record.",
    });
  }
});

/* =========================================================
   TRAINING
   GET
========================================================= */

app.get("/api/training", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        provider,
        district,
        enrolled,
        completed,
        placed
      FROM training_programs
      ORDER BY enrolled DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Training API error:", error);

    res.status(500).json({
      message: "Database unavailable",
    });
  }
});

/* =========================================================
   TRAINING
   CREATE
========================================================= */

app.post("/api/training", async (req, res) => {
  try {
    const { title, provider, district, enrolled, completed, placed } = req.body;

    if (!title || !provider) {
      return res.status(400).json({
        message: "Training title and provider are required.",
      });
    }

    const enrolledCount = Number(enrolled || 0);

    const completedCount = Number(completed || 0);

    const placedCount = Number(placed || 0);

    if (
      !Number.isInteger(enrolledCount) ||
      !Number.isInteger(completedCount) ||
      !Number.isInteger(placedCount)
    ) {
      return res.status(400).json({
        message: "Enrolled, completed and placed values must be whole numbers.",
      });
    }

    if (enrolledCount < 0 || completedCount < 0 || placedCount < 0) {
      return res.status(400).json({
        message: "Training numbers cannot be negative.",
      });
    }

    if (completedCount > enrolledCount) {
      return res.status(400).json({
        message: "Completed candidates cannot exceed enrolled candidates.",
      });
    }

    if (placedCount > completedCount) {
      return res.status(400).json({
        message: "Placed candidates cannot exceed completed candidates.",
      });
    }

    const result = await pool.query(
      `
        INSERT INTO training_programs
        (
          title,
          provider,
          district,
          enrolled,
          completed,
          placed
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING
          id,
          title,
          provider,
          district,
          enrolled,
          completed,
          placed
      `,
      [
        title.trim(),
        provider.trim(),
        district?.trim() || null,
        enrolledCount,
        completedCount,
        placedCount,
      ],
    );

    res.status(201).json({
      message: "Training program created successfully.",
      program: result.rows[0],
    });
  } catch (error) {
    console.error("Create training error:", error);

    res.status(500).json({
      message: "Unable to create training program.",
    });
  }
});

/* =========================================================
   TRAINING
   UPDATE
========================================================= */

app.put("/api/training/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid training program ID.",
      });
    }

    const { title, provider, district, enrolled, completed, placed } = req.body;

    if (!title || !provider) {
      return res.status(400).json({
        message: "Training title and provider are required.",
      });
    }

    const enrolledCount = Number(enrolled || 0);

    const completedCount = Number(completed || 0);

    const placedCount = Number(placed || 0);

    if (
      !Number.isInteger(enrolledCount) ||
      !Number.isInteger(completedCount) ||
      !Number.isInteger(placedCount)
    ) {
      return res.status(400).json({
        message: "Training numbers must be whole numbers.",
      });
    }

    if (enrolledCount < 0 || completedCount < 0 || placedCount < 0) {
      return res.status(400).json({
        message: "Training numbers cannot be negative.",
      });
    }

    if (completedCount > enrolledCount) {
      return res.status(400).json({
        message: "Completed candidates cannot exceed enrolled candidates.",
      });
    }

    if (placedCount > completedCount) {
      return res.status(400).json({
        message: "Placed candidates cannot exceed completed candidates.",
      });
    }

    const result = await pool.query(
      `
        UPDATE training_programs
        SET
          title = $1,
          provider = $2,
          district = $3,
          enrolled = $4,
          completed = $5,
          placed = $6
        WHERE id = $7
        RETURNING
          id,
          title,
          provider,
          district,
          enrolled,
          completed,
          placed
      `,
      [
        title.trim(),
        provider.trim(),
        district?.trim() || null,
        enrolledCount,
        completedCount,
        placedCount,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Training program not found.",
      });
    }

    res.json({
      message: "Training program updated successfully.",
      program: result.rows[0],
    });
  } catch (error) {
    console.error("Update training error:", error);

    res.status(500).json({
      message: "Unable to update training program.",
    });
  }
});

/* =========================================================
   TRAINING
   DELETE
========================================================= */

app.delete("/api/training/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid training program ID.",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM training_programs
        WHERE id = $1
        RETURNING id, title
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Training program not found.",
      });
    }

    res.json({
      message: "Training program deleted successfully.",
      program: result.rows[0],
    });
  } catch (error) {
    console.error("Delete training error:", error);

    res.status(500).json({
      message: "Unable to delete training program.",
    });
  }
});

/* =========================================================
   CANDIDATES
   GET
========================================================= */

app.get("/api/candidates", async (_req, res) => {
  try {
    const users = await pool.query(`
      SELECT
        id,
        name,
        email,
        district,
        created_at
      FROM users
      WHERE role = 'trainee'
      ORDER BY created_at DESC
    `);

    const candidates = await Promise.all(
      users.rows.map(async (user) => {
        const skills = await pool.query(
          `
                  SELECT
                    skill_name,
                    proficiency
                  FROM candidate_skills
                  WHERE user_id = $1
                  ORDER BY proficiency DESC
                `,
          [user.id],
        );

        const employment = await pool.query(
          `
                  SELECT
                    employer,
                    job_title,
                    district,
                    salary,
                    joining_date,
                    status
                  FROM employment_records
                  WHERE trainee_name = $1
                  ORDER BY joining_date DESC
                  LIMIT 1
                `,
          [user.name],
        );

        return {
          ...user,
          skills: skills.rows,
          employment: employment.rows[0] || null,
        };
      }),
    );

    res.json(candidates);
  } catch (error) {
    console.error("Candidates API error:", error);

    res.status(500).json({
      message: "Unable to fetch candidate data",
    });
  }
});

/* =========================================================
   CANDIDATES
   CREATE
========================================================= */

app.post("/api/candidates", async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, email, district, skills } = req.body;

    if (!name || !email || !district) {
      return res.status(400).json({
        message: "Name, email and district are required.",
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        message: "Skills must be an array.",
      });
    }

    await client.query("BEGIN");

    const existing = await client.query(
      `
          SELECT id
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
      [email.trim()],
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "A candidate with this email already exists.",
      });
    }

    const userResult = await client.query(
      `
          INSERT INTO users
          (
            name,
            email,
            role,
            district
          )
          VALUES
          ($1,$2,'trainee',$3)
          RETURNING
            id,
            name,
            email,
            district,
            created_at
        `,
      [name.trim(), email.trim(), district.trim()],
    );

    const candidate = userResult.rows[0];

    for (const skill of skills) {
      if (
        skill &&
        skill.skill_name &&
        Number.isFinite(Number(skill.proficiency))
      ) {
        const proficiency = Math.max(
          0,
          Math.min(100, Number(skill.proficiency)),
        );

        await client.query(
          `
            INSERT INTO candidate_skills
            (
              user_id,
              skill_name,
              proficiency
            )
            VALUES
            ($1,$2,$3)
          `,
          [candidate.id, skill.skill_name.trim(), proficiency],
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Candidate created successfully.",
      candidate,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create candidate error:", error);

    res.status(500).json({
      message: "Unable to create candidate.",
    });
  } finally {
    client.release();
  }
});

/* =========================================================
   CANDIDATES
   UPDATE
========================================================= */

app.put("/api/candidates/:id", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid candidate ID.",
      });
    }

    const { name, email, district, skills } = req.body;

    if (!name || !email || !district) {
      return res.status(400).json({
        message: "Name, email and district are required.",
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        message: "Skills must be an array.",
      });
    }

    await client.query("BEGIN");

    const duplicate = await client.query(
      `
          SELECT id
          FROM users
          WHERE email = $1
          AND id <> $2
          LIMIT 1
        `,
      [email.trim(), id],
    );

    if (duplicate.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "Another candidate already uses this email.",
      });
    }

    const candidateResult = await client.query(
      `
          UPDATE users
          SET
            name = $1,
            email = $2,
            district = $3
          WHERE id = $4
          AND role = 'trainee'
          RETURNING
            id,
            name,
            email,
            district,
            created_at
        `,
      [name.trim(), email.trim(), district.trim(), id],
    );

    if (candidateResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Candidate not found.",
      });
    }

    await client.query(
      `
        DELETE FROM candidate_skills
        WHERE user_id = $1
      `,
      [id],
    );

    for (const skill of skills) {
      if (
        skill &&
        skill.skill_name &&
        Number.isFinite(Number(skill.proficiency))
      ) {
        const proficiency = Math.max(
          0,
          Math.min(100, Number(skill.proficiency)),
        );

        await client.query(
          `
            INSERT INTO candidate_skills
            (
              user_id,
              skill_name,
              proficiency
            )
            VALUES
            ($1,$2,$3)
          `,
          [id, skill.skill_name.trim(), proficiency],
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      message: "Candidate updated successfully.",
      candidate: candidateResult.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update candidate error:", error);

    res.status(500).json({
      message: "Unable to update candidate.",
    });
  } finally {
    client.release();
  }
});

/* =========================================================
   CANDIDATES
   DELETE
========================================================= */

app.delete("/api/candidates/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid candidate ID.",
      });
    }

    const result = await pool.query(
      `
          DELETE FROM users
          WHERE id = $1
          AND role = 'trainee'
          RETURNING
            id,
            name
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Candidate not found.",
      });
    }

    res.json({
      message: "Candidate deleted successfully.",
      candidate: result.rows[0],
    });
  } catch (error) {
    console.error("Delete candidate error:", error);

    res.status(500).json({
      message: "Unable to delete candidate.",
    });
  }
});

/* =========================================================
   RETENTION
   GET
========================================================= */

app.get("/api/retention", async (_req, res) => {
  try {
    const records = await pool.query(`
        SELECT
          id,
          candidate_name,
          employer,
          checkpoint,
          status,
          monthly_salary,
          verified_by,
          verified_at,
          notes,
          created_at
        FROM retention_checkpoints
        ORDER BY
          candidate_name,
          CASE checkpoint
            WHEN '3M' THEN 1
            WHEN '6M' THEN 2
            WHEN '12M' THEN 3
          END
      `);

    res.json(records.rows);
  } catch (error) {
    console.error("Retention API error:", error);

    res.status(500).json({
      message: "Unable to fetch retention data",
    });
  }
});

/* =========================================================
   RETENTION
   CREATE
========================================================= */

app.post("/api/retention", async (req, res) => {
  try {
    const {
      candidate_name,
      employer,
      checkpoint,
      status,
      monthly_salary,
      verified_by,
      verified_at,
      notes,
    } = req.body;

    if (!candidate_name || !checkpoint) {
      return res.status(400).json({
        message: "Candidate name and checkpoint are required.",
      });
    }

    if (!["3M", "6M", "12M"].includes(checkpoint)) {
      return res.status(400).json({
        message: "Checkpoint must be 3M, 6M or 12M.",
      });
    }

    const allowedStatuses = ["Pending", "Completed", "Failed"];

    const finalStatus = status || "Pending";

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        message: "Invalid retention status.",
      });
    }

    const salaryValue =
      monthly_salary === "" ||
      monthly_salary === null ||
      monthly_salary === undefined
        ? null
        : Number(monthly_salary);

    if (
      salaryValue !== null &&
      (!Number.isInteger(salaryValue) || salaryValue < 0)
    ) {
      return res.status(400).json({
        message: "Monthly salary must be a valid whole number.",
      });
    }

    const result = await pool.query(
      `
          INSERT INTO retention_checkpoints
          (
            candidate_name,
            employer,
            checkpoint,
            status,
            monthly_salary,
            verified_by,
            verified_at,
            notes
          )
          VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING
            id,
            candidate_name,
            employer,
            checkpoint,
            status,
            monthly_salary,
            verified_by,
            verified_at,
            notes,
            created_at
        `,
      [
        candidate_name.trim(),
        employer?.trim() || null,
        checkpoint,
        finalStatus,
        salaryValue,
        verified_by?.trim() || null,
        verified_at || null,
        notes?.trim() || null,
      ],
    );

    res.status(201).json({
      message: "Retention checkpoint created successfully.",
      record: result.rows[0],
    });
  } catch (error) {
    console.error("Create retention error:", error);

    res.status(500).json({
      message: "Unable to create retention checkpoint.",
    });
  }
});

/* =========================================================
   RETENTION
   UPDATE
========================================================= */

app.put("/api/retention/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid retention checkpoint ID.",
      });
    }

    const {
      candidate_name,
      employer,
      checkpoint,
      status,
      monthly_salary,
      verified_by,
      verified_at,
      notes,
    } = req.body;

    if (!candidate_name || !checkpoint) {
      return res.status(400).json({
        message: "Candidate name and checkpoint are required.",
      });
    }

    if (!["3M", "6M", "12M"].includes(checkpoint)) {
      return res.status(400).json({
        message: "Checkpoint must be 3M, 6M or 12M.",
      });
    }

    const allowedStatuses = ["Pending", "Completed", "Failed"];

    const finalStatus = status || "Pending";

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({
        message: "Invalid retention status.",
      });
    }

    const salaryValue =
      monthly_salary === "" ||
      monthly_salary === null ||
      monthly_salary === undefined
        ? null
        : Number(monthly_salary);

    if (
      salaryValue !== null &&
      (!Number.isInteger(salaryValue) || salaryValue < 0)
    ) {
      return res.status(400).json({
        message: "Monthly salary must be a valid whole number.",
      });
    }

    const result = await pool.query(
      `
          UPDATE retention_checkpoints
          SET
            candidate_name = $1,
            employer = $2,
            checkpoint = $3,
            status = $4,
            monthly_salary = $5,
            verified_by = $6,
            verified_at = $7,
            notes = $8
          WHERE id = $9
          RETURNING
            id,
            candidate_name,
            employer,
            checkpoint,
            status,
            monthly_salary,
            verified_by,
            verified_at,
            notes,
            created_at
        `,
      [
        candidate_name.trim(),
        employer?.trim() || null,
        checkpoint,
        finalStatus,
        salaryValue,
        verified_by?.trim() || null,
        verified_at || null,
        notes?.trim() || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Retention checkpoint not found.",
      });
    }

    res.json({
      message: "Retention checkpoint updated successfully.",
      record: result.rows[0],
    });
  } catch (error) {
    console.error("Update retention error:", error);

    res.status(500).json({
      message: "Unable to update retention checkpoint.",
    });
  }
});

/* =========================================================
   RETENTION
   DELETE
========================================================= */

app.delete("/api/retention/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Invalid retention checkpoint ID.",
      });
    }

    const result = await pool.query(
      `
          DELETE FROM retention_checkpoints
          WHERE id = $1
          RETURNING
            id,
            candidate_name,
            checkpoint
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Retention checkpoint not found.",
      });
    }

    res.json({
      message: "Retention checkpoint deleted successfully.",
      record: result.rows[0],
    });
  } catch (error) {
    console.error("Delete retention error:", error);

    res.status(500).json({
      message: "Unable to delete retention checkpoint.",
    });
  }
});

/* =========================================================
   DISTRICT ANALYTICS
========================================================= */

app.get("/api/districts", async (_req, res) => {
  try {
    const result = await pool.query(`
        WITH training AS (
          SELECT
            COALESCE(district, 'Unknown') AS district,
            SUM(enrolled)::int AS enrolled,
            SUM(completed)::int AS completed,
            SUM(placed)::int AS trained_placed
          FROM training_programs
          GROUP BY COALESCE(district, 'Unknown')
        ),

        employment AS (
          SELECT
            COALESCE(district, 'Unknown') AS district,
            COUNT(*)::int AS employment_records,
            COUNT(*) FILTER (
              WHERE status = 'Active'
            )::int AS active_employment,
            ROUND(
              AVG(salary)
            )::int AS average_salary
          FROM employment_records
          GROUP BY COALESCE(district, 'Unknown')
        ),

        trainees AS (
          SELECT
            COALESCE(district, 'Unknown') AS district,
            COUNT(*)::int AS candidates
          FROM users
          WHERE role = 'trainee'
          GROUP BY COALESCE(district, 'Unknown')
        )

        SELECT
          COALESCE(
            training.district,
            employment.district,
            trainees.district
          ) AS district,

          COALESCE(
            trainees.candidates,
            0
          ) AS candidates,

          COALESCE(
            training.enrolled,
            0
          ) AS trained,

          COALESCE(
            training.completed,
            0
          ) AS completed,

          COALESCE(
            training.trained_placed,
            0
          ) AS training_placed,

          COALESCE(
            employment.employment_records,
            0
          ) AS employment_records,

          COALESCE(
            employment.active_employment,
            0
          ) AS active_employment,

          COALESCE(
            employment.average_salary,
            0
          ) AS average_salary,

          CASE
            WHEN COALESCE(
              training.enrolled,
              0
            ) > 0
            THEN ROUND(
              training.trained_placed *
              100.0 /
              training.enrolled,
              1
            )
            ELSE 0
          END::float AS placement_rate

        FROM training

        FULL OUTER JOIN employment
          ON training.district =
             employment.district

        FULL OUTER JOIN trainees
          ON COALESCE(
            training.district,
            employment.district
          ) = trainees.district

        ORDER BY placement_rate DESC
      `);

    res.json(result.rows);
  } catch (error) {
    console.error("District analytics API error:", error);

    res.status(500).json({
      message: "Unable to fetch district analytics.",
    });
  }
});

/* =========================================================
   DISTRICT SUMMARY
========================================================= */

app.get("/api/districts/summary", async (_req, res) => {
  try {
    const result = await pool.query(`
          SELECT
            COUNT(DISTINCT district)::int
              AS districts,

            COALESCE(
              SUM(enrolled),
              0
            )::int AS total_trained,

            COALESCE(
              SUM(completed),
              0
            )::int AS total_completed,

            COALESCE(
              SUM(placed),
              0
            )::int AS total_placed,

            CASE
              WHEN COALESCE(
                SUM(enrolled),
                0
              ) > 0
              THEN ROUND(
                SUM(placed) * 100.0 /
                SUM(enrolled),
                1
              )
              ELSE 0
            END::float AS placement_rate

          FROM training_programs
        `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("District summary API error:", error);

    res.status(500).json({
      message: "Unable to fetch district summary.",
    });
  }
});

/* =========================================================
   START SERVER
========================================================= */

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`SkillTrack API running on http://localhost:${PORT}`);
});
