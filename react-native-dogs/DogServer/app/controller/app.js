/**
 * Created by Jsonz on 2017/6/7.
 */


const mongoose = require('mongoose')
const User = mongoose.model('User')
const robot = require('../service/robot')

exports.signature = async ctx=> {
  let body = ctx.request.body;
  let {token, key} = await robot.getQiniuToken(body);

  ctx.body = {
    code: 0,
    data: {
      token,
      key
    },
  }

}

exports.hasToken = async (ctx, next)=> {

  let accessToken = ctx.query.accessToken || ctx.request.body.accessToken;

  if (!accessToken) {
    ctx.body = {
      code: 999,
      msg: '钥匙丢了'
    }
    return next;
  }

  let user = await User.findOne({
    accessToken
  }).exec()


  if (!user) {
    ctx.body = {
      code: 999,
      msg: '没登录'
    }

    return next();
  }

  ctx.session = ctx.session || {}
  ctx.session.user = user

  await next()

}


exports.hasBody = async (ctx, next)=> {
  let body = ctx.request.body || {}
  if (Object.keys(body).length === 0) {
    ctx.body = {
      code: 999,
      msg: '是不是漏掉什么了'
    }

    return next()
  }

  await next()

}