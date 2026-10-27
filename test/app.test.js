
import test from "node:test";
import assert from "node:assert/strict";

import { createB16eApp } from "../src/app.js";

test("creates a B16e application with an empty ledger", () => {
  const app = createB16eApp();

  assert.equal(app.getLedgerCount(), 0);
  assert.equal(
    app.getFinancialReport().totalNetResultPence,
    0
  );
});

test("records service revenue and updates the report", () => {
  const app = createB16eApp();

  const result = app.recordServiceRevenue({
    id: "APP001",
    amountPence: 2500,
    description: "Payment service fee"
  });

  assert.equal(result.recorded, true);
  assert.equal(app.getLedgerCount(), 1);
  assert.equal(
    app.getFinancialReport().serviceRevenuePence,
    2500
  );
});

test("rejects duplicate revenue IDs", () => {
  const app = createB16eApp();

  const entry = {
    id: "APP002",
    amountPence: 1000,
    description: "Service fee"
  };

  app.recordServiceRevenue(entry);

  assert.throws(
    () => app.recordServiceRevenue(entry),
    /Duplicate entry ID/
  );
});

test("assesses a trade without executing it", () => {
  const app = createB16eApp();

  const result = app.assessTrade({
    asset: "B16E",
    side: "buy",
    amountPence: 5000
  });

  assert.equal(result.approved, true);
  assert.equal(app.getLedgerCount(), 0);
});
