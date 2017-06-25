/**
 * Created by Jsonz on 2017/6/6.
 */

const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const db = 'mongodb://localhost/jsonz-app'

mongoose.Promise = require('bluebird')
mongoose.connect(db)

const models_path = path.join(__dirname, '/app/models')
const walk = function (modelPath) {
  fs
    .readdirSync(modelPath)
    .forEach(function (file) {
      let filePath = path.join(modelPath, '/' + file)
      let stat = fs.statSync(filePath)

      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(filePath)
        }
      } else if(stat.isDirectory()) {
        walk(filePath)
      }
    })
}
walk(models_path);

const Koa = require('koa')
const logger = require('koa-logger')
const session = require('koa-session')
const bodyParser = require('koa-bodyparser')
const app = new Koa()

app.keys = ['Jsonz']
app.use(logger())
app.use(session(app))
app.use(bodyParser())

let router = require('./config/routes')()

app
  .use(router.routes())
  .use(router.allowedMethods());



app.listen(1234)
console.log('Listening: 1234')
