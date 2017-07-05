import * as vscode from 'vscode';
import { prior, variablePriorMap, parseVariableByPrior } from './utils';

class testItem extends vscode.CompletionItem {
  constructor(label, kind) {
    super(label, kind);
    this.label = label;
    this.kind = kind;
    this.documentation = "ASdasdasda"
  }
}
class Comppletor {
  variableFiles: string[]
  prior: prior
  variablePriorMap: variablePriorMap
  constructor(variableFiles: string[], prior: prior) {
    this.variableFiles = variableFiles;
    this.prior = prior;
  }

  async initialVariables() {
    this.variablePriorMap = await parseVariableByPrior(this.variableFiles, this.prior);
  }

  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position){
    const textCurrentLine = document.getText(document.lineAt(position).range);
    if (!this.variablePriorMap) {
      // await this.initialVariables();
    }
    console.log(textCurrentLine);
    return [new testItem("#111", 15), new testItem("#2222", 15)];
    // return new Promise<vscode.CompletionItem[]>((resolve) => {
    //   resolve([new vscode.CompletionItem("111"), new vscode.CompletionItem("2222")]);
    // });
  }

  resolveCompletionItem() {
    return new testItem("#111", 15);
  }

  getVariables(text: string): Thenable<vscode.CompletionItem[]> {
    console.log(text);
    return new Promise((resolve, reject) => {
      resolve([new vscode.CompletionItem("#111", 15), new vscode.CompletionItem("#2222", 15)]);
    });
  }
}


export default Comppletor;