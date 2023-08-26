import Hapi from "@hapi/hapi";

import Controller, { Handler } from "../server";
import { All } from "../jsonified";
import { Tag } from "../models";
import { Assert, IsObject, IsString } from "@ipheion/safe-type";

const IsPostTag = IsObject({
  slug: IsString,
  name: IsString,
});

const IsPutTag = IsObject({
  name: IsString,
});

export default class TagsController extends Controller {
  constructor() {
    super("/api/tags");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return All(Tag);
  }

  @Handler("GET", "/{slug}")
  async GetSpecifc(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return new Tag(request.params.slug).Dto;
  }

  @Handler("POST")
  async Post(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const data = request.payload;
    Assert(IsPostTag, data);
    new Tag(data.slug, { name: data.name, created_date: new Date() }).Commit();

    return { success: true };
  }

  @Handler("PUT", "/{slug}")
  async Put(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const data = request.payload;
    Assert(IsPutTag, data);

    const item = new Tag(request.params.slug);
    item.name = data.name;
    item.Commit();

    return { success: true };
  }
}
