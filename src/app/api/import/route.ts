import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseAndDetectAnomalies, GroupMemberTimeline } from '@/lib/csv-engine';

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const groupId = formData.get('groupId') as string;

    if (!file || !groupId) {
      return NextResponse.json({ error: 'File and groupId are required' }, { status: 400 });
    }

    const csvString = await file.text();

    // 1. Fetch Group Members for timeline validation
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true }
    });

    const memberTimelines: GroupMemberTimeline[] = members.map(m => ({
      userId: m.userId,
      name: m.user.name,
      joinDate: m.joinDate,
      leaveDate: m.leaveDate,
    }));

    // 2. Run the CSV Engine to detect anomalies
    const { validRows, issues } = parseAndDetectAnomalies(csvString, memberTimelines);

    // 3. Create Import Session
    const session = await prisma.importSession.create({
      data: {
        groupId,
        uploadedById: userId,
        status: issues.length > 0 ? 'REVIEW' : 'COMPLETED',
        totalRows: validRows.length + issues.length,
        importedRows: validRows.length,
        issues: {
          create: issues.map(issue => ({
            rowNumber: issue.rowNumber,
            severity: issue.severity,
            description: issue.description,
            suggestedFix: issue.suggestedFix,
            rawData: JSON.stringify(issue.rawData),
          }))
        }
      },
      include: {
        issues: true,
      }
    });

    // 4. If no issues, we could theoretically insert the valid rows here, 
    // but typically we'd wait for user confirmation even if perfect.

    return NextResponse.json({ 
      message: 'File processed', 
      session 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Import CSV Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
