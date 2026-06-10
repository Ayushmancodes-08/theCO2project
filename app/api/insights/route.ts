import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const insights = await prisma.aIInsight.findMany({
      where: { userId: session.user.id },
      orderBy: { generatedAt: 'desc' },
      take: 10,
    });

    return NextResponse.json(successResponse(insights));
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}

export async function POST(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const activities = await prisma.carbonActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const totalCO2 = activities.reduce((sum, a) => sum + a.co2Kg, 0);
    const categoryTotals = activities.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] ?? 0) + a.co2Kg;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'unknown';

    const insights = [
      {
        action: topCategory === 'transportation'
          ? 'Switch one car trip per week to public transit'
          : topCategory === 'food'
          ? 'Try two meat-free days per week'
          : topCategory === 'energy'
          ? 'Lower your thermostat by 2°C this winter'
          : topCategory === 'shopping'
          ? 'Buy second-hand for your next purchase'
          : 'Start composting food waste',
        reasoning: `Your highest impact category is ${topCategory} at ${(categoryTotals[topCategory] ?? 0).toFixed(1)} kg CO2. This change targets your biggest source.`,
        estimatedSavingKg: topCategory === 'transportation' ? 50 : topCategory === 'food' ? 80 : topCategory === 'energy' ? 30 : topCategory === 'shopping' ? 40 : 20,
        difficulty: 'easy' as const,
      },
      {
        action: topCategory === 'transportation'
          ? 'Consider an electric vehicle for your next upgrade'
          : topCategory === 'food'
          ? 'Adopt a plant-based diet for one month'
          : topCategory === 'energy'
          ? 'Switch to 100% renewable energy provider'
          : topCategory === 'shopping'
          ? 'Implement a 30-day no-buy challenge'
          : 'Aim for zero waste to landfill',
        reasoning: `Medium-term changes in ${topCategory} can significantly reduce your overall footprint.`,
        estimatedSavingKg: topCategory === 'transportation' ? 120 : topCategory === 'food' ? 150 : topCategory === 'energy' ? 80 : topCategory === 'shopping' ? 100 : 50,
        difficulty: 'medium' as const,
      },
      {
        action: 'Track your daily emissions for the next 30 days',
        reasoning: `Awareness is the first step. Your current 30-day total is ${totalCO2.toFixed(1)} kg CO2. Tracking builds lasting habits.`,
        estimatedSavingKg: 30,
        difficulty: 'easy' as const,
      },
    ];

    const createdInsights = await Promise.all(
      insights.map((insight) =>
        prisma.aIInsight.create({
          data: {
            userId: session.user.id,
            action: insight.action,
            reasoning: insight.reasoning,
            estimatedSavingKg: insight.estimatedSavingKg,
            difficulty: insight.difficulty,
          },
        })
      )
    );

    return NextResponse.json(successResponse(createdInsights), { status: 201 });
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}
