// /**
//  * Created by Jsonz on 2017/5/27.
//  */
//
import queryString from 'query-string';
import Mock from 'mockjs';
import config from './config';
import _ from 'lodash';

const requires = {
  get(url, params) {
    if (params) {
      url += '?' + queryString.stringify(params);
    }

    return fetch(url)
      .then(response => {
        return response.json()
      })
      .then(response =>  Mock.mock(response));
  },

  post(url, body) {
    let options = _.extend(config.header, {
      body: JSON.stringify(body)
    });

    return fetch(url, options)
      .then(response => response.json())
      .then(response => Mock.mock(response));
  }
};

export default requires;
