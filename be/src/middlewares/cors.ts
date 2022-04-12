import { DefaultContext, Middleware, Next } from 'koa';

export const capacitorDev = 'http://localhost:8100';
export const capacitorIOS = 'capacitor://localhost';
export const capacitorAndroid = 'http://localhost';
export const dev = 'http://localhost:3000';

const allowedOrigins = [
  capacitorDev, // Capacitor
  capacitorIOS, // IOS
  capacitorAndroid, // Android
  dev // Dev
];

export function cors(): Middleware {
  return async (ctx: DefaultContext, next: Next) => {
    const origin = ctx.get('Origin');
    if (allowedOrigins.includes(origin)) {
      ctx.set('Access-Control-Allow-Origin', origin);
      ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Session-ID');
      ctx.set('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, POST, DELETE');
    }
    await next();
  };
}