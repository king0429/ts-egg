// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportGetCode from '../../../app/middleware/get_code';

declare module 'egg' {
  interface IMiddleware {
    getCode: typeof ExportGetCode;
  }
}
