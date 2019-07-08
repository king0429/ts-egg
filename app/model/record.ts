// module.exports = app => {
export default (app: any) => {
  // console.log(app.config.sequelize)
  const { STRING, INTEGER, DATE, FLOAT } = app.Sequelize;
  const Record = app.model.define('api_record', {
    // uid
    id: {
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true,
    },
    // 订单id
    order_id: {
      type: STRING(128),
      allowNull: false,
      unique: true,
    },
    // 订单日期
    order_date: {
      type: DATE,
      allowNull: false,
    },
    // 出货日期
    deliver_date: {
      type: DATE,
      allowNull: false,
    },
    send_type: {
      type: STRING(16),
      allowNull: false,
    },
    // 客户id
    customer_id: {
      type: STRING(128),
      allowNull: false,
    },
    // 客户类型
    customer_role: {
      type: STRING(32),
      allowNull: false,
    },
    // 所在城市
    city: {
      type: STRING(16),
      allowNull: false,
    },
    // 所在省份
    province: {
      type: STRING(16),
      allowNull: false,
    },
    // 所在国家
    country: {
      type: STRING(16),
      allowNull: false,
    },
    // 所属地区
    area: {
      type: STRING(8),
    },
    // 产品id
    product_id: {
      type: STRING(128),
      notNull: false,
    },
    // 产品类型
    product_type: {
      type: STRING(64),
      notNull: false,
    },
    // 产品描述
    product_desc: {
      type: STRING(64),
      notNull: false,
    },
    // 产品名称
    product_name: {
      type: STRING(128),
      notNull: false,
    },
    // 价格
    amount: {
      type: FLOAT,
      notNull: false,
    },
    // 数量
    number: {
      type: INTEGER,
      notNull: false,
    },
    // 折扣
    discount: {
      type: FLOAT,
      notNull: false,
    },
    // 利润
    profit: {
      type: STRING(64),
      notNull: false,
    },
  });
  // define mothod
  return Record;
};
