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
  async businessList () {
    const query = this.ctx.query;
    this.ctx.body = await this.ctx.service.banker.BusinessList(query.page, query.pageSize);
    // this.ctx.body = { query, code: 200 };
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
  async financingList () {
    const ctx = this.ctx;
    ctx.body = await ctx.service.banker.FinancingList(ctx.query.token, ctx.query.page, ctx.query.pageSize);
  }
  async Search () {
    const ctx = this.ctx;
    // console.log(ctx.request.body.key);
    ctx.body = await ctx.service.banker.Search(ctx.request.body.key, 'business');
  }
  async messageList () {
    const ctx = this.ctx;
    const id = ctx.params.id;
    const { page, pageSize } = ctx.query;
    ctx.body = await ctx.service.banker.Message(page, pageSize, id);
  }
  async password () {
    const ctx = this.ctx;
    ctx.body = await ctx.service.banker.Password(ctx.request.body.pwd, ctx.request.body.newPwd);
  }
  async account () {
    const ctx = this.ctx;
    const restful = ctx.method;
    if (restful === 'GET') {
      // 获取个人信息
      ctx.body = await ctx.service.banker.Account(ctx.query.account);
    } else if (restful === 'PUT') {
      // 修改个人信息
      console.log(ctx.request.body.phone);
      ctx.body = await ctx.service.banker.UpdateAccount(ctx.request.body, ctx.request.body.phone);
     }
  }
}
