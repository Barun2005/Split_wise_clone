import { describe, it, expect } from 'vitest';
import { parseAndDetectAnomalies, GroupMemberTimeline } from '../csv-engine';

describe('CSV Engine - Anomaly Detection', () => {
  const mockMembers: GroupMemberTimeline[] = [
    { userId: 'u1', name: 'Aisha', joinDate: new Date('2024-01-01'), leaveDate: null },
    { userId: 'u2', name: 'Rohan', joinDate: new Date('2024-01-01'), leaveDate: new Date('2024-06-30') },
    { userId: 'u3', name: 'Sam', joinDate: new Date('2024-07-01'), leaveDate: null },
  ];

  it('should parse valid rows without issues', () => {
    const csvData = `title,amount,currency,date,paidBy,participants,splitType\nLunch,100,INR,2024-02-15,Aisha,"Aisha, Rohan",EQUAL`;
    const result = parseAndDetectAnomalies(csvData, mockMembers);

    expect(result.issues).toHaveLength(0);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0].title).toBe('Lunch');
  });

  it('should detect unknown participants', () => {
    const csvData = `title,amount,currency,date,paidBy,participants,splitType\nDinner,200,INR,2024-02-15,Aisha,"Aisha, UnknownPerson",EQUAL`;
    const result = parseAndDetectAnomalies(csvData, mockMembers);

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('ERROR');
    expect(result.issues[0].description).toContain('Unknown participant');
    expect(result.validRows).toHaveLength(0);
  });

  it('should detect timeline mismatches (expense before join date)', () => {
    const csvData = `title,amount,currency,date,paidBy,participants,splitType\nBreakfast,50,INR,2024-05-15,Aisha,"Aisha, Sam",EQUAL`;
    const result = parseAndDetectAnomalies(csvData, mockMembers);

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('ERROR');
    expect(result.issues[0].description).toContain('was not a member');
  });

  it('should detect timeline mismatches (expense after leave date)', () => {
    const csvData = `title,amount,currency,date,paidBy,participants,splitType\nDrinks,150,INR,2024-08-15,Aisha,"Aisha, Rohan",EQUAL`;
    const result = parseAndDetectAnomalies(csvData, mockMembers);

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('ERROR');
    expect(result.issues[0].description).toContain('had left the group');
  });

  it('should detect exact duplicates', () => {
    const csvData = `title,amount,currency,date,paidBy,participants,splitType
Taxi,50,USD,2024-03-01,Aisha,"Aisha, Rohan",EQUAL
Taxi,50,USD,2024-03-01,Aisha,"Aisha, Rohan",EQUAL`;
    const result = parseAndDetectAnomalies(csvData, mockMembers);

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].description).toContain('Exact duplicate');
  });

  it('should flag settlements logged as expenses as warnings', () => {
    const csvData = `title,amount,currency,date,paidBy,participants,splitType\nSettlement for May,500,INR,2024-05-01,Rohan,"Aisha",EQUAL`;
    const result = parseAndDetectAnomalies(csvData, mockMembers);

    expect(result.issues.some(i => i.severity === 'WARNING' && i.description.includes('suggests this is a settlement'))).toBe(true);
  });
});
