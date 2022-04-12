import Router from '@koa/router';
import { sign } from './controller';
import { apiPrefix } from './config';

const unprotectedRouter = new Router();

// Sign methods
unprotectedRouter.put(`${apiPrefix}/sign/in/metaMask`, sign.inByMetaMask);
unprotectedRouter.post(`${apiPrefix}/sign/in/metaMask/check`, sign.inByMetaMaskCheck);


export { unprotectedRouter };
