// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAgnet from '../../../app/controller/agnet';
import ExportBanker from '../../../app/controller/banker';

declare module 'egg' {
  interface IController {
    agnet: ExportAgnet;
    banker: ExportBanker;
  }
}
