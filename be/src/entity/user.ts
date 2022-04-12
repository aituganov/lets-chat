import {ESEntity, Mapping} from './esEntity';
import { Expose } from 'class-transformer';
import { AvatarGenerator } from 'random-avatar-generator';
import { IsString } from 'class-validator';
import { ResponseArray } from './response';
import { elastic } from '../service';

export class User extends ESEntity {
  @IsString({message: 'User avatar is required'})
  @Expose() avatar: string;
  @IsString({message: 'User nonce is required'})
  @Expose() nonce: string;
  @Expose() addressCutted(): string {
    return `${this.id.substring(0, 6)}...${this.id.substring(38)}`
  }

  static index = 'lc-users';
  static mapping: Mapping = ESEntity.prepareMapping({
    avatar: {type: 'keyword'},
    nonce: {type: 'keyword'}
  });

  async updateNonce() {
    this.nonce = User.generateNonce();
    await this.updateToDB();
  }

  static async createFromAddress(address: string): Promise<User> {
    const aGenerator = new AvatarGenerator();
    return await User.validateAndCreate({
      id: address,
      avatar: aGenerator.generateRandomAvatar(),
      nonce: User.generateNonce()
    }, true) as User;
  }

  static async listByIDS(ids: string[]): Promise<ResponseArray<User>> {
    const res = await elastic.searchByIDs(User.index, ids);
    return new ResponseArray<User>(res, User);
  }

  private static generateNonce(): string {
    return Math.floor(Math.random() * 1000000).toString();
  }

}
