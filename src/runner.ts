import * as vscode from "vscode";
import * as micromatch from "micromatch";

export default class Runner {
    private terminal: vscode.Terminal | null;
    private editor: vscode.TextEditor | undefined;
    private lastCommand: string | null;

    constructor() {
        this.terminal = null;
        this.editor = vscode.window.activeTextEditor;
        this.lastCommand = null;

        vscode.window.onDidCloseTerminal(this.onTerminalClose.bind(this));
        vscode.window.onDidChangeActiveTextEditor(
            this.onEditorChange.bind(this)
        );
    }

    public run(): void {
        if (this.canRunCommand()) {
            const filePath = this.getCurrentFilePath();
            if (filePath) {
                const isTestFile = this.isTestFile(filePath);

                if (isTestFile) {
                    this.setupTerminal();
                    const command = this.getCommand(filePath);
                    this.runCommand(command);
                } else if (this.lastCommand !== null) {
                    this.setupTerminal();
                    this.runCommand(this.lastCommand);
                }
            }
        }
    }

    private onTerminalClose(terminal: vscode.Terminal): void {
        if (this.terminal) {
            if (terminal.processId === this.terminal.processId) {
                this.terminal = null;
            }
        }
    }

    private onEditorChange(editor: vscode.TextEditor | undefined) {
        this.editor = editor;
    }

    private setupTerminal(): void {
        if (this.terminal === null) {
            this.terminal = vscode.window.createTerminal("tap");
        }
        vscode.commands.executeCommand("workbench.action.terminal.clear");
        this.terminal.show(true);
    }

    private getCurrentFilePath(): string | null {
        return this.editor ? this.editor.document.fileName : null;
    }

    private canRunCommand(): boolean {
        return this.editor ? !this.editor.document.isUntitled : false;
    }

    private isTestFile(filePath: string): boolean {
        const config = vscode.workspace.getConfiguration("node-tap");
        const testFilePatterns = config.get<Array<string>>("testFilePatterns");

        if (testFilePatterns) {
            return micromatch.any(filePath, testFilePatterns, {
                matchBase: true
            });
        }
        return false;
    }

    private getCommand(filePath: string | null): string {
        return `npx tap ${filePath}`;
    }

    private runCommand(command: string) {
        if (this.terminal) {
            this.terminal.sendText(command);
            this.lastCommand = command;
        }
    }
}
