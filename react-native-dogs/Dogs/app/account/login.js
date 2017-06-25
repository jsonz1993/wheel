import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  AlertIOS,
  Text,
} from 'react-native';
import Button from 'apsl-react-native-button';
import Requires from '../common/requires';
import Config from '../common/config';
import {CountDownText} from '../component/CountDown';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      codeSent: false,
      verifyCode: '',
      phoneNumber: '',
      countingDone: false,
    }
  }

  // 提交
  _submit() {
    let { phoneNumber, verifyCode } = this.state;
    if (!phoneNumber || !verifyCode) return AlertIOS.alert('手机号或验证码不能为空!');

    Requires.post(Config.api.base + Config.api.verifyUser, {
      phoneNumber, verifyCode
    })
      .catch(err=> {
        AlertIOS.alert('登录失败，请稍后再试', err);
      })
      .then(({ code, msg, data })=> {

        if (code !== 0) return AlertIOS.alert('登录失败，请稍后再试', msg);


        this.props.afterLogin(data);
      });
  }

  // 获取验证码
  _sendVerifyCode() {
    let phoneNumber = this.state.phoneNumber;
    if (!phoneNumber) {
      return AlertIOS.alert('手机号不能为空');
    }

    Requires.post(Config.api.base2 + Config.api.signup, { phoneNumber })
      .then(({code, err})=> {
        console.log(code, err);

        if (code !== 0) {
          console.log(err);
          return AlertIOS.alert('获取验证码失败，请检查手机号是否正确');
        }
        AlertIOS.alert('请查看手机短信');
        this._showVerifyCode();
      })
      .catch(err=> {
        console.log(err);
        AlertIOS.alert('获取验证码失败，请稍后再试');
      });
  }

  // 显示验证码的输入框
  _showVerifyCode() {
    this.setState({
      codeSent: true,
    })
  }

  // 倒计时结束
  _countingDone() {
    this.setState({
      countingDone: true,
    })
  }

  render() {
    return (
      <View style={styles.container}>

        <Text style={styles.title}> 快速登录 </Text>

        <View style={styles.signupBox}>
          <TextInput
            placeholder="输入手机号"
            autoCaptialize={'none'} // 首字母不自动大写
            autoCorrect={false} // 不纠错
            keyboardType={'number-pad'}
            style={styles.inputField}
            onChangeText={(text)=> {
              this.setState({
                phoneNumber: text
              });
            }}
          />

          {
            this.state.codeSent ?
              <View style={styles.verifyCodeBox} >
                <TextInput
                  placeholder="输入验证码"
                  autoCaptialize={'none'} // 首字母不自动大写
                  autoCorrect={false} // 不纠错
                  keyboardType={'number-pad'}
                  style={[styles.inputField, styles.flex1]}
                  onChangeText={(text)=> {
                    this.setState({
                      verifyCode: text
                    });
                  }}
                />

                {
                  this.state.countingDone?
                    <Button
                      style={styles.countBtn}
                      textStyle={styles.textBtn}
                      onPress={this._sendVerifyCode.bind(this)} >
                      获取验证码
                    </Button>
                    :
                    <CountDownText
                      style={styles.countBtn}
                      countType="seconds"
                      auto={true} // 自动开始
                      afterEnd={this._countingDone.bind(this)} // 结束的回调
                      timeLeft={60} // 正向计时
                      step={-1} // 计时步长，以秒为单位，正数为正计时，负数为负计时
                      startText="获取验证码" // 开始的文本
                      endText="获取验证码" // 结束的文本
                      intervalText={(sec)=> `剩余秒数:${sec}`} // 定时的文本回调
                    />

                }
              </View>
              :
              null
          }

          {
            this.state.codeSent
             ? <Button
                style={styles.btn}
                onPress={this._submit.bind(this)}
                textStyle={styles.textBtn}
              >
              登录
              </Button>
             : <Button
                style={styles.btn}
                textStyle={styles.textBtn}
                onPress={this._sendVerifyCode.bind(this)}
              >
              获取验证码
             </Button>
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 50,
    padding: 10,
  },

  signupBox: {
    marginTop: 10,
  },

  title: {
    marginBottom: 10,
    color: '#333',
    fontSize: 20,
    textAlign: 'center',
  },

  inputField: {
    height: 40,
    padding: 5,
    color: '#666',
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginTop: 5,
  },

  btn: {
    padding: 10,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
  },

  textBtn: {
    color: '#ee735c',
    fontSize: 16,
  },

  verifyCodeBox: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countBtn: {
    color: '#333',
    width: 110,
    height: 40,
    padding: 10,
    marginLeft: 8,
    backgroundColor: '#ee735c',
    borderColor: '#ee735c',
    color: '#fff',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: 15,
    borderRadius: 2,
  },

  flex1: {
    flex: 1,
  }

});





























