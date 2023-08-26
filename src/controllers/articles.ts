import Hapi from "@hapi/hapi";

import { Article, Author, Series, Tag, Template } from "../models";
import { Handler } from "../server";
import Controller from "../server/controller";
import { Assert, IsObject, IsRecord, IsString } from "@ipheion/safe-type";

const IsPostArticle = IsObject({
  slug: IsString,
  title: IsString,
  content: IsRecord(IsString, IsString),
  author: IsString,
  tags: IsString,
});

const IsPutArticle = IsObject({
  title: IsString,
  content: IsRecord(IsString, IsString),
  author: IsString,
  tags: IsString,
});

export default class ArticlesController extends Controller {
  constructor() {
    super("/api/series/{series}/articles");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    return new Series(request.params.series).articles.map((a) => a.physical_id);
  }

  @Handler("POST")
  async Post(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsPostArticle, data);
    const target = new Series(request.params.series);
    const input = new Article(data.slug, {
      title: data.title,
      publish_date: new Date(),
      author: new Author(data.author),
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .map((t) => new Tag(t)),
      template: target.template,
      content: data.content,
    });

    target.articles = [...target.articles, input];
    target.Commit();
    return { success: true };
  }

  @Handler("GET", "/{id}")
  async GetItem(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const response = new Article(request.params.id);
    return response.Dto;
  }

  @Handler("PUT", "/{id}")
  async Put(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsPutArticle, data);
    const input = new Article(request.params.id);
    input.title = data.title;
    input.author = new Author(data.author);
    input.tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .map((t) => new Tag(t));
    input.content = data.content;

    input.Commit();
    return { success: true };
  }
}
