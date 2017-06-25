/**
 * Created by Jsonz on 2017/6/7.
 */

const mongoose = require('mongoose')
const xss = require('xss')
let User = mongoose.model('User')
const uuid = require('uuid')
const sms = require('../service/sms')

exports.signup = async ctx=> {

  let phoneNumber = xss(ctx.request.body.phoneNumber.trim())

  let user = await User.findOne({
    phoneNumber,
  }).exec()

  let verifyCode = sms.getCode()

  console.log('@JSONZ user: ', user);
  if (!user) {
    let accessToken = uuid.v4()

    user = new User({
      phoneNumber: xss(phoneNumber),
      accessToken,
      verifyCode,
      nickName: '小🐶腿',
      avatar: 'https://avatars3.githubusercontent.com/u/11730463?v=3&s=460',
    })
  } else {
    user.verifyCode = verifyCode
  }

  try {
    user = await user.save()
  } catch(e) {
    ctx.body = {
      code: 999,
      err: '保存user 失败'
    }
    console.log(e)
    return ;
  }

  let msg = '您的验证码是：' + verifyCode

  try {
    sms.send(user.phoneNumber, msg)
  } catch(e) {
    console.log(e)
    ctx.body = {
      code: 999,
      err: '短信服务异常'
    }
    return
  }

  ctx.body= {
    code: 0,
  }
}

exports.verify = async ctx=> {

  let verifyCode = ctx.request.body.verifyCode
  let phoneNumber = ctx.request.body.phoneNumber

  if (!verifyCode || !phoneNumber) {
    ctx.body = {
      code: 999,
      err: '验证未通过'
    }
    return;
  }

  let user = ctx.session.user

  if (user) {
    user.verified = true
    user = await user.save()
    ctx.body = {
      code: 0,
      data: {
        nickName: user.nickName,
        accessToken: user.accessToken,
        avatar: user.avatar,
      }
    }
  } else {
    ctx.body = {
      code: 999,
      err: '验证未通过'
    }
  }

}

exports.update = async ctx=> {

  let {accessToken} = ctx.request.body;

  let user = await User.findOne({
    accessToken
  }).exec()

  if (!user) {
    return ctx.body = {
      code: 999
    }
  }

  'breed, gender, age, nickName, avatar'.split(', ').forEach(field=> {
    let item = ctx.request.body[field]
    if (item) user[field] = xss(item)
  })

  try {
    user = await user.save()
    return ctx.body= {
      code: 0,

    }
  } catch(e) {
    return ctx.body = {
      code: 999
    }
  }
}






























































