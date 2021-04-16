export class BaseAdapter<API extends object, Entity extends object> {
  api: any;

  constructor(api: any) {
    this.api = api;
  }

  toEntity(object: any): Entity {
    // @ts-ignore
    return mapValues(this.api.fromJSON(object), (item: any) => item?.value ?? item) as Entity;
  }

  toAPI(object: any): API {
    // @ts-ignore
    return this.api.toJSON(object) as API;
  }
}
