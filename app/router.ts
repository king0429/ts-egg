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
  router.put('/update_card', controller.agnet.card);
  // 消息相关
  router.get('/message', controller.agnet.message);
  router.get('/message/:_id', controller.agnet.message);
  router.post('/upload', controller.agnet.file);
  /*
    信贷员接口
  */
  router.get('/banker', controller.banker.index);
  router.get('/banker/get_code', controller.banker.getCode);
  router.post('/banker/register', controller.banker.register);
  router.post('/banker/login', controller.banker.login);
  // 获取企业列表
  router.get('/banker/business', controller.banker.businessList);
  router.put('/banker/business', controller.banker.AllBusiness);
  router.get('/banker/business/:id', controller.banker.AllBusiness);
  // 信贷员 我的收藏
  router.get('/banker/collection', controller.banker.collection);
  // 搜索企业
  router.post('/banker/search', controller.banker.Search);
  // 站内信
  router.get('/banker/message', controller.banker.messageList);
  router.get('/banker/message/:id', controller.banker.messageList);
  router.post('/banker/change_password', controller.banker.password);
  router.get('/banker/account', controller.banker.account);
  router.put('/banker/account', controller.banker.account);
  router.get('/banker/forget', controller.banker.forget);
  router.put('/banker/forget', controller.banker.forget);
  router.post('/banker/upload', controller.banker.upload);
  router.get('/banker/friends', controller.banker.friends);
  router.get('/banker/friends_application', controller.banker.friendApplication);
  router.get('/banker/cfca_data', controller.banker.cfca);
};
