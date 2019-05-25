import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index () {
    const { ctx } = this;
    // ctx.body = await ctx.service.test.sayHi('egg');
    ctx.body = await ctx.service.agent.login('14101322457');
  }
  public async login () {
    const { ctx } = this;
    const { phone, code } = ctx.query;
    ctx.body = await ctx.service.agent.testCode(phone, code);
  }
}
