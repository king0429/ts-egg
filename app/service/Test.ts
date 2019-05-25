import { Service } from 'egg';

/**
 * Test Service
 */
export default class Test extends Service {

  /**
   * sayHi to you
   * @param name - your name
   */
  public async sayHi(name: string) {
    const db: any = this.app.mongo;
    console.log(db.find);
    const a: [] = await db.find('api_business').toArray();
    console.log(a);
    return [ 11, 2, name ].concat(a);
  }
}
