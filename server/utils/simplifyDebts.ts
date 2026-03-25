interface Balance {
  [user: string]: number;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export function simplifyDebts(balances: Balance): Transaction[] {
  const debtors: { user: string; amount: number }[] = [];
  const creditors: { user: string; amount: number }[] = [];

  for (const [user, amount] of Object.entries(balances)) {
    if (amount < -0.01) debtors.push({ user, amount: -amount });
    else if (amount > 0.01) creditors.push({ user, amount });
  }

  // Sort by amount descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];
  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);
    
    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      transactions.push({
        from: debtor.user,
        to: creditor.user,
        amount: roundedAmount,
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
}
