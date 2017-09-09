import { Position, Range, window, TextEditor, TextDocument, TextEditorEdit } from 'vscode';
import { parseVariableByPrior, readFile } from './utils';
import { Prior, VariablePriorMap, ColorValueToName, Config } from './delcarations';

export class Replacer {
  private variableFiles: string[];
  private prior: Prior;
  private unReplaceWarn: boolean;
  private variablePriorMap: VariablePriorMap;

  constructor(config: Config) {
    this.variableFiles = config.variableFiles;
    this.prior = config.prior;
    this.unReplaceWarn = config.unReplaceWarn;
    this.variablePriorMap = {};
  }

  public async replaceFile(): Promise<void> {
    try {
      await this.initialVariable();
    } catch (err) {
      console.error(err);
    }
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
    let unReplacedCount: number = 0;
    const replaced: string = content.replace(reg, (match: string) => {
      const name: string = this.findVariableName(match.toUpperCase());
      if (name) {
        return name;
      } else {
        unReplacedCount ++;

        return match;
      }
    });

    activeTextEditor.edit((textEditor: TextEditorEdit) => {
      textEditor.replace(range, replaced);
      if (this.unReplaceWarn && unReplacedCount > 0) {
        window.showWarningMessage(`有${unReplacedCount}个颜色值没有找到对应的变量`);
      }
    });
  }

  private async initialVariable(): Promise<void> {
    try {
      this.variablePriorMap = await parseVariableByPrior(this.variableFiles, this.prior);
    } catch (err) {
      console.error(err);
    }
  }

  private findVariableName(value: string): string | undefined {
    for (let priorWeight: number = this.prior.length; priorWeight > -1; priorWeight--) {
      const valueToName: ColorValueToName = this.variablePriorMap[priorWeight];
      const variableName: string | undefined = valueToName && valueToName[value];
      if (variableName) {
        return variableName;
      }
    }

    return undefined;
  }
}
