import { Controller } from 'egg';

export default class Birthday extends Controller {
  async getDate () {
    const { ctx } = this;
    const date: string = ctx.query.date;
    ctx.body = await ctx.service.birthday.getDate(date);
  }
}
