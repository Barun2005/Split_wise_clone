import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = groupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.errors }, { status: 400 });
    }

    const { name, description } = result.data;

    const group = await prisma.$transaction(async (tx) => {
      // Create the group
      const newGroup = await tx.group.create({
        data: {
          name,
          description,
          createdById: userId,
        },
      });

      // Add the creator as the first member
      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId,
          joinDate: new Date(),
        },
      });

      return newGroup;
    });

    return NextResponse.json({ message: 'Group created successfully', group }, { status: 201 });
  } catch (error: any) {
    console.error('Create Group Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all groups where the user is a member
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
            // We could also filter by leaveDate here if we only want active groups
          },
        },
      },
      include: {
        _count: {
          select: { members: true, expenses: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ groups }, { status: 200 });
  } catch (error: any) {
    console.error('Get Groups Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
