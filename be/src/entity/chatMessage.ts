import {ESEntity, Mapping} from './esEntity';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ResponseArrayMap } from './response';
import bodybuilder from 'bodybuilder';
import { elastic } from '../service';
import { User } from './user';
import { arrToMap } from '../utils';

export class ChatMessage extends ESEntity {
  @IsString({message: 'Message author id is required'})
  @Expose() idAuthor: string;
  @IsString({message: 'Message text is required'})
  @Expose() text: string;

  static index = 'lc-chat-messages';
  static mapping: Mapping = ESEntity.prepareMapping({
    idAuthor: {type: 'keyword'},
    text: {type: 'text'}
  });

  public static async list(params: {limit: string; toMessageTS: string;}): Promise<ResponseArrayMap<ChatMessage>> {
    const res = await elastic.msearch({
      index: ChatMessage.index,
      size: +params.limit,
      bodies: [
        bodybuilder()
          .query('range', 'tsCreated', {'lt': params.toMessageTS})
          .sort('tsCreated', 'desc')
          .build(),
        bodybuilder()
          .query('match_all', {})
          .build()
      ]
    });
    const result = {
      items: res.items[0].items,
      size: res.items[1].size
    }
    result.items = result.items.reverse();

    return new ResponseArrayMap<ChatMessage>(result, ChatMessage, await this.prepareMap(result.items));
  }

  public static async listAfterTS(ts: string): Promise<ResponseArrayMap<ChatMessage>>  {
    const res = await elastic.search({
      index: ChatMessage.index,
      size: 1000,
      body: bodybuilder()
        .query('range', {
          'tsCreated': {
            'gt': ts
          }
        })
        .sort('tsCreated', 'asc')
        .build()
    });

    return new ResponseArrayMap<ChatMessage>(res, ChatMessage, await this.prepareMap(res.items));
  }

  private static async prepareMap(messages: ChatMessage[]): Promise<any> {
    const userIds = Array.from(new Set(messages.map((i: ChatMessage) => i.idAuthor)));
    const users = await User.listByIDS(userIds);
    return {
      users: arrToMap(users.body.items)
    };
  }

}
