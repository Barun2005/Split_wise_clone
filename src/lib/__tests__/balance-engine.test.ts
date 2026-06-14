import { describe, it, expect } from 'vitest';
import { simplifyDebts, UserBalance } from '../balance-engine';

describe('Balance Engine - Debt Simplification', () => {
  it('should correctly settle a simple debt between two users', () => {
    const balances: UserBalance[] = [
      { userId: 'Alice', netBalance: 100 },
      { userId: 'Bob', netBalance: -100 },
    ];

    const transactions = simplifyDebts(balances);

    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toEqual({
      fromUserId: 'Bob',
      toUserId: 'Alice',
      amount: 100,
    });
  });

  it('should handle a circular debt gracefully', () => {
    // A owes B 100
    // B owes C 100
    // C owes A 100
    // Net balances: A: 0, B: 0, C: 0
    const balances: UserBalance[] = [
      { userId: 'A', netBalance: 0 },
      { userId: 'B', netBalance: 0 },
      { userId: 'C', netBalance: 0 },
    ];

    const transactions = simplifyDebts(balances);

    expect(transactions).toHaveLength(0);
  });

  it('should minimize transactions for multiple users', () => {
    // A paid 300 for A, B, C (A: +200, B: -100, C: -100)
    const balances: UserBalance[] = [
      { userId: 'A', netBalance: 200 },
      { userId: 'B', netBalance: -100 },
      { userId: 'C', netBalance: -100 },
    ];

    const transactions = simplifyDebts(balances);

    expect(transactions).toHaveLength(2);
    // B pays A 100, C pays A 100
    expect(transactions).toContainEqual({ fromUserId: 'B', toUserId: 'A', amount: 100 });
    expect(transactions).toContainEqual({ fromUserId: 'C', toUserId: 'A', amount: 100 });
  });

  it('should correctly match multiple creditors and debtors', () => {
    const balances: UserBalance[] = [
      { userId: 'A', netBalance: 50 },
      { userId: 'B', netBalance: 40 },
      { userId: 'C', netBalance: -30 },
      { userId: 'D', netBalance: -60 },
    ];

    const transactions = simplifyDebts(balances);
    
    // A gets 50, B gets 40. C owes 30, D owes 60.
    // D (60) pays A (50). D has 10 left.
    // D (10) pays B (10). B has 30 left.
    // C (30) pays B (30).
    expect(transactions).toHaveLength(3);
    
    const totalAmountSettled = transactions.reduce((acc, t) => acc + t.amount, 0);
    expect(totalAmountSettled).toBe(90);
  });

  it('should ignore dust amounts (floating point precision)', () => {
    const balances: UserBalance[] = [
      { userId: 'A', netBalance: 0.001 },
      { userId: 'B', netBalance: -0.001 },
    ];

    const transactions = simplifyDebts(balances);

    expect(transactions).toHaveLength(0);
  });
});
