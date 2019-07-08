import { Service } from 'egg';
// tslint:disable-next-line:no-var-requires
const xlsx2json = require('xlsx2json');

export default class Table extends Service {
  async getData () {
    // const baseDir = '/www/ts-egg/app/public/uploadFile';
    const data = await xlsx2json('/www/ts-egg/app/public/demoFile/market.xls');
    if (data) {
      const mapship = {
        A: 'id',
        B: 'order_id',
        C: 'order_date',
        D: 'deliver_date',
        E: 'send_type',
        F: 'customer_id',
        G: 'customer_role',
        H: 'customer_role',
        I: 'city',
        J: 'province',
        K: 'country',
        L: 'area',
        M: 'product_id',
        N: 'product_type',
        O: 'product_desc',
        P: 'product_name',
        Q: 'amount',
        R: 'number',
        S: 'discount',
        T: 'profit',
      };
      const list = data[0].slice(1).map(val => {
        const obj = {};
        for (const i in val) {
          if (i === 'D' || i === 'C') {
            const arr = val[i].split('/');
            obj[mapship[i]] = '20' + arr[2] + '-' + (arr[0] < 10 ? '0' + arr[0] : arr[0]) + '-' + (arr[1] < 10 ? '0' + arr[1] : arr[1]);
          } else if (i === 'S' || i === 'Q') {
            obj[mapship[i]] = parseFloat(val[i]);
          } else if (i === 'T') {
            obj[mapship[i]] = parseInt(val[i]);
          } else {
            obj[mapship[i]] = val[i];
          }
        }
        return obj;
      });
      const res = await this.ctx.model.Record.bulkCreate(list);
      if (res) {
        return { code: 200 };
      } else {
        return { code: 500 };
      }
    } else {
      return { code: 500, err_msg: '错误' };
    }
  }
}
