/**
 * 校验
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
module.exports = () => async (ctx, next) => {
  try {
    const _id = ctx.state.user.data;
    const auth = ctx.request.headers.authorization.split(' ')[1];
    console.log('====>', auth)
    const reply = await ctx.redis.get(auth);
    reply === _id ? await next() : ctx.pipeFail('用户未登录', 'BN99');
  } catch(e) {
    ctx.pipeFail(e);
  }
};