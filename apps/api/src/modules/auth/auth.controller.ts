import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    // Replace with real auth + OIDC
    return {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      role: 'manager',
      email: body.email,
    };
  }

  @Post('refresh')
  refresh(@Body() body: { refresh_token: string }) {
    return {
      access_token: 'mock-access-token',
    };
  }
}
