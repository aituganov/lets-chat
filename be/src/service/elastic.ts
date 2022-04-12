import { config } from '../config';
import { Client } from '@elastic/elasticsearch';
import {
  ChatHistory,
  ChatMessage,
  ESEntity,
  Mapping,
  User,
  UserSession
} from '../entity';
import { createArrayFromESResponse, createFromESResponse, isMasterNode } from '../utils';
import bodybuilder from 'bodybuilder';

let instance: ElasticClient;

export class ElasticSearchResult {
  items: any[];
  size: number;

  constructor (items: any[], size: number) {
    this.items = items;
    this.size = size;
  }

  public static fromElasticRS(rs: any): ElasticSearchResult {
    return new ElasticSearchResult(rs.hits.hits.map((item: any) => item._source), rs.hits.total.value);
  }
}

export class ElasticMSearchResult {
  items: ElasticSearchResult[] = [];
  commonSize = 0;

  constructor (fromMSearch: any) {
    for (const part of fromMSearch.body.responses) {
      const item = ElasticSearchResult.fromElasticRS(part);
      this.items.push(item);
      this.commonSize += item.size;
    }
  }

  getFirstExist(): any {
    for (const i of this.items) {
      if (i.size > 0) {
        return i.items[0];
      }
    }
    return null;
  }
}

class ElasticClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      nodes: config.database.nodes,
      auth: {
        username: config.database.user,
        password: config.database.pwd
      }
    });

    setTimeout(() => this.init(), 0);
  }

  async init(): Promise<void> {
    if (!isMasterNode()) {
      return;
    }
    // await this.deleteDocumentByQuery({
    //   index: ChatMessage.index,
    //   body: bodybuilder()
    //     .query('match_all', {})
    //     .build()
    // });
    await this.createIndexAndUpdateMapping(ChatHistory.index, ChatHistory.mapping);
    await this.createIndexAndUpdateMapping(ChatMessage.index, ChatMessage.mapping);
    await this.createIndexAndUpdateMapping(User.index, User.mapping);
    await this.createIndexAndUpdateMapping(UserSession.index, UserSession.mapping);
  }

  async bulkUpdateOnIndex(index: string, datasource: any[]) {
    console.log(`Bulk update ${index}, count ${datasource.length}...`);
    const res = await this.client.helpers.bulk({
      datasource,
      onDocument (doc) {
        return [
          { update: { _index: index, _id: doc.id } },
          { doc }
        ];
      }
    });
    console.log('Ready!', JSON.stringify(res));
  }

  async checkExist(index: string, id: string) {
    console.log('Check document exist ${index} ${id}...');
    const { body } = await this.client.exists({id: id, index}, {ignore: [404]});
    console.log(`Is exist: ${JSON.stringify(body)}`);
    return body;
  }

  async createDocument(index: string, doc: any) {
    console.log(`Document create ${index} ${JSON.stringify(doc)}...`);
    const { body } = await this.client.create({id: doc.id, refresh: 'wait_for', index, body: doc}, {ignore: [404]});
    console.log('Ready!', body);
    return body;
  }

  async getDocument(index: string, id: string) {
    console.log(`Document get with params ${index} ${id}...`);
    const { body } = await this.client.get({index, id}, {ignore: [404]});
    console.log(`Ready! ${JSON.stringify(body)}`);
    return body._source;
  }

  async updateDocument(index: string, doc: any, upsert = false) {
    console.log(`Document update with params ${index} ${JSON.stringify(doc)}...`);
    const { body } = await this.client.update({index, id: doc.id, refresh: 'wait_for', body: {doc, doc_as_upsert: upsert}});
    console.log(`Ready! ${JSON.stringify(body)}`);
    return body;
  }

  async deleteDocument(index: string, id: string) {
    console.log(`Document delete with params ${index} ${id}...`);
    try {
      const rs = await this.client.delete({index, id, refresh: 'wait_for'});
      console.log(`Ready! ${JSON.stringify(rs.body)}`);
      return rs.body.result;
    } catch (error) {
      throw {message: error.meta.body.result};
    }
  }

  async deleteDocumentByQuery(params: {index: string; body: any}) {
    const newParams = {...params, refresh: true};
    console.log(`Start delete with params: ${JSON.stringify(newParams)}`);
    try {
      const rs = await this.client.deleteByQuery(newParams);
      console.log(`Ready! ${JSON.stringify(rs.body)}`);
      return rs.body.result;
    } catch (error) {
      console.error(`Error: ${error.meta.body.result}`);
      throw {message: error.meta.body.result};
    }
  }

  async indicesCreate(schema: any) {
    const { body } = await this.client.indices.create(schema);
    console.log('Index created', body);
    return body;
  }

  async indicesDelete(id: string) {
    const { body } = await this.client.indices.delete({ index: id });
    console.log(`Index ${id} is deleted`);
    return body;
  }

  async indicesExist(id: string) {
    const { body } = await this.client.indices.exists({ index: id });
    console.log(`Index ${id} is exist: ${body}`);
    return body;
  }

  async indicesMappingUpdate(id: string, properties: Mapping) {
    await this.client.indices.putMapping({ index: id, body: {dynamic: false, properties}});
    console.log(`Mapping ${id} updated`);
  }

  async msearch(params: {index: string; bodies: any[]; size?: number}): Promise<ElasticMSearchResult> {
    console.log(`Start msearch ${params.index}, count=${params.size}, body ${JSON.stringify(params.bodies)}...`);
    const body: any[] = [];
    for (const item of params.bodies) {
      body.push({index: params.index});
      item.size = params.size || 1;
      body.push(item);
    }
    const result = new ElasticMSearchResult(await this.client.msearch({
      body
    }));

    console.log(JSON.stringify(result));
    return result;
  }

  async msearchByFewIndexes(body: any[]): Promise<ElasticMSearchResult> {
    console.log(`Start msearch by few indexes, body ${JSON.stringify(body)}...`);
    const result = new ElasticMSearchResult(await this.client.msearch({
      body
    }));

    console.log(JSON.stringify(result));
    return result;
  }

  async search(params: {index: string; size?: number; body: any; from?: number}): Promise<ElasticSearchResult> {
    if (!params.size) {
      params.size = 10;
    }
    if (!params.from) {
      params.from = 0;
    }
    console.log(`Start search with params: ${JSON.stringify(params)}`);
    const searchResult = ElasticSearchResult.fromElasticRS((await this.client.search(params)).body);
    console.log(JSON.stringify(searchResult));
    return searchResult;
  }

  async searchByIDs(index: string, ids: string[], sort?: {field: string; direction: string}): Promise<ElasticSearchResult> {
    console.log(`Start search in ${index} by IDs: ${JSON.stringify(ids)}`);
    const body = bodybuilder()
      .query('ids', 'values', ids);
    if (sort) {
      const f: any = {};
      f[sort.field] = sort.direction || 'asc';
      body.sort([
        f
      ]);
    }
    const searchResult = ElasticSearchResult.fromElasticRS((await this.client.search({
      index,
      size: ids.length,
      body: body.build()
    })).body);
    console.log(JSON.stringify(searchResult));
    return searchResult;
  }

  async allDocuments(params: {index: string; size?: number; body?: any}) {
    params.size = 9999;
    if (!params.body) {
      params.body = {query: {match_all: {}}};
    }

    console.log(`Start get all documents with params: ${JSON.stringify(params)}`);
    const searchResult = await this.client.search(params);
    console.log(JSON.stringify(searchResult.body.hits));
    return searchResult.body.hits.hits.map((item: any) => item._source);
  }

  static getInstance() {
    if (!instance) {
      instance = new ElasticClient();
    }
    return instance;
  }

  private async createIndexAndUpdateMapping(index: string, mapping: Mapping) {
    if (!await this.indicesExist(index)) {
      await this.indicesCreate({index});
    }
    await this.indicesMappingUpdate(index, mapping);
  }
}

export const elastic = ElasticClient.getInstance();
