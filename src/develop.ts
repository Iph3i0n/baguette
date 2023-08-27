import Hapi from "@hapi/hapi";

import AppData from "./controllers/app-data";
import AuthorsController from "./controllers/authors";
import TemplatesController from "./controllers/templates";
import FieldsController from "./controllers/fields";
import PagesController from "./controllers/pages";
import SitePageController from "./controllers/site-page";
import TagsController from "./controllers/tags";
import { Start } from "./server";
import SeriesController from "./controllers/series";
import ArticlesController from "./controllers/articles";

export async function StartDevelopmentServer() {
  Start(
    AppData,
    FieldsController,
    TemplatesController,
    AuthorsController,
    TagsController,
    SitePageController,
    SeriesController,
    ArticlesController,
    PagesController
  );

  const server = Hapi.server({
    port: 3001,
  });

  await server.register(require("@hapi/inert"));

  server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "./site",
        redirectToSlash: true,
      },
    },
  });

  server.start().then(() => console.log("Preview server started"));
}
