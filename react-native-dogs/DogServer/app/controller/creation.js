/**
 * Created by Jsonz on 2017/6/17.
 */

const mongoose = require('mongoose')
const User = mongoose.model('User')
const Video = mongoose.model('Video')
const robot = require('../service/robot')
const config = require('../../config/config')


/**
 * 后面实现思路：
 * app 上传七牛视频， 上传七牛mp3音频
 * 同步上传到 cloudinary 视频 && 音频
 * 在 cloudinary 合并视频音频
 * 合并完再同步到七牛
 */
exports.video = async (ctx, next)=> {
  let body = ctx.request.body
  let videoData = body.video
  let user = this.session.user

  if (!videoData || !videoData.key) {
    this.body = {
      success: false,
      err: '视频没有上传成功'
    }
    return next
  }
  let video = await Video.findOne({
    qiniu_key: videoData.key
  }).exec()

  if (!video) {
    video = new Video({
      author: user._id,
      qiniu_key: videoData.key,
      persistentId: videoData.persistentId,
    })

    video = await video.save()
  }

  let url = config.qiniu.video + video.qiniu_key

  robot
    .uploadoCloudinary(url)
    .then(({code, data})=> {
      if (data && data.public_id) {
        video.public_id = data.public_id
        video.detail = data

        video.save()
      }
    })

  ctx.body = {
    code: 0,
    data: video._id,
  }

}