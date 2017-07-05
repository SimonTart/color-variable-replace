const fs = require('fs');

export interface nameToValue {
  [prop:string]:string
}

export interface valueToName {
  [prop: string]: string
}

export interface variablePriorMap {
  [props: string]: valueToName
}

export type prior  = (string|RegExp)[]


export function readFile(path: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function parseVariable(variableFiles: string[]){
  const reg: RegExp = /([a-zA-Z_\$][a-zA-Z0-9_\-\$]*)\s*=\s*(#(?:[\da-fA-F]{6}|[\da-fA-F]{3}))/g;
  const nameToValue:nameToValue = {};
  for (const path of variableFiles) {
    const content = await readFile(path);
    while (true) {
      const result = reg.exec(content);
      if (!result) {
        break;
      } else {
        nameToValue[result[1]] = result[2];
      }
    }
  }
  return new Promise<nameToValue>((resolve,reject) => {
    resolve(nameToValue);
  });
}

export function getPriorWeight(name: string, prior: prior):number {
  const priorItem = prior.find((p: string | Object) => {
    if (typeof p === "string" && name.indexOf(p) > -1) {
      return true;
    } else if (p instanceof RegExp && p.test(name)) {
      return true;
    } else {
      return false;
    }
  });

  if (!priorItem) {
    return 0
  } else {
    return prior.length - prior.indexOf(priorItem);
  }
}

export async function parseVariableByPrior(variableFiles: string[], prior: prior) {
  const nameToValue: nameToValue = await parseVariable(variableFiles);
  const variablePriorMap: variablePriorMap = {};
  for(const name in nameToValue) {
    const priorWeight: number = getPriorWeight(name, prior);
    const valueToName: valueToName = variablePriorMap[priorWeight] || {};
    valueToName[nameToValue[name]] = name;
    variablePriorMap[priorWeight] = valueToName;
  }
  return new Promise<variablePriorMap>((resolve) => {
    resolve(variablePriorMap);
  });
}