import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createActivitySchema, activityQuerySchema } from '@/lib/validations/activity';
import { calculateCO2 } from '@/lib/utils/emissionCalculator';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = activityQuerySchema.parse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 20,
      category: searchParams.get('category') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });

    const where: Record<string, unknown> = { userId: session.user.id };
    if (query.category) where.category = query.category;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) (where.date as Record<string, unknown>).gte = new Date(query.startDate);
      if (query.endDate) (where.date as Record<string, unknown>).lte = new Date(query.endDate);
    }

    const [activities, total] = await Promise.all([
      prisma.carbonActivity.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
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
      }),
      prisma.carbonActivity.count({ where }),
    ]);

    return NextResponse.json({
      ...successResponse(activities),
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: query.page * query.pageSize < total,
    });
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const body = await req.json();
    const parsed = createActivitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(parsed.error.issues[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const { category, subcategory, quantity, unit, date } = parsed.data;
    const co2Kg = calculateCO2(category, subcategory, quantity);

    const activity = await prisma.carbonActivity.create({
      data: {
        userId: session.user.id,
        category,
        subcategory,
        quantity,
        unit,
        co2Kg,
        date: new Date(date),
      },
    });

    return NextResponse.json(successResponse(activity), { status: 201 });
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}
