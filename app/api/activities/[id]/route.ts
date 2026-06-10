import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const activity = await prisma.carbonActivity.findUnique({
      where: { id: params.id },
    });

    if (!activity) {
      return NextResponse.json(errorResponse('Activity not found'), { status: 404 });
    }

    if (activity.userId !== session.user.id) {
      return NextResponse.json(errorResponse('Forbidden'), { status: 403 });
    }

    await prisma.carbonActivity.delete({ where: { id: params.id } });

    return NextResponse.json(successResponse({ deleted: true }));
  } catch (error) {
    return NextResponse.json(errorResponse(getErrorMessage(error)), { status: 500 });
  }
}
