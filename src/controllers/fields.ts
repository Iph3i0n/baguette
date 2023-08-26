import Hapi from "@hapi/hapi";

import { Handler } from "../server";
import Controller from "../server/controller";
import { DataTypes } from "../models";

export default class FieldsController extends Controller {
  constructor() {
    super("/api/fields");
  }

  @Handler("GET", "/data-types")
  async Get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return DataTypes;
  }
}
