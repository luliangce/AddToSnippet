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
import { Strip, LastRightBraketIndex } from "./jsonUtils";
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
        let parsed = Strip(data);
        for (let name in parsed) {
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

    //save snippet to User Snippet
    //obviously,if this is the first snippet of language,just save it.
    //it not,append it.
    //but vscode snippet.json is supporting comment,and i have to keep them.
    //a shortcut to append this is insert new data to a 100% correct position
    //just before last "}",the real "}",not in comments
    saveToUserSnippet(): boolean {
        if (!this.nameIsOk) {
            return false;
        }
        if (!this._fileExists) {
            let toWrite = JSON.stringify(this.JSONify(), null, 2)
            fs.writeFileSync(this.userSnippetFilePath, toWrite)
            return true;
        }

        let data = fs.readFileSync(this.userSnippetFilePath, { encoding: "utf-8" })
        let appendString: string = this._appendString();
        let lrbi = LastRightBraketIndex(data);
        let toWrite = data.slice(0, lrbi) + appendString + data.slice(lrbi);
        fs.writeFileSync(this.userSnippetFilePath, toWrite)
        return true;

    }

    private _appendString(): string {
        let toAppend = JSON.stringify(this.JSONify(), null, 2)
        toAppend = toAppend.slice(1, -1); //delete barkets 
        if (this.nameSet.length > 0) {
            toAppend = "  ,\n" + toAppend;
        }
        return toAppend;
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

    JSONify(): object {
        if (!this.name) {
            return {}
        }
        interface Obj {
            [index: string]: any;
        }
        let ret: Obj = {}
        ret[this.name] = {
            "prefix": this.prefix,
            "body": this.body,
            "description": this.description

        };
        return ret;
    }
}



export default Snippet;