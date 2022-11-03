export interface IDefaultObject<T = string> {
  [key: string]: T;
}

export class WebClientBase {
  /**
   * 生成 URL
   * @param url - 需要处理的 URL
   * @param path - 路由参数
   */
  static generateURL(url: string, path?: IDefaultObject) {
    // 替换路由参数
    const newURL = url.replace(
      /[\{|:](\w+)[\}]?/gi,
      (_key: string, _value: string) => {
        return path ? path[_value] : "";
      },
    );

    return newURL;
  }
}