import { Controller } from 'egg';

export default class Banker extends Controller {
  async index () {
    this.ctx.body = await this.ctx.service.banker.index();
  }
  async getCode () {
    const phone: string = this.ctx.query.phone;
    this.ctx.body = await this.service.banker.getCode(phone);
  }
  async register () {
    const data: { phone: string; password: string; code: string; } = this.ctx.request.body;
    this.ctx.body = await this.ctx.service.banker.register(data);
  }
  async login () {
    const data: { phone: string; password: string } = this.ctx.request.body;
    this.ctx.body = await this.ctx.service.login(data);
  }
}
