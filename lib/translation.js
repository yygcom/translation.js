/**
 * 一个 API 对象
 * @typedef {Object} API
 * @property {String} id - 此接口的唯一 id
 * @property {String} name - 此接口的中文名称
 * @property {String} link - 此接口的在线网址
 * @property {Function} detect - 传递一段文本，返回一个 Promise。结果为语种，如不支持则返回 null
 * @property {Function} translate - 传递一个查询对象，返回一个 Promise。结果为翻译结果对象，如不支持则返回 null
 * @property {Function} audio - 传递一个查询对象，返回一个 Promise。结果为一段指向这段文本的音频地址，如不支持则返回 null
 */

/**
 * 查询对象。注意：查询对象里的语种都是谷歌翻译格式的
 * @typedef {Object} Query
 * @property {String} text - 要查询或者朗读的文本
 * @property {String} [from="auto"] - 这段文本的语种
 * @property {String} [to="auto"] - 期望得到的翻译语种
 * @property {String} [api] - 期望使用哪种翻译引擎翻译或朗读
 */

/**
 * @typedef {Object} Result
 *
 * 无论正常与否，下面的属性都会自动添加
 * @property {API} api - 使用哪个接口查询到的此次结果
 * @property {String} text - 等同于 Query 中的 text
 *
 * 查询结果正常的情况下：
 * @property {String} [result] - 查询结果
 * @property {String} [linkToResult] - 此翻译引擎的在线翻译地址
 * @property {Object} [response] - 此翻译引擎的原始未经转换的数据
 * @property {String} [from] - 此翻译引擎返回的源语种，注意这不是谷歌格式的语种，也不一定是 Query 里指定的语种
 * @property {String} [to] - 此翻译引擎返回的目标语种，注意这不是谷歌格式的语种，也不一定是 Query 里指定的语种
 * @property {String[]} [detailed] - 详细释义
 * @property {String} [phonetic] - 音标
 *
 * 查询结果异常的情况下：
 * @property {String} [error] - 错误消息，出错时必选
 */



'use strict';

class T {

  /**
   * 判断 superAgent 的错误对象的类型
   * @param {{timeout?:Number,status?:Number}} superAgentErr
   * @returns {String}
   */
  static errorType( superAgentErr ) {
    let type;
    if ( superAgentErr.timeout ) {
      type = 'timeout';
    } else if ( !superAgentErr.status ) {
      type = 'network error';
    } else {
      type = 'server error';
    }
    return type;
  }

  constructor() {
    this.defaultApi = 'baidu';
    this.api = {};
    this.errMsg = {
      timeout : '查询时超时了，请稍后再试。' ,
      'network error' : '网络错误，请检查网络设置，然后重试。' ,
      'server error' : '服务器出错了，请稍候重试。'
    };
  }

  /**
   * 创建一个翻译实例
   * @param {String} apiName
   * @param {*} config
   * @returns {API}
   */
  create( apiName , config ) {
    const api = this.api ,
      apiNameLower = apiName.toLowerCase() ,
      apiArr = api[ apiNameLower ] || (api[ apiNameLower ] = []) ,
      a = new T[ apiName ]( config );

    a.translateCount = 0;
    a.detectCount = 0;

    apiArr.push( a );
    return a;
  }

  /**
   * 翻译方法
   * @param {Query} queryObj
   * @returns {Promise}
   */
  translate( queryObj ) {
    return this.call( 'translate' , queryObj , 'translateCount' );
  }

  /**
   * 返回语音 url 的方法
   * @param queryObj
   * @returns {Promise}
   */
  audio( queryObj ) {
    return this.call( 'audio' , queryObj , 'detectCount' );
  }

  /**
   * 检测语种的方法。注意，此方法返回的语种类型是 API 相关的，可能不会遵守标准。
   * @param queryObj
   * @returns {Promise}
   */
  detect( queryObj ) {
    return this.call( 'detect' , queryObj , 'detectCount' );
  }

  /**
   * 调用实例方法
   * @param {String} method - 想调用实例的哪个方法
   * @param {Query} queryObj
   * @param {String} sortBy - 会根据这个属性的值（必须是一个数字）排序，使用最小的那个实例执行此方法
   * @returns {Promise}
   */
  call( method , queryObj , sortBy ) {
    return new Promise( ( resolve , reject )=> {
      const apiArr = this.api[ queryObj.api || this.defaultApi ];
      if ( !apiArr ) {
        return reject( `没有注册 ${queryObj.api} API。` );
      }

      const a = this.choose( apiArr , sortBy );
      a[ sortBy ] += 1;
      a[ method ]( queryObj ).then( resolve , superAgentError => {
        resolve( this.errMsg[ T.errorType( superAgentError ) ] );
      } );
    } );
  }

  /**
   * 从实例数组中选择一个实例进行翻译或检测语言类型。默认会优先使用调用次数少的实例，做到负载均衡。
   * @param {API[]} apiArr
   * @param {String} sortBy
   * @returns {API}
   */
  choose( apiArr , sortBy ) {
    apiArr.sort( ( a , b )=> {
      return a[ sortBy ] - b[ sortBy ];
    } );
    return apiArr[ 0 ];
  }
}

// 绑定构造函数
[ './baidu' ].forEach( fp => {
  const klass = require( fp );
  T[ klass.name ] = klass;
} );

module.exports = T;