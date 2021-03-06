export interface IPhonetic {
  name: string // 语种的中文名称
  ttsURI: string // 此音标对应的语音地址
  value: string // 此语种对应的音标值
}

export interface ITranslateResult {
  text: string // 此次查询的文本
  raw: any // 翻译接口提供的原始的、未经转换的查询结果
  link: string // 此翻译接口的在线查询地址
  from: string, // 由翻译接口提供的源语种，可能会与查询对象的 from 不同
  to: string, // 由翻译接口提供的目标语种，注意可能会与查询对象的 to 不同
  phonetic?: string | IPhonetic[], // 若有多个音标（例如美音和英音），则使用数组描述
  dict?: string[], // 如果查询的是英文单词，有的翻译接口（例如有道翻译）会返回这个单词的详细释义
  result?: string[] // 翻译结果，可以有多条（例如一个段落对应一个翻译结果）
  [other: string]: any // 允许各个接口添加自定义数据
}

export interface ITranslateOptions {
  text: string
  // 待翻译文本的源语种
  from?: string
  // 想将文本翻译成哪个语种
  to?: string
  // 想使用哪个 API 翻译这段文本
  api?: string
  // 允许用户传入自定义的配置
  [other: string]: any
}

export type TStringOrTranslateOptions = string | ITranslateOptions

export interface IAPI {
  readonly id: string // 翻译接口的唯一标识符
  // 翻译文本的方法
  translate (options: string | ITranslateOptions): Promise<ITranslateResult>
  // 检测文本语种的方法
  detect (options: string | ITranslateOptions): Promise<string>
  // 返回文本的在线音频地址的方法
  audio (options: string | ITranslateOptions): Promise<string>

  [other: string]: any
}

export interface IAnyObject {
  [prop: string]: any
}

export interface ILanguageList {
  readonly [prop: string]: string
}

export interface IRequestOptions {
  url: string
  query?: IStringOrStringArrayObject
  method?: string
  body?: IAnyObject
  type?: string
  headers?: IStringObject
}

export interface IStringObject {
  [prop: string]: string
}

export interface IStringOrStringArrayObject {
  [prop: string]: string | string[]
}
