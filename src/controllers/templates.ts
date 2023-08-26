import Hapi from "@hapi/hapi";

import Controller, { Handler } from "../server";
import { All } from "../jsonified";
import { Template, DataType, IsDataType } from "../models";
import { Assert, IsArray, IsObject, IsRecord, IsString, Optional } from "@ipheion/safe-type";

const IsField = IsObject({ name: IsString, type: IsDataType });

const IsPostBlockType = IsObject({
  name: IsString,
  fields: IsArray(IsField),
  template: IsString,
  undefined: Optional(IsString),
});

const IsPutBlockType = IsObject({
  name: IsString,
  fields: IsArray(IsField),
  template: IsString,
  undefined: Optional(IsString),
});

export default class TemplatesController extends Controller {
  constructor() {
    super("/api/templates");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return All(Template);
  }

  @Handler("GET", "/{name}")
  async GetSpecifc(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const result = new Template(request.params.name).Dto;
    return {
      ...result,
      fields: Object.keys(result.fields).map((k) => ({ name: k, type: result.fields[k] })),
    };
  }

  @Handler("POST")
  async Post(request: Hapi.Request, h: Hapi.ResponseToolkit, _: Error | undefined, data: unknown) {
    Assert(IsPostBlockType, data);

    const fields: Record<string, DataType> = {};
    for (const field of data.fields) fields[field.name] = field.type;
    new Template(data.name, { fields, template: data.template }).Commit();

    return { success: true };
  }

  @Handler("PUT", "/{name}")
  async Put(request: Hapi.Request, h: Hapi.ResponseToolkit, _: Error | undefined, data: unknown) {
    Assert(IsPutBlockType, data);

    const item = new Template(request.params.name);
    const fields: Record<string, DataType> = {};
    for (const field of data.fields) fields[field.name] = field.type;
    item.fields = fields;
    item.template = data.template;
    item.Commit();

    return { success: true };
  }
}
