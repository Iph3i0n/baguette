import { Assert, IsDate, IsOneOf, IsRecord, IsString, IsType, Optional } from "@ipheion/safe-type";
import Jsonified, { Child, Children, Serialisable, ValidJsonRecord } from "./jsonified";
import Fs from "fs-extra";
import Path from "path";

export const DataTypes = ["text", "rich_text", "boolean", "number", "image"] as const;

export const IsDataType = IsOneOf(...DataTypes);

export type DataType = IsType<typeof IsDataType>;

export class Template extends Jsonified {
  constructor(id: string, data?: ValidJsonRecord) {
    if (data?.template) {
      const code_path = Path.join("./TemplateCode", id + ".html");
      Fs.outputFileSync(code_path, data.template.toString());
      delete data.template;
      data.__template = code_path;
    }

    super(id, data);
  }

  @Serialisable(IsRecord(IsString, IsDataType))
  accessor fields!: Record<string, DataType>;

  @Serialisable(IsString)
  accessor __template!: string;

  get template() {
    return Fs.readFileSync(this.__template, "utf-8");
  }

  set template(value: string) {
    const code_path = Path.join("./TemplateCode", this.physical_id + ".html");
    Fs.outputFileSync(code_path, value);
    this.__template = code_path;
  }

  get Dto() {
    return {
      name: this.physical_id,
      fields: this.fields,
      template: this.template,
    };
  }
}

export class Tag extends Jsonified {
  @Serialisable(IsString)
  accessor name!: string;

  @Serialisable(IsDate)
  accessor created_date!: Date;

  get Dto() {
    return {
      slug: this.physical_id,
      name: this.name,
      created_date: this.created_date,
    };
  }
}

export class Author extends Jsonified {
  @Serialisable(IsString)
  accessor name!: string;

  @Serialisable(Optional(IsDate))
  accessor dob!: Date | undefined | null;

  @Serialisable(Optional(IsString))
  accessor job_title: string | undefined | null;

  get Dto() {
    return {
      slug: this.physical_id,
      name: this.name,
      dob: this.dob,
      job_title: this.job_title,
    };
  }
}

export class Page extends Jsonified {
  constructor(id: string, data?: ValidJsonRecord) {
    if (data?.content) {
      const content = data.content;
      delete data.content;
      data.__content = {};
      Assert(IsRecord(IsString, IsString), content);
      for (const key in content) {
        const input = Path.join("./PageContent", id, key + ".html");
        Fs.outputFileSync(input, content[key]);
        data.__content[key] = input;
      }
    }

    super(id, data);
  }

  @Serialisable(IsString)
  accessor title!: string;

  @Serialisable(IsString)
  accessor url!: string;

  @Serialisable(IsDate)
  accessor publish_date!: Date;

  @Child(Author)
  accessor author!: Author;

  @Children(Tag)
  accessor tags!: Array<Tag>;

  @Child(Template)
  accessor template!: Template;

  @Serialisable(IsRecord(IsString, IsString))
  accessor __content!: Record<string, string>;

  get content() {
    const result: Record<string, string> = {};
    for (const key in this.__content) {
      result[key] = Fs.readFileSync(this.__content[key], "utf-8");
    }

    return result;
  }

  set content(content: Record<string, string>) {
    const result: Record<string, string> = {};
    Assert(IsRecord(IsString, IsString), content);
    for (const key in content) {
      const input = Path.join("./PageContent", this.physical_id, key + ".html");
      Fs.outputFileSync(input, content[key]);
      result[key] = input;
    }

    this.__content = result;
  }

  get Dto() {
    return {
      slug: this.physical_id,
      url: this.url,
      title: this.title,
      publish_date: this.publish_date,
      author: this.author.Dto,
      tags: this.tags.map((t) => t.Dto),
      template: this.template.Dto,
      content: this.content,
    };
  }
}

export class Article extends Jsonified {
  constructor(id: string, data?: ValidJsonRecord) {
    if (data?.content) {
      const content = data.content;
      delete data.content;
      data.__content = {};
      Assert(IsRecord(IsString, IsString), content);
      for (const key in content) {
        const input = Path.join("./ArticleContent", id, key + ".html");
        Fs.outputFileSync(input, content[key]);
        data.__content[key] = input;
      }
    }

    super(id, data);
  }

  @Serialisable(IsString)
  accessor title!: string;

  @Serialisable(IsDate)
  accessor publish_date!: Date;

  @Children(Tag)
  accessor tags!: Array<Tag>;

  @Child(Author)
  accessor author!: Author;

  @Child(Template)
  accessor template!: Template;

  @Serialisable(IsRecord(IsString, IsString))
  accessor __content!: Record<string, string>;

  get content() {
    const result: Record<string, string> = {};
    for (const key in this.__content) {
      result[key] = Fs.readFileSync(this.__content[key], "utf-8");
    }

    return result;
  }

  set content(content: Record<string, string>) {
    const result: Record<string, string> = {};
    Assert(IsRecord(IsString, IsString), content);
    for (const key in content) {
      const input = Path.join("./ArticleContent", this.physical_id, key + ".html");
      Fs.outputFileSync(input, content[key]);
      result[key] = input;
    }

    this.__content = result;
  }

  get Dto() {
    return {
      slug: this.physical_id,
      title: this.title,
      publish_date: this.publish_date,
      tags: this.tags.map((t) => t.Dto),
      author: this.author.Dto,
      template: this.template.Dto,
      content: this.content,
    };
  }
}

export class Series extends Jsonified {
  constructor(id: string, data?: ValidJsonRecord) {
    if (data?.content) {
      const content = data.content;
      delete data.content;
      data.__content = {};
      Assert(IsRecord(IsString, IsString), content);
      for (const key in content) {
        const input = Path.join("./SeriesContent", id, key + ".html");
        Fs.outputFileSync(input, content[key]);
        data.__content[key] = input;
      }
    }

    super(id, data);
  }

  @Serialisable(IsString)
  accessor title!: string;

  @Serialisable(IsString)
  accessor url!: string;

  @Child(Template)
  accessor template!: Template;

  @Serialisable(IsRecord(IsString, IsString))
  accessor __content!: Record<string, string>;

  get content() {
    const result: Record<string, string> = {};
    for (const key in this.__content) {
      result[key] = Fs.readFileSync(this.__content[key], "utf-8");
    }

    return result;
  }

  set content(content: Record<string, string>) {
    const result: Record<string, string> = {};
    Assert(IsRecord(IsString, IsString), content);
    for (const key in content) {
      const input = Path.join("./SeriesContent", this.physical_id, key + ".html");
      Fs.outputFileSync(input, content[key]);
      result[key] = input;
    }

    this.__content = result;
  }

  @Child(Template)
  accessor item_template!: Template;

  @Children(Article)
  accessor articles!: Array<Article>;

  get Dto() {
    return {
      slug: this.physical_id,
      title: this.title,
      url: this.url,
      content: this.content,
      template: this.template.Dto,
      item_template: this.item_template.Dto,
    };
  }
}
