import { Controller } from 'egg';
const fs = require('fs');
const path = require('path');

export default class HomeController extends Controller {
  public async index () {
    const { ctx } = this;
    // ctx.body = await ctx.service.test.sayHi('egg');
    const phone: string = ctx.query.phone;
    ctx.body = await ctx.service.agent.login(phone);
    // ctx.body = { a: 123456 };
  }
  public async login () {
    const { ctx } = this;
    const { phone, code } = ctx.query;
    ctx.body = await ctx.service.agent.testCode(phone, code);
  }
  public async person () {
    const { ctx } = this;
    let _id: string = '';
    const restful = ctx.method;
    switch (restful) {
      case 'GET':
        _id = ctx.query._id;
        const key: string = ctx.query.key;
        ctx.body = await ctx.service.agent.getPerson(_id, key);
        break;
      case 'PUT':
        _id = ctx.request.body._id;
        const data: object = ctx.request.body;
        ctx.body = await ctx.service.agent.setPerson(_id, data);
        break;
      default:
        break;
    }
  }
  public async card () {
    const { ctx } = this;
    const data = ctx.request.body;
    ctx.body = await ctx.service.agent.setCard(data);
  }
  public async Business () {
    const { ctx } = this;
    const restful = ctx.method;
    let _id: string = '', key: any = null;
    switch (restful) {
      case 'GET':
        _id = ctx.query;
        const len: any = ctx.query.len;
        ctx.body = await ctx.service.agent.getBuiness(_id, len);
        break;
      case 'PUT':
        _id = ctx.request.body._id;
        key = ctx.request.body.key;
        ctx.body = await ctx.service.agent.setBusiness(_id, key);
        break;
      default:
        break;
    }
  }
  public async Contract () {
    const { ctx } = this;
    const id = ctx.params.id;
    if (id) {
      ctx.body = await ctx.service.agent.contractDetail(id);
    } else {
      const { id, type, contract_type } = ctx.query;
      ctx.body = await ctx.service.agent.contractList(id, type, contract_type);
    }
  }
  public async getStatus () {
    const { ctx } = this;
    const _id = ctx.query._id;
    ctx.body = await ctx.service.agent.getStatus(_id);
  }
  public async getChain () {
    const { ctx } = this;
    const id = ctx.query.id;
    ctx.body = await ctx.service.agent.chain(id);
  }
  public async message () {
    const { ctx } = this;
    const _id = ctx.params._id;
    if (_id) {
      ctx.body = await ctx.service.agent.messageDetail(_id);
    } else {
      const { page, pageSize } = ctx.query;
      ctx.body = await ctx.service.agent.messageList(page, pageSize);
    }
  }
  public async file () {
    const { ctx } = this;
    const stream = await ctx.getFileStream();
    if (stream) {
      const fileName = stream.filename;
      const baseDir = '/www/ts-egg/app/public/uploadFile';
      const target = path.join(baseDir, fileName)
      const writeStream = fs.createWriteStream(target)
      const a = await stream.pipe(writeStream);
      const formData = stream.fields;
      if (formData.target === 'video') {
        ctx.body = await ctx.service.agent.personAuth(a.path, formData._id);
      } else {
        ctx.body = { code: 200, path: a.path || 'null' }
      }
    } else {
      ctx.body = {code: 500, message: '未获取到文件'}
    }
  }
}
