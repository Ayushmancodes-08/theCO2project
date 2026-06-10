import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { computeCategoryBreakdown, computeCarbonScore } from '@/lib/utils/emissionCalculator';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';
import type { ActivityCategory } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { monthlyGoalKg: true, onboardingCompleted: true },
    });

    if (!user) {
      return NextResponse.json(errorResponse('User not found'), { status: 404 });
    }

    const activities = await prisma.carbonActivity.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        userId: true,
        category: true,
        subcategory: true,
        quantity: true,
        unit: true,
        co2Kg: true,
        date: true,
        createdAt: true,
      },
    });

    const mappedActivities = activities.map((a) => ({
      ...a,
      co2Equivalent: a.co2Kg,
      category: a.category as ActivityCategory,
      date: a.date,
    }));

    const breakdown = computeCategoryBreakdown(mappedActivities);
    const score = computeCarbonScore(mappedActivities, user.monthlyGoalKg);

    return NextResponse.json(
      successResponse({
        breakdown,
        score,
        goalKg: user.monthlyGoalKg,
        onboardingCompleted: user.onboardingCompleted,
      })
    );
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}
