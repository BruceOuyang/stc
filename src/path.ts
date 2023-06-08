import {
  IDefaultObject,
  IPathVirtualParameter,
  IPathVirtualParameterCategory,
  IPathVirtualProperty,
  ISwaggerResultPath,
} from "./swagger.ts";
import { getRefType } from "./util.ts";

/**
 * 获取请求对象
 * @param url - 接口地址
 * @param method - 请求方式
 * @param pathMethod - 请求对象
 * @returns
 */
const getPathVirtualProperty = (
  url: string,
  method: string,
  pathMethod: ISwaggerResultPath,
): IPathVirtualProperty => {
  // 请求参数 path、query、body、formData、header
  const parameters = pathMethod.parameters?.sort((_a, _b) =>
    Number(_b.required) - Number(_a.required)
  )
    ?.reduce((prev: IPathVirtualParameter, current) => {
      const item: IPathVirtualParameterCategory = {
        name: current.name,
        type: current.type ?? current.schema?.type ?? "",
        required: current.required,
        description: current.description,
        format: current.format ?? current.schema?.format,
        ref: getRefType(
          current.schema?.$ref ?? current.schema?.items?.$ref ?? "",
        ),
      };

      prev[current.in].push(item);

      return prev;
    }, { path: [], query: [], body: [], formData: [], header: [] });

  // 响应
  const _resSchema = pathMethod.responses[200]?.schema;

  const value: IPathVirtualProperty = {
    url,
    method,
    parameters,
    requestHeaders: pathMethod.consumes,
    responseHeaders: pathMethod.produces,
    response: {
      ref: getRefType(_resSchema?.$ref ?? ""),
      type: _resSchema?.type,
    },
    summary: pathMethod.summary,
    description: pathMethod.description,
    tags: pathMethod.tags,
  };

  return value;
};

/**
 * 获取接口地址对象
 * @param paths - 接口地址
 * @returns
 */
export const getApiPath = (
  paths: IDefaultObject<IDefaultObject<ISwaggerResultPath>>,
): Map<string, IPathVirtualProperty> => {
  const pathMap = new Map<string, IPathVirtualProperty>();

  Object.keys(paths).forEach((url) => {
    // if (
    //   !url.includes("/api/project")
    //   // !["/api/project/saveFormDataByPatient"].includes(url)
    // ) {
    //   return;
    // }
    // 请求方式
    const methods = paths[url];

    Object.keys(methods).forEach((method) => {
      const currentMethod = methods[method];
      // 方法名
      const name = currentMethod.operationId;
      // 接口对象
      const value = getPathVirtualProperty(url, method, currentMethod);

      pathMap.set(name, value);
    });
  });

  return pathMap;
};
