import { window, Position, Range } from 'vscode';
import { readFile, variablePriorMap, parseVariableByPrior } from './utils';

interface valueToName {
  [prop:string]:string
}

interface priorMap {
  [props:string]:valueToName
}

class Replacer {
  variableFiles:string[]
  prior:any[]
  variablePriorMap: variablePriorMap

  constructor(variableFiles:string[], prior:any[]) {
    this.variableFiles = variableFiles;
    this.prior = prior;
    this.variablePriorMap = {};
  }

  async initialVariable() {
    this.variablePriorMap = await parseVariableByPrior(this.variableFiles, this.prior);
  }

  async replace() {
    const activeTextEditor: any = window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const document = activeTextEditor.document;
    const start = new Position(0, 0);
    const end = new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    const range = new Range(start, end);
    const content:string = document.getText(range);

    const reg: RegExp = /#([\da-fA-F]{6}|[\da-fA-F]{3})/g;
    const replaced:string = content.replace(reg, (match) => {
      return this.findVariableName(match);
    });

    activeTextEditor.edit((textEditor) => {
      return textEditor.replace(range, replaced);
    })
  }

  findVariableName(value:string):string {
    for (let priorWeight = this.prior.length; priorWeight > -1; priorWeight--) {
      const valueToName:valueToName = this.variablePriorMap[priorWeight];
      const variableName:string|undefined = value && valueToName[value];
      if (variableName) {
        return variableName;
      }
    }
    return value;
  }

  async replaceFile() {
    await this.initialVariable();
    this.replace();
  }
}

export default Replacer;