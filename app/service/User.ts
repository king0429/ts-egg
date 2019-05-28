import { Service } from 'egg';
import $utils from '../utils';

export default class User extends Service {

  public async get () {
    const db = this.app.mongo;
    const a: [] = await db.find('api_order', { limit: 1 });
    const b: number = $utils.getCode();
    await this.app.redis.lpush('code', JSON.stringify({ code: b, phone: '123456' }));
    const arr: any[] = await this.app.redis.lrange('code', 0, 10);
    return { a, b, arr };
  }
}
