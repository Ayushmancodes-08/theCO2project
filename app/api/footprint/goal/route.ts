import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';

const updateGoalSchema = z.object({
  goalKg: z.number().positive().max(2000),
});

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { monthlyGoalKg: parsed.data.goalKg },
      select: { monthlyGoalKg: true },
    });

    return NextResponse.json(successResponse(user));
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}
