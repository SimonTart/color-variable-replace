'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Replacer from './replacer';
// import Completor from './completor';
const path = require('path');

const CONFIG_NAME: string = "colorReplace";
const COMMAND:string = "colorReplace"
export function activate(context: vscode.ExtensionContext) {
    const rootPath: string | undefined = vscode.workspace.rootPath;
    const workspaceConfig = vscode.workspace.getConfiguration(CONFIG_NAME);
    const variableFiles: string[] = workspaceConfig.get('variableFiles', []).map((p) => path.join(rootPath, p));
    const prior: any[] = workspaceConfig.get('prior', []);

    const disposable = vscode.commands.registerCommand(`extension.${COMMAND}`, () => {
        if (!rootPath) {
            return;
        }
        const repleacer:Replacer = new Replacer(variableFiles, prior);
        repleacer.replaceFile();
    });

    // const completor = new Completor(variableFiles, prior);
    // const completion = vscode.languages.registerCompletionItemProvider('*', completor, "#")
    // console.log(completor);
    
    context.subscriptions.push(disposable);
    // context.subscriptions.push(vscode.languages.registerCompletionItemProvider('*', completor, "#"));
}

// this method is called when your extension is deactivated
export function deactivate() {
}


