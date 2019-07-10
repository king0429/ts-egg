// This file is created by egg-ts-helper@1.25.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAgent from '../../../app/service/Agent';
import ExportBanker from '../../../app/service/Banker';
import ExportBirthday from '../../../app/service/birthday';
import ExportTable from '../../../app/service/Table';
import ExportTest from '../../../app/service/Test';
import ExportUser from '../../../app/service/User';

declare module 'egg' {
  interface IService {
    agent: ExportAgent;
    banker: ExportBanker;
    birthday: ExportBirthday;
    table: ExportTable;
    test: ExportTest;
    user: ExportUser;
  }
}
