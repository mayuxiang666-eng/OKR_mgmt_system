import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

export interface CreateCycleInput {
  orgId?: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export interface CreateObjectiveInput {
  orgId?: string;
  cycleId?: string;
  title: string;
  category: string;
  priority?: string;
  status?: string;
  ownerUserId?: string;
  ownerTeamId?: string;
  startDate?: string;
  dueDate?: string;
  description?: string;
  notes?: string;
  lastReviewDate?: string;
  plannedNextReviewDate?: string;
}

export interface CreateKeyResultInput {
  objectiveId: string;
  title: string;
  metricType: string;
  unit?: string;
  baseline?: number;
  target: number;
  current?: number;
  forecast?: number;
  weight?: number;
  confidence?: number;
  status?: string;
  calculationMode?: string;
}

export interface UpdateKrProgressInput {
  current?: number;
  forecast?: number;
  confidence?: number;
}

export interface UpdateObjectiveInput {
  title?: string;
  category?: string;
  priority?: string;
  status?: string;
  startDate?: string;
  dueDate?: string;
  description?: string;
  lastReviewDate?: string;
  plannedNextReviewDate?: string;
}

export interface UpdateKeyResultInput {
  title?: string;
  unit?: string;
  baseline?: number;
  target?: number;
  current?: number;
  forecast?: number;
  weight?: number;
  confidence?: number;
  status?: string;
}

export interface CreateAlignmentInput {
  parentObjectiveId: string;
  childObjectiveId: string;
  relation?: string;
  weight?: number;
}

@Injectable()
export class OkrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createCycle(input: CreateCycleInput) {
    const org = await this.resolveOrganization(input.orgId);
    return this.prisma.okrCycle.create({
      data: {
        orgId: org.id,
        name: input.name,
        type: input.type,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: input.status ?? 'active',
      },
    });
  }

  async listCycles(status?: string) {
    return this.prisma.okrCycle.findMany({
      where: status ? { status } : undefined,
      orderBy: { startDate: 'desc' },
    });
  }

  async createObjective(input: CreateObjectiveInput) {
    const org = await this.resolveOrganization(input.orgId);
    const cycleId = input.cycleId ?? (await this.resolveDefaultCycle(org.id)).id;

    const objective = await this.prisma.objective.create({
      data: {
        orgId: org.id,
        cycleId,
        ownerUserId: input.ownerUserId,
        ownerTeamId: input.ownerTeamId,
        title: input.title,
        category: input.category,
        priority: input.priority ?? 'medium',
        status: input.status ?? 'not_started',
        startDate: input.startDate ? new Date(input.startDate) : null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        description: input.description,
        lastReviewDate: input.lastReviewDate ? new Date(input.lastReviewDate) : null,
        plannedNextReviewDate: input.plannedNextReviewDate ? new Date(input.plannedNextReviewDate) : null,
      },
      include: { keyResults: true },
    });
    
    if (objective.ownerUserId) {
      await this.notificationService.create({
        userId: objective.ownerUserId,
        title: 'New OKR Assigned',
        message: `You have been assigned as the owner of "${objective.title}"`,
        type: 'assignment',
        link: `/objective/${objective.id}`,
      });
    }

    return objective;
  }

  async listObjectives(cycleId?: string) {
    return this.prisma.objective.findMany({
      where: cycleId ? { cycleId } : undefined,
      include: {
        keyResults: true,
        owner: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async getObjective(id: string) {
    const objective = await this.prisma.objective.findUnique({
      where: { id },
      include: {
        keyResults: true,
        owner: { select: { id: true, displayName: true, email: true } },
      },
    });
    if (!objective) {
      throw new NotFoundException(`Objective ${id} not found`);
    }
    return objective;
  }

  async updateObjective(id: string, input: UpdateObjectiveInput) {
    await this.getObjective(id);

    const updated = await this.prisma.objective.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.startDate !== undefined ? { startDate: input.startDate ? new Date(input.startDate) : null } : {}),
        ...(input.dueDate !== undefined ? { dueDate: input.dueDate ? new Date(input.dueDate) : null } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.lastReviewDate !== undefined ? { lastReviewDate: input.lastReviewDate ? new Date(input.lastReviewDate) : null } : {}),
        ...(input.plannedNextReviewDate !== undefined
          ? { plannedNextReviewDate: input.plannedNextReviewDate ? new Date(input.plannedNextReviewDate) : null }
          : {}),
      },
      include: {
        keyResults: true,
        owner: { select: { id: true, displayName: true, email: true } },
      },
    });

    if (updated.ownerUserId) {
      await this.notificationService.create({
        userId: updated.ownerUserId,
        title: 'OKR Updated',
        message: `The OKR "${updated.title}" has been updated.`,
        type: 'modification',
        link: `/objective/${updated.id}`,
      });
    }

    return updated;
  }

