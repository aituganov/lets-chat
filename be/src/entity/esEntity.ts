import {Expose, instanceToPlain} from 'class-transformer';
import {IsNotEmpty, IsString, validate} from 'class-validator';
import { createFromESResponse, createFromJSON, DefaultValueDecorator, uuid } from '../utils';
import {elastic} from '../service';

export declare type MappingType = 'boolean' | 'byte' | 'date' | 'geo_point'
  | 'integer' | 'keyword' | 'nested' | 'scaled_float'
    | 'text' | 'date_range' | 'long';

export declare type Mapping = {
  [key: string]: {fielddata?: boolean; fields?: any; type?: MappingType; properties?: Mapping; format?: string; scaling_factor?: number};
}

export abstract class ESEntity {
  static index: string;
  @IsString()
  @IsNotEmpty()
  @DefaultValueDecorator(uuid)
  @Expose() id: string;
  @Expose() tsCreated: string;
  @Expose() tsUpdated: string;

  static mapping: Mapping = {
    tsCreated: {type: 'date'},
    tsUpdated: {type: 'date'}
  };

  static prepareMapping(data: Mapping): Mapping {
    return {...data, ...ESEntity.mapping};
  }

  static emptyFieldVOpt (name = 'Значение') {
    return {message: `${name} не задано`};
  }

  static async create (params: any, pullToDb = false) {
    const obj = createFromJSON(this, params) as ESEntity;
    if (pullToDb) {
      await obj.pullToDB();
    }

    return obj;
  }

  static castItemFromESResponse (data: any) {
    return createFromESResponse(this, data);
  }

  static async validateAndCreate(data: any, pullToDb = false): Promise<ESEntity> {
    const obj = await this.create(data) as ESEntity;
    await obj.validateErrors();
    if (pullToDb) {
      await obj.pullToDB();
    }
    return obj;
  }

  static async read (id: string) {
    return this.castItemFromESResponse(await elastic.getDocument(this.index, id));
  }

  static async getList (index: string) {
    return elastic.allDocuments({index: index});
  }

  async deleteFromDB () {
    await elastic.deleteDocument((this.constructor as any).index, this.id);
  }

  async pullToDB () {
    this.tsCreated = new Date().toISOString();
    await elastic.createDocument((this.constructor as any).index, this.toJSON());
  }

  async updateToDB () {
    this.tsUpdated = new Date().toISOString();
    await elastic.updateDocument((this.constructor as any).index, this.toJSON());
  }

  async validateErrors(): Promise<void> {
    const res = await validate(this);
    const ex: any = {
      code: 400,
      message: null,
      validation: {}
    };
    res.forEach(item => {
      const errs: string[] = [];
      if (item.constraints) {
        Object.keys(item.constraints).forEach(key => errs.push(item.constraints[key]));
      } else {
        const nested = item.property;
        const constraints = item.children[0].constraints || item.children[0].children[0].constraints || {};
        Object.keys(constraints).forEach(key => errs.push(nested + ': ' + constraints[key]));
      }
      if (!ex.message) {
        ex.message = errs[0];
      }
      ex.validation[item.property] = errs;
    });
    if (res.length) {
      throw ex;
    }
  }

  toJSON (): any {
    return instanceToPlain(this, {strategy: 'excludeAll'});
  }
}
