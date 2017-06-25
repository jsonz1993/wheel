/**
 * Created by Jsonz on 2017/6/25.
 */

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Mixed = Schema.Types.Mixed
const ObjectId = Schema.Types.ObjectId

let VideoSchema = new Schema({
  author: {
    type: ObjectId,
    ref: 'User'
  },

  qiniu_key: String,
  persistentId: String,
  qiniu_final_key: String,
  qiniui_detail: Mixed,

  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

VideoSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.meta.updateAt = Date.now();
  }
  next();
})

module.exports = mongoose.model('Video', VideoSchema);