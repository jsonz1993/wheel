/**
 * Created by Jsonz on 2017/6/6.
 */

const Router = require('koa-router')
const User = require('../app/controller/user')
const App = require('../app/controller/app')
const Creation = require('../app/controller/creation')

module.exports = ()=> {
  let router = new Router({
    prefix: '/api'
  })

  // user
  router.post('/u/signup', App.hasBody, User.signup); // 登录
  router.post('/u/verify', App.hasBody, User.verify); // 验证
  router.post('/u/update', App.hasBody, App.hasToken, User.update); // 更新数据

  // app
  router.post('/signature', App.hasBody, App.hasToken, App.signature); // 上传图片获取签名
  router.post('/creations/video', App.hasBody, App.hasToken, Creation.video); // 上传视频获取签名


  return router
}