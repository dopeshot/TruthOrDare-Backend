import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Render,
    Request,
    UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { JwtAuthGuard } from '../auth/strategies/jwt/jwt-auth.guard';
import { returnUser } from './dto/return-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './enums/role.enum';
import { VerifyJWTGuard } from './guards/mailVerify-jwt.guard';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    async findAll(): Promise<returnUser[]> {
        return await this.userService.findAll();
    }

    @Get('/verify')
    @UseGuards(VerifyJWTGuard)
    @Render('MailVerify')
    async verifyMail(@Request() req): Promise<returnUser> {
        const user = await this.userService.veryfiyUser(req.user);
        return await this.userService.transformToReturn(user);
    }

    @Get('/profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req): Promise<returnUser> {
        const user = await this.userService.findOneById(req.user.userId);
        return await this.userService.transformToReturn(user);
    }

    @Get('/get-verify')
    @UseGuards(JwtAuthGuard)
    async regenerateVerify(@Request() req): Promise<void> {
        const userData = await this.userService.parseJWTtOUsable(req.user);
        await this.userService.createVerification(userData);
    }

    @Patch('/:id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: ObjectId,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<returnUser> {
        const user = await this.userService.updateUser(id, updateUserDto);
        return await this.userService.transformToReturn(user);
    }

    @Delete('/:id')
    @UseGuards(JwtAuthGuard)
    async remove(
        @Param('id') id: ObjectId,
        @Request() req
    ): Promise<returnUser> {
        const user = await this.userService.remove(id, req.user);
        return await this.userService.transformToReturn(user);
    }
}
