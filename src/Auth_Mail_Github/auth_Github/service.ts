import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserProfil } from './user/schemagit';
 
 
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
 
 
@Injectable()
export class AuthService {
  private readonly CLIENT_ID = 'Ov23li6PUhkBMT7M9NFg';
  private readonly CLIENT_SECRET = '8993bee995754314cc3f0f4309b52e92bfdb905a';
 
  constructor(
    @InjectModel(UserProfil.name) private readonly userProfilModel: Model<UserProfil>,
    private readonly httpService: HttpService
  ) {}
 
 
    async exchangeCodeForToken(code: string): Promise<string> {
        try {
            console.log('Received code:', code);
   
       
            const response = await firstValueFrom(
                this.httpService.post('https://github.com/login/oauth/access_token', {
                    client_id: this.CLIENT_ID,
                    client_secret: this.CLIENT_SECRET,
                    code,
                }, {
                    headers: { 'Accept': 'application/json' },
                })
            );
   
            console.log('GitHub response for token:', response.data);
   
            if (response.data.error) {
                throw new Error(`GitHub Error: ${response.data.error_description}`);
            }
   
            return response.data.access_token;
        } catch (error) {
            console.error('Error while exchanging code for token:', error.response || error);
            throw new Error('Error exchanging code for token');
        }
    }
   
 
   
    async getUserData(token: string): Promise<any> {
        try {
            console.log('Fetching user data with token:', token);
 
            const response = await firstValueFrom(
                this.httpService.get('https://api.github.com/user', {
                    headers: { 'Authorization': `Bearer ${token}` },
                })
            );
 
            console.log('GitHub user data:', response.data);
            console.log('GitHub user token:', token);
 
            if (response.data.message && response.data.message === 'Bad credentials') {
                throw new Error('Invalid or expired token');
            }
 
            return response.data;
        } catch (error) {
            console.error('Error while fetching user data:', error.response || error);
            throw new Error('Error fetching user data');
        }
    }
 
 
   async saveUserData(token: string, userInfo: any) {
    const user = new this.userProfilModel({
      token,
      login: userInfo.login,
      githubId: userInfo.id,
      avatarUrl: userInfo.avatar_url,
      htmlUrl: userInfo.html_url,
      followers: userInfo.followers,
      following: userInfo.following,
      publicRepos: userInfo.public_repos,
      createdAt: userInfo.created_at,
      updatedAt: userInfo.updated_at,
    });
 
    try {
      await user.save();
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error while saving user data:', error);
      throw new Error('Error while saving user data');
    }
  }
}