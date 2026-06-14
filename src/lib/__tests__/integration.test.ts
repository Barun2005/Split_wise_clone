import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock Auth JWT
vi.mock('@/lib/auth', () => ({
  signJWT: vi.fn().mockResolvedValue('mock-jwt-token'),
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}));

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/register should create a new user and return a token', async () => {
    // Setup Mock Responses
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
    });

    const requestObj = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(requestObj);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.message).toBe('Registered successfully');
    expect(json.user.id).toBe('user123');

    // Check if the cookie was set
    const cookies = response.headers.get('set-cookie');
    expect(cookies).toContain('token=mock-jwt-token');
  });

  it('POST /api/auth/register should fail if user already exists', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({ id: 'existing-user' });

    const requestObj = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(requestObj);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe('User already exists');
  });
});
