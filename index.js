/*
 * @Author: xuanxiaojing@bytedance.com
 * @Date: 2021-12-28 16:29:28
 * @LastEditors: xuanxiaojing@bytedance.com
 * @LastEditTime: 2021-12-29 13:46:58
 * @Description: file content
 */
var fs = require('fs');
var path = require('path');
var macro = require('./macro');
var loaderUtils = require('loader-utils');

function readDefines(filename){
  var data = JSON.parse(fs.readFileSync(filename));
  if (Array.isArray(data)){
    var result = {};
    for (var i = 0; i < data.length; i++){
      result[data[i]] = true;
    }
    return result;
  } else if (typeof data === 'object') {
    return data || {};
  } else {
    return {};
  }
}

module.exports = function(content) {
  var query = this.getOptions(this.query);
  this.cacheable && this.cacheable(Boolean(query.cacheable));

  var params = {
    mode: null,
    filename: this.resourcePath,
    prefix: '#'
  };

  var defines = null;
  if (query.defines){
    try {
      defines = readDefines(query.defines);
    } catch(err) {
      throw new Error('Cannot read defines: ' + err);
    }
  }

  if (!defines) defines = {};

  for (var n in query){
    if (query.hasOwnProperty(n) && n !== 'defines'){
      if (/^d:(\w+)$/.test(n)){
        defines[RegExp.$1] = JSON.parse(query[n]);
      } else {
        params[n] == query[n];
      }
    }
  }

  var config = null;
  if (query.config){
    try {
      config = JSON.parse(fs.readFileSync(query.config));
    } catch(err) {
      throw new Error('Cannot read defines: ' + err);
    }
  }

  return config ?
      macro(config, content, defines || {}, params) :
      macro[params.mode || 'js'](content, defines || {}, params);
};
