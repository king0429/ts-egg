import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.get('/login', controller.home.login);
  // 企业列表相关
  router.get('/business', controller.home.Business);
  router.put('/business', controller.home.Business);
  // 合同相关
  router.get('/contract', controller.home.Contract);
  router.get('/contract/:id', controller.home.Contract);
  // 用户相关
  router.get('/get_status', controller.home.getStatus);
};
