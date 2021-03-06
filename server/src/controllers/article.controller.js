const { Article } = require('../models')

/**
 * 创建只做生成文章ID功能
 */
exports.create = async (ctx) => {
  try {
    const call = await Article.create({})
    ctx.pipeDone(call)
  } catch (e) {
    ctx.pipeFail(e)
  }
}

/**
 *  更新文章
 */
exports.update = async (ctx) => {
  ctx.checkBody({
    title: {
      optional: true,
      isString: { errorMessage: 'title 需为 String' },
    },
    overview: {
      optional: true,
      isString: { errorMessage: 'overview 需为 String' },
    },
    category: {
      optional: true,
      isMongoId: { errIorMessage: 'category 需为 mongoId' },
    },
    cover: {
      optional: true,
      isString: { errorMessage: 'cover 需为 String' },
    },
    tags: {
      optional: true,
      inArray: {
        options: ['isString'],
        errorMessage: 'tags 内需为 string',
      },
    },
    content: {
      optional: true,
      isString: { errorMessage: 'content 需为 String' },
    },
    originalAuthor: {
      optional: true,
      isString: { errorMessage: 'originalAuthor 需为 String' },
    },
    originalUrl: {
      optional: true,
      isString: { errorMessage: 'originalUrl 需为 String' },
    },
    status: {
      optional: true,
      isIn: {
        options: [[0, 1, 2, 9]],
        errorMessage: 'status 必须为 0/1/2/9',
      },
    },
  })

  ctx.checkParams({
    _id: {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空',
      },
      isShortid: { errorMessage: '_id  需为 shortid' },
    },
  })

  try {
    const { _id, originalAuthor, ...input } = await ctx.pipeInput()

    const extendsData = {
      updateDate: Date.now(),
    }

    if (originalAuthor) {
      extendsData.originalAuthor = originalAuthor
      extendsData.$unset = { author: true }
    } else {
      extendsData.author = ctx.state.user._id
      extendsData.$unset = { originalAuthor: true }
    }

    await Article.update({ _id }, { ...input, ...extendsData })
    ctx.pipeDone()
  } catch (e) {
    ctx.pipeFail(e)
  }
}

/**
 * 查询单个文章
 */
exports.one = async (ctx) => {
  ctx.checkParams({
    _id: {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空',
      },
      isShortid: { errorMessage: '_id  需为 shortid' },
    },
  })

  try {
    const { _id } = await ctx.pipeInput()

    const call = await Article.findById(_id)
      .select({})
      .lean()
    call ? ctx.pipeDone(call) : ctx.pipeFail('查询失败', 'BN99')
  } catch (e) {
    ctx.pipeFail(e)
  }
}

/**
 * 查询文章列表
 */
exports.list = async (ctx) => {
  ctx.sanitizeQuery('page').toInt()
  ctx.sanitizeQuery('pageSize').toInt()
  ctx.checkQuery({
    title: {
      optional: true,
      isString: { errorMessage: 'title 需为 String' },
    },
    category: {
      optional: true,
      isMongoId: { errIorMessage: 'category 需为 mongoId' },
    },
    authorName: {
      optional: true,
      isString: { errorMessage: 'authorName 需为 String' },
    },
    author: {
      optional: true,
      isMongoId: { errIorMessage: 'author 需为 mongoId' },
    },
    isTop: {
      optional: true,
      isBoolean: { errorMessage: 'isTop 需为 Boolean' },
    },
    original: {
      optional: true,
      isBoolean: { errorMessage: 'original 需为 Boolean' },
    },
    from: {
      optional: true,
      isString: { errorMessage: 'cover 需为 String' },
    },
    status: {
      optional: true,
      isIn: {
        options: [[0, 1, 2, 9]],
        errorMessage: 'status 必须为 0/1/2/9',
      },
    },
  })

  try {
    const { page = 1, pageSize = 10, ...query } = await ctx.pipeInput()

    if (query.title) query.title = new RegExp(query.title, 'i')

    const total = await Article.count(query)
    const list = await Article.find(query)
      .sort('-create.date')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('-content -commentId -likes')
      .populate('category', 'name path')
      .lean()

    ctx.pipeDone({
      list,
      total,
      pageSize,
      page,
    })
  } catch (e) {
    ctx.pipeFail(e)
  }
}

