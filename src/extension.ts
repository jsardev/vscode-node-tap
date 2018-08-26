"use strict";

import * as vscode from "vscode";
import Runner from "./runner";

export function activate(context: vscode.ExtensionContext) {
    const runner = new Runner();

    const runTest = vscode.commands.registerCommand(
        "node-tap-runner.runTest",
        () => runner.run()
    );

    context.subscriptions.push(runTest);
}

export function deactivate() {}
