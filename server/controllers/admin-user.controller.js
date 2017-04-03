const sha1 = require('../services/sha1.service');
const adminUserService = require('../services/admin-user.service');

exports.check = async (ctx, next) => {
  ctx.session.adminUserId ? await next() : ctx.pipeFail(400,'用户未登录');
};

exports.create = async ctx => {
  ctx.checkBody({
    'email': {
      notEmpty: {
        options: [true],
        errorMessage: 'email 不能为空'
      },
      isEmail: { errorMessage: 'email 格式不正确' }
    },
    'password': {
      notEmpty: {
        options: [true],
        errorMessage: 'password 不能为空'
      },
      isLength: {
        options: [6],
        errorMessage: 'password 不能小于 6 位'
      }
    },
    'mobile': {
      optional: true,
      isMobile: { errorMessage: 'mobile 格式不正确' }
    },
    'nickname': {
      optional: true,
      isString: { errorMessage: 'nickname 需为字符串' },
      isLength: {
        options: [4,20],
        errorMessage: 'mobile 为 4-20 位'
      }
    },
    'avatar': {
      optional: true,
      isString: { errorMessage: 'avatar 需为字符串' },
    },
    'group': {
      optional: true,
      isMongoId: { errIorMessage: 'role 需为 mongoId' },
    }
  });

  if (ctx.validationErrors()) return null;

  ctx.request.body.password = sha1(ctx.request.body.password);

  try {
    await adminUserService.create(ctx.request.body)
    ctx.pipeDone();
  } catch(e) {
    ctx.pipeFail(500,e);
  }
};

exports.update = async ctx => {
  ctx.checkBody({
    'nickname': {
      optional: true,
      isString: { errorMessage: 'nickname 需为字符串' }
    },
    'mobile': {
      optional: true,
      isString: { errorMessage: 'mobile 需为字符串' },
      isLength: {
        options: [11,11],
        errorMessage: 'mobile 为11位'
      }
    },
    'password': {
      optional: true,
      isString: { errorMessage: 'password 需为字符串' },
      isLength: {
        options: [6],
        errorMessage: 'password 不能小于6位'
      }
    },
    'avatar': {
      optional: true,
      isString: { errorMessage: 'avatar 需为字符串' },
    },
    'group': {
      optional: true,
      isMongoId: { errIorMessage: 'role 需为 mongoId' },
    }
  });

  if (ctx.validationErrors()) return null;

  let password = ctx.request.body.password;
  if (password) password = sha1(password);

  try {
    await adminUserService.update(Object.assign(ctx.request.body, { password: password }));
    ctx.pipeDone();
  } catch(e) {
    ctx.pipeFail(500,'注册失败',e);
  }
};