
import { summarizeLedger } from "./ledger.js";

export function generateFinancialReport(ledger) {
  const summary = summarizeLedger(ledger);

  return Object.freeze({
    reportType: "B16e Financial Report",
    currency: "GBP",
    generatedAt: new Date().toISOString(),

    serviceRevenuePence: summary.serviceRevenuePence,

    trading: {
      gainsPence: summary.tradingGainsPence,
      lossesPence: summary.tradingLossesPence,
      netPence: summary.netTradingPence
    },

    treasury: {
      gainsPence: summary.treasuryGainsPence,
      lossesPence: summary.treasuryLossesPence,
      netPence: summary.netTreasuryPence
    },

    internalTransfersPence: summary.internalTransfersPence,

    totalNetResultPence: summary.totalNetResultPence
  });
}
