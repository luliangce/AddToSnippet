/**NQDA
 * @author Lu
 * @email luliangce@gmail.com
 * @create date 2018-12-11 23:54:03
 * @modify date 2018-12-11 23:57:51
 * @desc beware that vscode-JSON-config files support comments.
 * so i have to define a JSONWithComment Reader and try not to 
 * modify them when add a new snippet
 * NQDA
*/


function getBoolMap(data: string): boolean[] {
    let inCommnet: boolean = false;
    let commentEntry: string | undefined;
    let cache: string = "";
    let map: boolean[] = []
    for (let i = 0; i < data.length; i++) {
        let next2Char: string = data.slice(i, i + 2);
        //if this char is comment
        if (inCommnet) {
            map.push(false);
            //exit comment
            if (commentEntry === "//") {
                inCommnet = false;
                switch (true) {
                    case data[i] === "\n":
                        break;
                    case next2Char === "\r\n":
                        i++;
                        map.push(false);
                        break;
                    case data[i] === "\r":
                        break;

                    default:
                        inCommnet = true;
                }

            } else if (next2Char === "*/") {
                inCommnet = false;
                map.push(false);
                i++;
            }

            continue;
        }
        //go in comment
        if (cache.length === 0) {
            if (next2Char === "//" || next2Char === "/*") {
                inCommnet = true;
                commentEntry = next2Char;
                map.push(false, false);
                i++;
                continue;
            }
        }

        if (cache.length > 0 && data[i] === "\\") {
            map.push(true, true);
            i++;
            continue;
        }


        if (data[i] === "'" || data[i] === '"') {
            if (data[i] === cache) {
                cache = "";
            } else {
                cache = data[i]
            }
        }
        map.push(true)
    }
    return map;
}

export function Strip(data: string): object {
    let bm: boolean[] = getBoolMap(data);
    let retString: string = "";
    for (let i = 0; i < data.length; i++) {
        if (bm[i]) {
            retString += data[i]
        }
    }
    return JSON.parse(retString);
}

export function LastRightBraketIndex(data: string): number {
    let bm: boolean[] = getBoolMap(data);
    for (let i = data.length - 1; i >= 0; i--) {
        if (bm[i]) {
            if (data[i] === "}") {
                return i;
            }
        }
    }
    return -1;
}
