export interface IDefaultObject<T = string> {
  [key: string]: T
}

/**
 * 属性类型
 */
export type propertyType = 'string' | 'integer' | 'boolean' | 'array' | 'object'

interface ISwaggerResultInfo {
  title: string
  description: string
  version: string
  license: unknown
}

interface ISwaggerResultTag {
  name: string
  description: string
}

interface ISwaggerSchema {
  $ref: string
}

interface ISwaggerMethodResponseStatus {
  description: string
  schema?: ISwaggerSchema
}

interface ISwaggerMethodResponses {
  200: ISwaggerMethodResponseStatus
}

export interface ISwaggerMethodParameter {
  in: 'path' | 'query' | 'body'
  name: string
  type: string
  format: string
  required: boolean
  description: string
  schema: ISwaggerSchema
}

export interface ISwaggerResultPaths {
  operationId: string
  consumes: string[]
  produces: string[]
  summary: string
  tags: string[]
  parameters: ISwaggerMethodParameter[]
  responses: ISwaggerMethodResponses
}

export interface ISwaggerDefinitionPropertieItems extends Partial<ISwaggerSchema> {
  type?: string
}

interface ISwaggerDefinitionProperties {
  type?: string
  $ref?: string
  description?: string
  format?: string
  items?: ISwaggerDefinitionPropertieItems
}

export interface ISwaggerResultDefinitions {
  type: string
  properties: IDefaultObject<ISwaggerDefinitionProperties>
}

export interface ISwaggerResult {
  basePath: string
  host: string
  swagger: string
  consumes: string[]
  info: ISwaggerResultInfo
  tags: ISwaggerResultTag[]
  definitions: IDefaultObject<ISwaggerResultDefinitions>
  paths: IDefaultObject<IDefaultObject<ISwaggerResultPaths>>
  produces: string[]
}

// Http 方法
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch'

export interface IGenerateRuntimeApiParams {
  /**
   * 方法名
   */
  name: string

  /**
   * 请求地址
   */
  url: string

  /**
   * 请求方法
   */
  method: HttpMethod

  /**
   * 请求对象 Key
   */
  requestKey: string

  /**
   * 响应对象 Key
   */
  responseKey: string
}
