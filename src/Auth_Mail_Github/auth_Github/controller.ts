import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './service';
 
@Controller('auth/github')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
 
    @Post('callback')
    async githubCallback(@Body() body: { code: string }) {
        const { code } = body;
        try {
            console.log('Received code:', code);
 
            // Step 1: Exchange the code for a token
            const token = await this.authService.exchangeCodeForToken(code);
         
            // Step 2: Fetch user data using the token
            const userInfo = await this.authService.getUserData(token);
         
            // Step 3: Store user data in the database
            await this.authService.saveUserData(token, userInfo);
 
            // Step 4: Return the token and user info to the frontend
            return { token, userInfo };
        } catch (error) {
            console.error('Error during GitHub authentication process:', error);
            throw new InternalServerErrorException('Error exchanging code for token or saving user data');
        }
    }
}