import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import winston from 'winston';
import 'reflect-metadata';

import { cors, error, logger } from './middlewares';
import { config } from './config';
import { unprotectedRouter } from './unprotectedRoutes';
import { protectedRouter } from './protectedRoutes';
import { session } from './controller';

async function start () {
  const app = new Koa();

  // Custom middlewares
  app.use(cors());
  app.use(error());
  app.use(logger(winston));

  // Enable bodyParser with default options
  app.use(bodyParser({jsonLimit: '5mb'}));

  app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

  app.use(session.checkMiddleware());

  // These routes are protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
  app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

  app.listen(config.port);

  console.log(`Server running on port ${config.port}`);
}

start();
