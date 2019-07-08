import { Controller } from 'egg';

export default class Table extends Controller {
  async index () {
    const a = await this.service.table.getData();
    console.log(a);
    this.ctx.body = '<h1>hello data</h1>';
  }
  async view () {
    await this.ctx.render('table.ejs');
  }
  async title () {}
}
