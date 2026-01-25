import { Controller, Post, Body } from '@nestjs/common';
import { IdentityService } from './identity.service';

@Controller('identity')
export class IdentityController {
    constructor(private readonly identityService: IdentityService) {}

    @Post('register')
    register(@Body() body: { email: string; password: string; username: string }) {
        return this.identityService.register(body);
    }

    @Post('login')
    login(@Body() body: { email: string; password: string }) {
        return this.identityService.login(body);
    }
}