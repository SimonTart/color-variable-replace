import { Position, Range, window, TextEditor, TextDocument, TextEditorEdit } from 'vscode';
import { parseVariableByPrior, readFile } from './utils';
import { Prior, VariablePriorMap, ValueToName } from './delcarations';

export class Replacer {
  private variableFiles: string[];
  private prior: Prior;
  private variablePriorMap: VariablePriorMap;

  constructor(variableFiles: string[], prior: Prior) {
    this.variableFiles = variableFiles;
    this.prior = prior;
    this.variablePriorMap = {};
  }

  public async replaceFile(): Promise<void> {
    await this.initialVariable();
    this.replace();
  }

  private async replace(): Promise<void> {
    const activeTextEditor: TextEditor = window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const document: TextDocument = activeTextEditor.document;
    const start: Position = new Position(0, 0);
    const end: Position = new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    const range: Range = new Range(start, end);
    const content: string = document.getText(range);

    const reg: RegExp = /#([\da-fA-F]{6}|[\da-fA-F]{3})/g;
    const replaced: string = content.replace(reg, (match: string) => {
      return this.findVariableName(match);
    });

    activeTextEditor.edit((textEditor: TextEditorEdit) => {
      return textEditor.replace(range, replaced);
    });
  }

  private async initialVariable(): Promise<void> {
    this.variablePriorMap = await parseVariableByPrior(this.variableFiles, this.prior);
  }

  private findVariableName(value: string): string {
    for (let priorWeight: number = this.prior.length; priorWeight > -1; priorWeight--) {
      const valueToName: ValueToName = this.variablePriorMap[priorWeight];
      const variableName: string | undefined = valueToName && valueToName[value];
      if (variableName) {
        return variableName;
      }
    }

    return value;
  }
}
