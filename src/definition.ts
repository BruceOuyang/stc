import Logs from "./console.ts";
import {
  IDefaultObject,
  ISwaggerDefinitionProperties,
  ISwaggerDefinitionPropertiesItems,
  ISwaggerResultDefinitions,
  propertyType,
} from "./swagger.ts";

/**
 * 生成注释
 * @param comment - 注释描述
 * @param isIndent - 缩进
 * @returns
 */
const generateComment = (comment: string, isIndent = true) => {
  const indent = isIndent ? "\t" : "";

  return comment
    ? `
${indent}/**
${indent} * ${comment}
${indent} */`
    : "";
};

/**
 * 获取定义的名称
 * @param name - 定义的名称
 * @param isDefinition - 是否为定义
 * @returns
 */
const getDefinitionName = (name: string, isDefinition?: boolean): string => {
  const genericKey = ["T", "K", "U"];
  const keyLength = genericKey.length;

  name = name.replace("#/definitions/", "");

  // 处理泛型
  const newName = name.replace(/«(.*)?»/g, (_key: string, _value: string) => {
    const str = getDefinitionName(_value, isDefinition);

    // 定义的情况下，需要将具体名称换成 T、K、U...
    if (isDefinition) {
      const arr = str.split(/,\s*/g).map((_n: string, index: number) => {
        let newKey = genericKey[index % keyLength];
        // 当超过预设泛型 key 长度，自动加数字
        if (index >= keyLength) {
          newKey = newKey + Math.ceil((index - keyLength) / keyLength);
        }

        return newKey;
      });

      return `<${arr.join(", ")}>`;
    }

    return `<${str}>`;
  });

  return newName;
};

/**
 * 转换为 TypeScript 类型
 * @param prop - 属性基础类型
 * @returns
 */
const convertType = (prop: ISwaggerDefinitionProperties): string => {
  // 首先判断 type 是否定义，其次判断 $ref 是否定义
  const type = prop.type ?? prop.$ref ?? "any";

  switch (type) {
    case "integer":
      return "number";
    case "array": {
      const propItem = prop.items;

      if (propItem?.type) {
        const childType = convertType(propItem);

        return `${childType}[]`;
      }

      if (propItem?.$ref) {
        const name = getDefinitionName(propItem.$ref);
        const value = `${name}[]`;

        return value;
      }

      return "any[]";
    }
    case "object":
      return "IDefaultObject";
    default: {
      // 自定义类型
      if (type.includes("definitions")) {
        const name = getDefinitionName(type);

        return name;
      }

      return type;
    }
  }
};

const getDefinitionProperty = (defItem: ISwaggerResultDefinitions): string => {
  if (defItem.type !== "object") {
    Logs.error("无法解析当前对象");
    return "";
  }

  const props = defItem.properties;

  const res = Object.keys(props).reduce((prev, current) => {
    const prop = props[current];

    // 必填属性
    const isRequired = defItem.required?.includes(current);

    const propName = current + (isRequired ? "" : "?");
    const propType = convertType(prop);
    const comment = generateComment(prop.description ?? "");

    prev.splice(
      -1,
      0,
      `${comment}\n\t${propName}: ${propType}`,
    );
    return prev;
  }, ["{", "\n}"]);

  return res.join("");
};

export const generateDefinition = (
  definitions: IDefaultObject<ISwaggerResultDefinitions>,
) => {
  const defMap = new Map<string, string>();

  Object.keys(definitions).forEach((key) => {
    const name = getDefinitionName(key, true);

    const isExistName = defMap.has(name);
    if (isExistName) return;

    const defItem = definitions[key];
    const props = getDefinitionProperty(defItem);
    console.log("======================" + name);
    console.log(props);
    // 存储到 map 中，防止重复生成
    defMap.set(name, props);
  });
};