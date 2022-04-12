import {IsString} from 'class-validator';
import {ESEntity, Mapping} from './esEntity';
import {Expose} from 'class-transformer';

export class UserSession extends ESEntity {
  @IsString({message: 'Session expire is required'})
  @Expose() expiredOn: string;
  @IsString({message: 'Session user ID is required'})
  @Expose() userId: string;
  @IsString({message: 'Session token is required'})
  @Expose() token: string;

  static index = 'lc-user-sessions';
  static mapping: Mapping = ESEntity.prepareMapping({
    expiredOn: {
      type: 'date',
      format: 'strict_date_optional_time||epoch_second'
    },
    userId: {type: 'keyword'},
    token: {type: 'keyword'},
  });

  static async createNew(userId: string, token?: string): Promise<UserSession> {
    return  await UserSession.create({userId, token}, true) as UserSession;
  }
}
