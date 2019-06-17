import { Service } from 'egg';
import { ObjectID } from 'mongodb';
import $utils from '../utils';

const Auth = async (obj: any, db) => {
  if (!obj.token) {
    return false;
  } else {
    const token = obj.token;
    const uid = await db.find('api_banker_token', { query: { token }, project: { uid: 1 } });
    if (uid[0]) {
      return uid[0].uid;
    } else {
      return false;
    }
  }
};

// const Page = async (db: any, table: string, page: number, pageSize: number, query: any) => {
//   const data = query ? await db.find(table, { limit: pageSize, skip: (page - 1) * pageSize }) : await db.find(table, { query, limit: pageSize, skip: (page - 1) * pageSize });
//   return data;
// };

export default class Agent extends Service {
  async index () {
    console.log(ObjectID);
    console.log($utils);
    return { message: '信贷员' };
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
          await redis.lpush('banker_phone_code', JSON.stringify({ update_time: new Date().getTime(), phone, code: showCode }));
          return { code: 200, data: { update_time: new Date().getTime(), phone, code: showCode } };
          // return a;
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
      if (curCode[0]) {
          if (curCode[0].code === data.code) {
            interface Account {
              uid: string;
              phone: string;
              password: string;
              register_time: number;
              region: string;
              realname: string;
              nick: string;
              bank: string;
              branch: string;
              location: any;
            }
            const banker: Account = {
              uid: $utils.uid(),
              phone: data.phone,
              password: $utils.md5(data.pwd),
              register_time: new Date().getTime(),
              region: data.region,
              realname: data.realname,
              nick: data.nick,
              bank: data.bank,
              branch: data.branch,
              location: data.localtion,
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
    const account = await db.findOne('api_banker', { query: { phone: data.phone } });
    if (account) {
      if (account.password === $utils.md5(data.password)) {
        const hasToekn = await db.findOneAndUpdate('api_banker_token', { filter: { uid: account.uid }, update: { $set: { update_time: new Date().getTime() } } });
        console.log(hasToekn);
        if (hasToekn.value) {
          return { ...account, token: hasToekn.value.token, code: 200 };
        } else {
          const token = $utils.uid();
          const res = await db.insertOne('api_banker_token', { doc: { uid: account.uid, token, update_time: new Date().getTime() } });
          if (res.result.ok) {
            return { token, code: 200, ...account };
          } else {
            return { code: 500, message: res };
          }
        }
      } else {
        return { code: 501, message: '密码错误' };
      }
    } else {
      return { code: 504, message: '账号不存在' };
    }
  }
  async innerCode (phone: string) {
    /*
      业务获取验证码
      @params
      phone: string  手机号码
      @return
      { code: 200, data: {phone: 13167553096, code: '123465'} }
      { code: 500, data: null, message: '账号不存在' }
    */
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    if (phone) {
      const hasPhone = await db.findOne('api_banker', { query: { phone } });
      if (hasPhone) {
        const codeList: any = await redis.lrange('banker_phone_code_inner', '0', -1);
        const codes: any = codeList.map((val: any) => JSON.parse(val));
        const curCode: any = codes.filter((val: any) => val.phone === phone);
        // 查找redis 是否有验证码
        if (curCode.length === 0) {
          const showCode = $utils.getCode();
          await redis.lpush('banker_phone_code_inner', JSON.stringify({ update_time: new Date().getTime(), phone, code: showCode }));
          return { code: 200, data: { update_time: new Date().getTime(), phone, code: showCode } };
          // return a;
        } else {
          return { code: 200, data: curCode[0] };
        }
      } else {
        return { code: 500, message: '账号不存在', data: null };
      }
    } else {
      return { code: 505, message: '无法获取参数：phone' };
    }
  }
  async changePassword (data: any) {
    /*
      业务获取验证码
      @params
      phone:    string  手机号码
      code:     string  验证码
      password: string
      @return
      { code: 200, message: '修改成功' }
      { code: 500, message: '修改失败' }
    */
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    if (data.phone) {
      const hasPhone = await db.findOne('api_banker', { query: { phone: data.phone } });
      if (hasPhone) {
        const codeList: any = await redis.lrange('banker_phone_code_inner', '0', -1);
        const codes: any = codeList.map((val: any) => JSON.parse(val));
        const curCode: any = codes.filter((val: any) => val.phone === data.phone);
        if (curCode.length !== 0) {
          if (curCode[0].code === data.code) {
            if ($utils.md5(data.password) !== hasPhone.password) {
              const res = await db.findOneAndUpdate('api_banker', { filter: { phone: data.phone }, update: { $set: { password: $utils.md5(data.password) } } });
              return { code: 200, ...res };
            } else {
              return { code: 501, message: '原密码与新密码相同' };
            }
          } else {
            return { code: 502, message: '验证码错误' };
          }
        } else {
          return { code: 502, message: '验证码失效' };
        }
      } else {
        return { code: 500, message: '账号不存在' };
      }
    } else {
      return { code: 505, message: '无法获取参数phone' };
    }
  }
  /*
    企业相关
  */
  async Business (key: string, id: any, token: any, sw: number) {
    const db: any = this.app.mongo;
    const uid = await Auth({ token }, db);
    if (uid) {
      if (key === 'get' && !id) {
        const page: number = Number(this.ctx.query.page) ? Number(this.ctx.query.page) : 1;
        const pageSize: any = Number(this.ctx.query.page_size) ? Number(this.ctx.query.page_size) : 10;
        const total = await db.countDocuments('ninstar_company');
        const data = await db.find('ninstar_company', { query: { detail_id: { $ne: null } }, limit: pageSize, skip: (page - 1) * pageSize, project: { name: 1, id: 1, detail_id: 1 } });
        return { data, code: 200, total };
      } else if (key === 'get' && id) {
        const data = await db.findOne('ninstar_companydetail', { query: { id } });
        const detail = {
          _id: data.id, id: data.id, name: data.name, company_nattion: data.company_nat, region_code: Number(data.region_code),
          area: JSON.parse(data.area), gsxt_info: JSON.parse(data.gsxt_info), legal_person: data.legal_perso,
          contact_info: JSON.parse(data.contact_inf), brief_intro: JSON.parse(data.brief_intro), business_info: JSON.parse(data.business_in),
        };
        return { detail, code: 200 };
      } else if (key === 'put' && id) {
        const hasCollect = await db.findOne('api_banker_collection', { query: { uid, business_id: id } });
        if (!hasCollect) {
          const res = await db.insertOne('api_banker_collection', { doc: { uid, business_id: id, using: 1, update_time: new Date().getTime() } });
          // console.log(res);
          if (res) {
            return { code: 200, message: '添加成功' };
          } else {
            return { code: 400, message: '添加失败' };
          }
        } else {
          const res = db.findOneAndUpdate('api_banker_collection', { filter: { uid, business_id: id }, update: { $set: { using: sw, update_time: new Date().getTime() } } });
          if (res) {
            return { code: 400, message: '修改成功' };
          } else {
            return { code: 400, message: '修改失败' };
          }
        }
      } else {
        return { code: 500, message: '参数错误' };
      }
    } else {
      return { code: 403, message: 'token错误' };
    }
  }
  /*
    信贷员名单管理
  */
  async Collection (key: string, id: any, token: any) {
    const db = this.app.mongo;
    const uid = await Auth({ token }, db);
    if (uid) {
      if (key === 'get' && !id) {
        const args = {
          pipeline: [
            {
              $lookup: {
                from: 'ninstar_company',
                localField: 'business_id',
                foreignField: 'id',
                as: 'business',
              },
            },
            {
              $match: {
                uid,
              },
            },
            {
              $project: {
                _id: 1,
                using: 1,
                name: '$business.name',
                business_id: 1,
              },
            },
          ],
        };
        const data = await db.aggregate('api_banker_collection', args);
        console.log(data);
        const list = data.map(val => ({
          _id: val._id,
          business_id: val.business_id,
          using: val.using,
          business_name: val.name[0],
        }));
        return { list, code: 200 };
      }
    } else {
      return { code: 403, message: 'token错误' };
    }
  }
  async FinancingList (token: string, page: string, pageSize: string): Promise<any> {
    const db = this.app.mongo;
    const uid = await Auth({ token }, db);
    if (uid) {
      const p = Number(page) ? Number(page) : 1;
      const ps = Number(pageSize) ? Number(pageSize) : 10;
      const list = db.find('api_orderfinancingapplication', { limit: ps, skip: (p - 1) * ps });
      return { code: 200, list };
    } else {
      return { code: 403, message: 'token错误' };
    }
  }
  async FinancingDeatil (token: string, _id: any, target: string, info: any): Promise<any> {
    const db = this.app.mongo;
    const uid = await Auth({ token }, db);
    const table = 'api_orderfinancingapplication';
    // const restFul = this.ctx.method;
    if (uid) {
      if (target === 'GET') {
        const detail = await db.findOne(table, { query: { _id } });
        return { code: 200, detail };
      } else if (target === 'PUT') {
        const change = await db.findOneAndUpdate(table, { filter: { _id }, update: { $set: { setp: '2' } } });
        if (change.result.ok) {
          return { code: 200, message: '修改成功' };
        } else {
          return { code: 501, message: '修改失败' };
        }
      } else if (target === 'POST') {
        const res = await db.insertOne(table, { doc: info });
        if (res.result.ok) {
          return { code: 200, message: '添加成功' };
        } else {
          return { code: 501, message: '添加失败' };
        }
      }
    } else {
      return { code: 403, message: 'token错误' };
    }
  }
  // 获客列表
  async BusinessList (page: string, pageSize: string) {
    const db = this.app.mongo;
    const ps = Number(pageSize) ? Number(pageSize) : 10;
    const p = Number(page) ? Number(page) : 1;
    const list = await db.find('api_businessdetail', { limit:  ps, skip: (p - 1) * ps });
    const total = await db.count('api_business');
    return { code: 200, list, total };
  }
  async Search (key: string, type: string) {
    const db = this.app.mongo;
    // const uid = await Auth({ token }, db);
    if (type === 'business') {
      const keyword = new RegExp(key);
      const res = await db.find('api_businessdetail', { query: { name: keyword } });
      if (res) {
        return res;
      } else {
        return { code: 500, message: '数据错误' };
      }
    }
  }
  async Message (page: any, pageSize: any, id: any) {
    const db = this.app.mongo;
    if (!id) {
      const p = Number(page) ? Number(page) : 1;
      const ps = Number(pageSize) ? Number(pageSize) : 10;
      const list = await db.find('api_institutionmessage', { limit: ps, skip: (p - 1) * ps, project: { title: 1, post_time: 1, read: 1 } });
      return { code: 200, list };
    } else {
      const detail = await db.findOneAndUpdate('api_institutionmessage', { filter: { _id: new ObjectID(id) }, update: { $set: { read: '1' } } });
      if (detail.ok) {
        return { code: 200, detail };
      } else {
        return { code: 500, message: '请联系管理员' };
      }
    }
  }
  async Password (oldOne: string, newOne: string) {
    if (oldOne && newOne) {
      return { code: 200, message: '修改成功' };
    } else {
      return { code: 500, message: '修改失败' };
    }
  }
  async Account (account: string) {
    const db = this.app.mongo;
    const detail = await db.findOne('api_legalperson', { query: { phone: account } });
    if (detail) {
      return { code: 200, detail };
    } else {
      return { code: 500, message: '账号信息错误' };
    }
  }
  async UpdateAccount (data: object, phone: string) {
    const db = this.app.mongo;
    const _id = await db.findOne('api_banker', { query: { phone }, project: { uid: 1 } });
    if (_id) {
      const res = await db.findOneAndUpdate('api_banker_account', { filter: { uid: _id }, update: { $set: { data } } });
      return { code: 200, detail: res, message: '修改成功' };
    } else {
      return { code: 502, message: '账号不存在' };
    }
  }
  async getFriends (phone: string, page: string) {
    const p = Number(page) ? Number(page) : 1;
    const db = this.app.mongo;
    const args = {
      pipeline: [
        {
          $lookup: {
            from: 'api_business',
            localField: 'friend_accountid_id',
            foreignField: 'id',
            as: 'business',
          },
        },
        {
          $match: {
            belong_to_accountid_id: '47',
          },
        },
        {
          $project: {
            'business.name': 1,
            'business.id': 1,
            id: 1,
            add_time: 1,
          },
        },
        {
          $limit: 30,
        },
      ],
    };
    const res = await db.aggregate('api_friends', args);
    const list = res.map(val => {
      if (val.business.length > 0) {
        return { ...val, name: val.business[0].name, business_id: val.business[0].id };
      }
    }).filter(val => val);
    return { code: 200, phone, list, p };
  }
}
