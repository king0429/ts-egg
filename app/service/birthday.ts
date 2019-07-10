import { Service } from 'egg';

export default class Birthdat extends Service {
  async getDate (date: string) {
    const { ctx } = this;
    const res = await ctx.curl('http://jisuwnl.market.alicloudapi.com/calendar/query?date=' + date, {
      dataType: 'json',
      headers: { Authorization: 'APPCODE c930f1a496384d169b5591ea4637f6d0' },
    });
    if (res) {
      return res;
    } else {
      return false;
    }
  }
}
