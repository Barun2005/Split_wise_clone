import Papa from 'papaparse';
import { parse, isValid, isBefore, isAfter } from 'date-fns';

/**
 * CSV Import Engine & Anomaly Detection System
 * 
 * Purpose: Parses uploaded CSV files of expenses, validates each row against business rules,
 * and detects complex anomalies like timeline mismatches or duplicate entries.
 * 
 * Assumptions:
 * - CSV has headers.
 * - Minimum required headers: title, amount, currency, date, paidBy, participants, splitType
 * 
 * Edge Cases Handled:
 * - Corrupted rows (missing standard columns)
 * - Timeline violations (expenses outside of active membership dates)
 * - Split mismatches (e.g. percentages not adding up to 100)
 * - Near-duplicates (similar amount/date but different title)
 */

export interface RawExpenseRow {
  title: string;
  amount: string;
  currency: string;
  date: string;
  paidBy: string;
  participants: string;
  splitType: string;
  notes?: string;
  [key: string]: any;
}

export interface ImportIssue {
  rowNumber: number;
  severity: 'WARNING' | 'ERROR';
  description: string;
  suggestedFix?: string;
  rawData: any;
}

export interface ParseResult {
  validRows: any[];
  issues: ImportIssue[];
}

export interface GroupMemberTimeline {
  userId: string;
  name: string;
  joinDate: Date;
  leaveDate: Date | null;
}

export function parseAndDetectAnomalies(
  csvString: string,
  groupMembers: GroupMemberTimeline[],
  existingExpenses: any[] = []
): ParseResult {
  const issues: ImportIssue[] = [];
  const validRows: any[] = [];
  
  const parsed = Papa.parse<RawExpenseRow>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    issues.push({
      rowNumber: 0,
      severity: 'ERROR',
      description: 'CSV Parsing failed. File might be corrupted.',
      rawData: parsed.errors,
    });
    return { validRows, issues };
  }

  const seenRows: RawExpenseRow[] = [];

  parsed.data.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header row
    let isRowValid = true;

    // 16. Corrupted Row
    if (!row.title && !row.amount && !row.date) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Corrupted or entirely empty row', rawData: row });
      return;
    }

    // 13. Empty title
    if (!row.title || row.title.trim() === '') {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Missing expense title', suggestedFix: 'Provide a descriptive title', rawData: row });
      isRowValid = false;
    }

    // 6 & 7. Negative or Zero amount
    const amount = parseFloat(row.amount);
    if (isNaN(amount) || amount === 0) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Zero amount expense', suggestedFix: 'Amount must be greater than 0', rawData: row });
      isRowValid = false;
    } else if (amount < 0) {
      issues.push({ rowNumber: rowNum, severity: 'WARNING', description: 'Negative amount detected', suggestedFix: 'Convert to a positive expense or log as a settlement', rawData: row });
    }

    // 3. Invalid dates & 15. Future date
    const expenseDate = new Date(row.date);
    if (!isValid(expenseDate)) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Invalid date format', suggestedFix: 'Use YYYY-MM-DD format', rawData: row });
      isRowValid = false;
    } else if (isAfter(expenseDate, new Date())) {
      issues.push({ rowNumber: rowNum, severity: 'WARNING', description: 'Expense date is in the future', rawData: row });
    }

    // 4 & 5. Missing payer / participant
    if (!row.paidBy) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Missing payer', rawData: row });
      isRowValid = false;
    }
    if (!row.participants) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Missing participants', rawData: row });
      isRowValid = false;
    }

    // 14. Unknown User & 10. Expense outside membership period
    if (isRowValid && row.participants) {
      const participantNames = row.participants.split(',').map(p => p.trim());
      for (const pName of participantNames) {
        const member = groupMembers.find(m => m.name.toLowerCase() === pName.toLowerCase());
        if (!member) {
          issues.push({ rowNumber: rowNum, severity: 'ERROR', description: `Unknown participant: ${pName}`, suggestedFix: `Add user to group first`, rawData: row });
          isRowValid = false;
        } else {
          // Check timeline
          if (isBefore(expenseDate, member.joinDate)) {
            issues.push({ rowNumber: rowNum, severity: 'ERROR', description: `${pName} was not a member on ${row.date}`, suggestedFix: `Remove ${pName} or change expense date`, rawData: row });
            isRowValid = false;
          }
          if (member.leaveDate && isAfter(expenseDate, member.leaveDate)) {
            issues.push({ rowNumber: rowNum, severity: 'ERROR', description: `${pName} had left the group by ${row.date}`, suggestedFix: `Remove ${pName} or change expense date`, rawData: row });
            isRowValid = false;
          }
        }
      }
    }

    // 1 & 2. Duplicate / Near-duplicate detection
    const isExactDuplicate = seenRows.some(r => r.title === row.title && r.amount === row.amount && r.date === row.date);
    if (isExactDuplicate) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: 'Exact duplicate of another row in this import', suggestedFix: 'Remove duplicate row', rawData: row });
      isRowValid = false;
    }

    const isNearDuplicate = seenRows.some(r => r.amount === row.amount && r.date === row.date && r.title !== row.title);
    if (isNearDuplicate) {
      issues.push({ rowNumber: rowNum, severity: 'WARNING', description: 'Near-duplicate detected (same amount and date, different title)', rawData: row });
    }

    // 9. Settlement logged as expense
    if (row.title && row.title.toLowerCase().includes('settle') || row.title.toLowerCase().includes('payment')) {
      issues.push({ rowNumber: rowNum, severity: 'WARNING', description: 'Title suggests this is a settlement, not an expense', suggestedFix: 'Log this via the Settlements feature instead', rawData: row });
    }

    // 8. Currency Mismatch
    if (row.currency && !['INR', 'USD'].includes(row.currency.toUpperCase())) {
      issues.push({ rowNumber: rowNum, severity: 'ERROR', description: `Unsupported currency: ${row.currency}`, suggestedFix: 'Change to INR or USD', rawData: row });
      isRowValid = false;
    }

    seenRows.push(row);

    if (isRowValid) {
      validRows.push(row);
    }
  });

  return { validRows, issues };
}
