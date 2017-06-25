
import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  ListView,
  TouchableHighlight,
  Dimensions, // 可视区宽度
  ActivityIndicator,
  RefreshControl,
  AlertIOS,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Requires from '../common/requires';
import Config from '../common/config';

import Detail from './detail';

const width = Dimensions.get('window').width;
let cachedResults = {
  nextPage: 1,
  items: [],
  total: 0,
  upTimer: null,
};

class Item extends Component {

  constructor(props) {
    super(props);

    this.state = {
      up: props.voted,
      row: props.row,
    }
  }

  _up() {
    let up = !this.state.up,
      row = this.state.row,
      url =
        Config.api.base + Config.api.up,
      body = {
        id: row._id,
        up: up? 1: 0,
        accessToken: 'jsonz',
      };

    this.setState({
      up
    });

    clearTimeout(cachedResults.upTimer);
    cachedResults.upTimer = setTimeout(()=>{
      Requires.post(url, body)
        .then(({code})=> {
          if (code !== 0) {
            AlertIOS.alert('点赞失败，稍后重试');
            this.setState({
              up: !up,
            })
          }
        })
        .catch(err=> {
          console.log(err);
          AlertIOS.alert('点赞失败，稍后重试');
        });
    }, 1000);
  }

  render() {
    return (
      <TouchableHighlight onPress={ this.props.onSelect }>
        <View style={styles.item}>
          <Text style={styles.title}>{this.state.row.title}</Text>
          <Image
            source={{ uri: this.state.row.thumb }}
            style={styles.thumb} >
            <Icon
              name="ios-play"
              size={28}
              style={styles.play} />
          </Image>

          <View style={styles.itemFooter}>
            <View style={styles.handleBox} >
              <Icon
                name={this.state.up? 'ios-heart': 'ios-heart-outline'}
                size={28}
                style={[this.state.up? styles.up: styles.down]}
                onPress={this._up.bind(this)} />
              <Text style={styles.handleText} onPress={this._up.bind(this)} >喜欢</Text>
            </View>

            <View style={styles.handleBox}>
              <Icon
                name="ios-chatbubbles-outline"
                size={28}
                style={styles.commentIcon} />
              <Text style={styles.handleText}>评论</Text>
            </View>

          </View>

        </View>
      </TouchableHighlight>
    )
  }
}


export default class List extends Component {

  static navigationOptions = {
    title: 'Welcome',
  };

  constructor(props) {
    super(props);
    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([]),
      isLoadingTail: false,
      isRefreshing: false,
    };

  }

  componentDidMount() {
    this.fetchData(1);
  }

  fetchData(page) {

    let _state = page === 0? 'isRefreshing': 'isLoadingTail';
    this.setState({
      [_state]: true
    });

    Requires.get(Config.api.base + Config.api.creations, {
      accessToken: 'jsonz',
      page,
    })
      .then(({data, code, pages})=> {
        if (code !== 0) return;

       setTimeout(()=> {
         cachedResults.items = page === 0? data: cachedResults.items.concat(data);
         cachedResults.total = pages.total;
         cachedResults.nextPage += !!page;

         this.setState({
           [_state]: false,
           dataSource: this.state.dataSource.cloneWithRows(cachedResults.items),
         });
       }, 0)

      })
      .catch(error=> {
        this.setState({
          [_state]: false,
        });
        console.warn(error);
      })
  }

  fetchMoreData() {
    if (!this.hasMore() || this.state.isLoadingTail) {
      return;
    }

    let page = cachedResults.nextPage;

    this.fetchData(page);
  }

  hasMore() {
    return cachedResults.items.length !== cachedResults.total;
  }

  renderFooter() {
    if (!this.hasMore() && cachedResults.items.length !== 0) {
      return (
        <View style={styles.loadMore}>
          <Text style={styles.loadText}> 到底了你知道吗 </Text>
        </View>
      )
    }

    if (!this.state.isLoadingTail) return <View style={styles.loadMore} />

    return (
      <ActivityIndicator style={[styles.loadMore]} animating={true} size="large" />
    )
  }

  _loadPage(row) {

    this.props.navigator.push({
      name: 'detail',
      component: Detail,
      title: row.title,
      detail: row,
      author: this.props.route.user,
    });
  }

  renderRow(row) {
    return <Item
        row={row} key={row._id}
        onSelect={()=> this._loadPage(row) }
        />
  }

  _onRefresh() {
    if (this.state.isRefreshing || !this.hasMore()) return;

    this.fetchData(0);
  }

  render() {
    return (
      <View style={styles.content}>

        <View style={styles.header}>
          <Text style={styles.headerText}> 列表页面 </Text>
        </View>

        <ListView
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          onEndReached={this.fetchMoreData.bind(this)}
          onEndReachedThreshold={20}
          renderFooter={this.renderFooter.bind(this)}
          removeClippedSubviews={true}
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          showsVerticalScrollIndicator={false} // 隐藏滚动条， listView文档没写 在 scrollView
          style={styles.listView}

          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh.bind(this)}
              tintColor="#ff0000"
              title="加载 (⁎⁍̴̛ᴗ⁍̴̛⁎)..."
              titleColor="#ff6600"
              colors={['#ff0000', '#00ff00', '#0000ff']}
              progressBackgroundColor="#ffff00"
            />
          }

        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c'

  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600'
  },

  listView: {
    overflow: 'hidden',
  },

  item: {
    width: width,
    marginBottom: 10,
    backgroundColor: '#fff'
  },

  thumb: {
    width: width,
    height: width * .56,
    resizeMode: 'cover',
  },

  title: {
    padding: 10,
    fontSize: 18,
    color: '#333',
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
  },

  handleBox: {
    padding: 10,
    flexDirection: 'row',
    width: width * .5 - .5,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66',
  },

  handleText: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#333',
  },

  up: {
    fontSize: 22,
    color: 'red',
  },

  down: {
    fontSize: 22,
    color: '#333',
  },

  commentIcon: {
    fontSize: 22,
    color: '#333'
  },

  loadMore: {
    marginVertical: 20,
  },

  loadText: {
    color: '#777',
    textAlign: 'center',
  }

});

