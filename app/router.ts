import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.agnet.index);
  router.get('/login', controller.agnet.login);
  // 企业列表相关
  router.get('/business', controller.agnet.Business);
  router.put('/business', controller.agnet.Business);
  // 合同相关
  router.get('/contract', controller.agnet.Contract);
  router.get('/contract/:id', controller.agnet.Contract);
  // 记账相关
  router.get('/chain', controller.agnet.getChain);
  // 用户相关
  router.get('/get_status', controller.agnet.getStatus);
  router.get('/person_info', controller.agnet.person);
  router.put('/person_info', controller.agnet.person);
  // 消息相关
  router.get('/message', controller.agnet.message);
  router.get('/message/:_id', controller.agnet.message);
};
