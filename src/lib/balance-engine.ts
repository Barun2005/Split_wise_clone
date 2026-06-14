/**
 * Balance Engine - Debt Simplification Algorithm
 * 
 * Purpose: Calculates net balances and generates an optimized list of 
 * minimum transactions required to settle all debts in a group.
 * 
 * Assumptions:
 * - All amounts are converted to a single base currency before passing here.
 * - Net balance is calculated as: (Total Paid) - (Total Shared Share)
 * 
 * Edge Cases:
 * - Floating point precision: We use cents or round to 2 decimal places to avoid floating point errors.
 * - Circular debts: The greedy algorithm naturally resolves circular debts by only looking at net balances.
 */

export interface UserBalance {
  userId: string;
  netBalance: number; // Positive means they are owed money, negative means they owe money
}

export interface SimplifiedDebt {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export function simplifyDebts(balances: UserBalance[]): SimplifiedDebt[] {
  const creditors: UserBalance[] = [];
  const debtors: UserBalance[] = [];

  // Separate into creditors and debtors
  for (const b of balances) {
    if (b.netBalance > 0.01) {
      creditors.push({ ...b });
    } else if (b.netBalance < -0.01) {
      debtors.push({ ...b, netBalance: Math.abs(b.netBalance) });
    }
  }

  // Sort by amount descending
  creditors.sort((a, b) => b.netBalance - a.netBalance);
  debtors.sort((a, b) => b.netBalance - a.netBalance);

  const transactions: SimplifiedDebt[] = [];
  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.netBalance, debtor.netBalance);
    
    // Round to 2 decimal places to avoid float issues
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      transactions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: roundedAmount,
      });
    }

    creditor.netBalance -= amount;
    debtor.netBalance -= amount;

    if (creditor.netBalance < 0.01) i++;
    if (debtor.netBalance < 0.01) j++;
  }

  return transactions;
}
