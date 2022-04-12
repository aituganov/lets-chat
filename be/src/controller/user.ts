import {DefaultContext} from 'koa';
import { Response } from '../entity/response';

export default class UserController {

  public static async get(ctx: DefaultContext): Promise<void> {
    new Response(true, ctx.state.user.toJSON()).fillCtx(ctx);
  }

}
