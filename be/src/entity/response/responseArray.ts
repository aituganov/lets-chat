import { Response } from './response';
import { ElasticSearchResult } from '../../service';
import { plainToInstance } from 'class-transformer';

export class ResponseArray<T> extends Response {
  body: {
    items: T[];
    size: number;
  }

  constructor (searchResult: ElasticSearchResult, claz: any) {
    super(true);
    this.body = {
      items: plainToInstance(claz, searchResult.items, {excludeExtraneousValues: true}),
      size: searchResult.size
    };
  }
}