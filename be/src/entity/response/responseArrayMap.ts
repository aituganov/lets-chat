import { Response } from './response';
import { ElasticSearchResult } from '../../service';
import { plainToInstance } from 'class-transformer';

export class ResponseArrayMap<T> extends Response {
  body: {
    items: T[];
    size: number;
    map: any;
  }

  constructor (searchResult: ElasticSearchResult, claz: any, map: any) {
    super(true);
    this.body = {
      items: plainToInstance(claz, searchResult.items, {excludeExtraneousValues: true}),
      size: searchResult.size,
      map
    };
  }
}