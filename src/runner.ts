import * as vscode from "vscode";

export default class Runner {
    private terminal: vscode.Terminal | null;
    private editor: vscode.TextEditor | undefined;

    constructor() {
        this.terminal = null;
        this.editor = vscode.window.activeTextEditor;

        vscode.window.onDidCloseTerminal(this.onTerminalClose.bind(this));
        vscode.window.onDidChangeActiveTextEditor(
            this.onEditorChange.bind(this)
        );
    }

    public run(): void {
        if (this.canRunCommand()) {
            this.setupTerminal();
            const filePath = this.getCurrentFilePath();
            const command = this.getCommand(filePath);
            this.runCommand(command);
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

    private getCommand(filePath: string | null): string {
        return `tap ${filePath}`;
    }

    private runCommand(command: string) {
        if (this.terminal) {
            this.terminal.sendText(command);
        }
    }
}
