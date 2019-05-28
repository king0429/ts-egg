import { Service } from 'egg';
import { ObjectID } from 'mongodb';
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
  // 获取当前关联企业
  async getBuiness (_id: string) {
    const db: any = this.app.mongo;
    const data = await db.find('api_business', { limit: 5, projection: { _id: 1, id: 1, name: 1, legal_person_change_id: 1 } });
    return data;
  }
  // 修改当前企业状态
  async setBusiness (_id: string, sw: any) {
    const db: any = this.app.mongo;
    // const data = db.find('api_business', { query: { id } });
    const data = await db.findOneAndUpdate('api_business', { filter: { _id: new ObjectID(_id) }, update: { $set: { legal_person_change_id: sw ? '1' : null } } }, { returnNewDocument: true });
    return data;
  }
  // 合同列表
  async contractList (id: string, type: string, contractType: string) {
    interface Query {
      business_id: string;
      finished: string;
      contract_type?: string;
    }
    const db: any = this.app.mongo;
    const query: Query = contractType === '1' || contractType === '2' ? {
      business_id: id,
      finished: type,
      contract_type: contractType,
    } : {
      business_id: id,
      finished: type,
    };
    const data = await db.find('api_contract', { query, limit: 10 });
    const list: [any] = data ? data.map((val: any) => {
      return {
        _id: val._id,
        id: val.id,
        name: val.name,
        number: val.number,
        date: val.create_time.replace(/\//g, '-'),
        status: val.status,
        contract_type: val.contract_type,
      };
    }) : [];
    return list;
  }
  // 合同详情
  async contractDetail (id: string) {
    const db: any = this.app.mongo;
    const data = await db.findOne('api_contract', { query: { _id: new ObjectID(id) } });
    return data;
  }
  // 获取记账相关信息
  async chain (id: string) {
    const db: any = this.app.mongo;
    const sch: any = [
      { name: 'contract', table: 'api_contract' },
      { name: 'order', table: 'api_order' },
      { name: 'deposit', table: 'api_deposit' },
      { name: 'warehouse', table: 'api_warehouse' },
      { name: 'transport', table: 'api_transport' },
      { name: 'settlement', table: 'api_settlement' },
      { name: 'invoice', table: 'api_invoice' },
      { name: 'payment', table: 'api_payment' },
    ];
    interface Chain {
      contract?: any;
      order?: any;
      deposit?: any;
      warehouse?: any;
      transport?: any;
      settlement?: any;
      invoice?: any;
      payment?: any;
    }
    const detail: Chain = {};
    for (const val of sch) {
      detail[val.name] = await db.find(val.table, { limit: 5 });
    }
    return { detail, id };
  }
  // 获取当前审核状态
  async getStatus (_id: string) {
    const db = this.ctx.app.mongo;
    const data = await db.findOne('api_legalperson', { query: { _id: new ObjectID(_id) } });
    if (data.verified_LegalPerson) {
      return '3';
    } else if (data.data.legal_person_id_1 && data.legal_person_id_2) {
      return '2';
    } else {
      return '1';
    }
  }
  // 用户基本信息
  async getPerson (_id: string, key: string) {
    const db = this.ctx.app.mongo;
    const data = await db.findOne('api_legalperson', { query: { _id: new ObjectID(_id) } });
    if (key === '1') {
      interface Person {
        _id: string;
        id: string;
        name: string;
        phone: string;
        card_id: string;
        role: any;
        email: any;
        office_phone: any;
        wechat: any;
        qq: any;
      }
      const person: Person = {
        _id: data._id,
        id: data.id,
        name: data.legal_person_name,
        card_id: data.legal_person_card_id,
        phone: data.phone,
        role: '操作员',
        email: data.email,
        office_phone: data.office_phone || null,
        wechat: data.wechat || null,
        qq: data.qq || null,
      };
      return person;
    } else if (key === '2') {
      interface CardPic {
        legal_person_id_1: any;
        legal_person_id_2: any;
      }
      const card: CardPic = {
        legal_person_id_1: data.legal_person_id_1,
        legal_person_id_2: data.legal_person_id_2,
      };
      return card;
    } else if (key === '3') {
      return { state: data.verified_LegalPerson };
    } else {
      return data;
    }
  }
  // 设置用户基本信息
  async setPerson (_id: string, data: any) {
    const db: any = this.app.mongo;
    interface PersonInfo {
      email: any;
      office_phone: any;
      wechat: any;
      qq: any;
    }
    const info: PersonInfo = {
      email: data.email,
      office_phone: data.office_phone,
      wechat: data.wechat,
      qq: data.qq,
    };
    const res = await db.findOneAndUpdate('api_legalperson', { filter: { _id: new ObjectID(_id) }, update: { $set: { ...info } } });
    if (res) {
      return { code: 200, message: null };
    } else {
      return { code: 400, message: '更新失败' };
    }
  }
  // 消息列表
  async messageList (page: any, pageSize: any) {
    const db = this.app.mongo;
    const limit: number = Number(pageSize || '10');
    const p = page || 1;
    const skip: number = Number((p - 1) * limit);
    const data = await db.find('api_businessmessage', { limit, skip, sort: { id: 1 } });
    return { data };
  }
  async messageDetail (_id: string) {
    const db = this.app.mongo;
    const data = await db.findOne('api_businessmessage', { query: { _id: new ObjectID(_id) } });
    return data;
  }
}
