let columnHeadersEl = document.getElementById("column-headers");
let tableEl = document.getElementById("excel");


bodyArrays = [
    ['', ''],
    ['', '']
]

function getNextColumnName(name) {
    let base26Val = getBase26Val(name);
    return getColumnName(base26Val + 1);
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function getBase26Val(name) {
    let alphabetArray = Array.from(name);
    let base26Val = 0;
    for (let i = 0; i < alphabetArray.length; i++) {
        let val = ALPHABET.indexOf(alphabetArray[i]) + 1;
        base26Val += val * Math.pow(26, alphabetArray.length - i- 1);
    }

    return base26Val;
}

function getColumnName(base26) {
    if (base26 == 0) {
        console.error('0 ?!');
        return;
    }
    base26 = base26 - 1;
    let name = ''
    while (true){
        let remain = base26 % 26;
        base26 = Math.floor(base26 / 26);

        name = ALPHABET[remain] + name;
        if (base26 == 0) {
            break;
        }

        base26 = base26 - 1;
    }

    return name;
}

function sumHandler(e) {
    let value = e.srcElement.value;
    let sum = checkSumFunction(value);
    if (sum) {
        value = sum;
    }
    e.srcElement.value = value;
    let position = getPositionFromCell(e.srcElement);
    setValue(position, value);
}

function getIndex(node) {
    let nodeIndex = 0;
    while ((node = node.previousSibling) != null) {
        if (node.nodeName == "#text") {
            continue;
        }
        nodeIndex++;
    }
    return nodeIndex;
}

function getPositionFromCell(cell) {
    let td = cell.parentElement;
    let tr = td.parentElement;

    let tdIndex = getIndex(td);
    let trIndex = getIndex(tr);

    return [tdIndex - 1, trIndex - 1];
}

function checkSumFunction(value) {
    let matched = value.match(/^=SUM\(([A-Z]+\d+) *, *([A-Z]+\d+)\)$/);
    if (matched) {
        let left = matched[1];
        let right = matched[2];
        let leftValue = parseInt(getValue(left));
        let rightValue = parseInt(getValue(right));
        if (leftValue && rightValue) {
            return leftValue + rightValue;
        }

        return "## REF! ##";
    }
}

function getPosition(name) {
    let parsed = name.match(/([a-zA-Z]+)(\d+)/);
    let columnName = parsed[1].toUpperCase();
    let rowName = parsed[2];

    let columnNum = getBase26Val(columnName) - 1;
    let rowNum = Number(rowName) - 1;
    return [columnNum, rowNum];
}

function getValue(position) {
    let type = typeof position;
    if (type == 'string') {
        position = getPosition(position);
    }

    try {
        let value = bodyArrays[position[1]][position[0]];
        return value;
    } catch(err) {
        return undefined
    }
}

function setValue(position, value) {
    let type = typeof position;
    if (type == 'string') {
        position = getPosition(position);
    }

    try {
        bodyArrays[position[1]][position[0]] = value;
        return value;
    } catch(err) {
        return undefined
    }
}

function addColumn() {
    // header
    let indices = columnHeadersEl.children;
    let lastColumnHeaderEl = indices[indices.length - 1];
    let clone = lastColumnHeaderEl.cloneNode();
    let nextName = getNextColumnName(lastColumnHeaderEl.innerHTML);
    clone.innerHTML = nextName;
    columnHeadersEl.appendChild(clone);

    // body
    for (let i = 0; i < bodyArrays.length; i++) {
        bodyArrays[i].push('');
    }

    renderBody('ALL_ROW', 'ONLY_LAST_COLUMN');
}

function addRow() {
    let rowMax = bodyArrays[0].length;
    let newRowIndex = bodyArrays.length + 1;

    // body
    let newRow = Array.from({length: rowMax}, () => '')
    bodyArrays.push(newRow);

    // header
    let obj = {
        newRowIndex: newRowIndex,
        bodyCount: rowMax
    }

    renderBody('ONLY_LAST_ROW', 'ALL_COLUMN', obj);

}

function createDefaultTd() {
    let td = document.createElement('td');
    let textarea = document.createElement('textarea');
    textarea.setAttribute('rows', '1');
    textarea.onmouseleave = sumHandler
    td.appendChild(textarea);
    return td
}

function renderBody(rowType, columnType, obj) {
    if (rowType == 'ALL_ROW' && columnType == 'ONLY_LAST_COLUMN') {
        let children = tableEl.children;
        for (let i = 0; i < children.length; i++) {
            if (i == 0) {
                continue
            }
            let tr = children[i];
            let td = createDefaultTd();
            tr.appendChild(td);
        }
    } else if (rowType == 'ONLY_LAST_ROW' && columnType == 'ALL_COLUMN') {
        // index
        let children = tableEl.children;
        let firstRow = children[1];
        let rowIndexEl = firstRow.children[0];
        let clone = rowIndexEl.cloneNode();
        clone.innerHTML = obj.newRowIndex;

        let tr = document.createElement('tr');
        tr.append(clone);
        for (let i = 0; i < obj.bodyCount; i++) {
            let td = createDefaultTd();
            tr.append(td);
        }
        tableEl.appendChild(tr);
    }
}


let defaultTextAreas = document.getElementsByClassName("default-textarea");
for (let i = 0; i < defaultTextAreas.length; i++) {
    defaultTextAreas[i].onmouseleave = sumHandler;
}
