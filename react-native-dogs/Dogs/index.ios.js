
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  TabBarIOS,
  NavigatorIOS,
  AsyncStorage, // getItem setItem removeItem
  ActivityIndicator,
  View,
  Dimensions,
  StyleSheet,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import List from './app/creation';
import Account from './app/account';
import Edit from './app/edit';
import Login from './app/account/login';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

// 隐藏掉黄屏输出
// console.disableYellowBox = true;

class TabBarExample extends Component {
  static title = '<TabBarIOS>';
  static description = 'Tab-based navigation.';
  static displayName = 'TabBarExample';

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      selectedTab: 'edit',
      notifCount: 0,
      presses: 0,
      logined: false, // 是否登录的用户标识
      booted: false,
      animating: true,
    }
  }

  componentDidMount() {
    this._asyncAppState()
  }

  _asyncAppState() {

    AsyncStorage.getItem('user')
    .then((data)=> {
      let user = null,
        newState = {};

      try {
        data && (user = JSON.parse(data));
      } catch(e) { console.warn(e)}

      newState.user = user;
      newState.logined = !!(user && user.accessToken);
      newState.booted = true;

      this.setState(newState);

    });
  }

  _afterLogin(data) {

    AsyncStorage.setItem('user', JSON.stringify(data))
      .then(()=> {
        this.setState({
          user: data,
          logined: true,
        });
      })
  }

  _logout() {

    AsyncStorage.removeItem('user');
    this.setState({ user: null, logined: false });

  }

  render() {

    if (!this.state.booted) {
      return (
        <View style={styles.bootPage}>
          <ActivityIndicator
            animating={this.state.animating}
            style={[styles.centering, {height: 80}]}
            size="large"
          />
        </View>
      )
    }

    if (!this.state.logined) {
      return <Login afterLogin={this._afterLogin.bind(this)} />;
    }

    return (
      <TabBarIOS
        barTintColor="#fff">

        <Icon.TabBarItemIOS

          iconName="list"
          iconSize={30}
          iconColor="#000"
          selectedIconColor="#114887"

          title="用户列表"
          selected={this.state.selectedTab === 'list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list',
            });
          }}>

          <NavigatorIOS
            initialRoute={{
              component: List,
              title: '视频列表',
              user: this.state.user,
            }}
            style={{flex: 1}}
          />

        </Icon.TabBarItemIOS>

        <Icon.TabBarItemIOS

          iconName="video-camera"
          iconSize={30}
          iconColor="#000"
          selectedIconColor="#114887"

          title="录像"
          selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit',
            });
          }}
        >

          <Edit/>

        </Icon.TabBarItemIOS>
        <Icon.TabBarItemIOS

          iconName="github"
          iconSize={30}
          iconColor="#000"
          selectedIconColor="#114887"

          title="更多"
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account',
            });
          }}
        >
          <Account user={this.state.user} logout={this._logout.bind(this)} />

        </Icon.TabBarItemIOS>
      </TabBarIOS>
    );
  }
}

const styles = StyleSheet.create({
  bootPage: {
    width: width,
    height: height,
    backgroundColor: '#fff',
    justifyContent: 'center',
  }
});

AppRegistry.registerComponent('Dogs', () => TabBarExample);

