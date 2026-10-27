
import test from "node:test";
import assert from "node:assert/strict";

import { createRiskEngine, checkTrade } from "../src/risk.js";

const engine = createRiskEngine();

const trade = {
  asset: "B16E",
  side: "buy",
  amountPence: 5000
};

test("allows a trade within all limits", () => {
  assert.equal(checkTrade(engine, trade).approved, true);
});

test("rejects a trade exceeding the trade limit", () => {
  const result = checkTrade(engine, {
    ...trade,
    amountPence: 10001
  });

  assert.equal(result.approved, false);
  assert.match(result.reason, /Trade limit/);
});

test("rejects trading when the daily loss limit is reached", () => {
  const result = checkTrade(engine, trade, {
    dailyLossPence: 25000,
    exposurePence: 0
  });

  assert.equal(result.approved, false);
  assert.match(result.reason, /Daily loss limit/);
});

test("rejects a trade exceeding the exposure limit", () => {
  const result = checkTrade(engine, trade, {
    dailyLossPence: 0,
    exposurePence: 48000
  });

  assert.equal(result.approved, false);
  assert.match(result.reason, /Exposure limit/);
});

test("rejects invalid trade amounts", () => {
  const result = checkTrade(engine, {
    ...trade,
    amountPence: -1
  });

  assert.equal(result.approved, false);
});

test("rejects invalid risk limits", () => {
  assert.throws(
    () => createRiskEngine({ maxTradePence: 0 }),
    /Invalid risk limit/
  );
});

test("rejects invalid trade sides", () => {
  const result = checkTrade(engine, {
    ...trade,
    side: "unknown"
  });

  assert.equal(result.approved, false);
});
