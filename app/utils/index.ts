// tslint:disable-next-line:no-var-requires
const uuid: any = require('uuid/v4');
// tslint:disable-next-line:no-var-requires
const md5 = require('md5');
const $utils: any = {};
$utils.getCode = (len: number = 4) => {
  let str: string = '';
  for (let i = 0; i < len; i++) {
    str += (((Math.random() * 100000 % 10)).toFixed(0)).toString();
  }
  return str;
};

$utils.uid = () => {
  return uuid();
};
$utils.md5 = (str: string) => md5(str);

export default $utils;
