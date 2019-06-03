import { Controller } from 'egg';

export default class Banker extends Controller {
  async index () {
    // 爬取接口文档
    const res = await this.ctx.curl('https://documenter.getpostman.com/api/examples/4379810/S1TWybcj?lang=jQuery&versionTag=latest', { contentType: 'json', dataType: 'json' });
    const list = res.data.data.map((val: any) => ({ id: val.item_id, ...val.example[0] }));
    await this.ctx.render('api_banker.ejs', { list });
  }
  async getCode () {
    const phone: string = this.ctx.query.phone;
    this.ctx.body = await this.service.banker.getCode(phone);
  }
  async register () {
    const data: any = this.ctx.request.body;
    this.ctx.body = await this.ctx.service.banker.register(data);
  }
  async login () {
    const data: { phone: string; password: string } = this.ctx.request.body;
    this.ctx.body = await this.ctx.service.banker.login(data);
  }
  // 企业相关
  async AllBusiness () {
    // this.ctx.body = { code: 123 };
    const ctx = this.ctx;
    const id = ctx.params.id;
    if (!id) {
      const restful = ctx.method;
      switch (restful) {
        case 'GET':
          ctx.body = await ctx.service.banker.Business('get', null, ctx.query.token, 0);
          break;
        case 'PUT':
          const id = ctx.request.body.id;
          ctx.body = await ctx.service.banker.Business('put', id, ctx.request.body.token, Number(ctx.request.body.sw));
          break;
        default:
          break;
      }
    } else {
      ctx.body = await ctx.service.banker.Business('get', id, ctx.query.token, 0);
    }
  }
  async collection () {
    const ctx = this.ctx;
    const id = ctx.params.business_id;
    if (!id) {
      const restful = ctx.method;
      switch (restful) {
        case 'GET':
          ctx.body = await ctx.service.banker.Collection('get', null, ctx.query.token);
          break;
        default:
          break;
      }
    } else {
      console.log(id);
    }
  }
}
