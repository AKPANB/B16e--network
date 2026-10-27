
const DEFAULT_LIMITS = Object.freeze({
  maxTradePence: 10000,
  maxDailyLossPence: 25000,
  maxExposurePence: 50000
});

export function createRiskEngine(overrides = {}) {
  const limits = {
    ...DEFAULT_LIMITS,
    ...overrides
  };

  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new Error(`Invalid risk limit: ${name}`);
    }
  }

  return Object.freeze({ limits: Object.freeze(limits) });
}

export function checkTrade(riskEngine, trade, state = {}) {
  if (!riskEngine?.limits) {
    throw new Error("A valid risk engine is required.");
  }

  if (!trade || typeof trade !== "object") {
    throw new Error("A valid trade is required.");
  }

  const { amountPence, asset, side } = trade;
  const { dailyLossPence = 0, exposurePence = 0 } = state;

  if (typeof asset !== "string" || asset.trim() === "") {
    return { approved: false, reason: "Invalid asset." };
  }

  if (!["buy", "sell"].includes(side)) {
    return { approved: false, reason: "Invalid trade side." };
  }

  if (!Number.isSafeInteger(amountPence) || amountPence <= 0) {
    return { approved: false, reason: "Invalid trade amount." };
  }

  if (
    !Number.isSafeInteger(dailyLossPence) ||
    dailyLossPence < 0 ||
    !Number.isSafeInteger(exposurePence) ||
    exposurePence < 0
  ) {
    return { approved: false, reason: "Invalid risk state." };
  }

  const limits = riskEngine.limits;

  if (amountPence > limits.maxTradePence) {
    return { approved: false, reason: "Trade limit exceeded." };
  }

  if (dailyLossPence >= limits.maxDailyLossPence) {
    return { approved: false, reason: "Daily loss limit reached." };
  }

  if (amountPence > limits.maxExposurePence - exposurePence) {
    return { approved: false, reason: "Exposure limit exceeded." };
  }

  return { approved: true, reason: "Within configured limits." };
}
