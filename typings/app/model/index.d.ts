// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportRecord from '../../../app/model/record';

declare module 'egg' {
  interface IModel {
    Record: ReturnType<typeof ExportRecord>;
  }
}
