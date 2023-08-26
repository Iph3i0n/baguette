import Hapi from "@hapi/hapi";

import { Handler } from "../server";
import Controller from "../server/controller";
import { Author, Template, DataTypes, Page, Tag, Series } from "../models";
import { All } from "../jsonified";

export default class AppData extends Controller {
  constructor() {
    super("/api/app-data");
  }

  @Handler("GET")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return {
      data_types: DataTypes,
      authors: All(Author),
      templates: All(Template),
      pages: All(Page),
      tags: All(Tag),
      series: All(Series),
    };
  }
}
