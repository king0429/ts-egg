import { Service } from 'egg';
import $utils from '../utils';

export default class Agent extends Service {
  // 判断账号是否存在，存在返回验证码，不存在抛出异常
  async login (phone: string) {
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    const hasPhone = await db.findOne('api_legalperson', { query: { phone } });
    // 判断用户是否存在，存在发送验证码
    if (hasPhone) {
      // 查找
      const codeList: any = await redis.lrange('phone_code', '0', -1);
      const codes: any = codeList.map((val: any) => JSON.parse(val));
      const curCode: any = codes.filter((val: any) => val.phone === phone);
      console.log(curCode.length);
      // 查找redis 是否有验证码
      if (curCode.length === 0) {
        const showCode = $utils.getCode();
        const a: any = await redis.lpush('phone_code', JSON.stringify({ update_time: new Date().getTime(), phone, code: showCode }));
        // return { code: 200, data: { update_time: new Date().getTime(), phone, code: showCode } };
        return a;
      } else {
        return { code: 200, data: curCode[0] };
      }
    } else {
      return { code: 400, message: '用户不存在' };
    }
  }
  // 从 redis 验证验证码
  async testCode (phone: string, code: string) {
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    const codeList: [] = await redis.lrange('phone_code', 0, -1);
    const codes: any = codeList.map((val: any) => JSON.parse(val));
    const curCode: any = codes.filter((val: any) => phone === val.phone && val.code === code);
    if (curCode.length !== 0) {
      const data = await db.findOne('api_legalperson', { query: { phone } });
      return { code: 200, data, message: null };
    } else {
      return { code: 400, data: null, message: '验证码无效' };
    }
  }
}
