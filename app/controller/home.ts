import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index () {
    const { ctx } = this;
    // ctx.body = await ctx.service.test.sayHi('egg');
    ctx.body = await ctx.service.agent.login('14101322457');
    // ctx.body = { a: 123456 };
  }
  public async login () {
    const { ctx } = this;
    const { phone, code } = ctx.query;
    ctx.body = await ctx.service.agent.testCode(phone, code);
  }
  public async Business () {
    const { ctx } = this;
    const restful = ctx.method;
    let _id: string = '', key: any = null;
    switch (restful) {
      case 'GET':
        _id = ctx.query;
        ctx.body = await ctx.service.agent.getBuiness(_id);
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
    const id = ctx.query.id;
    ctx.body = { status: await ctx.service.agent.getStatus(id) };
  }
}
