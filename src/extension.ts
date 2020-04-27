'use strict';
import * as vscode from 'vscode';
import Snippet from './components/snippet';
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.AddToSnippet', async () => {
        let editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('please select a piece of code first!');
            return;
        }
        let body: string = editor.document.getText(editor.selection);
        let snippet: Snippet;
        try {
            snippet = new Snippet(body, editor.document.languageId);
        } catch (error) {
            vscode.window.showWarningMessage(error.message);
            return;
        }
        let name: string | undefined = await vscode.window.showInputBox({
            prompt: "input NAME",
            placeHolder: "Required. Esc to cancel",
            validateInput: (value: string): string => {
                if (snippet.nameIsOk(value)) {
                    return "";
                }
                return `${value} IS ALREADY EXISTED`;
            }
        });
        if (name === undefined) {
            vscode.window.showWarningMessage('canceled by user');
            return
        }
        snippet.name = name
        //default prefix is the first line of snippet body
        let prefix: string | undefined = await vscode.window.showInputBox({
            prompt: `input PREFIX`,
            placeHolder: `default: ${snippet.body[0]}`
        });
        snippet.prefix = prefix || snippet.body[0];

        snippet.description = await vscode.window.showInputBox({
            prompt: `input DESCRIPTION`,
            placeHolder: "defualt:(empty)",
        }) || "";
        snippet.saveToUserSnippet();
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}