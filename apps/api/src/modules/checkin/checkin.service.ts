import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OkrService } from '../okr/okr.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';

@Injectable()
export class CheckinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly okrService: OkrService,
  ) {}

  async create(input: CreateCheckinDto) {
    const kr = await this.prisma.keyResult.findUnique({
      where: { id: input.krId },
      include: { objective: true },
    });

    if (!kr) {
      throw new NotFoundException(`Key result ${input.krId} not found`);
    }

    const userId = await this.resolveUserId(kr.objective.orgId, input.userId);
    const weekStartDate = input.weekStartDate ? new Date(input.weekStartDate) : this.startOfWeek(new Date());

    const checkin = await this.prisma.checkin.create({
      data: {
        krId: input.krId,
        userId,
        weekStartDate,
        current: input.current,
        forecast: input.forecast,
        confidence: input.confidence,
        risk: input.risk,
        blocker: input.blocker,
        comment: input.comment,
      },
    });

    await this.okrService.updateKrProgress(input.krId, {
      current: input.current,
      forecast: input.forecast,
      confidence: input.confidence,
    });

    return checkin;
  }

  list(krId?: string) {
    return this.prisma.checkin.findMany({
      where: krId ? { krId } : undefined,
      orderBy: { weekStartDate: 'desc' },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
      },
    });
  }

  private async resolveUserId(orgId: string, userId?: string) {
    if (userId) {
      return userId;
    }

    const user = await this.prisma.user.findFirst({ where: { orgId } });
    if (user) {
      return user.id;
    }

    const created = await this.prisma.user.create({
      data: {
        orgId,
        email: `system-${Date.now()}@conti.local`,
        displayName: 'System User',
        role: 'manager',
      },
    });

    return created.id;
  }

  private startOfWeek(date: Date) {
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utcDate.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    utcDate.setUTCDate(utcDate.getUTCDate() + diffToMonday);
    return utcDate;
  }
}
