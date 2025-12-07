import 'koa';

declare module 'koa' {
  interface Request {
    // 扩展 Request 接口，添加 body 属性
    // 这里暂时定义为 any，因为 body 的结构取决于具体的请求
    // 如果你想更严格，可以使用泛型或 unknown
    body?: any;
  }
}