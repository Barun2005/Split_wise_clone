import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addMemberSchema = z.object({
  email: z.string().email(),
  joinDate: z.string().optional(), // YYYY-MM-DD
});

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId: params.groupId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const body = await request.json();
    const result = addMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const { email, joinDate } = result.data;

    // Find user by email
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found with that email' }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: { groupId: params.groupId, userId: userToAdd.id },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this group' }, { status: 409 });
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: params.groupId,
        userId: userToAdd.id,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ message: 'Member added successfully', member }, { status: 201 });
  } catch (error) {
    console.error('Add Member Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
