export const ON_SHOW = 'onShow'
export const ON_LAUNCH = 'onLaunch'
export const ON_READY = 'onReady'
export const ON_LOAD = 'onLoad'

export const UniLifecycleHooks = [ON_SHOW, ON_LAUNCH, ON_LOAD, ON_READY] as const

export interface LaunchShowOption {
  /**
   * 打开小程序的路径
   */
  path: string;
  /**
   * 打开小程序的query
   */
  query: AnyObject;
  /**
   * 打开小程序的场景值
   * - 1001: 发现栏小程序主入口，「最近使用」列表（基础库2.2.4版本起包含「我的小程序」列表）
   * - 1005: 顶部搜索框的搜索结果页
   * - 1006: 发现栏小程序主入口搜索框的搜索结果页
   * - 1007: 单人聊天会话中的小程序消息卡片
   * - 1008: 群聊会话中的小程序消息卡片
   * - 1011: 扫描二维码
   * - 1012: 长按图片识别二维码
   * - 1013: 手机相册选取二维码
   * - 1014: 小程序模板消息
   * - 1017: 前往体验版的入口页
   * - 1019: 微信钱包
   * - 1020: 公众号 profile 页相关小程序列表
   * - 1022: 聊天顶部置顶小程序入口
   * - 1023: 安卓系统桌面图标
   * - 1024: 小程序 profile 页
   * - 1025: 扫描一维码
   * - 1026: 附近小程序列表
   * - 1027: 顶部搜索框搜索结果页「使用过的小程序」列表
   * - 1028: 我的卡包
   * - 1029: 卡券详情页
   * - 1030: 自动化测试下打开小程序
   * - 1031: 长按图片识别一维码
   * - 1032: 手机相册选取一维码
   * - 1034: 微信支付完成页
   * - 1035: 公众号自定义菜单
   * - 1036: App 分享消息卡片
   * - 1037: 小程序打开小程序
   * - 1038: 从另一个小程序返回
   * - 1039: 摇电视
   * - 1042: 添加好友搜索框的搜索结果页
   * - 1043: 公众号模板消息
   * - 1044: 带 shareTicket 的小程序消息卡片
   * - 1045: 朋友圈广告
   * - 1046: 朋友圈广告详情页
   * - 1047: 扫描小程序码
   * - 1048: 长按图片识别小程序码
   * - 1049: 手机相册选取小程序码
   * - 1052: 卡券的适用门店列表
   * - 1053: 搜一搜的结果页
   * - 1054: 顶部搜索框小程序快捷入口
   * - 1056: 音乐播放器菜单
   * - 1057: 钱包中的银行卡详情页
   * - 1058: 公众号文章
   * - 1059: 体验版小程序绑定邀请页
   * - 1064: 微信连Wi-Fi状态栏
   * - 1067: 公众号文章广告
   * - 1068: 附近小程序列表广告
   * - 1069: 移动应用
   * - 1071: 钱包中的银行卡列表页
   * - 1072: 二维码收款页面
   * - 1073: 客服消息列表下发的小程序消息卡片
   * - 1074: 公众号会话下发的小程序消息卡片
   * - 1077: 摇周边
   * - 1078: 连Wi-Fi成功页
   * - 1079: 微信游戏中心
   * - 1081: 客服消息下发的文字链
   * - 1082: 公众号会话下发的文字链
   * - 1084: 朋友圈广告原生页
   * - 1089: 微信聊天主界面下拉，「最近使用」栏（基础库2.2.4版本起包含「我的小程序」栏）
   * - 1090: 长按小程序右上角菜单唤出最近使用历史
   * - 1091: 公众号文章商品卡片
   * - 1092: 城市服务入口
   * - 1095: 小程序广告组件
   * - 1096: 聊天记录
   * - 1097: 微信支付签约页
   * - 1099: 页面内嵌插件
   * - 1102: 公众号 profile 页服务预览
   * - 1103: 发现栏小程序主入口，「我的小程序」列表（基础库2.2.4版本起废弃）
   * - 1104: 微信聊天主界面下拉，「我的小程序」栏（基础库2.2.4版本起废弃）
   */
  scene: number;
  /**
   * 打开小程序的场景值
   */
  shareTicket: string;
  /**
   * 当场景为由从另一个小程序或公众号或App打开时，返回此字段
   */
  referrerInfo?: ReferrerInfo;
}

interface ReferrerInfo {
  /**
   * 来源小程序或公众号或App的 appId
   *
   * 以下场景支持返回 referrerInfo.appId：
   * - 1020（公众号 profile 页相关小程序列表）： appId
   * - 1035（公众号自定义菜单）：来源公众号 appId
   * - 1036（App 分享消息卡片）：来源应用 appId
   * - 1037（小程序打开小程序）：来源小程序 appId
   * - 1038（从另一个小程序返回）：来源小程序 appId
   * - 1043（公众号模板消息）：来源公众号 appId
   */
  appId: string;
  /**
   * 来源小程序传过来的数据，scene=1037或1038时支持
   */
  extraData?: any;
}

type PiniaWatchConfig = {
  key: string
  type: 'pinia'
  store: any // todo 如何使用更具体的 store 类型
  onUpdate?: (val: any) => boolean
}

type DefaultWatchConfig = {
  key: string
  type?: 'default'
  onUpdate?: (val: any) => boolean
}

export type WatchConfig = PiniaWatchConfig | DefaultWatchConfig

export enum PromiseStatus {
  /** 加载状态 */
  PENDING = 'pending',
  /** 已完成 */
  FULFILLED = 'fulfilled'
}

export type WatchConfigCollection = {
  [key: string]: WatchConfig
}

export type PromiseEntry = {
  status: PromiseStatus
  resolve: Function,
  type?: 'pinia' | 'default'
  onUpdate?: (val: any) => boolean
}

export type PromiseMapValue = PromiseEntry & Partial<WatchConfig>

export type HookFunction = (beforeCb: () => void, asyncCb: (options?: any) => Promise<void>, afterCb: () => void) => void;

export type CustomHook = (cb: (options?: any) => void, watchKey: string[] | string) => void;
