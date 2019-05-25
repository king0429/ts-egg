const $utils: any = {};
$utils.getCode = (len: number = 4) => {
  let str: string = '';
  for (let i = 0; i < len; i++) {
    str += (((Math.random() * 100000 % 10)).toFixed(0)).toString();
  }
  return str;
};

export default $utils;
