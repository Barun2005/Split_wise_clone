import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { SplitType } from '@prisma/client';

const participantSchema = z.object({
  userId: z.string(),
  amountOwed: z.number().min(0),
  splitPercentage: z.number().optional(),
  exactAmount: z.number().optional(),
});

const expenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  date: z.string(),
  paidById: z.string(),
  splitType: z.nativeEnum(SplitType),
  notes: z.string().optional(),
  participants: z.array(participantSchema).min(1),
});

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const data = result.data;
    const expenseDate = new Date(data.date);

    // Validate Membership Timelines
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: params.groupId },
    });

    const isPayerMember = groupMembers.find(m => m.userId === data.paidById);
    if (!isPayerMember) {
      return NextResponse.json({ error: 'Payer is not a member of the group' }, { status: 400 });
    }

    for (const p of data.participants) {
      const member = groupMembers.find(m => m.userId === p.userId);
      if (!member) {
        return NextResponse.json({ error: `User ${p.userId} is not a member` }, { status: 400 });
      }

      if (expenseDate < member.joinDate) {
        return NextResponse.json({ error: `User ${p.userId} had not joined the group yet on this date` }, { status: 400 });
      }

      if (member.leaveDate && expenseDate > member.leaveDate) {
        return NextResponse.json({ error: `User ${p.userId} had already left the group on this date` }, { status: 400 });
      }
    }

    // Mathematical validation
    let totalOwed = 0;
    for (const p of data.participants) {
      totalOwed += p.amountOwed;
    }

    // Allow 0.01 margin of error for floating point
    if (Math.abs(totalOwed - data.amount) > 0.01) {
      return NextResponse.json({ error: 'Participant owed amounts do not sum up to total amount' }, { status: 400 });
    }

    // Create Expense Transaction
    const expense = await prisma.expense.create({
      data: {
        groupId: params.groupId,
        title: data.title,
        amount: data.amount,
        currency: data.currency,
        date: expenseDate,
        paidById: data.paidById,
        splitType: data.splitType,
        notes: data.notes,
        participants: {
          create: data.participants.map(p => ({
            userId: p.userId,
            amountOwed: p.amountOwed,
            splitPercentage: p.splitPercentage,
            exactAmount: p.exactAmount,
          }))
        }
      },
      include: {
        participants: true,
      }
    });

    return NextResponse.json({ message: 'Expense created', expense }, { status: 201 });
  } catch (error: any) {
    console.error('Create Expense Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