  async deleteObjective(id: string) {
    const objective = await this.prisma.objective.findUnique({ where: { id }, select: { id: true } });
    if (!objective) {
      throw new NotFoundException(`Objective ${id} not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      const keyResults = await tx.keyResult.findMany({ where: { objectiveId: id }, select: { id: true } });
      const krIds = keyResults.map((item) => item.id);

      const directInitiatives = await tx.initiative.findMany({ where: { objectiveId: id }, select: { id: true } });
      const krInitiatives = krIds.length
        ? await tx.initiative.findMany({ where: { krId: { in: krIds } }, select: { id: true } })
        : [];
      const initiativeIds = Array.from(new Set([...directInitiatives, ...krInitiatives].map((item) => item.id)));

      if (initiativeIds.length) {
        await tx.task.deleteMany({ where: { initiativeId: { in: initiativeIds } } });
      }

      if (krIds.length) {
        await tx.task.deleteMany({ where: { krId: { in: krIds } } });
        await tx.checkin.deleteMany({ where: { krId: { in: krIds } } });
        await tx.review.deleteMany({ where: { krId: { in: krIds } } });
        await tx.project.updateMany({ where: { krId: { in: krIds } }, data: { krId: null } });
      }

      await tx.review.deleteMany({ where: { objectiveId: id } });

      if (initiativeIds.length) {
        await tx.initiative.deleteMany({ where: { id: { in: initiativeIds } } });
      }

      await tx.alignment.deleteMany({ where: { OR: [{ parentObjectiveId: id }, { childObjectiveId: id }] } });
      await tx.objective.updateMany({ where: { parentObjectiveId: id }, data: { parentObjectiveId: null } });
      await tx.keyResult.deleteMany({ where: { objectiveId: id } });
      await tx.objective.delete({ where: { id } });
    });

    return { id, deleted: true };
  }

  async createKeyResult(input: CreateKeyResultInput) {
    const objective = await this.prisma.objective.findUnique({ where: { id: input.objectiveId } });
    if (!objective) {
      throw new NotFoundException(`Objective ${input.objectiveId} not found`);
    }

    const progress = this.calculateProgress(input.current, input.baseline, input.target);

    const created = await this.prisma.keyResult.create({
      data: {
        objectiveId: input.objectiveId,
        title: input.title,
        metricType: input.metricType,
        unit: input.unit,
        baseline: input.baseline,
        target: input.target,
        current: input.current,
        forecast: input.forecast,
        weight: input.weight ?? 1,
        progress,
        confidence: input.confidence ?? 0.5,
        status: input.status ?? 'on_track',
        calculationMode: input.calculationMode ?? 'manual',
      },
    });

    await this.refreshObjectiveProgress(input.objectiveId);
    return created;
  }

  async listKeyResults(objectiveId?: string) {
    return this.prisma.keyResult.findMany({
      where: objectiveId ? { objectiveId } : undefined,
      orderBy: { id: 'desc' },
    });
  }

  async getKeyResult(id: string) {
    const kr = await this.prisma.keyResult.findUnique({ where: { id } });
    if (!kr) {
      throw new NotFoundException(`Key result ${id} not found`);
    }
    return kr;
  }

  async updateKeyResult(id: string, input: UpdateKeyResultInput) {
    const existing = await this.getKeyResult(id);

    const nextTarget = input.target ?? existing.target;
    const nextBaseline = input.baseline ?? existing.baseline ?? undefined;
    const nextCurrent = input.current ?? existing.current ?? undefined;
    const nextConfidence = input.confidence ?? existing.confidence;
    const progress = this.calculateProgress(nextCurrent, nextBaseline, nextTarget);

    const updated = await this.prisma.keyResult.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.unit !== undefined ? { unit: input.unit } : {}),
        ...(input.baseline !== undefined ? { baseline: input.baseline } : {}),
        ...(input.target !== undefined ? { target: input.target } : {}),
        ...(input.current !== undefined ? { current: input.current } : {}),
        ...(input.forecast !== undefined ? { forecast: input.forecast } : {}),
        ...(input.weight !== undefined ? { weight: input.weight } : {}),
        ...(input.confidence !== undefined ? { confidence: input.confidence } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        progress,
        status: input.status ?? this.toHealthStatus(progress, nextConfidence),
      },
    });

    await this.refreshObjectiveProgress(existing.objectiveId);
    return updated;
  }

  async deleteKeyResult(id: string) {
    const existing = await this.getKeyResult(id);
    await this.prisma.checkin.deleteMany({ where: { krId: id } });
    await this.prisma.review.deleteMany({ where: { krId: id } });
    await this.prisma.task.deleteMany({ where: { krId: id } });
    await this.prisma.project.updateMany({ where: { krId: id }, data: { krId: null } });
    await this.prisma.initiative.deleteMany({ where: { krId: id } });
    await this.prisma.keyResult.delete({ where: { id } });
    await this.refreshObjectiveProgress(existing.objectiveId);
    return { id, deleted: true };
  }

  async updateKrProgress(id: string, input: UpdateKrProgressInput) {
    const existing = await this.getKeyResult(id);
    const progress = this.calculateProgress(
      input.current ?? existing.current ?? undefined,
      existing.baseline ?? undefined,
      existing.target,
    );

    const updated = await this.prisma.keyResult.update({
      where: { id },
      data: {
        current: input.current ?? existing.current,
        forecast: input.forecast ?? existing.forecast,
        confidence: input.confidence ?? existing.confidence,
        progress,
        status: this.toHealthStatus(progress, input.confidence ?? existing.confidence),
      },
    });

    await this.refreshObjectiveProgress(existing.objectiveId);
    return updated;
  }

  async createAlignment(input: CreateAlignmentInput) {
    if (input.parentObjectiveId === input.childObjectiveId) {
      throw new BadRequestException('Parent and child objective cannot be the same');
    }

    const parent = await this.prisma.objective.findUnique({ where: { id: input.parentObjectiveId } });
    const child = await this.prisma.objective.findUnique({ where: { id: input.childObjectiveId } });
    if (!parent || !child) {
      throw new NotFoundException('Parent or child objective not found');
    }

    return this.prisma.alignment.create({
      data: {
        parentObjectiveId: input.parentObjectiveId,
        childObjectiveId: input.childObjectiveId,
        relation: input.relation ?? 'contributes_to',
        weight: input.weight ?? 1,
      },
    });
  }

  async listAlignments(parentObjectiveId?: string) {
    return this.prisma.alignment.findMany({
      where: parentObjectiveId ? { parentObjectiveId } : undefined,
      include: {
        parent: { select: { id: true, title: true, progressCached: true } },
        child: { select: { id: true, title: true, progressCached: true } },
      },
      orderBy: { id: 'desc' },
    });
  }

  async refreshObjectiveProgress(objectiveId: string) {
    const keyResults = await this.prisma.keyResult.findMany({
      where: { objectiveId },
      select: { progress: true, weight: true, confidence: true },
    });

    if (keyResults.length === 0) {
      await this.prisma.objective.update({
        where: { id: objectiveId },
        data: {
          progressCached: 0,
          confidenceCached: 0,
        },
      });
      return;
    }

    const totalWeight = keyResults.reduce((sum: number, item: { weight: number; progress: number; confidence: number }) => sum + (item.weight || 1), 0);
    const weightedProgress = keyResults.reduce((sum: number, item: { weight: number; progress: number; confidence: number }) => sum + item.progress * (item.weight || 1), 0) / totalWeight;
    const weightedConfidence = keyResults.reduce((sum: number, item: { weight: number; progress: number; confidence: number }) => sum + item.confidence * (item.weight || 1), 0) / totalWeight;

    await this.prisma.objective.update({
      where: { id: objectiveId },
      data: {
        progressCached: weightedProgress,
        confidenceCached: weightedConfidence,
        status: this.toProgressStatus(weightedProgress),
      },
    });
  }

  private calculateProgress(current: number | undefined, baseline: number | undefined, target: number): number {
    if (current === undefined || current === null) {
      return 0;
    }

    if (baseline === undefined || baseline === null) {
      if (target === 0) {
        return 0;
      }
      return this.clamp01(current / target);
    }

    const denominator = target - baseline;
    if (denominator === 0) {
      return current >= target ? 1 : 0;
    }

    return this.clamp01((current - baseline) / denominator);
  }

  private clamp01(value: number): number {
    if (value < 0) {
      return 0;
    }
    if (value > 1) {
      return 1;
    }
    return Number(value.toFixed(4));
  }

  private toHealthStatus(progress: number, confidence: number): string {
    if (progress < 0.35 || confidence < 0.5) {
      return 'off_track';
    }
    if (progress < 0.6 || confidence < 0.7) {
      return 'at_risk';
    }
    return 'on_track';
  }

  private toProgressStatus(progress: number): string {
    if (progress >= 1) {
      return 'completed';
    }
    if (progress <= 0) {
      return 'not_started';
    }
    return 'in_progress';
  }

  private async resolveOrganization(orgId?: string) {
    if (orgId) {
      const organization = await this.prisma.organization.findUnique({ where: { id: orgId } });
      if (organization) {
        return organization;
      }
      throw new NotFoundException(`Organization ${orgId} not found`);
    }

    const existing = await this.prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
    if (existing) {
      return existing;
    }

    return this.prisma.organization.create({
      data: {
        name: 'Continental PE',
        timezone: 'Asia/Shanghai',
      },
    });
  }

  private async resolveDefaultCycle(orgId: string) {
    const cycle = await this.prisma.okrCycle.findFirst({
      where: { orgId },
      orderBy: { startDate: 'desc' },
    });
    if (cycle) {
      return cycle;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);

    return this.prisma.okrCycle.create({
      data: {
        orgId,
        name: `${startDate.getUTCFullYear()}-Q${Math.floor(startDate.getUTCMonth() / 3) + 1}`,
        type: 'quarterly',
        startDate,
        endDate,
        status: 'active',
      },
    });
  }
}


