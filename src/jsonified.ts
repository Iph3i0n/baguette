import fs from "fs-extra";
import path from "path";
import {
  Assert,
  Checker,
  DoNotCare,
  IsArray,
  IsInstanceOf,
  IsRecord,
  IsString,
  IsUnion,
} from "@ipheion/safe-type";

const GetData = Symbol();
const SetData = Symbol();
const TypeMap = Symbol();

type Constructor<T> = new (...args: any[]) => T;

interface ValidJsonRecord extends Record<string, ValidJsonValue> {}
interface ValidJsonArray extends Array<ValidJsonValue> {}
type ValidJsonValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | ValidJsonRecord
  | ValidJsonArray
  | Jsonified;

type ValidJson = ValidJsonArray | ValidJsonRecord;

type DataType<T> = [
  new (...args: any[]) => T,
  (data: string) => T,
  (data: T) => string
];

const data_types: Record<string, DataType<any>> = {
  Date: [
    Date,
    (data: string) => new Date(data),
    (data: Date) => data.toISOString(),
  ],
};

const IsValidJson = IsUnion(IsArray(DoNotCare), IsRecord(IsString, DoNotCare));

const data_dir = process.env.DATA_DIR ?? "./";

type Readable<T extends Jsonified = Jsonified> = new (id: string) => T;

export default abstract class Jsonified {
  readonly #id: string;
  readonly #data: ValidJsonRecord = {};
  readonly #dir: string = data_dir;

  #processed_data: ValidJsonRecord | undefined;

  readonly [TypeMap]: Record<string, Readable> = {};

  constructor(id: string, data?: ValidJsonRecord) {
    this.#id = id;

    if (data)
      if (fs.pathExistsSync(this.#location))
        throw new Error(
          "Attempting to initialise data when it is already saved to disk"
        );
      else for (const key in data) this[SetData](key, data[key]);
    else this.#data = JSON.parse(fs.readFileSync(this.#location, "utf-8"));
  }

  get physical_id() {
    return this.#id;
  }

  get physical_name() {
    const prototype = Object.getPrototypeOf(this);
    return prototype.constructor.name;
  }

  get #location() {
    return path.join(this.#dir, this.physical_name, this.#id + ".json");
  }

  #to_read(key: string, value: ValidJsonValue): any {
    if (typeof value !== "string") {
      if (typeof value === "object")
        if (Array.isArray(value))
          return value.map((d) => this.#to_read(key, d));
        else {
          const result: any = {};
          for (const lower_key in value)
            result[lower_key] = this.#to_read(key, (value as any)[lower_key]);
          return result;
        }

      return value;
    }

    if (value.startsWith("::CHILD_INFO::")) {
      const [_1, _2, id] = value.split("::");
      const creator = this[TypeMap][key];
      return new creator(id);
    }

    if (value.startsWith("::TYPE_INFO::")) {
      const [_1, _2, type, data] = value.split("::");

      const match = data_types[type];
      if (match) return match[1](data);
    }

    return value;
  }

  get #main_data() {
    if (!this.#processed_data) {
      const result: ValidJsonRecord = {};

      for (const key in this.#data)
        result[key] = this.#to_read(key, this.#data[key]);

      this.#processed_data = result;

      return result;
    }

    return this.#processed_data;
  }

  #to_write(data: ValidJsonValue): any {
    if (data instanceof Jsonified) {
      return `::CHILD_INFO::${data.#id}`;
    }

    for (const label in data_types) {
      const [Target, _, create] = data_types[label];
      if (data instanceof Target)
        return `::TYPE_INFO::${label}::${create(data)}`;
    }

    if (typeof data === "object")
      if (Array.isArray(data)) return data.map((d) => this.#to_write(d));
      else {
        const result: any = {};
        for (const key in data)
          result[key] = this.#to_write((data as any)[key]);
        return result;
      }

    return data;
  }

  *#get_children(start: ValidJson): Generator<Jsonified> {
    for (const item of Array.isArray(start) ? start : Object.values(start))
      if (typeof item !== "object") continue;
      else if (item instanceof Jsonified) yield item;
      else if (IsValidJson(item)) yield* this.#get_children(item);
  }

  [SetData](key: string, data: ValidJsonValue) {
    Assert(IsRecord(IsString, DoNotCare), this.#data);
    this.#data[key] = this.#to_write(data);
    if (!this.#processed_data) {
      this.#main_data;
      if (!this.#processed_data) throw new Error("Should not be reachable");
    }

    this.#processed_data[key] = data;
  }

  [GetData]<T>(key: string, checker: Checker<T>): T {
    const item = this.#main_data[key];
    Assert(checker, item);
    return item;
  }

  Commit() {
    for (const child of this.#get_children(this.#main_data)) child.Commit();
    fs.outputFileSync(this.#location, JSON.stringify(this.#data, undefined, 2));
  }
}

export function Serialisable<T extends ValidJsonValue>(checker: Checker<T>) {
  return (
    _: ClassAccessorDecoratorTarget<Jsonified, T>,
    ctx: ClassAccessorDecoratorContext<Jsonified, T>
  ): ClassAccessorDecoratorResult<Jsonified, T> => {
    const name = ctx.name;
    if (typeof name === "symbol")
      throw new Error("Symbols may not be serialised");
    return {
      get() {
        return this[GetData](name, checker);
      },
      set(data) {
        this[SetData](name, data);
      },
    };
  };
}

export function Child<T extends Jsonified>(creator: Constructor<T>) {
  return (
    _: ClassAccessorDecoratorTarget<Jsonified, T>,
    ctx: ClassAccessorDecoratorContext<Jsonified, T>
  ): ClassAccessorDecoratorResult<Jsonified, T> => {
    const name = ctx.name;
    if (typeof name === "symbol")
      throw new Error("Symbols may not be serialised");

    ctx.addInitializer(function () {
      this[TypeMap][name] = creator;
    });

    return {
      get() {
        return this[GetData](name, IsInstanceOf(creator));
      },
      set(data) {
        this[SetData](name, data);
      },
    };
  };
}

export function Children<T extends Jsonified>(creator: Constructor<T>) {
  return (
    _: ClassAccessorDecoratorTarget<Jsonified, Array<T>>,
    ctx: ClassAccessorDecoratorContext<Jsonified, Array<T>>
  ): ClassAccessorDecoratorResult<Jsonified, Array<T>> => {
    const name = ctx.name;
    if (typeof name === "symbol")
      throw new Error("Symbols may not be serialised");

    ctx.addInitializer(function () {
      this[TypeMap][name] = creator;
    });

    return {
      get() {
        return this[GetData](name, IsArray(IsInstanceOf(creator)));
      },
      set(data) {
        this[SetData](name, data);
      },
    };
  };
}

export function All(target: Readable<Jsonified>) {
  if (!fs.pathExistsSync(path.join(data_dir, target.name))) return [];
  return fs
    .readdirSync(path.join(data_dir, target.name))
    .map((i) => i.replace(".json", ""));
}

export function Delete(item: Jsonified) {
  fs.rmSync(
    path.join(data_dir, item.physical_name, item.physical_id + ".json")
  );
}
