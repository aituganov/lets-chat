import { pad } from './helperString';

export function makeStringDate(d: Date, withTime = false): string {
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1, 2, '0')}-${pad(d.getDate(), 2, '0')}`;
  const time = withTime ? ` ${pad(d.getHours(), 2, '0')}:${pad(d.getMinutes(), 2, '0')}:${pad(d.getSeconds(), 2, '0')}`: '';
  return date + time;
}
export function makeDateFromString(s: string): Date {
  return new Date(s.replace(' ', 'T'));
}
export function setStartOfTheDay(d: Date): Date {
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  return d;
}
export function setEndOfTheDay(d: Date): Date {
  d.setHours(23);
  d.setMinutes(59);
  d.setSeconds(59);
  return d;
}
export function setStartOfTheDayForString(d: string): string {
  return d.split(' ')[0] + ' 00:00:00';
}
export function setEndOfTheDayForString(d: string): string {
  return d.split(' ')[0] + ' 23:59:59';
}