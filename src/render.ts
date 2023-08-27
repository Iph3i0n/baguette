import { All } from "./jsonified";
import { Page, Series } from "./models";
import Mustache from "mustache";
import Fs from "fs-extra";

function ProcessUrl(url: string) {
  const input = url.endsWith("/") ? url + "index" : url;
  return `./site${input}.html`;
}

export async function RenderApp() {
  const pages = All(Page).map((p) => new Page(p));
  const series = All(Series).map((s) => new Series(s));

  for (const page of pages) {
    await Fs.outputFile(ProcessUrl(page.url), Mustache.render(page.template.template, { ...page.Dto, ...page.content }));
  }

  for (const item of series) {
    await Fs.outputFile(
      ProcessUrl(item.url),
      Mustache.render(item.template.template, {
        ...item.Dto,
        ...item.content,
        articles: item.articles.map((a) => ({ title: a.title, slug: a.physical_id, publish_date: a.publish_date })),
      })
    );

    for (const article of item.articles)
      await Fs.outputFile(
        ProcessUrl(item.url + "/" + article.physical_id),
        Mustache.render(article.template.template, {
          series: item.Dto,
          ...article.Dto,
          ...article.content,
        })
      );
  }

  if (await Fs.pathExists("./static")) await Fs.copy("./static", "./site/static");
}
