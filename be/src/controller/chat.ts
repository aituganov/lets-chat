import { DefaultContext } from 'koa';
import { ChatHistory } from '../entity';

export default class ChatMessageController {
  public static async online(ctx: DefaultContext): Promise<void> {
    (await ChatHistory.onlineList(ctx.state.user.id)).fillCtx(ctx);
  }
}
