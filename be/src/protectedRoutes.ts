import Router from '@koa/router';
import {
  chat,
  chatMessage,
  sign,
  user
} from './controller';
import { apiPrefix } from './config';

const protectedRouter = new Router();

// Chat methods
protectedRouter.get(`${apiPrefix}/chat/online`, chat.online);

// Message methods
protectedRouter.get(`${apiPrefix}/messages`, chatMessage.list);
protectedRouter.put(`${apiPrefix}/messages/create`, chatMessage.create);
protectedRouter.get(`${apiPrefix}/messages/synchronize`, chatMessage.synchronize);

// Sign methods
protectedRouter.delete(`${apiPrefix}/sign`, sign.out);

// User methods
protectedRouter.get(`${apiPrefix}/user`, user.get);

export { protectedRouter };
