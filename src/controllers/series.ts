import Hapi from "@hapi/hapi";

import { All } from "../jsonified";
import { Series, Template } from "../models";
import { Handler } from "../server";
import Controller from "../server/controller";
import { Assert, IsObject, IsRecord, IsString } from "@ipheion/safe-type";

const IsPostSeries = IsObject({
  url: IsString,
  slug: IsString,
  title: IsString,
  template: IsString,
  content: IsRecord(IsString, IsString),
  item_template: IsString,
});

const IsPutSeries = IsObject({
  url: IsString,
  title: IsString,
  template: IsString,
  content: IsRecord(IsString, IsString),
  item_template: IsString,
});

export default class SeriesController extends Controller {
  constructor() {
    super("/api/series");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    return All(Series);
  }

  @Handler("POST")
  async Post(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsPostSeries, data);
    const input = new Series(data.slug, {
      url: data.url,
      title: data.title,
      template: new Template(data.template),
      content: data.content,
      articles: [],
      item_template: new Template(data.item_template),
    });

    input.Commit();
    return { success: true };
  }

  @Handler("GET", "/{id}")
  async GetItem(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const response = new Series(request.params.id);
    return response.Dto;
  }

  @Handler("PUT", "/{id}")
  async Put(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsPutSeries, data);
    const input = new Series(request.params.id);
    input.url = data.url;
    input.title = data.title;
    input.template = new Template(data.template);
    input.content = data.content;
    input.item_template = new Template(data.item_template);

    input.Commit();
    return { success: true };
  }
}
