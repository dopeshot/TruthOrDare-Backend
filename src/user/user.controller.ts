import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';
import { VerifyJWTGuard } from './guards/mail-verify-jwt.guard';
import { returnUser } from './types/return-user.type';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiOperation({ summary: 'Get all Users' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async findAll(): Promise<returnUser[]> {
        const users = await this.userService.findAll();
        users.forEach(async (user) => {
            await this.userService.transformToReturn(user);
        });

        return users;
    }

    @Get('/verify-account')
    @ApiOperation({ summary: 'Verify user mail adress with JWT' })
    @UseGuards(VerifyJWTGuard)
    async verifyMail(@Request() req): Promise<void> {
        await this.userService.veryfiyUser(req.user);
    }

    @Get('/profile')
    @ApiOperation({ summary: 'Get user profile' })
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req): Promise<returnUser> {
        const user = await this.userService.findOneById(req.user.userId);
        return await this.userService.transformToReturn(user);
    }

    @Get('/resend-account-verification')
    @ApiOperation({ summary: 'Rerequest verify email' })
    @UseGuards(JwtAuthGuard)
    async regenerateVerify(@Request() req): Promise<void> {
        const userData = await this.userService.findOneById(req.user.userId);
        await this.userService.createVerification(userData);
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update User' })
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: ObjectId,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req
    ): Promise<returnUser> {
        const user = await this.userService.updateUser(
            id,
            updateUserDto,
            req.user
        );
        return await this.userService.transformToReturn(user);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete User' })
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: ObjectId, @Request() req): Promise<void> {
        await this.userService.remove(id, req.user);
    }
}
