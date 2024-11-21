export type JsonRecord = { [key: string]: JsonType };
export type JsonType =
  | string
  | number
  | boolean
  | null
  | JsonRecord
  | Array<JsonType>;

export type ClientAssignedFeatureFlag = {
  key: string;
  variants: Record<string, number>;
  payload?: JsonType;
};
