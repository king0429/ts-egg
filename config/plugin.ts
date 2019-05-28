import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  // static: true,
  mysql: {
    enable: true,
    package: 'egg-mysql',
  },
  view: {
    enable: true,
    package: 'egg-view',
  },
  ejs: {
    enable: true,
    package: 'egg-view-ejs',
  },
  // mongodb: {
  //   enable: true,
  //   package: 'egg-mongodb',
  // },
  mongoose: {
    enable: true,
    package: 'egg-mongoose',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
  mongo: {
    enable: true,
    package: 'egg-mongo-native',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
};

export default plugin;
