import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';

async function hashPassword(password: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(errorResponse('Email already registered'), { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(successResponse(user), { status: 201 });
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}
