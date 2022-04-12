import crypto from 'crypto';
import {instanceToPlain, plainToInstance} from 'class-transformer';
import {Transform} from 'class-transformer';

export function arrToMap(arr: any[], castFn?: (elm: any) => any) {
  const map: any = {};
  arr.forEach(elm => map[elm.id] = castFn ? castFn(elm) : elm);
  return map;
}

export function currentDate(addSeconds?: number): string {
  const result = new Date();
  if (addSeconds) {
    result.setSeconds(result.getSeconds() + addSeconds);
  }
  return result.toISOString();
}

export function uuid(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateFileName(extension: string, prefix?: string): string {
  const first = prefix || uuid();
  return `${first}_${new Date().getTime()}.${extension}`;
}

export function isMasterNode(): boolean {
  const instance = process.env.NODE_APP_INSTANCE;
  return typeof instance === 'undefined' || instance === '0';
}

export function createFromJSON(claz: any, json: any): any {
  return plainToInstance(claz, json, {excludeExtraneousValues: true});
}

export function createFromESResponse(claz: any, esResponse: any): any {
  return plainToInstance(claz, esResponse, {excludeExtraneousValues: true});
}

export function createArrayFromESResponse(claz: any, esResponse: any[]): any[] {
  return plainToInstance(claz, esResponse, {excludeExtraneousValues: true});
}

export const DefaultValueDecorator = (defaultValue: any) => {
  return Transform((target: any) => {
    if (typeof target === 'string' && target.length) {
      return target;
    }
    const val = typeof defaultValue === 'function' ? defaultValue(target) : defaultValue;
    return target ? target.value || val : val;
  });
};


export function round(num: number, exponent = 2): number {
  const multiplier = Math.pow(10, exponent);
  return Math.round( num * multiplier + Number.EPSILON ) / multiplier;
}

export function toHex(from: string): string {
  return from
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}
