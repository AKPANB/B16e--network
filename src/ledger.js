
const ALLOWED_TYPES = new Set([
  "service_revenue",
  "trading_gain",
  "trading_loss",
  "treasury_gain",
  "treasury_loss",
  "internal_transfer"
]);

export function createLedger() {
  return [];
}

export function recordEntry(ledger, entry) {
  if (!Array.isArray(ledger)) {
    throw new TypeError("Ledger must be an array.");
  }

  if (!entry || typeof entry !== "object") {
    throw new TypeError("Entry must be an object.");
  }

  const { id, type, amountPence, description } = entry;

  if (typeof id !== "string" || id.trim() === "") {
    throw new Error("Entry must have a valid ID.");
  }

  if (ledger.some((item) => item.id === id)) {
    throw new Error("Duplicate entry ID.");
  }

  if (!ALLOWED_TYPES.has(type)) {
    throw new Error("Invalid entry type.");
  }

  if (!Number.isSafeInteger(amountPence) || amountPence <= 0) {
    throw new Error("Amount must be a positive integer in pence.");
  }

  if (typeof description !== "string" || description.trim() === "") {
    throw new Error("Entry must have a description.");
  }

  const newEntry = Object.freeze({
    id,
    type,
    amountPence,
    description: description.trim(),
    recordedAt: new Date().toISOString()
  });

  return [...ledger, newEntry];
}

export function summarizeLedger(ledger) {
  if (!Array.isArray(ledger)) {
    throw new TypeError("Ledger must be an array.");
  }

  const totals = {
    serviceRevenuePence: 0,
    tradingGainsPence: 0,
    tradingLossesPence: 0,
    treasuryGainsPence: 0,
    treasuryLossesPence: 0,
    internalTransfersPence: 0
  };

  for (const entry of ledger) {
    if (!entry || !ALLOWED_TYPES.has(entry.type)) {
      throw new Error("Ledger contains an invalid entry.");
    }

    if (!Number.isSafeInteger(entry.amountPence) || entry.amountPence <= 0) {
      throw new Error("Ledger contains an invalid amount.");
    }

    const totalKey = {
      service_revenue: "serviceRevenuePence",
      trading_gain: "tradingGainsPence",
      trading_loss: "tradingLossesPence",
      treasury_gain: "treasuryGainsPence",
      treasury_loss: "treasuryLossesPence",
      internal_transfer: "internalTransfersPence"
    }[entry.type];

    totals[totalKey] += entry.amountPence;

    if (!Number.isSafeInteger(totals[totalKey])) {
      throw new Error("Ledger total exceeds the safe calculation limit.");
    }
  }

  const netTradingPence =
    totals.tradingGainsPence - totals.tradingLossesPence;

  const netTreasuryPence =
    totals.treasuryGainsPence - totals.treasuryLossesPence;

  const totalNetResultPence =
    totals.serviceRevenuePence +
    netTradingPence +
    netTreasuryPence;

  if (!Number.isSafeInteger(totalNetResultPence)) {
    throw new Error("Net result exceeds the safe calculation limit.");
  }

  return Object.freeze({
    ...totals,
    netTradingPence,
    netTreasuryPence,
    totalNetResultPence
  });
}
