/**
 * Created by Jsonz on 2017/6/2.
 */

export default class CountDown {

  constructor(props) {
    this.setData(props);
  }

  // 获取有多少秒
  static getSeconds(time) {
    let type = typeof time;
    return (type === 'number' || type === 'string' && /^\d+$/.test(time))
      ? time
      : new Date(time).getTime() / 1000;
  }

  // 位数补全
  static ten(t) {
    return t < 10? '0' + t: t;
  }

  // 设置数据
  setData(props) {
    this.countType = props.countType; // 支持两种计时方式，两个日期之间 && 秒数的倒计时
    this.timerId = null; // 计时器
    this.endTime = props.endTime; // 计时器结束时间
    this.startTime = props.startTime; // 计时器开始时间
    this.timeLeft = props.timeLeft; // 计时器剩余秒数， 区别于上面时间段的计时方式
    this.timePassed = 0; // 正向为累计时间，反向为剩余时间
    this.onInterval = props.onInterval; // 定时的回调
    this.onEnd = props.onEnd; // 结束的回调
    this.step = props.step; // 计时步长，以秒为单位，正数为正计时，负数为倒计时
    this.counter = 0; // 累加器 TODO 疑问

    // 数据校验
    if (!this.countType) {
      throw new Error('必须传入一个 countType: seconds || date');
    }

    if (
      (this.timeLeft && (this.endTime || this.startTime)) ||
      (!this.timeLeft && !(this.endTime || this.startTime))
    ) {
      throw new Error('必须传入一个时间段 [timeLeft] [startTime] [endTime]');
    }

    if (!this.timeLeft && typeof this.startTime === 'undefined') {
      this.startTime = Date.now()/ 1000;
    }

    if (!this.timeLeft) {
      this.timeLeft = Math.floor(CountDown.getSeconds(this.endTime) - CountDown.getSeconds(this.startTime));
    }

//    this.refreshTime(true);
  }

  // 周期启动更新时间
  auto() {

    this.timerId = setTimeout(()=> {
      // 倒计时到0停止计时
      if (this.timePassed <= 0 && this.step < 0) return this.end();

      this.refreshTime(true);

    }, 1000 * Math.abs(this.step)); // 时间间隔为整数， 对step求绝对值

  }

  refreshTime(isStart) {

    this.timePassed  = (this.timeLeft * 1000 + this.step * 1000 * this.counter++) / 1000;

    if (this.countType === 'date') {

      let _timePassed = this.timePassed,
        second = CountDown.ten(_timePassed % 60);
      _timePassed = parseInt(_timePassed / 60);
      let minute = CountDown.ten(_timePassed % 60);
      _timePassed = parseInt(_timePassed / 60);
      let hour = CountDown.ten(_timePassed % 24);
      _timePassed = CountDown.ten(parseInt(_timePassed / 24));
      this.onInterval(_timePassed,hour,minute, second);

    } else if (this.countType === 'seconds') {

      this.onInterval(this.timePassed);

    }

    isStart && this.auto(); // 是否开始计时

  }

  // 开始计时
  start() {
    clearTimeout(this.timerId);
    this.refreshTime(true);
  }

  // 结束： 没有清空计数 + 停止计时
  end() {
    clearTimeout(this.timerId);
    this.onEnd(this.timeLeft);
  }

  reset() {
    this.counter = 0;
    clearTimeout(this.timerId);
    this.refreshTime(false);
  }

}