/**
 * 删除文章
 */
exports.delete = async (ctx) => {
  ctx.checkParams({
    _id: {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空',
      },
      isShortid: { errorMessage: '_id  需为 shortid' },
    },
  })

  try {
    const { _id } = await ctx.pipeInput()

    await Article.remove({ _id })
    ctx.pipeDone()
  } catch (e) {
    ctx.pipeFail(e)
  }
}

exports.multi = async (ctx) => {
  ctx.checkBody({
    type: {
      notEmpty: {
        options: [true],
        errorMessage: 'type 不能为空',
      },
      isIn: {
        options: [['remove', 'add', 'update']],
        errorMessage: 'type 必须为 remove/add/update',
      },
    },
    multi: {
      optional: true,
      inArray: {
        options: ['isShortid'],
        errorMessage: 'multi 内需为 shortid',
      },
    },
  })

  try {
    const { multi, type } = await ctx.pipeInput()
    if (type === 'remove') {
      // 只物理删除回收站 => status === 9
      const toTrash = []
      const toRemove = []
      const call = await Article.find({ _id: { $in: multi } })
      if (Array.isArray(call)) {
        call.forEach((item) => {
          item.status === 9 ? toRemove.push(item._id) : toTrash.push(item._id)
        })
      }

      if (toTrash.length) {
        await Article.update({ _id: { $in: toTrash } }, { status: 9 })
      }

      if (toRemove.length) {
        await Article.remove({ _id: { $in: toRemove } })
      }

      ctx.pipeDone()
    } else {
      ctx.pipeFail(`暂无${type}操作`, 'BN99')
    }
  } catch (e) {
    ctx.pipeFail(e)
  }
}

/**
 * ===================================================
 * front api
 */

/**
 * 查询文章列表
 */
exports.articleList = async (ctx) => {
  ctx.sanitizeQuery('page').toInt()
  ctx.sanitizeQuery('pageSize').toInt()
  ctx.checkQuery({
    title: {
      optional: true,
      isString: { errorMessage: 'title 需为 String' },
    },
    category: {
      optional: true,
      isMongoId: { errIorMessage: 'category 需为 mongoId' },
    },
    authorName: {
      optional: true,
      isString: { errorMessage: 'authorName 需为 String' },
    },
    author: {
      optional: true,
      isMongoId: { errIorMessage: 'author 需为 mongoId' },
    },
    isTop: {
      optional: true,
      isBoolean: { errorMessage: 'isTop 需为 Boolean' },
    },
  })

  try {
    const { page = 1, pageSize = 10, ...query } = await ctx.pipeInput()

    if (query.title) query.title = new RegExp(query.title, 'i')
    if (query.authorName) query.authorName = new RegExp(query.authorName, 'i')

    // default query
    query.status = 1

    const total = await Article.count(query)
    const list = await Article.find(query)
      .sort('-create.date')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('-content -commentId -likes')
      .populate('category', 'name path')
      .populate('author')
      .lean()

    ctx.pipeDone({
      list,
      total,
      pageSize,
      page,
    })
  } catch (e) {
    ctx.pipeFail(e)
  }
}

/**
 * 查询文章
 */
exports.articleItem = async (ctx) => {
  ctx.checkParams({
    _id: {
      notEmpty: {
        options: [true],
        errorMessage: '_id 不能为空',
      },
      isShortid: { errorMessage: '_id  需为 shortid' },
    },
  })

  try {
    const { _id } = await ctx.pipeInput()

    const call = await Article.findById(_id)
      .select({})
      .lean()
    call ? ctx.pipeDone(call) : ctx.pipeFail('查询失败', 'BN99')
  } catch (e) {
    ctx.pipeFail(e)
  }
}
