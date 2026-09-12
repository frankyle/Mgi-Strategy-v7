// financeService.js
// Supabase-backed data layer for the Finance Tracker feature: day-to-day
// income/expenses (Personal or Family usage, same account), loans you've
// borrowed (from people, banks, or loan companies) with interest, and
// investments (e.g. dehydration machine, prop firm account) with
// contributions over time. Mirrors the async CRUD pattern used by
// SetupMatchGraderService.jsx elsewhere in this app.
import { supabase } from "../../supabaseClient";

export const EXPENSE_CATEGORIES = [
  "Food & Groceries",
  "Rent/Housing",
  "Transport",
  "Utilities",
  "Airtime/Internet",
  "Health",
  "Family Support",
  "Education",
  "Entertainment",
  "Shopping",
  "Trading/Tools",
  "Loan Given Out",
  "Investment",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Trading Profit",
  "Side Income",
  "Loan Repayment Received",
  "Interest Received",
  "Other Income",
];

export const USAGE_TYPES = ["Personal", "Family"];
export const PAYMENT_METHODS = ["Cash", "Mobile Money", "Bank Transfer", "Card", "Other"];
export const PAYMENT_STATUSES = ["Planned", "Half Paid", "Paid"];
export const LENDER_TYPES = ["Individual", "Bank", "Loan Company", "Other"];

// Same three underlying status values are used for Income and Expense
// (the database column doesn't care which), but they read differently
// depending on direction of money — "Planned" expense hasn't left your
// account yet; "Planned" income hasn't landed in it yet.
export const STATUS_LABELS = {
  Expense: { Planned: "Planned", "Half Paid": "Half Paid", Paid: "Paid" },
  Income: { Planned: "Expected", "Half Paid": "Partially Received", Paid: "Received" },
};

export function statusLabel(type, status) {
  return (STATUS_LABELS[type] && STATUS_LABELS[type][status]) || status;
}

const DEFAULT_INVESTMENTS = [
  {
    name: "Dehydration Machine Development",
    category: "Business/Equipment",
    targetAmount: 0,
    status: "Planning",
    notes: "Development of the dehydration machine.",
  },
  {
    name: "Prop Firm Account",
    category: "Trading",
    targetAmount: 0,
    status: "Planning",
    notes: "Buying a funded prop firm account to trade the strategy.",
  },
];

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const formatError = (error) => ({
  success: false,
  error: {
    message: error?.message || "Unknown error",
    details: error?.details || null,
    hint: error?.hint || null,
    code: error?.code || null,
    status: error?.status || 500,
  },
});

async function getAuthUser() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) return { user: null, errorResult: formatError(userError) };
  if (!user)
    return {
      user: null,
      errorResult: {
        success: false,
        error: { message: "User not logged in", code: "NO_USER", status: 401 },
      },
    };
  return { user, errorResult: null };
}

// ---------------------------------------------------------------------
// Row <-> app-shape mapping (DB is snake_case, app uses camelCase — same
// field names the UI components already expect)
// ---------------------------------------------------------------------

function fromTxRow(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    usage: row.usage,
    category: row.category,
    amount: Number(row.amount) || 0,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toTxRow(tx, userId) {
  return {
    user_id: userId,
    date: tx.date,
    type: tx.type,
    usage: tx.type === "Expense" ? tx.usage || "Personal" : null,
    category: tx.category,
    amount: Number(tx.amount) || 0,
    payment_method: tx.paymentMethod || null,
    payment_status: tx.paymentStatus || "Paid",
    notes: tx.notes || null,
  };
}

function fromRepaymentRow(row) {
  return { id: row.id, date: row.date, amount: Number(row.amount) || 0, note: row.note || "" };
}

function fromLoanRow(row) {
  return {
    id: row.id,
    lenderName: row.lender_name,
    lenderType: row.lender_type,
    principal: Number(row.principal) || 0,
    interestRate: Number(row.interest_rate) || 0,
    interestType: row.interest_type,
    dateBorrowed: row.date_borrowed,
    dueDate: row.due_date,
    status: row.status,
    paidDate: row.paid_date,
    notes: row.notes,
    createdAt: row.created_at,
    repayments: (row.repayments || [])
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .map(fromRepaymentRow),
  };
}

function toLoanRow(loan, userId) {
  return {
    user_id: userId,
    lender_name: loan.lenderName,
    lender_type: loan.lenderType || "Individual",
    principal: Number(loan.principal) || 0,
    interest_rate: Number(loan.interestRate) || 0,
    interest_type: loan.interestType || "monthly",
    date_borrowed: loan.dateBorrowed,
    due_date: loan.dueDate || null,
    status: loan.status || "Active",
    paid_date: loan.paidDate || null,
    notes: loan.notes || null,
  };
}

function fromContributionRow(row) {
  return { id: row.id, date: row.date, amount: Number(row.amount) || 0, note: row.note || "" };
}

function fromInvestmentRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    targetAmount: Number(row.target_amount) || 0,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    contributions: (row.contributions || [])
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .map(fromContributionRow),
  };
}

