export class BaseAdapter<API extends object, Entity extends object> {
  toEntity(object: any): Entity {
    // @ts-ignore
    return mapValues(API.fromJSON(object), (item: any) => item?.value ?? item) as Entity;
  }

  toAPI(object: any): API {
    // @ts-ignore
    return API.toJSON(object) as API;
  }
}
