import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const importSessions = await prisma.importSession.findMany({
      where: { groupId: params.groupId },
      include: {
        issues: true,
        group: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    const reports = importSessions.map(session => ({
      sessionId: session.id,
      date: session.createdAt,
      status: session.status,
      metrics: {
        totalRows: session.totalRows,
        importedRows: session.importedRows,
        skippedRows: session.totalRows - session.importedRows,
        anomalyCount: session.issues.length,
      },
      anomalies: session.issues.map(i => ({
        row: i.rowNumber,
        severity: i.severity,
        description: i.description,
        suggestedFix: i.suggestedFix,
        resolved: i.resolved,
      })),
      // In a real PDF generation scenario, we'd use a library like jsPDF or puppeteer here 
      // to format this JSON into a downloadable PDF buffer.
    }));

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error('Get Reports Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