function toInvestmentRow(investment, userId) {
  return {
    user_id: userId,
    name: investment.name,
    category: investment.category || null,
    target_amount: Number(investment.targetAmount) || 0,
    status: investment.status || "Planning",
    notes: investment.notes || null,
  };
}

// ---------------------------------------------------------------------
// Transactions (day-to-day income & expenses, Personal or Family usage)
// ---------------------------------------------------------------------

export async function getTransactions() {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { data, error } = await supabase
    .from("finance_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) return formatError(error);
  return { success: true, data: data.map(fromTxRow) };
}

export async function addTransaction(tx) {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { data, error } = await supabase
    .from("finance_transactions")
    .insert([toTxRow(tx, user.id)])
    .select();

  if (error) return formatError(error);
  return { success: true, tx: fromTxRow(data[0]) };
}

export async function updateTransaction(id, changes) {
  const payload = {};
  if ("date" in changes) payload.date = changes.date;
  if ("type" in changes) payload.type = changes.type;
  if ("usage" in changes) payload.usage = changes.usage;
  if ("category" in changes) payload.category = changes.category;
  if ("amount" in changes) payload.amount = Number(changes.amount) || 0;
  if ("paymentMethod" in changes) payload.payment_method = changes.paymentMethod;
  if ("paymentStatus" in changes) payload.payment_status = changes.paymentStatus;
  if ("notes" in changes) payload.notes = changes.notes;

  const { data, error } = await supabase
    .from("finance_transactions")
    .update(payload)
    .eq("id", id)
    .select();

  if (error) return formatError(error);
  if (!data || data.length === 0) return { success: false, error: { message: "Transaction not found." } };
  return { success: true, tx: fromTxRow(data[0]) };
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
  if (error) return formatError(error);
  return { success: true };
}

// Payment-status handling for expenses: an expense can be logged as
// "Planned" (money not sent yet), "Half Paid" (roughly half sent), or
// "Paid" (fully settled). Only the portion actually paid counts as real
// cash leaving the account; the rest shows up as "outstanding" so you can
// see what's still owed on top of what's already gone out.
export function paidFraction(status) {
  if (status === "Planned") return 0;
  if (status === "Half Paid") return 0.5;
  return 1; // "Paid" or legacy transactions with no status set
}

// Actual cash that has moved for this transaction so far — money that's
// actually left your account for an Expense, or money that's actually
// landed for an Income. Same status field, same math, both directions.
export function computePaidAmount(tx) {
  return (tx.amount || 0) * paidFraction(tx.paymentStatus || "Paid");
}

// What's still outstanding — still owed on an Expense, or still expected
// but not yet received on an Income.
export function computeOutstandingAmount(tx) {
  return (tx.amount || 0) - computePaidAmount(tx);
}

export function computeTransactionStats(txs, month = "All") {
  const filtered =
    month === "All" ? txs : txs.filter((t) => (t.date || "").slice(0, 7) === month);

  const income = filtered.filter((t) => t.type === "Income");
  const expenses = filtered.filter((t) => t.type === "Expense");

  // Full amount promised, whether or not it's actually landed yet.
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  // Actual cash that has landed in the account so far.
  const totalIncomeReceived = income.reduce((s, t) => s + computePaidAmount(t), 0);
  // Promised but not yet received.
  const totalIncomeExpected = income.reduce((s, t) => s + computeOutstandingAmount(t), 0);

  // Actual cash that has left the account so far.
  const totalExpenses = expenses.reduce((s, t) => s + computePaidAmount(t), 0);
  // Full committed amount, whether or not it's actually gone out yet —
  // this is what expenses would cost if every one of them were settled.
  const totalExpensesFull = expenses.reduce((s, t) => s + t.amount, 0);
  // Still owed on logged expenses (Planned in full, Half Paid the remaining half).
  const totalOutstanding = expenses.reduce((s, t) => s + computeOutstandingAmount(t), 0);
  const totalPlanned = expenses
    .filter((t) => (t.paymentStatus || "Paid") === "Planned")
    .reduce((s, t) => s + t.amount, 0);

  const personalExpenses = expenses
    .filter((t) => t.usage === "Personal")
    .reduce((s, t) => s + computePaidAmount(t), 0);
  const familyExpenses = expenses
    .filter((t) => t.usage === "Family")
    .reduce((s, t) => s + computePaidAmount(t), 0);

  const byCategoryMap = {};
  expenses.forEach((t) => {
    byCategoryMap[t.category] = (byCategoryMap[t.category] || 0) + computePaidAmount(t);
  });
  const byCategory = Object.entries(byCategoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    totalIncome,
    totalIncomeReceived,
    totalIncomeExpected,
    totalExpenses,
    totalExpensesFull,
    totalOutstanding,
    totalPlanned,
    // Real cash balance right now: money actually received minus money
    // actually paid out. (Not affected by income/expenses still pending.)
    net: totalIncomeReceived - totalExpenses,
    personalExpenses,
    familyExpenses,
    byCategory,
    count: filtered.length,
  };
}

// Distinct "YYYY-MM" months present in the data, most recent first.
export function getAvailableMonths(txs) {
  const set = new Set(txs.map((t) => (t.date || "").slice(0, 7)).filter(Boolean));
  return Array.from(set).sort().reverse();
}

// ---------------------------------------------------------------------
// Loans (money YOU borrow — from people, banks, or loan companies)
// ---------------------------------------------------------------------

export async function getLoans() {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { data, error } = await supabase
    .from("finance_loans")
    .select("*, repayments:finance_loan_repayments(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return formatError(error);
  return { success: true, data: data.map(fromLoanRow) };
}

export async function addLoan(loan) {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { data, error } = await supabase
    .from("finance_loans")
    .insert([toLoanRow(loan, user.id)])
    .select();

  if (error) return formatError(error);
  return { success: true, loan: fromLoanRow({ ...data[0], repayments: [] }) };
}

export async function updateLoan(id, changes) {
  const payload = {};
  if ("status" in changes) payload.status = changes.status;
  if ("paidDate" in changes) payload.paid_date = changes.paidDate;
  if ("lenderName" in changes) payload.lender_name = changes.lenderName;
  if ("lenderType" in changes) payload.lender_type = changes.lenderType;
  if ("principal" in changes) payload.principal = Number(changes.principal) || 0;
  if ("interestRate" in changes) payload.interest_rate = Number(changes.interestRate) || 0;
  if ("interestType" in changes) payload.interest_type = changes.interestType;
  if ("dateBorrowed" in changes) payload.date_borrowed = changes.dateBorrowed;
  if ("dueDate" in changes) payload.due_date = changes.dueDate;
  if ("notes" in changes) payload.notes = changes.notes;

  const { data, error } = await supabase
    .from("finance_loans")
    .update(payload)
    .eq("id", id)
    .select("*, repayments:finance_loan_repayments(*)");

  if (error) return formatError(error);
  if (!data || data.length === 0) return { success: false, error: { message: "Loan not found." } };
  return { success: true, loan: fromLoanRow(data[0]) };
}

export async function deleteLoan(id) {
  const { error } = await supabase.from("finance_loans").delete().eq("id", id);
  if (error) return formatError(error);
  return { success: true };
}

export async function addRepayment(loanId, repayment) {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { error: insertError } = await supabase.from("finance_loan_repayments").insert([
    {
      user_id: user.id,
      loan_id: loanId,
      date: repayment.date || todayStr(),
      amount: Number(repayment.amount) || 0,
      note: repayment.note || null,
    },
  ]);
  if (insertError) return formatError(insertError);

  const { data, error } = await supabase
    .from("finance_loans")
    .select("*, repayments:finance_loan_repayments(*)")
    .eq("id", loanId)
    .single();
  if (error) return formatError(error);
  return { success: true, loan: fromLoanRow(data) };
}

export async function deleteRepayment(loanId, repaymentId) {
  const { error: deleteError } = await supabase
    .from("finance_loan_repayments")
    .delete()
    .eq("id", repaymentId);
  if (deleteError) return formatError(deleteError);

  const { data, error } = await supabase
    .from("finance_loans")
    .select("*, repayments:finance_loan_repayments(*)")
    .eq("id", loanId)
    .single();
  if (error) return formatError(error);
  return { success: true, loan: fromLoanRow(data) };
}

// Simple-interest accrual on what YOU owe. interestType: "flat" (one-off %
// of principal, doesn't grow with time), "monthly" (% of principal per
// month elapsed), "annual" (% of principal per year elapsed).
export function computeLoanInterest(loan) {
  const principal = loan.principal || 0;
  const rate = loan.interestRate || 0;
  if (rate === 0) return 0;

  if (loan.interestType === "flat") {
    return principal * (rate / 100);
  }

  const start = new Date((loan.dateBorrowed || todayStr()) + "T00:00:00");
  const end = loan.status === "Paid" && loan.paidDate
    ? new Date(loan.paidDate + "T00:00:00")
    : new Date();
  const msElapsed = Math.max(0, end - start);
  const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);

  if (loan.interestType === "annual") {
    const years = daysElapsed / 365;
    return principal * (rate / 100) * years;
  }
  // default: monthly
  const months = daysElapsed / 30;
  return principal * (rate / 100) * months;
}

export function computeLoanSummary(loan) {
  const principal = loan.principal || 0;
  const interestOwed = computeLoanInterest(loan);
  const totalOwed = principal + interestOwed;
  const totalRepaid = (loan.repayments || []).reduce((s, r) => s + r.amount, 0);
  const balanceRemaining = Math.max(0, totalOwed - totalRepaid);
  return { principal, interestOwed, totalOwed, totalRepaid, balanceRemaining };
}

export function computeLoansOverview(loans) {
  const active = loans.filter((l) => l.status !== "Paid");
  let totalPrincipalBorrowed = 0;
  let totalInterestAccrued = 0;
  let totalOutstanding = 0;
  active.forEach((l) => {
    const s = computeLoanSummary(l);
    totalPrincipalBorrowed += s.principal;
    totalInterestAccrued += s.interestOwed;
    totalOutstanding += s.balanceRemaining;
  });
  return {
    activeCount: active.length,
    totalPrincipalBorrowed,
    totalInterestAccrued,
    totalOutstanding,
  };
}

// ---------------------------------------------------------------------
// Investments (e.g. Dehydration Machine, Prop Firm Account)
// ---------------------------------------------------------------------

export async function getInvestments() {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  let { data, error } = await supabase
    .from("finance_investments")
    .select("*, contributions:finance_investment_contributions(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return formatError(error);

  // First-time setup: seed the two investments currently being tracked.
  if (data.length === 0) {
    const seedRows = DEFAULT_INVESTMENTS.map((inv) => toInvestmentRow(inv, user.id));
    const { error: seedError } = await supabase.from("finance_investments").insert(seedRows);
    if (seedError) return formatError(seedError);

    const refetch = await supabase
      .from("finance_investments")
      .select("*, contributions:finance_investment_contributions(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (refetch.error) return formatError(refetch.error);
    data = refetch.data;
  }

  return { success: true, data: data.map(fromInvestmentRow) };
}

export async function addInvestment(investment) {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { data, error } = await supabase
    .from("finance_investments")
    .insert([toInvestmentRow(investment, user.id)])
    .select();

  if (error) return formatError(error);
  return { success: true, investment: fromInvestmentRow({ ...data[0], contributions: [] }) };
}

export async function updateInvestment(id, changes) {
  const payload = {};
  if ("status" in changes) payload.status = changes.status;
  if ("name" in changes) payload.name = changes.name;
  if ("category" in changes) payload.category = changes.category;
  if ("targetAmount" in changes) payload.target_amount = Number(changes.targetAmount) || 0;
  if ("notes" in changes) payload.notes = changes.notes;

  const { data, error } = await supabase
    .from("finance_investments")
    .update(payload)
    .eq("id", id)
    .select("*, contributions:finance_investment_contributions(*)");

  if (error) return formatError(error);
  if (!data || data.length === 0) return { success: false, error: { message: "Investment not found." } };
  return { success: true, investment: fromInvestmentRow(data[0]) };
}

export async function deleteInvestment(id) {
  const { error } = await supabase.from("finance_investments").delete().eq("id", id);
  if (error) return formatError(error);
  return { success: true };
}

export async function addContribution(investmentId, contribution) {
  const { user, errorResult } = await getAuthUser();
  if (errorResult) return errorResult;

  const { error: insertError } = await supabase.from("finance_investment_contributions").insert([
    {
      user_id: user.id,
      investment_id: investmentId,
      date: contribution.date || todayStr(),
      amount: Number(contribution.amount) || 0,
      note: contribution.note || null,
    },
  ]);
  if (insertError) return formatError(insertError);

  const { data, error } = await supabase
    .from("finance_investments")
    .select("*, contributions:finance_investment_contributions(*)")
    .eq("id", investmentId)
    .single();
  if (error) return formatError(error);
  return { success: true, investment: fromInvestmentRow(data) };
}

export async function deleteContribution(investmentId, contributionId) {
  const { error: deleteError } = await supabase
    .from("finance_investment_contributions")
    .delete()
    .eq("id", contributionId);
  if (deleteError) return formatError(deleteError);

  const { data, error } = await supabase
    .from("finance_investments")
    .select("*, contributions:finance_investment_contributions(*)")
    .eq("id", investmentId)
    .single();
  if (error) return formatError(error);
  return { success: true, investment: fromInvestmentRow(data) };
}

export function computeInvestmentTotal(investment) {
  return (investment.contributions || []).reduce((s, c) => s + c.amount, 0);
}

export function computeInvestmentsOverview(investments) {
  const totalInvested = investments.reduce((s, i) => s + computeInvestmentTotal(i), 0);
  return { totalInvested, count: investments.length };
}

// ---------------------------------------------------------------------
// Projection: "if every expense gets paid, every income arrives, and
// every investment gets fully funded, what am I left with?"
// ---------------------------------------------------------------------
export function computeProjectedOverview(txStats, investments, loans) {
  // Only investments with a target amount set count as "still owed" —
  // one with no target isn't a commitment, just a tracker with nothing
  // pledged yet.
  const investmentsRemaining = (investments || []).reduce((s, inv) => {
    const target = inv.targetAmount || 0;
    if (target <= 0) return s;
    const contributed = computeInvestmentTotal(inv);
    return s + Math.max(0, target - contributed);
  }, 0);

  const loansRemaining = (loans || [])
    .filter((l) => l.status !== "Paid")
    .reduce((s, l) => s + computeLoanSummary(l).balanceRemaining, 0);

  // Every income lands (totalIncome, not just what's already received),
  // minus every expense gets paid in full (totalExpensesFull, not just
  // what's already gone out), minus whatever's still left to put into
  // investments, minus whatever's still owed on loans.
  const projectedFinalBalance =
    txStats.totalIncome - txStats.totalExpensesFull - investmentsRemaining - loansRemaining;

  return { investmentsRemaining, loansRemaining, projectedFinalBalance };
}
