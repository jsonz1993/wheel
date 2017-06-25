import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  AlertIOS,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-picker';
import Requires from '../common/requires';
import Config from '../common/config';
import * as Progress from 'react-native-progress';
import Button from 'apsl-react-native-button';


let PageData = {
  ImagePickerOptions: {
    title: '选择照片',
    cancelButtonTitle: '取消',
    takePhotoButtonTitle: '拍摄',
    chooseFromLibraryButtonTitle: '从手机相册选择',
  },
};

const width = Dimensions.get('window').width;

// 会员中心页
export default class Account extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {},
      avatarProgress: 0,
      avatarUploading: false,
      modalVisible: false,
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('user')
      .then(data => {
        let user = data ? JSON.parse(data) : {};
        user.accessToken && this.setState({user,});
        console.log(user);
      });

  }

  _getQiniuToken(accessToken) {
    let signatureURL = Config.api.base2 + Config.api.signature;

    return Requires.post(signatureURL, {
      accessToken,
      type: 'avatar',
    })
      .catch(err => {
        console.error(err);
      });

  }

  _pickPhoto() {

    ImagePicker.showImagePicker(PageData.ImagePickerOptions, (res) => {
      console.log('Response = ', res);

      if (res.didCancel) return console.log('用户取消了');
      if (res.error) return AlertIOS.alert('错误了');
      if (res.customButton) return console.log('User tapped custom button: ', res.customButton);

      let {user} = this.state,
        uri = res.uri;

      this._getQiniuToken(user.accessToken)
        .then(({code, data}) => {

          if (code !== 0) return console.error('错误');

          let {token, key} = data;
          // 提交一个表单
          let body = new FormData();

          body.append('token', token);
          body.append('file', {
            type: 'image/jpeg',
            name: key,
            uri,
          });
          body.append('key', key);

          this._upload(body);

        });
    });

  }

  _upload(body) {

    this.setState({
      avatarUploading: true,
      avatarProgress: 0,
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
          avatarUploading: false,
          avatarProgress: 0,
          user,
        });

        this.updateUser(user)
          .catch(err => {
            console.error(err);
          });
      }
    };

    if (xhr.upload) {
      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          let percent = event.loaded / event.total;

          this.setState({
            avatarProgress: percent,
            avatarUploading: true,
          });

        }
      }
    }

    xhr.send(body);

  }

  updateUser(user) {
    return Requires.post(Config.api.base + Config.api.update)
      .catch(err => console.log(err))
      .then((res) => {
        console.log('upload', res);
        AsyncStorage.setItem('user', JSON.stringify(user))
          .then((data)=> {
            console.log('saveUser', data);
            AlertIOS.alert('保存成功');
          })
      });
  }

  _edit() {
    this.setState({
      modalVisible: true
    })
  }

  _closeModal() {
    this.setState({
      modalVisible: false
    });
  }

  changeUserState(key, value) {
    let user = this.state.user;
    user[key] = value;
    this.setState({user,});
  }

  _save() {
    let {user} = this.state;
    this.updateUser(user);
    this._closeModal();
  }

  _logout() {
    this.props.logout();
  }

  render() {
    return (
      <View style={styles.content}>
        {/*标题*/}
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text style={styles.toolbarEdit} onPress={this._edit.bind(this)}>编辑</Text>
        </View>

        {/*头像*/}
        {
          this.state.user.avatar ?
            <TouchableOpacity style={styles.avatarContainer}
                              onPress={this._pickPhoto.bind(this)}>
              <Image
                style={styles.avatarContainer}
                source={{uri: this.state.user.avatar}}
              >
                <View style={styles.avatarBox}>
                  {
                    this.state.avatarUploading
                      ?
                      <Progress.Circle
                        size={80}
                        indeterminate={false}
                        progress={this.state.avatarProgress}
                        showsText={true}
                        formatText={(progress) => `${Number(progress.toFixed(2)) * 100}%`}
                      />
                      :
                      <Image
                        source={{uri: this.state.user.avatar}}
                        style={styles.avatar}
                      />
                  }
                </View>

                <Text style={styles.avatarTip}>戳这里换头像</Text>

              </Image>
            </TouchableOpacity>
            :
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={this._pickPhoto.bind(this)}>
              <Text style={styles.avatarTip}>添加头像</Text>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                    ?
                    <Progress.Circle
                      size={80}
                      indeterminate={false}
                      progress={this.state.avatarProgress}
                      showsText={true}
                      formatText={(progress) => `${Number(progress.toFixed(2)) * 100}%`}
                    />
                    :
                    <Icon
                      name="plus"
                      style={styles.plusIcon}
                    />
                }

              </View>
            </TouchableOpacity>
        }

        <Modal
          visible={this.state.modalVisible}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <Icon
              name="close"
              onPress={this._closeModal.bind(this)}
              style={styles.closeIcon}/>
            <View style={styles.fieldItem}>
              <Text style={styles.label}> 昵称</Text>
              <TextInput
                placeholder="输入你的昵称"
                style={styles.inputField}
                autoCapitalize={'none'}
                autocorrect={false}
                defaultValue={this.state.user.nickName}
                onChangeText={text => {
                  this.changeUserState('nickName', text);
                }}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}> 品种</Text>
              <TextInput
                placeholder="输入狗狗的品种"
                style={styles.inputField}
                autoCapitalize={'none'}
                autocorrect={false}
                defaultValue={this.state.user.breed}
                onChangeText={text => {
                  this.changeUserState('breed', text);
                }}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}> 年龄</Text>
              <TextInput
                placeholder="输入狗狗的年龄"
                style={styles.inputField}
                autoCapitalize={'none'}
                autocorrect={false}
                defaultValue={this.state.user.age}
                onChangeText={text => {
                  this.changeUserState('age', text);
                }}
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.label}> 性别</Text>
              <Icon.Button
                onPress={() => {
                  this.changeUserState('gender', 'male')
                }}
                style={[
                  styles.gender,
                  this.state.user.gender !== 'female' && styles.genderChecked
                ]}
                name="male"
              >
                男
              </Icon.Button>
              <Icon.Button
                onPress={() => {
                  this.changeUserState('gender', 'female')
                }}
                style={[
                  styles.gender,
                  this.state.user.gender === 'female' && styles.genderChecked
                ]}
                name="female"
              >
                女
              </Icon.Button>
            </View>

            <Button
              style={styles.btn}
              onPress={this._save.bind(this)}
              textStyle={styles.textBtn}
            >
              保存资料
            </Button>
          </View>

        </Modal>

        <Button
          style={styles.btn}
          onPress={this._logout.bind(this)}
          textStyle={styles.textBtn}
        >
          退出登录
        </Button>

      </View>
    )
  }
};

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

  avatarContainer: {
    width: width,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#999',
  },

  avatarBox: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden'
  },

  plusIcon: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 25,
    paddingRight: 25,
    color: '#999',
    fontSize: 20,
    backgroundColor: '#fff',
  },

  avatarTip: {
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 14,
  },

  avatar: {
    marginBottom: 15,
    width: width * .2,
    height: width * .2,
    resizeMode: 'cover',
    borderRadius: width * .1,
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

  modalContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },

  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#eee',
    borderBottomWidth: 1,
  },

  label: {
    color: '#ccc',
    marginRight: 10,
  },

  inputField: {
    height: 50,
    flex: 1,
    color: '#666',
    fontSize: 14,
  },

  closeIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c',
  },

  gender: {
    backgroundColor: '#ccc'
  },

  genderChecked: {
    backgroundColor: '#ee735c',
  },

  btn: {
    marginTop: 25,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
  },

  textBtn: {
    color: '#ee735c',
    fontSize: 16,
  },

});
