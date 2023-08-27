import Hapi from "@hapi/hapi";

import { Handler } from "../server";
import Controller from "../server/controller";
import { Author, Template, DataTypes, Page, Tag, Series } from "../models";
import { All } from "../jsonified";
import Fs from "fs-extra";
import Path from "path";
import { RenderApp } from "../render";
import { Assert, IsObject, IsOneOf, IsString, Optional } from "@ipheion/safe-type";
import path from "path";

const IsSiteSetup = IsObject({
  package_name: IsString,
  use_pages: Optional(IsOneOf("on", "off")),
});

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

  @Handler("POST", "/static", {
    payload: {
      output: "stream",
      parse: true,
      allow: "multipart/form-data",
      multipart: { output: "file" },
    },
  })
  async PostFile(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const file: any = (request.payload as any).file;
    await Fs.outputFile(Path.join("./static", file.filename), await Fs.readFile(file.path));
    return { url: `/static/${file.filename}` };
  }

  @Handler("POST", "/compile")
  async Compile(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    await RenderApp();
    return { success: true };
  }

  @Handler("POST", "/init")
  async Init(request: Hapi.Request, h: Hapi.ResponseToolkit, _: any, data: unknown) {
    Assert(IsSiteSetup, data);
    await Fs.copyFile(path.join(__dirname, "../../templates/.gitignore"), "./.gitignore");
    if (data.use_pages === "on") {
      await Fs.ensureDir("./.github/workflows");
      await Fs.copyFile(path.join(__dirname, "../../templates/pages.yml"), "./.github/workflows/pages.yml");
    }

    await Fs.outputJSON(
      "package.json",
      {
        name: data.package_name,
        version: "1.0.0",
        private: true,
        scripts: {
          build: "baguette render",
          dev: "baguette develop",
        },
        devDependencies: {
          "@ipheion/baguette": "0.0.2",
        },
      },
      { spaces: 2 }
    );
    return { success: true };
  }
}
