export type ValueToName = {
  [prop: string]: string;
};

export type VariablePriorMap = {
  [props: string]: ValueToName
};

export type Prior = (string | RegExp)[];
