import { mapKeys, mapValues } from 'lodash';

export class BaseAdapter<InterchangeFormat extends object, Entity extends object> {
  optionalFields: string[];

  wrapperToOptional(field: any) {
    return field?.value;
  }

  optionalToWrapper(field: any) {
    return { value: field };
  }

  toEntity(object: InterchangeFormat): Entity {
    return mapValues(object, (value, key) =>
      this.optionalFields.includes(key) ? this.wrapperToOptional(value) : value,
    ) as Entity;
  }

  toInterchangeFormat(object: Entity): InterchangeFormat {
    return mapValues(object, (value, key) =>
      this.optionalFields.includes(key) ? this.optionalToWrapper(value) : value,
    ) as InterchangeFormat;
  }
}