const Koa = require('koa')
const path = require('path')
const koaBody = require('koa-body')
const convert = require('koa-convert')
const koaStatic = require('koa-static')
const cors = require('kcors')
// const views = require('koa-views')

const stateMiddle = require('./middleware/state.middleware')
const validation = require('./middleware/validation.middleware')
const pipe = require('./middleware/pipe.middleware')
const authority = require('./middleware/authority.middleware')
const logger = require('./lib/logger.lib')
const route = require('./lib/route.lib')
const Throw = require('./lib/error.lib')
const config = require('./config')

global.Promise = require('bluebird')

global.Throw = Throw
global.Route = route // 处理lib自执行函数内绑定controller时传值问题

const app = new Koa()
app.jsonSpaces = 0 // 压缩json返回中的空格
app.keys = ['key']

// 跨域
app.use(
  cors({
    credentials: true,
  })
)

// 请求解析
app.use(
  convert(
    koaBody({
      multipart: true,
      formLimit: '5mb',
      formidable: {
        uploadDir: path.join(`${__dirname}/tmp`),
      },
    })
  )
)

// middleware
app.use(
  convert.compose(
    stateMiddle(),
    authority(route.authRoutes), // 权限验证
    validation(), // 验证参数
    pipe() // 通讯
  )
)

// 静态文件
app.use(convert(koaStatic(path.join(__dirname, '/static'))))

// 渲染引擎
// app.use(views(path.join(__dirname, './static/theme/'), {
//   extension: 'ejs',
// }))

// 网络日志
app.use(logger.httpEffectMiddle(config.http_effect))

// 路由
app.use(route.routes())
app.use(
  route.allowedMethods({
    throw: true,
  })
)

// 监听错误
app.on('error', (err, ctx) => {
  logger().error('服务错误: ', err, ctx)
})

module.exports = app
