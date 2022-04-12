import { DefaultContext, Middleware } from 'koa';

function parseStdErrorMessage (mess: string): string {
  if (!mess) {
    return 'Произошла ошибка';
  }
  if (mess.startsWith('request entity too large')) {
    return 'Слишком большой размер изображений';
  }
  return mess;
}


export function error(): Middleware {
  return async (ctx: DefaultContext, next: any) => {
    try {
      await next();
    } catch (err) {
      const status = Number.parseInt(err.code || err.statusCode || err.status);
      ctx.status = status || 500;
      ctx.type = 'json';
      ctx.body = {
        code: ctx.status,
        data: err.data,
        message: parseStdErrorMessage(err.message),
        stack: err.stack,
        validation: err.validation
      };
      console.error(`Catch error: ${JSON.stringify(ctx.body)}`);
    }
  };
}