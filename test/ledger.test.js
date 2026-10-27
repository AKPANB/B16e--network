
import test from "node:test";
import assert from "node:assert/strict";

import {
  createLedger,
  recordEntry,
  summarizeLedger
} from "../src/ledger.js";

function entry(id, type, amountPence, description = "Test entry") {
  return { id, type, amountPence, description };
}

test("creates an empty ledger", () => {
  assert.deepEqual(createLedger(), []);
});

test("records service revenue", () => {
  const ledger = recordEntry(
    createLedger(),
    entry("S001", "service_revenue", 10000)
  );

  const summary = summarizeLedger(ledger);

  assert.equal(summary.serviceRevenuePence, 10000);
  assert.equal(summary.totalNetResultPence, 10000);
});

test("calculates trading gains and losses separately", () => {
  let ledger = createLedger();

  ledger = recordEntry(
    ledger,
    entry("T001", "trading_gain", 5000)
  );

  ledger = recordEntry(
    ledger,
    entry("T002", "trading_loss", 2000)
  );

  const summary = summarizeLedger(ledger);

  assert.equal(summary.tradingGainsPence, 5000);
  assert.equal(summary.tradingLossesPence, 2000);
  assert.equal(summary.netTradingPence, 3000);
});

test("calculates Treasury gains and losses separately", () => {
  let ledger = createLedger();

  ledger = recordEntry(
    ledger,
    entry("R001", "treasury_gain", 8000)
  );

  ledger = recordEntry(
    ledger,
    entry("R002", "treasury_loss", 3000)
  );

  const summary = summarizeLedger(ledger);

  assert.equal(summary.treasuryGainsPence, 8000);
  assert.equal(summary.treasuryLossesPence, 3000);
  assert.equal(summary.netTreasuryPence, 5000);
});

test("does not count internal transfers as revenue", () => {
  const ledger = recordEntry(
    createLedger(),
    entry("I001", "internal_transfer", 90000)
  );

  const summary = summarizeLedger(ledger);

  assert.equal(summary.internalTransfersPence, 90000);
  assert.equal(summary.serviceRevenuePence, 0);
  assert.equal(summary.totalNetResultPence, 0);
});

test("rejects duplicate entry IDs", () => {
  const first = entry("D001", "service_revenue", 1000);
  const ledger = recordEntry(createLedger(), first);

  assert.throws(
    () => recordEntry(ledger, first),
    /Duplicate entry ID/
  );
});

test("rejects invalid transaction types", () => {
  assert.throws(
    () => recordEntry(
      createLedger(),
      entry("X001", "bitcoin_purchase", 1000)
    ),
    /Invalid entry type/
  );
});

test("rejects zero, negative and decimal amounts", () => {
  for (const amount of [0, -100, 10.5, NaN, Infinity]) {
    assert.throws(
      () => recordEntry(
        createLedger(),
        entry("A001", "service_revenue", amount)
      ),
      /positive integer in pence/
    );
  }
});

test("rejects missing descriptions", () => {
  assert.throws(
    () => recordEntry(
      createLedger(),
      entry("M001", "service_revenue", 1000, " ")
    ),
    /valid description|description/
  );
});

test("does not modify the original ledger when adding an entry", () => {
  const original = createLedger();

  const updated = recordEntry(
    original,
    entry("N001", "service_revenue", 2500)
  );

  assert.equal(original.length, 0);
  assert.equal(updated.length, 1);
});
