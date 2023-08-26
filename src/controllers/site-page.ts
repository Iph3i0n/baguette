import Hapi from "@hapi/hapi";

import { Handler } from "../server";
import Controller from "../server/controller";
import { All } from "../jsonified";
import { Author, Page, Tag, Template } from "../models";
import { Assert, IsArray, IsObject, IsRecord, IsString } from "@ipheion/safe-type";

const IsPostPage = IsObject({
  slug: IsString,
  url: IsString,
  title: IsString,
  author: IsString,
  tags: IsString,
  template: IsString,
  content: IsRecord(IsString, IsString),
});

const IsPutPage = IsObject({
  url: IsString,
  title: IsString,
  author: IsString,
  tags: IsString,
  template: IsString,
  content: IsRecord(IsString, IsString),
});

export default class SitePageController extends Controller {
  constructor() {
    super("/api/pages");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return All(Page);
  }

  @Handler("POST")
  async Post(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsPostPage, data);
    const input = new Page(data.slug, {
      title: data.title,
      url: data.url,
      publish_date: new Date(),
      author: new Author(data.author),
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .map((t) => new Tag(t)),
      template: new Template(data.template),
      content: data.content,
    });

    input.Commit();
    return { success: true };
  }

  @Handler("GET", "/{id}")
  async GetItem(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const response = new Page(request.params.id);
    return response.Dto;
  }

  @Handler("PUT", "/{id}")
  async Put(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsPutPage, data);
    const input = new Page(request.params.id);
    input.title = data.title;
    input.url = data.url;
    input.author = new Author(data.author);
    input.tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .map((d) => new Tag(d));
    input.template = new Template(data.template);
    input.content = data.content;

    input.Commit();
    return { success: true };
  }
}
