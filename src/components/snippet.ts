/**
 * @author Lu
 * @email luliangce@gmail.com
 * @create date 2018-12-09 18:55:18
 * @modify date 2018-12-11 23:42:03
 * @desc this file define a basic class for a snippet.
*/

import * as os from "os";
import * as process from "process";
import * as fs from "fs";
import * as path from 'path';
import * as jp from "jsonc-parser";
class Snippet {
    name: string | undefined;
    prefix: string | undefined;
    body: string[];
    description: string | undefined;
    nameSet: string[] = [];
    private _fileExists = false; // language file 
    //initialize an instance by user selected text
    constructor(public rawBody: string, public language: string) {
        if (rawBody.length === 0) {
            throw new Error("Can not generate a snippet from empty string");
        }
        this.body = this.rawBody.split(/(?:\r\n|\r|\n)/);
        //load user's snippet-name-list
        this._LoadNamesAlreadyExists();
    }

    private _LoadNamesAlreadyExists() {

        let data: string;
        if (fs.existsSync(this.userSnippetFilePath)) {
            this._fileExists = true;
            data = fs.readFileSync(this.userSnippetFilePath, { encoding: "utf-8" })
        } else {
            data = "{}";
        }
        for (let name in jp.parse(data)) {
            this.nameSet.push(name)
        }
    }

    //check whether snippet is already exists
    nameIsOk(name: string = ""): boolean {
        let N: string | undefined = name === "" ? this.name : name;
        if (!N) {
            return true;
        }
        return this.nameSet.indexOf(N) === -1;
    }

    saveToUserSnippet(): boolean {
        if (!this.nameIsOk) {
            return false;
        }
        let data: string
        if (!this._fileExists) {
            data = '{}'
        } else {
            data = fs.readFileSync(this.userSnippetFilePath, { encoding: "utf-8" })
        }
        let toWrite: string
        toWrite = jp.applyEdits(data, jp.modify(data, [String(this.name)], {
            prefix: this.prefix,
            body: this.body,
            description: this.description
        }, { formattingOptions: { tabSize: 2 } }))
        fs.writeFileSync(this.userSnippetFilePath, toWrite)
        return true;

    }

    get userSnippetFilePath(): string {
        let platform: string = os.platform();
        let AppDataPath: string;
        switch (platform) {
            case 'win32':
                AppDataPath = process.env['VSCODE_APPDATA'] || process.env['APPDATA'] || path.join(process.env['USERPROFILE'] || "", 'AppData', 'Roaming');
                break;
            case 'darwin':
                AppDataPath = process.env['VSCODE_APPDATA'] || path.join(os.homedir(), 'Library', 'Application Support');
                break;
            case 'linux':
                AppDataPath = process.env['VSCODE_APPDATA'] || process.env['XDG_CONFIG_HOME'] || path.join(os.homedir(), '.config');
                break;
            default: throw new Error('Platform not supported');
        }
        return path.join(AppDataPath, "Code", "User", "snippets", `${this.language}.json`)
    }

}



export default Snippet;