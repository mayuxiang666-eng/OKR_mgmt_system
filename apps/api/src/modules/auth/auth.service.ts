import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type AuthResult = {
  access_token: string;
  refresh_token: string;
  role: string;
  email: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    role: string;
  };
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(input: RegisterDto): Promise<AuthResult> {
    const email = this.normalizeEmail(input.email);
    const displayName = input.displayName.trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    const passwordHash = this.hashPassword(input.password);

    if (existing) {
      if (existing.passwordHash) {
        throw new ConflictException('Email already registered');
      }

      const activated = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          displayName,
          passwordHash,
        },
      });

      return this.buildAuthResult(activated);
    }

    const org = await this.resolveOrganization();
    const user = await this.prisma.user.create({
      data: {
        email,
        displayName,
        role: 'member',
        orgId: org.id,
        passwordHash,
      },
    });

    return this.buildAuthResult(user);
  }

  async login(input: LoginDto): Promise<AuthResult> {
    const email = this.normalizeEmail(input.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = this.verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResult(user);
  }

  refresh() {
    return {
      access_token: this.issueToken('access'),
    };
  }

  private async resolveOrganization() {
    const existing = await this.prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
    if (existing) {
      return existing;
    }

    return this.prisma.organization.create({
      data: {
        name: 'Default Organization',
        timezone: 'Asia/Shanghai',
      },
    });
  }

  private normalizeEmail(value: string) {
    return value.trim().toLowerCase();
  }

  private hashPassword(password: string) {
    const iterations = 210000;
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, iterations, 32, 'sha512').toString('hex');
    return `pbkdf2$${iterations}$${salt}$${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [algo, iterationsRaw, salt, expected] = stored.split('$');
    if (algo !== 'pbkdf2' || !iterationsRaw || !salt || !expected) {
      return false;
    }

    const iterations = Number(iterationsRaw);
    if (!Number.isInteger(iterations) || iterations <= 0) {
      return false;
    }

    const actual = pbkdf2Sync(password, salt, iterations, 32, 'sha512').toString('hex');
    return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  }

  private issueToken(prefix: 'access' | 'refresh') {
    return `${prefix}-${randomBytes(24).toString('hex')}`;
  }

  private buildAuthResult(user: { id: string; displayName: string; email: string; role: string }): AuthResult {
    return {
      access_token: this.issueToken('access'),
      refresh_token: this.issueToken('refresh'),
      role: user.role,
      email: user.email,
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      },
    };
  }
}