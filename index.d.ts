import { H3Event } from 'h3'

export declare type DrosseDbApi = {
  list: {
    all(collection: string, cleanFields?: string[]): Array<any>
    byId(
      collection: string,
      id: string|number,
      cleanFields?: string[]
    ): Array<any>
    byField(
      collection: string,
      field: string,
      value: any,
      cleanFields?: string[]
    ): any
    byFields(
      collection: string,
      fields: string,
      value: any,
      cleanFields?: string[]
    ): any
    find(
      collection: string,
      query: Object,
      cleanFields?: string[]
    ): Array<any>
    where(
      collection: string,
      searchFn: Function,
      cleanFields?: string[]
    ): Array<any>
  }
  get: {
    byId(collection: string, id: string|number, cleanFields: string[]): any
    byRef(refObj, dynamicId, cleanFields: string[]): any
    byField(
      collection: string,
      field: string,
      value: any,
      cleanFields: string[]
    ): any
    byFields(
      collection: string,
      fields: string[],
      value: any,
      cleanFields: string[]
    ): any
    find(collection: string, query: Object, cleanFields: string[]): any
    where(collection: string, searchFn: Function, cleanFields: string[]): any
  }

  query: {
    getIdMap(collection: string, fieldname: string, firstOnly: boolean): Object
    chain(collection: string): any
    clean(...fields: any[]): any
  }

  insert(collection: string, ids: Array<string|number>, payload): any

  update: {
    byId(collection: string, id: string|number, newValue: Object): any

    subItem: {
      append(
        collection: string,
        id: string|number,
        subPath: string,
        payload: any
      ): any
      prepend(
        collection: string,
        id: string|number,
        subPath: string,
        payload: any
      ): any
    }
  }
  remove: {
    byId(collection: string, id): any
  }
}

export declare type DrosseIoApi = {
  loadScraped(
    routePath: string,
    params: any,
    query: any,
    verb: string|null,
    skipVerb:boolean,
    extensions:string[]
  ): Promise,
  loadStatic(
    routePath: string,
    params: any,
    query: any,
    verb: string|null,
    skipVerb:boolean,
    extensions:string[]
  ): Promise,
}

export declare type DrosseLogger = {
  debug(message?: any, ...optionalParams: any[]): void
  error(message?: any, ...optionalParams: any[]): void
  info(message?: any, ...optionalParams: any[]): void
  success(message?: any, ...optionalParams: any[]): void
  warn(message?: any, ...optionalParams: any[]): void
}

export declare type DrosseServerConfig = {
  /** @default 'assets' */
  assetsPath?: string

  /** @default '' */
  basePath?: string

  /** @default '' */
  baseUrl?: string

  /** @default null */
  cli?: (vorpal: Function, params: any) => any

  /** @default 'collections'' */
  collectionsPath?: string

  /** @default {} */
  commands?: {
    [id: string]: (api: DrosseServiceApi) => Promise
  }

  /** @default 'mocks.json' */
  database?: string

  /** @default 'LokiFsAdapter' */
  dbAdapter?: string

  /** @default null */
  errorHandler?: Function

  /** @default null */
  extendServer?: Function

  /** @default ['morgan'] */
  middlewares?: Array<string|Function>

  /** @default 'Drosse mock server' */
  name: string

  /** @default null */
  onHttpUpgrade?: Function

  /** @default 8000 */
  port?: number

  /** @default 'routes' */
  routesFile?: string

  /** @default 'scraped' */
  scrapedPath?: string

  /** @default 'scrapers' */
  scraperServicesPath?: string

  /** @default 'services' */
  servicesPath?: string

  /** @default [] */
  shallowCollections?: string[]

  /** @default 'static' */
  staticPath?: string

  /** @default {} */
  templates?: {
    [id: string]: Function;
  }
}

type DrosseServiceCallback = (api: DrosseServiceApi) => Promise<any>

export declare type DrosseServiceApi = {
  req: H3Event,
  res: H3Event,
  db: DrosseDbApi,
  logger: DrosseLogger,
  io: DrosseIoApi,
  config: DrosseServerConfig
}

export declare function defineDrosseServer(
  config: DrosseServerConfig
): DrosseServerConfig

export declare function defineDrosseService(cb: DrosseServiceCallback): void
