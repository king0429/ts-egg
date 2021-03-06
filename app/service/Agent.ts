import { Service } from 'egg';
import { ObjectID } from 'mongodb';
import $utils from '../utils';

export default class Agent extends Service {
  /*
   判断账号是否存在，存在返回验证码，不存在抛出异常 （账号是否存在 平台经办人）
   @params phone: string  手机号码
  */
  async login (phone: string) {
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    const hasPhone = await db.findOne('chain_ledger_agentinfo', { query: { phone } });
    // 判断用户是否存在，存在发送验证码
    if (hasPhone) {
      // 查找
      const codeList: any = await redis.lrange('phone_code', '0', -1);
      const codes: any = codeList.map((val: any) => JSON.parse(val));
      const curCode: any = codes.filter((val: any) => val.phone === phone);
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
  /*
   从 redis 验证验证码 （验证登陆）
   @params
   phone: string  手机号码
   code: string    手机验证码
  */
  async testCode (phone: string, code: string) {
    const db: any = this.app.mongo;
    const redis: any = this.app.redis;
    const codeList: [] = await redis.lrange('phone_code', 0, -1);
    const codes: any = codeList.map((val: any) => JSON.parse(val));
    const curCode: any = codes.filter((val: any) => phone === val.phone && val.code === code);
    if (curCode.length !== 0) {
      const data = await db.findOne('chain_ledger_agentinfo', { query: { phone } });
      return { code: 200, data, message: null };
    } else {
      return { code: 400, data: null, message: '验证码无效' };
    }
  }
  /*
   获取当前关联企业
   @params
   _id: string  经办人uid 相当于token
   len: any    可不传  page_size
  */
  async getBuiness (_id: string, len: any) {
    const db: any = this.app.mongo;
    const l = Number(len) || 8;
    const data = await db.find('api_business', { limit: l, projection: { _id: 1, id: 1, name: 1, legal_person_change_id: 1 } });
    return { data, code: 200 };
  }
  /*
   修改当前企业状态   （更改授权）
   @params
   _id: string  经办人uid 相当于token
   len: sw    可不传  手否授权
  */
  async setBusiness (_id: string, sw: any) {
    const db: any = this.app.mongo;
    // const data = db.find('api_business', { query: { id } });
    const data = await db.findOneAndUpdate('api_business', { filter: { _id: new ObjectID(_id) }, update: { $set: { legal_person_change_id: sw ? '1' : null } } }, { returnNewDocument: true });
    return data;
  }
  /*
   经办人参与合同列表
   @params
   _id: string  经办人uid 相当于token
   type: string    是否确认
   contractType: string 合同类型
  */
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
  /*
   合同详情
   @params
   _id: string  合同_id
  */
  async contractDetail (_id: string) {
    const db: any = this.app.mongo;
    const data = await db.findOne('api_contract', { query: { _id: new ObjectID(_id) } });
    return data;
  }
  /*
   根据合同_id 获取记账详情
   @params
   _id: string  合同_id
  */
  // 获取记账相关信息
  async chain (id: string) {
    const db: any = this.app.mongo;
    const sch: any = [
      { name: 'contract', table: 'api_contract' },
      { name: 'order', table: 'api_order' },
      { name: 'deposit', table: 'api_deposit' },
      { name: 'warehouse', table: 'api_warehouse' },
      { name: 'transport', table: 'api_transport' },
      { name: 'acceptance', table: 'api_acceptance' },
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
  /*
   根据合同_id 获取当前审核状态
   @params
   _id: string  合同_id
  */
  async getStatus (_id: string) {
    console.log(_id);
    const db = this.ctx.app.mongo;
    const data = await db.findOne('chain_ledger_agentinfo', { query: { _id } });
    if (data.face) {
      return { status: '3', name: data.name };
    } else if (data.legal_perso && data.legal_perso1) {
      return { status: '2', name: data.name, company: data.company };
    } else {
      return { status: '1', name: data.name, company: data.company };
    }
  }
  /*
   获取当前经办人相关信息
   @params
   _id: string  经办人_id
   key: 开关   1 为基本信息   2为身份证信息     3位人脸识别审核信息
  */
  async getPerson (_id: string, key: string) {
    const db = this.ctx.app.mongo;
    const data = await db.findOne('chain_ledger_agentinfo', { query: { _id } });
    console.log(data);
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
        company: any;
        wechat: any;
        qq: any;
      }
      const person: Person = {
        _id: data._id,
        id: data.id,
        name: data.name,
        card_id: data.iDnumber,
        phone: data.phone,
        role: '操作员',
        company: data.company,
        email: data.email,
        office_phone: data.officePhone || null,
        wechat: data.weCaht || null,
        qq: data.QQ || null,
      };
      return { code: 200, person };
    } else if (key === '2') {
      interface CardPic {
        id_card_front: any;
        id_card_back: any;
      }
      const card: CardPic = {
        id_card_front: data.legal_perso,
        id_card_back: data.legal_perso1,
      };
      return { code: 200, card };
    } else if (key === '3') {
      return { state: data.face };
    } else {
      return { data, code: 200 };
    }
  }
  /*
   设置用户基本信息
   @params
   _id: string  经办人_id
   data: 修改信息
  */
  async setPerson (_id: string, data: any) {
    const db: any = this.app.mongo;
    interface PersonInfo {
      email: any;
      officePhone: any;
      weChat: any;
      QQ: any;
      role: any;
    }
    const info: PersonInfo = {
      email: data.email,
      officePhone: data.office_phone,
      weChat: data.wechat,
      QQ: data.qq,
      role: '经办人',
    };
    const res = await db.findOneAndUpdate('chain_ledger_agentinfo', { filter: { _id }, update: { $set: { ...info } } });
    if (res) {
      return { code: 200, message: null };
    } else {
      return { code: 400, message: '更新失败' };
    }
  }
  /*
   修改证件信息
   @params
   data: 证件照上传图片后返回的 id
  */
  async setCard (data: any) {
    const db: any = this.app.mongo;
    interface Card {
      legal_perso: string;
      legal_perso1: string;
    }
    const card: Card = {
      legal_perso: data.id_card_front,
      legal_perso1: data.id_card_back,
    };
    const res = await db.findOneAndUpdate('chain_ledger_agentinfo', { filter: { _id: data._id }, update: { $set: { ...card } } });
    if (res.ok) {
      return { code: 200 };
    }
  }
  /*
   修改人脸识别认证信息
   @params
   data: face 上传人脸识别信息后返回信息
  */
  async personAuth (face: string, _id: string) {
    const db: any = this.app.mongo;
    const res = await db.findOneAndUpdate('chain_ledger_agentinfo', { filter: { _id }, update: { $set: { face } } });
    if (res.ok) {
      return { code: 200, value: res.value };
    } else {
      return { code: 500, message: res };
    }
  }
  /*
   消息列表
   @params
   page: 页码
   pageSize： 页长度
  */
  async messageList (page: any, pageSize: any) {
    const db = this.app.mongo;
    const limit: number = Number(pageSize || '10');
    const p = page || 1;
    const skip: number = Number((p - 1) * limit);
    const data = await db.find('api_businessmessage', { limit, skip, sort: { id: 1 } });
    const d = data.map(val => ({ ...val, date: val.post_time.replace(/\//g, '-') }));
    return { data: d, code: 200 };
  }
  /*
   消息列表
   @params
   _id: 消息id
  */
  async messageDetail (_id: string) {
    const db = this.app.mongo;
    const data = await db.findOneAndUpdate('api_businessmessage', { filter: { _id: new ObjectID(_id) }, update: { $set: { read: '1' } } });
    return data;
  }
}
