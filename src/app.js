
import { createLedger, recordEntry } from "./ledger.js";
import { createRiskEngine, checkTrade } from "./risk.js";
import { generateFinancialReport } from "./report.js";

export function createB16eApp(options = {}) {
  let ledger = createLedger();

  const riskEngine = createRiskEngine(options.riskLimits);

  function recordServiceRevenue({ id, amountPence, description }) {
    ledger = recordEntry(ledger, {
      id,
      type: "service_revenue",
      amountPence,
      description
    });

    return { recorded: true, id };
  }

  function assessTrade(trade, state = {}) {
    return checkTrade(riskEngine, trade, state);
  }

  function getFinancialReport() {
    return generateFinancialReport(ledger);
  }

  function getLedgerCount() {
    return ledger.length;
  }

  return Object.freeze({
    recordServiceRevenue,
    assessTrade,
    getFinancialReport,
    getLedgerCount
  });
}
