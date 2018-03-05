var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var contents_id = 0;
var line_break = 0;
var preformat_ltrim = 1;
var _symbol_anchor = '&dagger;';
var config = {
    // リスト構造の左マージン
    _ul_left_margin: 0,
    _ul_margin: 16,
    _ol_left_margin: 0,
    _ol_margin: 16,
    _dl_left_margin: 0,
    _dl_margin: 16
};
var msg_content_back_to_top = '<div class="jumpmenu"><a href="#navigator">&uarr;</a></div>';
function ltrim(stringToTrim, pattern) {
    if (pattern === void 0) { pattern = /^\s+/; }
    return stringToTrim.replace(pattern, "");
}
var exist_plugin_convert = function (uuu) { return false; };
function rtrim(stringToTrim, pattern) {
    if (pattern === void 0) { pattern = /\s+$/; }
    return stringToTrim.replace(pattern, "");
}
// Make heading string (remove heading-related decorations from Wiki text)
function make_heading(str, strip) {
    if (strip === void 0) { strip = true; }
    // Cut fixed-heading anchors
    var id = '';
    var matches = str.match(/^(\*{0,3})(.*?)\[#([A-Za-z][\w-]+)\](.*?)$/m);
    if (matches) {
        str = matches[2] + matches[4];
        var id_1 = matches[3];
    }
    else {
        str = str.replace(/^\*{0,3}/, '');
    }
    return id;
}
var hr = '<hr class="full_hr" />';
var strspn = function (str1, str2, start, lgth) {
    if (start === void 0) { start = 0; }
    var found;
    var stri;
    var strj;
    var j = 0;
    var i = 0;
    start = start < 0 ? (str1.length + start) : start;
    lgth = lgth ? ((lgth < 0) ? (str1.length + lgth - start) : lgth) : str1.length - start;
    str1 = str1.substr(start, lgth);
    for (var i_1 = 0; i_1 < str1.length; i_1++) {
        var found_1 = 0;
        stri = str1.substring(i_1, i_1 + 1);
        for (var j_1 = 0; j_1 <= str2.length; j_1++) {
            strj = str2.substring(j_1, j_1 + 1);
            if (stri === strj) {
                found_1 = 1;
                break;
            }
        }
        if (found_1 !== 1) {
            return i_1;
        }
    }
    return i;
};
var htmlsc = function (string) {
    return string.replace(/[&'`"<>]/g, function (match) {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        }[match];
    });
};
var _list_pad_str = function (list, padl, marl) {
    return " class=\"list" + list + "\" style=\"padding-left:" + padl + "px;margin-left:" + marl + "px\"";
};
function convert_html(lines) {
    contents_id = contents_id++;
    var body = new Body(contents_id);
    body.parse(lines);
    return body.toString();
}
// Returns inline-related object
var Factory_Inline = function (text) {
    // Check the first letter of the line
    if (text.slice(0, 1) === '~') {
        return new Paragraph(' ' + text.slice(1));
    }
    else {
        return new Inline(text);
    }
};
var Factory_DList = function (root, text) {
    var out = ltrim(text).split('|', 2);
    if (out.length < 2) {
        return Factory_Inline(text);
    }
    else {
        return new DList(out);
    }
};
// '|'-separated table
function Factory_Table(root, text) {
    var match = text.match(/^\|(.+)\|([hHfFcC]?)$/);
    if (!match) {
        return Factory_Inline(text);
    }
    else {
        return new Table(match);
    }
}
// Comma-separated table
/*function Factory_YTable(root, text){
    if (text === ',') {
        return Factory_Inline(text);
    } else {
        return new YTable(csv_explode(',', substr($text, 1)));
    }
}*/
var Factory_Div = function (root, text) {
    var matches = text.match(/^\#([^\(]+)(?:\((.*)\))?/);
    if (matches && exist_plugin_convert(matches[1])) {
        return new Div(matches);
    }
    return new Paragraph(text);
};
// Block elements
var BElement = /** @class */ (function () {
    function BElement() {
        this.elements = []; // References of childs
        this.last = this;
    }
    BElement.prototype.setParent = function (parent) {
        this.parent = parent;
    };
    BElement.prototype.add = function (obj) {
        if (this.canContain(obj)) {
            return this.insert(obj);
        }
        else {
            return this.parent.add(obj);
        }
    };
    BElement.prototype.insert = function (obj) {
        obj.setParent(this);
        this.elements.push(obj);
        return this.last = obj.last;
    };
    BElement.prototype.canContain = function (obj) {
        return true;
    };
    BElement.prototype.wrap = function (string, tag, param, canomit) {
        if (param === void 0) { param = ''; }
        if (canomit === void 0) { canomit = true; }
        return (canomit && string === '') ? '' :
            '<' + tag + param + '>' + string + '</' + tag + '>';
    };
    BElement.prototype.toString = function () {
        var ret = [];
        this.elements.forEach(function (val) {
            ret.push(val.toString());
        });
        return ret.join("\n");
    };
    BElement.prototype.dump = function (indent) {
        if (indent === void 0) { indent = 0; }
        var ret = ' '.repeat(indent) + this.constructor.name + "\n";
        indent += 2;
        this.elements.forEach(function (val) {
            ret += val;
        });
        return ret;
    };
    return BElement;
}());
// Paragraph: blank-line-separated sentences
var Paragraph = /** @class */ (function (_super) {
    __extends(Paragraph, _super);
    function Paragraph(text, param) {
        if (param === void 0) { param = ''; }
        var _this = _super.call(this) || this;
        _this.param = param;
        if (text === '')
            return _this;
        if (text.substr(0, 1) === '~')
            text = ' ' + text.substr(1);
        _super.prototype.insert.call(_this, Factory_Inline(text));
        return _this;
    }
    Paragraph.prototype.canContain = function (obj) {
        return obj instanceof Inline;
    };
    Paragraph.prototype.toString = function () {
        return _super.prototype.wrap.call(this, _super.prototype.toString.call(this), 'p', this.param);
    };
    return Paragraph;
}(BElement));
// Inline elements
var Inline = /** @class */ (function (_super) {
    __extends(Inline, _super);
    function Inline(text) {
        var _this = _super.call(this) || this;
        _this.elements = [];
        _this.elements.push(text.substr(0, 1).trim() === "\n" ?
            text : text);
        return _this;
    }
    Inline.prototype.insert = function (obj) {
        this.elements.push(obj.elements[0]);
        return this;
    };
    Inline.prototype.canContain = function (obj) {
        return obj instanceof Inline;
    };
    Inline.prototype.toString = function () {
        return this.elements.join(line_break ? '<br />\n' : "\n");
    };
    Inline.prototype.toPara = function (cls) {
        if (cls === void 0) { cls = ''; }
        var obj = new Paragraph('', cls);
        obj.insert(this);
        return obj;
    };
    return Inline;
}(BElement));
// * Heading1
// ** Heading2
// *** Heading3
var Heading = /** @class */ (function (_super) {
    __extends(Heading, _super);
    function Heading(root, text) {
        var _this = _super.call(this) || this;
        _this.level = Math.min(3, strspn(text, '*'));
        _a = root.getAnchor(text, _this.level), text = _a[0], _this.msg_top = _a[1], _this.id = _a[2];
        _this.insert(Factory_Inline(text));
        _this.level++; // h2,h3,h4
        return _this;
        var _a;
    }
    Heading.prototype.insert = function (obj) {
        _super.prototype.insert.call(this, obj);
        return this.last = this;
    };
    Heading.prototype.canContain = function (obj) {
        return false;
    };
    Heading.prototype.toString = function () {
        return this.msg_top + this.wrap(_super.prototype.toString.call(this), "h" + this.level, " id=\"" + this.id + "\"");
    };
    return Heading;
}(BElement));
// ----
// Horizontal Rule
var HRule = /** @class */ (function (_super) {
    __extends(HRule, _super);
    function HRule(root, text) {
        return _super.call(this) || this;
    }
    HRule.prototype.canContain = function (obj) {
        return false;
    };
    HRule.prototype.toString = function () {
        return hr;
    };
    return HRule;
}(BElement));
// Lists (UL, OL, DL)
var ListContainer = /** @class */ (function (_super) {
    __extends(ListContainer, _super);
    function ListContainer(tag, tag2, head, text) {
        var _this = _super.call(this) || this;
        var var_margin = "_" + tag + "_margin";
        var var_left_margin = "_" + tag + "_left_margin";
        _this.margin = config[var_margin];
        _this.left_margin = config[var_left_margin];
        _this.tag = tag;
        _this.tag2 = tag2;
        _this.level = Math.min(3, strspn(text, head));
        text = ltrim(text.substr(_this.level));
        _super.prototype.insert.call(_this, new ListElement(_this.level, tag2));
        if (text != '')
            _this.last = _this.last.insert(Factory_Inline(text));
        return _this;
    }
    ListContainer.prototype.canContain = function (obj) {
        return (!(obj instanceof ListContainer))
            || (this.tag === obj.tag && this.level === obj.level);
    };
    ListContainer.prototype.setParent = function (parent) {
        _super.prototype.setParent.call(this, parent);
        var step = this.level;
        if (parent.parent && parent.parent instanceof ListContainer) {
            step -= parent.parent.level;
        }
        var margin = this.margin * step;
        if (step === this.level) {
            margin += this.left_margin;
        }
        this.style = _list_pad_str(this.level, margin, margin);
    };
    ListContainer.prototype.insert = function (obj) {
        var _this = this;
        if (!(obj instanceof ListContainer))
            return this.last = this.last.insert(obj);
        // Break if no elements found (BugTrack/524)
        if (obj.elements.length === 1 && !obj.elements[0].elements)
            return this.last.parent; // up to ListElement
        // Move elements
        obj.elements.forEach(function (val) {
            _super.prototype.insert.call(_this, val);
        });
        return this.last;
    };
    ListContainer.prototype.toString = function () {
        return this.wrap(_super.prototype.toString.call(this), this.tag, this.style);
    };
    return ListContainer;
}(BElement));
var ListElement = /** @class */ (function (_super) {
    __extends(ListElement, _super);
    function ListElement(level, head) {
        var _this = _super.call(this) || this;
        _this.level = level;
        _this.head = head;
        return _this;
    }
    ListElement.prototype.canContain = function (obj) {
        return (!(obj instanceof ListContainer) || (obj.level > this.level));
    };
    ListElement.prototype.toString = function () {
        return this.wrap(_super.prototype.toString.call(this), this.head);
    };
    return ListElement;
}(BElement));
// - One
// - Two
// - Three
var UList = /** @class */ (function (_super) {
    __extends(UList, _super);
    function UList(root, text) {
        return _super.call(this, 'ul', 'li', '-', text) || this;
    }
    return UList;
}(ListContainer));
// + One
// + Two
// + Three
var OList = /** @class */ (function (_super) {
    __extends(OList, _super);
    function OList(root, text) {
        return _super.call(this, 'ol', 'li', '+', text) || this;
    }
    return OList;
}(ListContainer));
// : definition1 | description1
// : definition2 | description2
// : definition3 | description3
var DList = /** @class */ (function (_super) {
    __extends(DList, _super);
    function DList(out) {
        var _this = _super.call(this, 'dl', 'dt', ':', out[0]) || this;
        _this.last = _super.prototype.insert.call(_this, new ListElement(_this.level, 'dd'));
        if (out[1] != '') {
            _this.last = _this.last.insert(Factory_Inline(out[1]));
        }
        return _this;
    }
    return DList;
}(ListContainer));
// > Someting cited
// > like E-mail text
var BQuote = /** @class */ (function (_super) {
    __extends(BQuote, _super);
    function BQuote(root, text) {
        var _this = _super.call(this) || this;
        var head = text.substr(0, 1);
        _this.level = Math.min(3, strspn(text, head));
        text = ltrim(text.substr(_this.level));
        if (head === '<') {
            var level = _this.level;
            _this.level = 0;
            _this.last = _this.end(root, level);
            if (text != '')
                _this.last = _this.last.insert(Factory_Inline(text));
        }
        else {
            _this.insert(Factory_Inline(text));
        }
        return _this;
    }
    BQuote.prototype.canContain = function (obj) {
        return (!(obj instanceof BQuote) || obj.level >= this.level);
    };
    BQuote.prototype.insert = function (obj) {
        // BugTrack/521, BugTrack/545
        /*if (is_a(obj, 'inline'))
            return super.insert(obj.toPara(' class="quotation"'));*/
        if (obj instanceof BQuote && obj.level === this.level && obj.elements.length) {
            obj = obj.elements[0];
            if (this.last instanceof Paragraph && obj.elements.length) {
                obj = obj.elements[0];
            }
        }
        return _super.prototype.insert.call(this, obj);
    };
    BQuote.prototype.toString = function () {
        return this.wrap(_super.prototype.toString.call(this), 'blockquote');
    };
    BQuote.prototype.end = function (root, level) {
        var parent = root.last;
        while (parent) {
            if (parent instanceof BQuote && parent.level === level) {
                return parent.parent;
            }
            parent = parent.parent;
        }
        return this;
    };
    return BQuote;
}(BElement));
var TableCell = /** @class */ (function (_super) {
    __extends(TableCell, _super);
    function TableCell(text, is_template) {
        if (is_template === void 0) { is_template = false; }
        var _this = _super.call(this) || this;
        _this.tag = 'td'; // {td|th}
        _this.colspan = 1;
        _this.rowspan = 1;
        _this.style = [];
        var matches = [];
        var reg = /^(?:(LEFT|CENTER|RIGHT)|(BG)?COLOR\(([#\w]+)\)|SIZE\((\d+)\)):(.*)/;
        while (reg.test(text)) {
            matches = text.match(reg);
            if (matches[1]) {
                _this.style['align'] = 'text-align:' + matches[1].toLowerCase() + ';';
                text = matches[5];
            }
            else if (matches[3]) {
                var name_1 = matches[2] ? 'background-color' : 'color';
                _this.style[name_1] = name_1 + ':' + htmlsc(matches[3]) + ';';
                text = matches[5];
            }
            else if (matches[4]) {
                _this.style['size'] = 'font-size:' + htmlsc(matches[4]) + 'px;';
                text = matches[5];
            }
        }
        if (is_template && !Number.isNaN(Number(text)))
            _this.style['width'] = 'width:' + text + 'px;';
        if (text === '>') {
            _this.colspan = 0;
        }
        else if (text === '~') {
            _this.rowspan = 0;
        }
        else if (text.substr(0, 1) === '~') {
            _this.tag = 'th';
            text = text.substr(1);
        }
        var obj;
        if (text != '' && text[0] === '#') {
            // Try using Div class for this text
            obj = Factory_Div(_this, text);
            if (obj instanceof Paragraph)
                obj = obj.elements[0];
        }
        else {
            obj = Factory_Inline(text);
        }
        _this.insert(obj);
        return _this;
    }
    TableCell.prototype.setStyle = function (style) {
        var _this = this;
        style.forEach(function (val, key) {
            if (!_this.style[key])
                _this.style[key] = val;
        });
    };
    TableCell.prototype.toString = function () {
        if (this.rowspan === 0 || this.colspan === 0)
            return '';
        var param = ' class="style_' + this.tag + '"';
        if (this.rowspan > 1)
            param += ' rowspan="' + this.rowspan + '"';
        if (this.colspan > 1) {
            param += ' colspan="' + this.colspan + '"';
            delete this.style['width'];
        }
        if (this.style)
            param += ' style="' + this.style.join(' ') + '"';
        return this.wrap(_super.prototype.toString.call(this), this.tag, param, false);
    };
    return TableCell;
}(BElement));
// | title1 | title2 | title3 |
// | cell1  | cell2  | cell3  |
// | cell4  | cell5  | cell6  |
var Table = /** @class */ (function (_super) {
    __extends(Table, _super);
    function Table(out) {
        var _this = _super.call(this) || this;
        var cells = out[1].split('|');
        _this.col = cells.length;
        _this.type = out[2].toLowerCase();
        _this.types = [_this.type];
        var is_template = (_this.type === 'c');
        var row = [];
        cells.forEach(function (cell) {
            row.push(new TableCell(cell, is_template));
        });
        _this.elements.push(row);
        return _this;
    }
    Table.prototype.canContain = function (obj) {
        return obj instanceof Table && (obj.col === this.col);
    };
    Table.prototype.insert = function (obj) {
        this.elements.push(obj.elements[0]);
        this.types.push(obj.type);
        return this;
    };
    Table.prototype.toString = function () {
        var _this = this;
        var parts = { 'h': 'thead', 'f': 'tfoot', '': 'tbody' };
        var _loop_1 = function (ncol) {
            var rowspan = 1;
            this_1.elements.reverse().forEach(function (val, nrow) {
                var row = val;
                if (row[ncol].rowspan === 0) {
                    rowspan++;
                    return;
                }
                row[ncol].rowspan = rowspan;
                // Inherits row type
                while (--rowspan)
                    _this.types[nrow + rowspan] = _this.types[nrow];
                rowspan = 1;
            });
        };
        var this_1 = this;
        // Set rowspan (from bottom, to top)
        for (var ncol = 0; ncol < this.col; ncol++) {
            _loop_1(ncol);
        }
        // Set colspan and style
        var stylerow = null;
        this.elements.forEach(function (val, nrow) {
            var row = val;
            if (_this.types[nrow] === 'c')
                stylerow = row;
            var colspan = 1;
            row.forEach(function (c, ncol) {
                if (row[ncol].colspan === 0) {
                    ++colspan;
                    return;
                }
                row[ncol].colspan = colspan;
                if (stylerow) {
                    row[ncol].setStyle(stylerow[ncol].style);
                    // Inherits column style
                    while (--colspan)
                        row[ncol - colspan].setStyle(stylerow[ncol].style);
                }
                colspan = 1;
            });
        });
        // toString
        var string = '';
        var _loop_2 = function (type) {
            var part_string = '';
            this_2.elements.forEach(function (_, nrow) {
                if (_this.types[nrow] != type) {
                    return;
                }
                var row = _this.elements[nrow];
                var row_string = '';
                row.forEach(function (_, ncol) {
                    row_string += row[ncol].toString();
                });
                part_string += _this.wrap(row_string, 'tr');
            });
            string += this_2.wrap(part_string, parts[type]);
        };
        var this_2 = this;
        for (var _i = 0, _a = Object.keys(parts); _i < _a.length; _i++) {
            var type = _a[_i];
            _loop_2(type);
        }
        string = this.wrap(string, 'table', ' class="style_table" cellspacing="1" border="0"');
        return this.wrap(string, 'div', ' class="ie5"');
    };
    return Table;
}(BElement));
// , cell1  , cell2  ,  cell3 
// , cell4  , cell5  ,  cell6 
// , cell7  ,        right,==
// ,left          ,==,  cell8
var YTable = /** @class */ (function (_super) {
    __extends(YTable, _super);
    // TODO: Seems unable to show literal '==' without tricks.
    //       But it will be imcompatible.
    // TODO: Why toString() or toXHTML() here
    function YTable(row) {
        if (row === void 0) { row = ['cell1 ', ' cell2 ', ' cell3']; }
        var _this = _super.call(this) || this;
        var str = [];
        var col = row.length;
        var matches = [];
        var _value = [];
        var _align = [];
        row.forEach(function (cell) {
            var match = cell.match(/^(\s+)?(.+?)(\s+)?/);
            if (match) {
                if (matches[2] === '==') {
                    // Colspan
                    _value.push(false);
                    _align.push(false);
                }
                else {
                    _value.push(matches[2]);
                    if (matches[1] === '') {
                        _align.push(''); // left
                    }
                    else if (matches[3]) {
                        _align.push('center');
                    }
                    else {
                        _align.push('right');
                    }
                }
            }
            else {
                _value.push(cell);
                _align.push('');
            }
        });
        for (var i = 0; i < col; i++) {
            if (_value[i] === false)
                continue;
            var colspan = 1;
            while (_value[i + colspan] && _value[i + colspan] === false)
                ++colspan;
            var _colspan = (colspan > 1) ? ' colspan="' + colspan + '"' : '';
            var align = _align[i] ? ' style="text-align:' + _align[i] + '"' : '';
            str.push('<td class="style_td"' + align + _colspan + '>');
            str.push(_value[i]);
            str.push('</td>');
            delete _value[i];
            delete _align[i];
        }
        _this.col = col;
        _this.elements.push(str.join(''));
        return _this;
    }
    YTable.prototype.canContain = function (obj) {
        return obj instanceof YTable && (obj.col === this.col);
    };
    YTable.prototype.insert = function (obj) {
        this.elements.push(obj.elements[0]);
        return this;
    };
    YTable.prototype.toString = function () {
        var rows = '';
        this.elements.forEach(function (str) {
            rows += "\n" + '<tr class="style_tr">' + str + '</tr>' + "\n";
        });
        rows = this.wrap(rows, 'table', ' class="style_table" cellspacing="1" border="0"');
        return this.wrap(rows, 'div', ' class="ie5"');
    };
    return YTable;
}(BElement));
// ' 'Space-beginning sentence
// ' 'Space-beginning sentence
// ' 'Space-beginning sentence
var Pre = /** @class */ (function (_super) {
    __extends(Pre, _super);
    function Pre(root, text) {
        var _this = _super.call(this) || this;
        _this.elements.push(htmlsc((!preformat_ltrim || text === '' || text[0] != ' ') ? text : text.substr(1)));
        return _this;
    }
    Pre.prototype.canContain = function (obj) {
        return obj instanceof Pre;
    };
    Pre.prototype.insert = function (obj) {
        this.elements.push(obj.elements[0]);
        return this;
    };
    Pre.prototype.toString = function () {
        return this.wrap(this.elements.join("\n"), 'pre');
    };
    return Pre;
}(BElement));
// Block plugin: #something (started with '#')
var Div = /** @class */ (function (_super) {
    __extends(Div, _super);
    function Div(out) {
        var _this = _super.call(this) || this;
        _a = out[1], _this.name = _a === void 0 ? '' : _a, _b = out[2], _this.param = _b === void 0 ? '' : _b;
        return _this;
        var _a, _b;
    }
    Div.prototype.canContain = function (obj) {
        return false;
    };
    Div.prototype.toString = function () {
        // Call #plugin
        return '#' + this.name;
        //return do_plugin_convert(this.name, this.param);
    };
    return Div;
}(BElement));
// LEFT:/CENTER:/RIGHT:
var Align = /** @class */ (function (_super) {
    __extends(Align, _super);
    function Align(align) {
        var _this = _super.call(this) || this;
        _this.align = align;
        return _this;
    }
    Align.prototype.canContain = function (obj) {
        return obj instanceof Inline;
    };
    Align.prototype.toString = function () {
        return this.wrap(_super.prototype.toString.call(this), 'div', ' style="text-align:' + this.align + '"');
    };
    return Align;
}(BElement));
// Body
var Body = /** @class */ (function (_super) {
    __extends(Body, _super);
    function Body(id) {
        var _this = _super.call(this) || this;
        _this.count = 0;
        _this.classes = {
            '-': 'UList',
            '+': 'OList',
            '>': 'BQuote',
            '<': 'BQuote'
        };
        _this.factories = {
            ':': 'DList',
            '|': 'Table',
            ',': 'YTable',
            '#': 'Div'
        };
        _this.id = id;
        _this.contents = new BElement();
        _this.contents_last = _this.contents;
        return _this;
    }
    Body.prototype.parse = function (lines) {
        this.last = this;
        var matches = [];
        while (lines.length !== 0) {
            console.log(lines);
            var line = lines.shift();
            // Escape comments
            if (line.substr(0, 2) === '//')
                continue;
            var matches_1 = line.match(/^(LEFT|CENTER|RIGHT):(.*)/);
            if (matches_1) {
                // <div style="text-align:...">
                this.last = this.last.add(new Align(matches_1[1].toLowerCase()));
                if (matches_1[2] === '')
                    continue;
                line = matches_1[2];
            }
            line = rtrim(line, /^[\r\n]+/);
            // Empty
            if (line === '') {
                this.last = this;
                continue;
            }
            // Horizontal Rule
            if (line.substr(0, 4) === '----') {
                this.insert(new HRule(this, line));
                continue;
            }
            // The first character
            var head = line[0];
            // Heading
            if (head === '*') {
                this.insert(new Heading(this, line));
                continue;
            }
            // Pre
            if (head === ' ' || head === "\t") {
                this.last = this.last.add(new Pre(this, line));
                continue;
            }
            // Line Break
            if (line.substr(-1) === '~')
                line = line.substr(0, -1) + "\r";
            // Other Character
            if (this.classes[head]) {
                var classname = this.classes[head];
                this.last = this.last.add(eval("new " + classname + "(this, line)"));
                continue;
            }
            // Other Character
            if (this.factories[head]) {
                var factoryname = 'Factory_' + this.factories[head];
                this.last = this.last.add(eval(factoryname + "(this, line)"));
                continue;
            }
            // Default
            this.last = this.last.add(Factory_Inline(line));
        }
    };
    Body.prototype.getAnchor = function (text, level) {
        // Heading id (auto-generated)
        var autoid = 'content_' + this.id + '_' + this.count;
        this.count++;
        // Heading id (specified by users)
        var id = make_heading(text, false); // Cut fixed-anchor from text
        var anchor;
        if (id === '') {
            // Not specified
            id = autoid;
            anchor = '';
        }
        else {
            anchor = ' &aname(' + id + ',super,full){' + _symbol_anchor + '};';
        }
        text = ' ' + text;
        // Add 'page contents' link to its heading
        this.contents_last = this.contents_last.add(new Contents_UList(text, level, id));
        // Add heding
        return [text + anchor, this.count > 1 ? "\n" + msg_content_back_to_top : '', autoid];
    };
    Body.prototype.insert = function (obj) {
        if (obj instanceof Inline)
            obj = obj.toPara();
        return _super.prototype.insert.call(this, obj);
    };
    Body.prototype.toString = function () {
        var text = _super.prototype.toString.call(this);
        // #contents
        text = text.replace(/<#_contents_>/, this.replace_contents);
        return text + "\n";
    };
    Body.prototype.replace_contents = function (arr) {
        return '<div class="contents">' + "\n" +
            '<a id="contents_' + this.id + '"></a>' + "\n" +
            this.contents.toString() + "\n" +
            '</div>' + "\n";
    };
    return Body;
}(BElement));
var Contents_UList = /** @class */ (function (_super) {
    __extends(Contents_UList, _super);
    function Contents_UList(text, level, id) {
        var _this = 
        // Reformatting text
        // A line started with "\n" means "preformatted" ... X(
        _super.call(this, 'ul', 'li', '-', '-'.repeat(level)) || this;
        make_heading(text); // GLOB
        text = "\n<a href=\"#" + id + "\">" + text + "</a>\n";
        _super.prototype.insert.call(_this, Factory_Inline(text));
        return _this;
    }
    Contents_UList.prototype.setParent = function (parent) {
        _super.prototype.setParent.call(this, parent);
        var step = this.level;
        var margin = this.left_margin;
        if (parent.parent && parent.parent instanceof ListContainer) {
            step -= parent.parent.level;
            margin = 0;
        }
        margin += this.margin * (step === this.level ? 1 : step);
        this.style = _list_pad_str(this.level, margin, margin);
    };
    return Contents_UList;
}(ListContainer));
