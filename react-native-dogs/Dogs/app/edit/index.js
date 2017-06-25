import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  AsyncStorage,
  TouchableOpacity,
  Dimensions,
  ProgressViewIOS,
  AlertIOS,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import Config from '../common/config';
import Requires from '../common/requires';
import Video from 'react-native-video';
import {AudioRecorder, AudioUtils} from 'react-native-audio';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

let PageData = {
  currentTime: 0,
  videoOption: {
    title: '选择视频',
    cancelButtonTitle: '取消',
    takePhotoButtonTitle: '录制视频',
    chooseFromLibraryButtonTitle: '选择已有视频',
    noData: false,
    videoQuality: 'medium',
    mediaType: 'video',
    durationLimit: 10, // 录制时长
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  },
};


// 视频录制页
export default class Edit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      title: '', // 点击按钮配音
      user: {},
      previewVideo: null,

      // video upload
      video: null,
      videoUploaded: false,
      videoUploading: false,

      // video loads
      playing: false,
      paused: false, // 是否暂停
      videoUploadProgress: '',
      videoTotal: 0,
      currentTime: 0,

      rate: 0,
      muted: true, // 静音
      resizeMode: 'contain',
      repeat: false,
      videoLoad: false,

      // 音频
      audioName: 'jsonz.aac',
      recordDone: false,
      audioPlaying: false,
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('user')
      .then(data => {
        let user = data ? JSON.parse(data) : {};
        user.accessToken && this.setState({user,});
      });

    this._initAudio();
  }

  _initAudio() {
    let audioPath = AudioUtils.DocumentDirectoryPath + '/' + this.state.audioName;

    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "High",
      AudioEncoding: "aac"
    });


  }

  _pickVideo() {

    ImagePicker.show(PageData.videoOption, (res) => {
      console.log('Response = ', res);

      if (res.didCancel) return console.log('用户取消了');
      if (res.error) return AlertIOS.alert('错误了');
      if (res.customButton) return console.log('User tapped custom button: ', res.customButton);

      let {user} = this.state,
        uri = res.uri;

      this.setState({
        previewVideo: uri,
      });

      this._getQiniuToken(user.accessToken)
        .then(({code, data}) => {

          if (code !== 0) return console.error('错误');

          let {token, key} = data;
          // 提交一个表单
          let body = new FormData();

          body.append('token', token);
          body.append('file', {
            type: 'video/mp4',
            name: key,
            uri,
          });
          body.append('key', key);

          this._upload(body);

        });
    });

  }


  _getQiniuToken(accessToken) {
    let signatureURL = Config.api.base2 + Config.api.signature;

    return Requires.post(signatureURL, {
      accessToken,
      type: 'video',
    })
      .catch(err => {
        console.error(err);
      });

  }

  _upload(body) {

    this.setState({
      videoUploading: true,
      videoUploaded: false,
    });

    let xhr = new XMLHttpRequest();
    let url = Config.qiniu.upload;
    let {user} = this.state;

    xhr.open('POST', url);

    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.log(xhr.responseText);
        return AlertIOS.alert('请求失败');
      }
      if (!xhr.responseText) return AlertIOS.alert('请求失败');

      let response;
      try {
        response = JSON.parse(xhr.response);
      } catch (e) {
        console.log(e)
      }

      if (response && response.key) {
        user.avatar = `${Config.qiniu.picOrigin}/${response.key}`;

        this.setState({
          video: response,
          videoUploading: false,
          videoUploaded: true,
          user,
        });

        const videoUrl = Config.api.base2 + Config.api.video,
          accessToken = this.state.user.accessToken;

        Requires.post(videoUrl, {
          accessToken,
          video:response
        })
          .catch(err=> {
            console.log(err);
            AlertIOS.alert('视频同步出错，请重新上传！');
          })
          .then(({code, data})=> {
          if (code !== 0) AlertIOS.alert('视频同步出错，请重新上传');

          })
      }
    };

    if (xhr.upload) {
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          let percent = event.loaded / event.total;

          this.setState({
            videoUploaded: percent,
            videoUploading: true,
          });
        }
      }
    }

    xhr.send(body);

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
        videoUploadProgress: percent,
      };

    if (!this.state.playing && PageData.currentTime !== currentTime) newState.playing = true;

    PageData.currentTime = currentTime;

    this.setState(newState);
  }

  _onEnd() {
    this.setState({
      videoUploadProgress: 1,
      playing: false,
      recordDone: true,
    });

    AudioRecorder.stopRecording();
  }

  _onError(e) {
    console.log('error', e);
  }

  _rePlay() {
    this.refs.videoPlayer.seek(0)
  }

  _record() {
    this.setState({
      videoProgress: 0,
      counting: false,
      recording: true,
      recordDone: false,
    });

    // 启动音频录制
    AudioRecorder.startRecording();

    this.refs.videoPlayer.seek(0)
  }

  _counting() {
    if (!this.state.counting && !this.state.recording) {
      this.setState({
        counting: true,
      });

      this.refs.videoPlayer.seek(this.state.videoTotal - 0.01)
    }
  }

  // 预览
  _preview() {
    if (this.state.audioPlaying) {
      // TODO 停止播放
      // AudioRecorder.stopPlaying();
    }

    this.setState({
      videoProgress: 0,
      audioPlaying: true,
    });

    // TODO 开始播放
    // AudioRecorder.playRecording();
    this.refs.videoPlayer.seek(0);

  }

  render() {
    return (
      <View style={styles.content}>
        {/*标题*/}
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}> {this.state.title || '理解狗狗，从配音开始'} </Text>
          {
            this.state.previewVideo && this.state.videoLoad
              ?
              <Text style={styles.toolbarEdit} onPress={this._pickVideo.bind(this)}>更换视频</Text>
              :
              null
          }
        </View>

        <View style={ styles.page} >
          {
            this.state.previewVideo
              ?
              <View style={styles.videoContainer} >
                <View style={styles.videoBox} >
                  <Video
                    ref={(ref) => {
                      this.videoPlayer = ref
                    }}
                    source={{uri: this.state.previewVideo}}
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
                    onEnd={this._onEnd.bind(this)} // end
                    onError={this._onError.bind(this)} // error
                  />

                  {
                    !this.state.videoUploaded && this.state.videoUploading
                      ?
                      <View style={styles.progressTipBox}>
                        <ProgressViewIOS
                          style={styles.progressBar}
                          progressTintColor="#ee735c"
                          progress={this.state.videoUploadProgress}
                        />
                          <Text style={styles.progressTip} >
                            正在上传静音视频，已完成{(this.state.videoUploadProgress * 100).toFixed(2)}
                          </Text>
                      </View>
                      : null
                  }
                  {
                    this.state.recording || this.state.audioPlaying
                      ?
                      <View style={styles.progressTipBox}>
                        <ProgressViewIOS
                          style={styles.progressBar}
                          progressTintColor="#ee735c"
                          progress={this.state.videoUploadProgress}
                        />
                        {
                          this.state.recording
                            ?
                            <Text style={styles.progressTip} >
                              录制声音中
                            </Text>
                            :
                            null
                        }
                      </View>
                      :
                      null
                  }

                  {
                    this.state.recordDone
                      ?
                      <View style={styles.previewBox}>
                        <Icon
                          name="play"
                          style={styles.previewIcon}
                          />
                        <Text
                          style={styles.previewText}
                          onPress={this._preview.bind(this)}
                        >
                          预览
                        </Text>
                      </View>
                      :
                      null
                  }

                </View>
              </View>
              :
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={this._pickVideo.bind(this)}
              >
                <View style={styles.uploadBox} >
                  <Icon
                    name="ios-cloud-upload-outline"
                    size={38}
                    style={styles.uploadIcon}/>
                  <Text style={styles.uploadTitle} >点我上传视频</Text>
                  <Text style={styles.uploadDesc} >建议时长不超过 10秒</Text>
                </View>
              </TouchableOpacity>
          }
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5fcff'
  },

  toolbar: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },

  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },

  toolbarEdit: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
  },

  page: {
    flex: 1,
    alignItems: 'center',
  },

  uploadContainer: {
    marginTop: 90,
    backgroundColor: '#fff',
    width: width - 40,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    justifyContent: 'center',
    borderRadius: 6,
  },

  uploadTitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#000'
  },

  uploadDesc: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
  },

  uploadIcon: {
    width: 110,
    textAlign: 'center',
  },

  uploadBox: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },

  videoBox: {
    width: width,
    height: height * .6,
  },

  video: {
    width: width,
    height: height * .6,
    backgroundColor: '#333'
  },

  progressTipBox: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: width,
    height: 30,
    backgroundColor: 'rgba(244,244,244,.65)'
  },

  progressTip: {
    color: '#333',
    width: width -10,
    padding: 5,
  },

  progressBar: {
    width: width,
  },

  previewBox: {
    width: 80,
    height: 30,
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  previewIcon: {
    marginRight: 5,
    fontSize: 20,
    color: '#ee735c'
  },

  previewText: {
    fontSize: 20,
    color: '#ee735c',
  },


});