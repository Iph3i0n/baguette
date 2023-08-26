import Hapi from "@hapi/hapi";

import Controller, { Handler } from "../server";
import { All } from "../jsonified";
import { Author } from "../models";
import { Assert, IsObject, IsString, Optional } from "@ipheion/safe-type";

const IsPostAuthor = IsObject({
  slug: IsString,
  name: IsString,
  dob: Optional(IsString),
  job_title: Optional(IsString),
});

const IsPutAuthor = IsObject({
  name: IsString,
  dob: Optional(IsString),
  job_title: Optional(IsString),
});

export default class AuthorsController extends Controller {
  constructor() {
    super("/api/authors");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return All(Author);
  }

  @Handler("GET", "/{slug}")
  async GetSpecifc(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return new Author(request.params.slug).Dto;
  }

  @Handler("POST")
  async Post(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const data = request.payload;
    Assert(IsPostAuthor, data);
    new Author(data.slug, { name: data.name, dob: data.dob ? new Date(data.dob) : undefined, job_title: data.job_title || undefined }).Commit();

    return { success: true };
  }

  @Handler("PUT", "/{slug}")
  async Put(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const data = request.payload;
    Assert(IsPutAuthor, data);

    const item = new Author(request.params.slug);
    item.name = data.name;
    item.dob = data.dob ? new Date(data.dob) : undefined;
    item.job_title = data.job_title || undefined;
    item.Commit();

    return { success: true };
  }
}
