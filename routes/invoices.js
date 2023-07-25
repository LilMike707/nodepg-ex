const express = require("express");
const db = require("../db");
const router = new express.Router();

router.get("/", async (req, res) => {
  const result = await db.query("select id, comp_code from invoices");
  return res.json({ invoices: result.rows });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await db.query(
    "select * from invoices join companies on invoices.comp_code = companies.code where id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  return res.json({ invoice: result.rows[0] });
});

router.post("/", async (req, res) => {
  const { comp_code, amt } = request.body;

  const result = await db.query(
    "insert into invoices (comp_code, amt) values ($1, $2) returning *",
    [comp_code, amt]
  );

  return res.status(201).json({ invoice: result.rows[0] });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { amt, paid } = req.body;

  let paidDate = null;
  if (paid) {
    paidDate = new Date().toISOString().split("T")[0]; // Get the current date in "YYYY-MM-DD" format
  }

  const result = await db.query(
    "UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING *",
    [amt, paid, paidDate, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  return res.json({ invoice: result.rows[0] });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const result = db.query("delete from invoices where id = $1 returning *", [
    id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  return res.json({ status: "deleted" });
});

module.exports = router;
