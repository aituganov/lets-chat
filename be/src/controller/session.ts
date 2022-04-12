import {DefaultContext, Middleware} from 'koa';
import {elastic} from '../service';
import {User, UserSession} from '../entity';
import {createFromESResponse} from '../utils';

export default class Session {
  public static KEY = 'LCSID';

  public static checkMiddleware(): Middleware {
    return async (ctx: DefaultContext, next: any) => {
      if (ctx.request.method === 'OPTIONS' || await Session.fillSessionState(ctx)) {
        await next();
      } else {
        Session.clear(ctx);
        Session.trowAuthorize();
      }
    };
  }

  public static async fillSessionState(ctx: DefaultContext): Promise<boolean> {
    const sid = Session.get(ctx);
    if (!sid) {
      return false;
    }
    const userSession =
      createFromESResponse(UserSession, await elastic.getDocument(UserSession.index, sid));
    if (userSession) {
      ctx.state.user = createFromESResponse(User, await elastic.getDocument(User.index, userSession.userId));
    }
    return !!ctx.state.user;
  }

  public static get(ctx: DefaultContext): string {
    return ctx.cookies.get(Session.KEY);
  }

  public static set(ctx: DefaultContext, value: string): string {
    return ctx.cookies.set(Session.KEY, value, {
      expires: new Date(Date.now() + 366 * 24 * 60 * 60 * 1000) // now + 1 year
    });
  }

  public static clear(ctx: DefaultContext): string {
    return ctx.cookies.set(Session.KEY, null);
  }

  public static trowAuthorize() {
    throw {code: 401, message: 'Необходима авторизация'};
  }
}
