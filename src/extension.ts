'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Replacer } from './replacer';
import { Prior } from './delcarations';

// import Completor from './completor';
const path: any = require('path');

const CONFIG_NAME: string = 'colorReplace';
const COMMAND: string = 'colorReplace';
export function activate(context: vscode.ExtensionContext): void {
    const rootPath: string | undefined = vscode.workspace.rootPath;
    const workspaceConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(CONFIG_NAME);
    const variableFiles: string[] = workspaceConfig.get('variableFiles', []).map((p: string) => path.join(rootPath, p));
    const prior: Prior = workspaceConfig.get('prior', []);

    const disposable: vscode.Disposable = vscode.commands.registerCommand(`extension.${COMMAND}`, () => {
        if (!rootPath) {
            return;
        }
        const repleacer: Replacer = new Replacer(variableFiles, prior);
        repleacer.replaceFile();
    });

    // const completor = new Completor(variableFiles, prior);
    // const completion = vscode.languages.registerCompletionItemProvider('*', completor, "#")
    // console.log(completor);
    context.subscriptions.push(disposable);
    // context.subscriptions.push(vscode.languages.registerCompletionItemProvider('*', completor, "#"));
}
