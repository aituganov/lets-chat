import {ESEntity, Mapping} from './esEntity';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { ResponseArrayMap } from './response';
import bodybuilder from 'bodybuilder';
import { elastic } from '../service';
import { arrToMap, currentDate } from '../utils';
import { User } from './user';

const types = ['online', 'write'];

export class ChatHistory extends ESEntity {
  @IsString({message: 'User id is required'})
  @Expose() idUser: string;
  @IsString({message: 'TS expire is required'})
  @Expose() tsExpire: string
  @IsString({message: 'Type is required'})
  @Expose() type: string

  static index = 'lc-chat-histories';
  static mapping: Mapping = ESEntity.prepareMapping({
    idUser: {type: 'keyword'},
    tsExpire: {type: 'date'},
    type: {type: 'keyword'}
  });

  static async onlineList(currentIdUser: string): Promise<ResponseArrayMap<ChatHistory>> {
    await ChatHistory.clearExpired();
    await ChatHistory.createOrUpdateElement(currentIdUser, 'online');
    const res = await elastic.search({
      index: ChatHistory.index,
      size: 1000,
      body: bodybuilder()
        .filter('term', 'type', 'online')
        .sort('idUser', 'asc')
        .build()
    });

    return new ResponseArrayMap<ChatHistory>(res, ChatHistory, await ChatHistory.prepareMap(res.items));
  }

  static async typedList(): Promise<ResponseArrayMap<ChatHistory>> {
    await ChatHistory.clearExpired();
    return null;
  }

  static async clearExpired(): Promise<void> {
    await elastic.deleteDocumentByQuery({
      index: ChatHistory.index,
      body: bodybuilder()
        .query('range', {
          'tsExpire': {
            'lt': 'now'
          }
        })
        .build()
    })
  }

  static async createOrUpdateElement(idUser: string, type: string): Promise<ChatHistory> {
    const tsExpire = currentDate(type === types[0] ? 30 : 10);
    const id = `${idUser}-${type}`;
    let elm;

    try {
      elm = await this.validateAndCreate({
        id,
        idUser,
        tsExpire,
        type
      }, true);
    } catch (err) {
      elm = await elastic.updateDocument(ChatHistory.index, {
        id,
        tsExpire
      });
    }

    return elm as ChatHistory;
  }

  private static async prepareMap(messages: ChatHistory[]): Promise<any> {
    const userIds = Array.from(new Set(messages.map((i: ChatHistory) => i.idUser)));
    const users = await User.listByIDS(userIds);
    return {
      users: arrToMap(users.body.items)
    };
  }
}
