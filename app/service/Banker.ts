import { Service } from 'egg';
import { ObjectID } from 'mongodb';
import $utils from '../utils';

export default class Agent extends Service {
  async index () {
    console.log(ObjectID);
    console.log($utils);
  }
  async getCode (phone: string) {
    /*
    判断账号是否存在，存在返回验证码，不存在抛出异常 （账号是否存在 信贷员）
    @params
    phone: string  手机号码
    @return
    { code: 200, data: {phone: 13167553096, code: '123465'} }
    { code: 500, data: null, message: '账号已存在' }
    */
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    if (phone) {
      const hasPhone = await db.findOne('api_banker', { query: { phone } });
      if (!hasPhone) {
        const codeList: any = await redis.lrange('banker_phone_code', '0', -1);
        const codes: any = codeList.map((val: any) => JSON.parse(val));
        const curCode: any = codes.filter((val: any) => val.phone === phone);
        // 查找redis 是否有验证码
        if (curCode.length === 0) {
          const showCode = $utils.getCode();
          const a: any = await redis.lpush('banker_phone_code', JSON.stringify({ update_time: new Date().getTime(), phone, code: showCode }));
          // return { code: 200, data: { update_time: new Date().getTime(), phone, code: showCode } };
          return a;
        } else {
          return { code: 200, data: curCode[0] };
        }
      } else {
        return { code: 500, message: '账号已存在', data: null };
      }
    } else {
      return { code: 505, message: '无法获取参数：phone' };
    }
  }
  /*
    注册
    @params
    phone: string  手机号码
    password: string  密码
    code: string 手机验证码
    @return
    { code: 200, message: '注册成功，请前往登录' }
    { code: 200, message: '注册失败，请稍后重试' }
    { code: 304, message: '验证码错误' }
    { code: 303, message: '验证码过期或失效' }
    { message: '账号已存在，请前往登录', code: 301 }
  */
//  { phone: string, password: string, code: string }
  async register (data: any) {
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    const hasPhone = await db.findOne('api_banker', { query: { phone: data.phone } });
    if (!hasPhone) {
      const codeList: any = await redis.lrange('banker_phone_code', '0', -1);
      const codes: any = codeList.map((val: any) => JSON.parse(val));
      const curCode: any = codes.filter((val: any) => val.phone === data.phone);
      console.log(curCode);
      if (curCode[0]) {
          if (curCode[0].code === data.code) {
            interface Account {
              uid: string;
              phone: string;
              password: string;
              register_time: number;
              region_code?: number;
              name?: string;
              iDnumber?: string;
              avatar?: string;
              openid?: string;
              status?: string;
              state?: string;
            }
            const banker: Account = {
              uid: $utils.uid(),
              phone: data.phone, password: $utils.md5(data.password), register_time: new Date().getTime(),
            };
            const res = await db.insertOne('api_banker', { doc: banker });
            if (res) {
              return { code: 200, message: '注册成功，请前往登录' };
            } else {
              return { code: 200, message: '注册失败，请稍后重试' };
            }
          } else {
            return { code: 500, message: '验证码错误' };
          }
      } else {
        return { code: 500, message: '重新获取验证码' };
      }
    } else {
      return { message: '账号已存在，请前往登录', code: 503 };
    }
  }
  async login (data: {phone: string, password: string}) {
    /*
      登录
      @params
      phone: string  手机号码
      password: string  密码
      @return
      { uid: account.uid, token, code: 200 }
      { code: 501, message: '密码错误' }
      { code: 304, message: '验证码错误' }
      { code: 303, message: '验证码过期或失效' }
      { code: 504, message: '账号不存在' }
    */
    const db: any = this.app.mongo;
    const account = await db.findOne('api_banker', { quary: { phone: data.phone } });
    if (account) {
      if (account.password === $utils.md5(data.password)) {
        const token = $utils.uid();
        const res = await db.insertOne('api_banker_token', { doc: { uid: account.uid, token, update_time: new Date().getTime() } });
        console.log(res);
        if (res.result.ok) {
          return { uid: account.uid, token, code: 200 };
        } else {
          return { code: 500, message: res };
        }
      } else {
        return { code: 501, message: '密码错误' };
      }
    } else {
      return { code: 504, message: '账号不存在' };
    }
  }
}
