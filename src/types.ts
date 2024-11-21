export type JsonRecord = { [key: string]: JsonType };
export type JsonType =
  | string
  | number
  | boolean
  | null
  | JsonRecord
  | Array<JsonType>;

export interface ClientAssignedFeatureFlag {
  key: string;
  variants: Record<string, number>;
}

export type FlagValue = string | boolean | null;
export type FlagAssignments = { [key: string]: FlagValue };
