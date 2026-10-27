
import test from "node:test";
import assert from "node:assert/strict";

import { createLedger, recordEntry } from "../src/ledger.js";
import { generateFinancialReport } from "../src/report.js";

test("reports revenue, gains, losses and net result", () => {
  let ledger = createLedger();

  ledger = recordEntry(ledger, {
    id: "R001",
    type: "service_revenue",
    amountPence: 10000,
    description: "Payment service fee"
  });

  ledger = recordEntry(ledger, {
    id: "R002",
    type: "trading_gain",
    amountPence: 3000,
    description: "Realised trading gain"
  });

  ledger = recordEntry(ledger, {
    id: "R003",
    type: "trading_loss",
    amountPence: 1000,
    description: "Realised trading loss"
  });

  ledger = recordEntry(ledger, {
    id: "R004",
    type: "treasury_gain",
    amountPence: 2000,
    description: "Treasury gain"
  });

  ledger = recordEntry(ledger, {
    id: "R005",
    type: "internal_transfer",
    amountPence: 50000,
    description: "Internal movement"
  });

  const report = generateFinancialReport(ledger);

  assert.equal(report.currency, "GBP");
  assert.equal(report.serviceRevenuePence, 10000);
  assert.equal(report.trading.netPence, 2000);
  assert.equal(report.treasury.netPence, 2000);
  assert.equal(report.internalTransfersPence, 50000);
  assert.equal(report.totalNetResultPence, 14000);
});

test("does not modify the original ledger", () => {
  const ledger = createLedger();

  const report = generateFinancialReport(ledger);

  assert.equal(ledger.length, 0);
  assert.equal(report.totalNetResultPence, 0);
});

test("rejects an invalid ledger", () => {
  assert.throws(() => generateFinancialReport(null));
});
