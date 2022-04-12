import { DefaultContext } from 'koa';
import { ChatMessage, Response } from '../entity';

export default class ChatMessageController {
  public static async list(ctx: DefaultContext): Promise<void> {
    (await ChatMessage.list(ctx.query)).fillCtx(ctx);
  }

  public static async synchronize(ctx: DefaultContext) {
    const from = ctx.query.from;
    if (!from) {
      throw {message: 'From TS is required'};
    }
    (await ChatMessage.listAfterTS(from)).fillCtx(ctx);
  }

  public static async create(ctx: DefaultContext): Promise<void> {
    const text = ctx.request.body.text;
    if (!text) {
      throw {message: 'Message text is required'};
    }
    const message = await ChatMessage.validateAndCreate({
      idAuthor: ctx.state.user.id,
      text
    }, true) as ChatMessage;
    new Response(true, {message, user: ctx.state.user}).fillCtx(ctx);
  }
}
