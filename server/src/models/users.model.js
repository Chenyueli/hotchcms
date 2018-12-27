const mongoose = require('mongoose')
const sha1 = require('../lib/sha1.lib')

/**
 * trim: 去除字符串2边空格
 * unique: 唯一
 * enum: 枚举验证
 */

/**
 * 用户模型
 */
const usersSchema = new mongoose.Schema(
  {
    // 手机
    mobile: {
      type: Number,
      unique: true,
      sparse: true,
      match: /^1[3|4|5|7|8]\d{9}$/,
    },

    // 邮箱
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
      // required: true,
      match: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    },

    // 密码
    password: { type: String, set: sha1, required: true },

    // 帐号名
    nickname: {
      type: String,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 20,
    },

    // 头像
    avatar: { type: String, trim: true },

    // 资源库数
    repositories: { type: Number, default: 0 },

    // 追随者数
    followers: { type: Number, default: 0 },

    // 关注数
    following: { type: Number, default: 0 },

    // 金币数
    coin: { type: Number, default: 0 },

    // 积分
    integral: { type: Number, default: 0 },

    // 注册日期
    createDate: { type: Date, default: Date.now },

    // 权限
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Roles' },
  },
  {
    collection: 'users',
    id: false,
  },
)

module.exports = mongoose.model('Users', usersSchema)
