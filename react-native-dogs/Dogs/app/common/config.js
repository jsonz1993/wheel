/**
 * Created by Jsonz on 2017/5/27.
 */

export default {
  header: {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  },
  api: {
    base: 'http://rapapi.org/mockjs/19758/',
    base2: 'http://localhost:1234/',
    creations: 'api/creations',
    comment: 'api/comments', // 评论
    up: 'api/up',
    signup: 'api/u/signup',
    verifyUser: 'api/u/verify',
    signature: 'api/signature',
    update: 'api/u/update',
    video: 'api/creations/video',
  },
  qiniu: {
    upload: 'http://up-z2.qiniu.com/',
    picOrigin: 'http://orbgcblbo.bkt.clouddn.com',
  }
}