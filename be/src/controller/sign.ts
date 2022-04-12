import {DefaultContext} from 'koa';
import {elastic} from '../service';
import { Response, User, UserSession } from '../entity';
import {session} from './index';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { toHex, uuid } from '../utils';
import Session from './session';

export default class SignController {
  public static async inByMetaMask(ctx: DefaultContext): Promise<void> {
    if (!ctx.request.body.address) {
      throw {message: 'Address is required'};
    }
    let user = await User.read(ctx.request.body.address) as User;
    if (!user) {
      user = await User.createFromAddress(ctx.request.body.address);
    }
    new Response(true, {nonce: user.nonce}).fillCtx(ctx);
  }

  public static async inByMetaMaskCheck(ctx: DefaultContext): Promise<void> {
    const address = ctx.request.body.address;
    if (!address) {
      throw {message: 'Address is required'};
    }
    const signature = ctx.request.body.signature;
    if (!signature) {
      throw {message: 'Signature is required'};
    }
    const user = await User.read(address) as User;
    if (!user) {
      throw {message: 'User not found by address'};
    }

    const nonce = user.nonce;
    const recoveredAddress = recoverPersonalSignature({
      data: `0x${toHex(nonce)}`,
      signature
    });

    if (recoveredAddress !== address) {
      throw {message: 'Invalid signature'};
    }

    await user.updateNonce();
    const session = await UserSession.createNew(user.id, uuid());
    Session.set(ctx, session.id);
    new Response(true, {user}).fillCtx(ctx);
  }

  public static async out(ctx: DefaultContext): Promise<void> {
    const sessionFromCookies = session.get(ctx);
    if (sessionFromCookies) {
      const sid = await elastic.getDocument(UserSession.index, sessionFromCookies);
      if (sid) {
        await elastic.deleteDocument(UserSession.index, sessionFromCookies);
        session.clear(ctx);
        ctx.redirect('/');
      }
    } else {
      ctx.redirect('/');
    }
  }
}
