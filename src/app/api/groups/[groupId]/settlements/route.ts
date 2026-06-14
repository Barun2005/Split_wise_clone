import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const settlementSchema = z.object({
  paidToId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  date: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = settlementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const data = result.data;

    // Verify both users are members
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: params.groupId,
        userId: { in: [userId, data.paidToId] }
      }
    });

    if (members.length !== 2 && userId !== data.paidToId) {
      return NextResponse.json({ error: 'Both users must be members of the group' }, { status: 400 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        groupId: params.groupId,
        paidById: userId,
        paidToId: data.paidToId,
        amount: data.amount,
        currency: data.currency,
        date: new Date(data.date),
        notes: data.notes,
      }
    });

    return NextResponse.json({ message: 'Settlement recorded', settlement }, { status: 201 });
  } catch (error) {
    console.error('Create Settlement Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const settlements = await prisma.settlement.findMany({
      where: { groupId: params.groupId },
      include: {
        paidBy: { select: { name: true } },
        paidTo: { select: { name: true } }
      },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json({ settlements }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
