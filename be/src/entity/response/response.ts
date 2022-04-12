import { DefaultContext } from 'koa';

export class Response {
  error: boolean;
  body: any;
  success: boolean;

  constructor (private isSuccess: boolean, private bodyData?: any) {
    this.error = !isSuccess;
    this.body = bodyData;
    this.success = isSuccess;
  }

  fillCtx(ctx: DefaultContext) {
    ctx.status = this.success ? 200 : 500;
    ctx.type = 'json';
    ctx.body = this.body || {};
    if (this.error) {
      this.body.code = ctx.status;
    }
  }
}