const express = require("express");
const db = require("../db");
const router = new express.Router();

router.get("/", async (req, res) => {
  const result = await db.query("select code, name from companies");
  return res.json({ companies: result.rows });
});

router.post("/", async (req, res) => {
  const { code, name, description } = req.body;

  const result = await db.query(
    "insert into companies (code, name, description) values ($1, $2, $3) returning *",
    [code, name, description]
  );
  return res.status(201).json({ company: result.rows[0] });
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const companyResult = await db.query(
    "SELECT * FROM companies WHERE code = $1",
    [code]
  );
  const invoiceResult = await db.query(
    "SELECT * FROM invoices WHERE comp_code = $1",
    [code]
  );
  const industryResult = await db.query(
    "SELECT i.code, i.industry FROM industries i JOIN company_industries ci ON i.code = ci.industry_code WHERE ci.company_code = $1",
    [code]
  );

  if (companyResult.rows.length === 0) {
    return res.status(404).json({ error: "Company not found" });
  }

  const company = companyResult.rows[0];
  company.invoices = invoiceResult.rows.map((invoice) => invoice.id);
  company.industries = industryResult.rows;

  return res.json({ company });
});

router.put("/:code", async (req, res) => {
  const { code } = req.params;
  const { name, description } = req.body;

  const result = await db.query(
    "update companies set name = $1, description = $2 where code = $3 returning *",
    [name, description, code]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Company Not Found" });
  }

  return res.json({ company: result.rows[0] });
});

router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  const result = await db.query(
    "delete from companies where code = $1 returning *",
    [code]
  );
  return res.json({ status: "deleted" });
});

module.exports = router;
