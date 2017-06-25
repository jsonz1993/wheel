/**
 * Created by Jsonz on 2017/5/28.
 */

import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  ListView,
  TextInput,
  Modal,
  AlertIOS,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import Requires from '../common/requires';
import Config from '../common/config';
import Button from 'apsl-react-native-button';

const width = Dimensions.get('window').width;

let cacheData = {
  currentTime: 0,
  commentList: []
};

// 详情页
export default class Detail extends Component {
  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      detail: props.route.detail,
      rate: 0,
      muted: true,
      resizeMode: 'contain',
      repeat: false,
      videoLoad: false,
      playing: false,
      paused: false, // 是否暂停

      videoTotal: 0,
      currentTime: 0,
      videoProgress: 0.01,

      videoOk: true, // 视频是否出错

      dataSource: ds.cloneWithRows([]),

      // modal
      animationType: 'none',
      modalVisible: false,
      isSending: false,
      content: ''
    };
  }

  componentDidMount() {
    this._fetchData();
  }

  // 获取评论
  _fetchData() {
    const url = Config.api.base + Config.api.comment,
      {detail} = this.props.route;

    Requires.get(url, {
      id: parseInt(detail._id).toString().slice(0, 5),
    })
      .catch(error => {
        console.warn(error);
      })
      .then(({code, data}) => {
        if (code !== 0) return;
        cacheData.commentList = data;

        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(cacheData.commentList),
        });
      })
  }

  renderRow(row) {
    return (
      <View
        key={row.id}
        style={styles.replyBox}
      >
        <Image style={styles.replyAvatar} source={{uri: row.replyBy.avatar}}/>
        <View style={styles.reply}>
          <Text style={styles.replyNickName}> {row.replyBy.nickName} </Text>
          <Text style={styles.replyContent}> {row.content} </Text>
        </View>
      </View>
    )
  }

  _onLoad() {
    this.setState({
      videoLoad: true,
    });
  }

  // 隔250ms 调一次
  _onProgress({currentTime, seekableDuration}) {

    let percent = Number((currentTime / seekableDuration).toFixed(2)),
      newState = {
        videoTotal: seekableDuration,
        currentTime: Number(currentTime.toFixed(2)),
        videoProgress: percent,
      };

    if (!this.state.playing && cacheData.currentTime !== currentTime) newState.playing = true;

    cacheData.currentTime = currentTime;

    this.setState(newState);
  }

  _onEnd() {
    this.setState({
      videoProgress: 1,
      playing: false,
    })
  }

  _onError(e) {
    console.log('error', e);
    this.setState({
      videoOk: false,
    })
  }

  // modal 关闭事件
  _setModalVible(isVisible) {
    this.setState({
      modalVisible: isVisible
    })
  }

  _submit() {
    if (!this.state.content) {
      return AlertIOS.alert('不能为空');
    }

    if (this.state.isSending) {
      return AlertIOS.alert('正在评论中！');
    }

    this.setState({
      isSending: true,
    });

    let body = {
      accessToken: 'abc',
      creation: '123',
      content: this.state.content,
    };
    const url = Config.api.base + Config.api.comment;

    Requires.post(url, body)
      .catch(error => {
        console.warn(error);
        this.setState({
          isSending: false,
        });
        this._setModalVible(false);
      })
      .then(({code}) => {

        if (code !== 0) {
          this.setState({
            isSending: false,
          });
          return AlertIOS.alert('评论失败，请稍后重试');
        }

        let content = this.state.content;
        cacheData.commentList.unshift({
          content,
          replyBy: {
            nickName: 'Jsonz',
            avatar: 'https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo/bd_logo1_31bdc765.png'
          },
        });

        // 有BUG
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(cacheData.commentList),
          isSending: false,
        });

        AlertIOS.alert('评论成功');
        this._setModalVible(false);
      })
  }

  _focus() {
    this._setModalVible(true)
  }

  _closeModal() {
    this._setModalVible(false)
  }

  _onBuffer(e) {
  }

  _onTimedMetadata(e) {
  }

  _replay() {
    this.videoPlayer.seek(0);
    this.setState({
      rate: 1,
    });
    console.log('重新播放');
  }

  _pause() {
    if (this.state.paused !== false) return;
    this.setState({
      paused: true,
    });
    console.log('暂停')
  }

  _resume() {
    if (this.state.paused !== true) return;
    this.setState({
      paused: false,
    });
    console.log('播放')
  }

  render() {
    let video = this.state.detail.video;

    return (
      <View style={styles.content}>
        <View style={styles.videoBox}>

          <Video
            ref={(ref) => {
              this.videoPlayer = ref
            }}
            source={{uri: video}}
            style={styles.video}

            rate={this.state.rate}        // 0 暂停 1 默认
            volume={1} // 0 静音 1默认
            muted={this.state.muted} // 是否完全静音
            paused={this.state.paused} // 暂停播放
            resizeMode={this.state.resizeMode} // 拉伸方式
            repeat={this.state.repeat} // 循环播放
            playInBackground={false} // 是否退出到背景也继续播放
            playWhenInactive={false} // 是否出现在控制中心的播放器
            ignoreSilentSwitch={"ignore"} // 当ios控制为静音时 是否跟着静音
            progressUpdateInterval={250.0} // 启动时间间隔， onProgress 的间隔调用时间

            onLoad={this._onLoad.bind(this)} // load
            onProgress={this._onProgress.bind(this)} // progress
            onBuffer={this._onBuffer} // buffer
            onEnd={this._onEnd.bind(this)} // end
            onError={this._onError.bind(this)} // error
            onTimedMetadata={this._onTimedMetadata} // 接收元数据的时候回调 不明觉厉
          />

          {/*错误处理*/}
          {
            !this.state.videoOk && <Text style={styles.failText}>视频出错了</Text>
          }

          {/* loader */}
          {
            !this.state.videoLoad &&
            <ActivityIndicator style={[styles.loading]} animating={true} size="large" color="#fff"/>
          }

          {/* 开始播放，重播按钮 */}
          {
            this.state.videoLoad && !this.state.playing
              ? <Icon
              onPress={this._replay.bind(this)}
              name="ios-play"
              size={38}
              style={styles.playIcon}/>
              : null
          }

          {
            this.state.videoLoad && this.state.playing
              ?
              <TouchableOpacity onPress={this._pause.bind(this)} style={styles.pauseBtn}>
                {
                  this.state.paused
                    ?
                    <Icon
                      onPress={this._resume.bind(this)}
                      name="ios-play"
                      size={38}
                      style={styles.playIcon}/>
                    : <Text>''</Text>
                }
              </TouchableOpacity>
              :
              null
          }

          <View style={styles.progressBox}>
            <View style={[styles.progressBar, {width: width * this.state.videoProgress}]}/>
          </View>
        </View>

        <ScrollView
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >

          <View style={styles.listHeader}>
            <View style={styles.infoBox}>
              <Image style={styles.avatar} source={{uri: this.props.route.author.avatar}}/>
              <View style={styles.docBox}>
                <Text style={styles.nickName}> {this.props.route.author.nickName} </Text>
                <Text style={styles.title}> {this.props.route.title} </Text>
              </View>
            </View>

            <View style={styles.commentBox}>
              <View style={styles.comment}>
                <Text>评论一个 </Text>
                <TextInput
                  placeholder="好喜欢这个狗狗啊..."
                  style={styles.inputContent}
                  multiline={true}
                  onFocus={this._focus.bind(this)}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.commentArea}>
              <Text >精彩评论</Text>

            </View>
          </View>

          {/* TODO JSONZ 有 BUG */}
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this.renderRow.bind(this)}
            automaticallyAdjustContentInsets={false}
            enableEmptySections={true}
            showsVerticalScrollIndicator={false} // 隐藏滚动条， listView文档没写 在 scrollView
            style={styles.listView}
          />

          <Modal
            animationType={'fade'}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              this._setModalVible(false)
            }}
          >
            <View style={styles.modalContainer}>
              <Icon
                onPress={this._closeModal.bind(this)}
                name="ios-close-outline"
                style={styles.closeIcon}
              />

              <View style={styles.commentBox}>
                <View style={styles.comment}>
                  <Text>评论一个 </Text>
                  <TextInput
                    placeholder="好喜欢这个狗狗啊..."
                    style={styles.inputContent}
                    multiline={true}
                    defaultValue={this.state.content}
                    placeholderTextColor="#999"
                    onChangeText={text => {
                      this.setState({
                        content: text
                      })
                    }}
                  />
                </View>
              </View>

              <Button
                style={styles.submitBtn}
                textStyle={styles.submitBtnText}
                onPress={this._submit.bind(this)}>
                提交
              </Button>

            </View>
          </Modal>
        </ScrollView>

      </View>
    )
  }
};


