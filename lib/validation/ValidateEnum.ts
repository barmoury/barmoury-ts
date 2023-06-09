
import { Validator } from "./Validator";
import { BarmouryObject } from "../util/Types";
import { ControllersValidationMap, prepareValidationSchema } from "./Validate";
import { FieldUtil } from "../util/FieldUtil";

export interface ValidateEnumAttributtes {

    enum: any;
    only?: string[];
    groups?: string[];
    excludes?: string[];

}

export function ValidateEnum(options: ValidateEnumAttributtes) {

    return function (target: any, propertyKey: string) {
        const groups = options.groups || ["CREATE"];
        const key = `${target.constructor}`;
        for (const group of groups) {
            prepareValidationSchema(key, propertyKey, target, group);
            const enums = Object.keys(options.enum).reduce((acc: BarmouryObject, key: string) => {
                if (!isNaN(Number(key))) return acc;
                if (options.only && !options.only.includes(key)) return acc;
                if (options.excludes && options.excludes.includes(key)) acc;
                const value = options.enum[key];
                const type = typeof value;
                if (!acc.type.includes(type)) acc.type.push(type);
                acc.enum.push(value);
                return acc;
            }, { type: [], enum: [] });
            ControllersValidationMap[key]["body"][group]["properties"][propertyKey]["type"] =
                FieldUtil.unique(FieldUtil.mergeArrays(ControllersValidationMap[key]["body"][group]["properties"][propertyKey]["type"], enums.type));
            if (!("enum" in ControllersValidationMap[key]["body"][group]["properties"][propertyKey])) {
                ControllersValidationMap[key]["body"][group]["properties"][propertyKey]["enum"] = enums.enum;
            } else {
                ControllersValidationMap[key]["body"][group]["properties"][propertyKey]["enum"] =
                    FieldUtil.unique(FieldUtil
                        .mergeArrays(ControllersValidationMap[key]["body"][group]["properties"][propertyKey]["enum"], enums.enum));
            }
        }
    };

}
