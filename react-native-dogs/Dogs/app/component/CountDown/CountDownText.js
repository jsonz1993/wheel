/**
 * Created by Jsonz on 2017/6/3.
 */


import React, {Component} from 'react';
import {
  Text
} from 'react-native';
import CountDown from './CountDown';


class CountDownText extends Component {

  constructor(props) {
    super(props);

    this.state = {
      text: this.props.startText,
    };
  }

  counter= null;

  static isTimeEquals(t1, t2) {
    return Math.abs(t1 - t2) < 2;
  }

  componentWillReceiveProps(nextProps) {

    let updating = true;

    // 倒计时的情况
    if (this.props.step === nextProps.step && this.props.step < 0) {
      if (this.props.endTime) {
        // 1. 按起始日期来计时
        updating = !CountDownText.isTimeEquals(this.props.endTime, nextProps.endTime);
      } else {
        // 2. 按间隔秒数来计时
        updating = !CountDownText.isTimeEquals(nextProps.timeLeft, this.counter.timePassed);
      }
    }


    if (updating) {
      // 重置： 清空计数 + 停止计时
      this.counter.reset();

      this.counter.setData(Object.assign({}, nextProps, {
        onInterval: this.onInterval.bind(this),
        onEnd: this.onEnd.bind(this),
      }));

      if (nextProps.auto) {
        this.start();
      }
    }
  }

  componentDidMount() {

    this.counter =  new CountDown(Object.assign({}, this.props, {
      onInterval: this.onInterval.bind(this),
      onEnd: this.onEnd.bind(this),
    }));

    if (this.counter.timeLeft <= 0 && this.counter.step <= 0) {
      return this.end();
    }

    if (this.props.auto) this.start();

  }

  componentWillUnmount() {
    this.reset();
  }

  start() {
    this.counter.start();
  }

  end() {
    this.counter.end();
  }

  reset() {
    this.counter.reset();
  }

  render() {
    return (
      <Text style={this.props.style}> {this.state.text} </Text>
    )
  }

  getTimePassed() {
    return this.counter.timePassed;
  }

  onInterval(...args) {
    this.setState({text: this.props.intervalText.apply(null, args)})
  }

  onEnd(timePassed) {
    this.setState({
      text: this.props.endText,
    });

    this.props.afterEnd(timePassed);
  }

}

CountDownText.defaultProps = {
  countType: 'seconds',
  onEnd: null,
  timeLeft: 0,
  step: -1,
  startText: null,
  intervalText: null,
  endText: null,
  auto: false,
  afterEnd: ()=> {},
};

export default CountDownText;