const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5fcff',
    paddingTop: 80,
  },

  videoBox: {
    width: width,
    height: width * .56,
    backgroundColor: '#000',
  },

  video: {
    width: width,
    height: width * .56,
    backgroundColor: '#000'
  },

  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

  loading: {
    width: width,
    position: 'absolute',
    left: 0,
    top: 80,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },

  progressBox: {
    width: width,
    height: 2,
    backgroundColor: '#ccc',
  },

  progressBar: {
    width: 1,
    height: 2,
    backgroundColor: '#ff6600',
  },

  playIcon: {
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66',
  },

  pauseBtn: {
    width: width,
    height: 360,
    position: 'absolute',
    left: 0,
    top: 0,
  },

  failText: {
    width: width,
    position: 'absolute',
    left: 0,
    top: 90,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },

  scrollView: {
    width: width,
  },

  infoBox: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  avatar: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 30,
  },

  docBox: {
    flex: 1,
  },

  nickName: {
    fontSize: 18,
  },

  title: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },

  replyBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },

  replyAvatar: {
    width: 40,
    height: 40,
    marginRight: 10,
    marginLeft: 10,
    borderRadius: 20,
  },

  replyNickName: {
    color: '#666',
  },

  replyContent: {
    color: '#666',
    marginTop: 4
  },

  reply: {
    flex: 1,
  },

  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width: width,
  },

  inputContent: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80,
  },

  listHeader: {
    width: width,
    marginTop: 10,
  },

  commentArea: {
    width: width,
    marginTop: 10,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff',
  },

  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c'
  },

  submitBtn: {
    width: width - 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ee753c',
    borderRadius: 4,
    marginLeft: 10,

  },

  submitBtnText: {
    fontSize: 18,
    color: '#ee753c',
  }


});



