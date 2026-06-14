import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { simplifyDebts, UserBalance } from '@/lib/balance-engine';

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    // 1. Fetch all expenses and their participants
    const expenses = await prisma.expense.findMany({
      where: { groupId: params.groupId },
      include: { participants: true }
    });

    // 2. Fetch all settlements
    const settlements = await prisma.settlement.findMany({
      where: { groupId: params.groupId }
    });

    // 3. Calculate Net Balances
    const balanceMap: Record<string, number> = {};

    // For every expense, the payer gets +amount, participants get -amountOwed
    expenses.forEach(exp => {
      balanceMap[exp.paidById] = (balanceMap[exp.paidById] || 0) + Number(exp.amount);
      
      exp.participants.forEach(p => {
        balanceMap[p.userId] = (balanceMap[p.userId] || 0) - Number(p.amountOwed);
      });
    });

    // For every settlement, the payer gets +amount (they paid debt), receiver gets -amount (they received debt back)
    settlements.forEach(settle => {
      balanceMap[settle.paidById] = (balanceMap[settle.paidById] || 0) + Number(settle.amount);
      balanceMap[settle.paidToId] = (balanceMap[settle.paidToId] || 0) - Number(settle.amount);
    });

    const userBalances: UserBalance[] = Object.entries(balanceMap).map(([userId, netBalance]) => ({
      userId,
      netBalance
    }));

    // 4. Simplify Debts
    const simplifiedDebts = simplifyDebts(userBalances);

    return NextResponse.json({
      netBalances: userBalances,
      simplifiedDebts
    }, { status: 200 });

  } catch (error) {
    console.error('Get Balances Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
