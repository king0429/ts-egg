import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1558748807202_8424';

  // add your egg config in here
  config.middleware = [];

  // database
  config.cluster = {
    listen: {
      path: '',
      port: 80,
      hostname: '0.0.0.0',
    },
  };
  config.view = {
    mapping: {
      '.ejs': 'ejs',
    },
  };
  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      db: '4',
      password: '',
    },
    agrnt: true,
  };
  // config.mysql = {
  //   // database configuration
  //   client: {
  //     host: 'localhost',
  //     port: '3306',
  //     user: 'root',
  //     password: '123456',
  //     database: 'mock_data_nsmain',
  //   },
  //   app: true,
  //   agent: false,
  // };
  // add your config here
  config.middleware = [];
  // 文件上传
  config.multipart = {
    fileSize: '100mb',
    fileExtensions: [
      '.webm',
    ],
  };
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ '*' ],
  };
  // config.mongodb = {
  //   app: true,
  //   agnet: false,
  //   hosts: '127.0.0.1:27017',
  //   db: 'test1',
  // };
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };
  config.mongo = {
    client: {
      host: '127.0.0.1',
      port: '27017',
      name: 'test1',
    },
  };

  config.sequelize = {
    dialect: 'mysql',
    database: 'mock_data_nsmain',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '123456',
    define: {
      createdAt: false,
      updatedAt: false,
    },
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
