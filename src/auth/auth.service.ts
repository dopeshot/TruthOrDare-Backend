import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { AccessTokenDto } from './dto/jwt.dto';
import { userDataFromProvider } from '../user/interfaces/userDataFromProvider.interface';
import { ObjectId } from 'mongoose';
import { UserStatus } from '../user/enums/status.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Register User (Creates a new one)
     * @param credentials of the user
     * @returns the new registered User
     */
    async registerUser(credentials: RegisterDto): Promise<AccessTokenDto> {
        // While this might seem unnecessary now, this way of implementing this allows us to add logic to register later without affecting the user create itself
        const user: User = await this.userService.create(credentials);

        /* istanbul ignore next */
        if (!user)
            new InternalServerErrorException('User could not be created');

        // Generate and return JWT
        return await this.createLoginPayload(user);
    }

    /**
     * Search for a user by username and validate with the password
     * @param username of the user
     * @param password of the user
     * @returns user without password or if user do not exist returns null
     */
    async validateUserWithEmailPassword(
        email: string,
        password: string
    ): Promise<User> {
        const user = await this.userService.findOneByEmail(email);
        if (!user)
            throw new UnauthorizedException(
                `Login Failed due to invalid credentials`
            );

        if (user.provider) {
            throw new UnauthorizedException(
                `Login Failed due to invalid credentials. There might be a third party login with this email`
            );
        }

        if (await bcrypt.compare(password, user.password)) {
            return user;
        }
        throw new UnauthorizedException(
            `Login Failed due to invalid credentials`
        );
    }

    async handleProviderLogin(
        userDataFromProvider: userDataFromProvider
    ): Promise<AccessTokenDto> {
        // This is a failsave that should never occur
        /* istanbul ignore next */
        if (!userDataFromProvider)
            throw new InternalServerErrorException(
                'Request does not have a user. Please contact the administrator'
            );

        // Check if user already exits
        const alreadyCreatedUser = await this.userService.findOneByEmail(
            userDataFromProvider.email
        );

        // Check if provider is the same
        if (
            alreadyCreatedUser &&
            alreadyCreatedUser.provider !== userDataFromProvider.provider
        )
            throw new ConflictException(
                `This email is already registered with ${
                    alreadyCreatedUser.provider
                        ? alreadyCreatedUser.provider
                        : 'Email and Password Auth'
                }`
            );

        if (alreadyCreatedUser)
            return this.createLoginPayload(alreadyCreatedUser);

        // Create User
        const newUser: User = await this.userService.createUserFromProvider(
            userDataFromProvider
        );

        // Create Payload and JWT
        return await this.createLoginPayload(newUser);
    }

    /**
     * Creates Login Payload and generate JWT with the payload
     * @param user logged in user
     * @returns access token
     */
    async createLoginPayload(user: User): Promise<AccessTokenDto> {
        const payload = {
            username: user.username,
            sub: user._id,
            role: user.role
        };

        return {
            access_token: this.jwtService.sign(payload)
        };
    }

    async isValidJWT(userId: ObjectId): Promise<boolean> {
        let user: User;
        try {
            user = await this.userService.findOneById(userId);
        } catch (error) {
            // This is necessary as a not found exception would overwrite the guard response
            return false;
        }

        /* istanbul ignore next */
        if (!user) return false; // This should never happen but just in case

        if (
            user.status !== UserStatus.ACTIVE &&
            user.status !== UserStatus.UNVERIFIED
        ) {
            // TODO: Add status check once we decided on how to handle reported user
            return false;
        }

        return true;
    }
}
