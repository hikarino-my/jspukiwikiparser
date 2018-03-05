let contents_id = 0;
const line_break = 0;
const preformat_ltrim = 1;
const _symbol_anchor   = '&dagger;';
const config = {
	// リスト構造の左マージン
	_ul_left_margin: 0,   // リストと画面左端との間隔(px)
	_ul_margin: 16,       // リストの階層間の間隔(px)
	_ol_left_margin: 0,   // リストと画面左端との間隔(px)
	_ol_margin: 16,     // リストの階層間の間隔(px)
	_dl_left_margin: 0,   // リストと画面左端との間隔(px)
	_dl_margin: 16
}
const msg_content_back_to_top = '<div class="jumpmenu"><a href="#navigator">&uarr;</a></div>';
function ltrim(stringToTrim: string, pattern = /^\s+/) {
	return stringToTrim.replace(pattern,"");
}
const exist_plugin_convert = uuu => false;
function rtrim(stringToTrim: string, pattern =/\s+$/) {
	return stringToTrim.replace(pattern, "");
}
// Make heading string (remove heading-related decorations from Wiki text)
function make_heading(str, strip = true){
	// Cut fixed-heading anchors
	let id = '';
	let matches = str.match(/^(\*{0,3})(.*?)\[#([A-Za-z][\w-]+)\](.*?)$/m);
	if (matches) {
		str = matches[2] +matches[4];
		let id  = matches[3];
	} else {
		str = str.replace(/^\*{0,3}/,'');
	}
	return id;
}
const hr = '<hr class="full_hr" />';
const strspn = (str1: string, str2: string, start = 0, lgth?: number) => {
  let found
  let stri
  let strj
  let j = 0
  let i = 0
  start = start < 0 ? (str1.length + start) : start;
  lgth = lgth ? ((lgth < 0) ? (str1.length + lgth - start) : lgth) : str1.length - start;
  str1 = str1.substr(start, lgth);
  for (let i = 0; i < str1.length; i++) {
    let found = 0
    stri = str1.substring(i, i + 1)
    for (let j = 0; j <= str2.length; j++) {
      strj = str2.substring(j, j + 1)
      if (stri === strj) {
        found = 1
        break
      }
    }
    if (found !== 1) {
      return i
    }
  }
  return i
}
const htmlsc = (string: string) => {
  return string.replace(/[&'`"<>]/g, function(match) {
    return {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    }[match]
  });
}
const _list_pad_str = (list: number, padl: number, marl: number) => {
	return ` class="list${list}" style="padding-left:${padl}px;margin-left:${marl}px"`;
};
function convert_html (lines: string[]){
	contents_id = contents_id++;
	const body = new Body(contents_id);
	body.parse(lines);
	return body.toString();
}
// Returns inline-related object
const Factory_Inline = (text: string) => {
	// Check the first letter of the line
	if (text.slice(0, 1) === '~') {
		return new Paragraph(' ' + text.slice(1));
	} else {
		return new Inline(text);
	}
}

const Factory_DList = (root, text) => {
	let out = ltrim(text).split('|', 2);
	if (out.length < 2) {
		return Factory_Inline(text);
	} else {
		return new DList(out);
	}
}

// '|'-separated table
function Factory_Table(root, text){
	let match = text.match(/^\|(.+)\|([hHfFcC]?)$/);
	if (! match) {
		return Factory_Inline(text);
	} else {
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
const Factory_Div = (root, text) => {
	const matches = text.match(/^\#([^\(]+)(?:\((.*)\))?/);
	if (matches && exist_plugin_convert(matches[1])) {
		return new Div(matches);
	}
	return new Paragraph(text);
}
// Block elements
class BElement {
	parent;
	elements = []; // References of childs
	last;     // Insert new one at the back of the last
	constructor() {
		this.last = this;
	}
	setParent(parent) {
		this.parent = parent;
	}
	add(obj) {
		if (this.canContain(obj)) {
			return this.insert(obj);
		} else {
			return this.parent.add(obj);
		}
	}
	insert(obj) {
		obj.setParent(this);
		this.elements.push(obj);
		return this.last = obj.last;
	}
	canContain(obj) {
		return true;
	}
	wrap(string: string, tag: string, param = '', canomit = true) {
		return (canomit && string === '') ? '' :
			'<' + tag + param + '>' + string + '</' + tag + '>';
	}
	toString() {
		let ret = [];
		this.elements.forEach(val => {
			ret.push(val.toString());
		});
		return ret.join("\n");
	}
	dump(indent = 0) {
		let ret = ' '.repeat(indent) + this.constructor.name + "\n";
		indent += 2;
		this.elements.forEach(val => {
			ret += val
		})
		return ret;
	}
}

// Paragraph: blank-line-separated sentences
class Paragraph extends BElement {
	param: string;

	constructor(text: string, param = ''){
		super();
		this.param = param;
		if (text === '') return;
		if (text.substr(0, 1) === '~')
			text = ' ' + text.substr(1);
		super.insert(Factory_Inline(text));
	}
	canContain(obj) {
		return obj instanceof Inline;
	}
	toString() {
		return super.wrap(super.toString(), 'p', this.param);
	}
}
// Inline elements
class Inline extends BElement {
	elements = [];
	constructor(text) {
		super();
		this.elements.push(text.substr(0, 1).trim() === "\n" ?
		text : text);
	}
	insert(obj){
		this.elements.push(obj.elements[0]);
		return this;
	}
	canContain(obj) {
		return obj instanceof Inline;
	}

	toString() {
		return this.elements.join(line_break ? '<br />\n' : "\n");
	}
	toPara(cls = ''){
		let obj = new Paragraph('', cls);
		obj.insert(this);
		return obj;
	}
}
// * Heading1
// ** Heading2
// *** Heading3
class Heading extends BElement {
	level: number;
	id;
	msg_top;
	last;

	constructor(root, text){
		super();
		this.level = Math.min(3, strspn(text, '*'));
		[text, this.msg_top, this.id] = root.getAnchor(text, this.level);
		this.insert(Factory_Inline(text));
		this.level++; // h2,h3,h4
	}
	insert(obj){
		super.insert(obj);
		return this.last = this;
	}
	canContain(obj) {
		return false;
	}

	toString() {
		return this.msg_top + this.wrap(super.toString(),
			`h${this.level}`, ` id="${this.id}"`);
	}
}
// ----
// Horizontal Rule
class HRule extends BElement {
	constructor(root, text) {
		super();
	}
	canContain(obj) {
		return false;
	}
	toString() {
		return hr;
	}
}
// Lists (UL, OL, DL)
class ListContainer extends BElement {
	tag;
	tag2;
	level;
	style;
	margin;
	left_margin;
	constructor(tag: string, tag2: string, head: string, text: string){
		super();
		let var_margin = `_${tag}_margin`;
		let var_left_margin = `_${tag}_left_margin`;
		this.margin      = config[var_margin];
		this.left_margin = config[var_left_margin];
		this.tag   = tag;
		this.tag2  = tag2;
		this.level = Math.min(3, strspn(text, head));
		text = ltrim(text.substr(this.level));
		super.insert(new ListElement(this.level, tag2));
		if (text != '')
			this.last =  this.last.insert(Factory_Inline(text));
	}

	canContain(obj) {
		return (! (obj instanceof ListContainer))
			|| (this.tag === obj.tag && this.level === obj.level);
	}

	setParent(parent) {
		super.setParent(parent);
		let step = this.level;
		if (parent.parent && parent.parent instanceof ListContainer){
			step -= parent.parent.level;
		}
		let margin = this.margin * step;
		if (step === this.level){
			margin += this.left_margin;
		}
		this.style = _list_pad_str(this.level, margin, margin);
	}

	insert(obj){
		if (!(obj instanceof ListContainer))
			return this.last =this.last.insert(obj);
		// Break if no elements found (BugTrack/524)
		if (obj.elements.length === 1 && !obj.elements[0].elements)
			return this.last.parent; // up to ListElement
		// Move elements
		obj.elements.forEach(val => {
			super.insert(val);
		});
		return this.last;
	}
	toString() {
		return this.wrap(super.toString(), this.tag, this.style);
	}
}

class ListElement extends BElement {
	constructor(public level, public head) {
		super();
	}
	canContain( obj) {
		return (!(obj instanceof ListContainer) || (obj.level > this.level));
	}
	toString() {
		return this.wrap(super.toString(), this.head);
	}
}
// - One
// - Two
// - Three
class UList extends ListContainer {
	constructor(root, text) {
		super('ul', 'li', '-', text);
	}
}
// + One
// + Two
// + Three
class OList extends ListContainer {
	constructor(root, text) {
		super('ol', 'li', '+', text);
	}
}
// : definition1 | description1
// : definition2 | description2
// : definition3 | description3
class DList extends ListContainer {
	constructor(out) {
		super('dl', 'dt', ':', out[0]);
		this.last =super.insert(new ListElement(this.level, 'dd'));
		if (out[1] != ''){
			this.last =this.last.insert(Factory_Inline(out[1]));
		}
	}
}
// > Someting cited
// > like E-mail text
class BQuote extends BElement {
	level;
	constructor(root, text){
		super();
		let head = text.substr(0, 1);
		this.level = Math.min(3, strspn(text, head));
		text = ltrim(text.substr(this.level));
		if (head === '<') { // Blockquote close
			let level = this.level;
			this.level = 0;
			this.last  = this.end(root, level);
			if (text != '')
				this.last =this.last.insert(Factory_Inline(text));
		} else {
			this.insert(Factory_Inline(text));
		}
	}
	canContain(obj) {
		return (!(obj instanceof BQuote) || obj.level >= this.level);
	}
	insert(obj){
		// BugTrack/521, BugTrack/545
		/*if (is_a(obj, 'inline'))
			return super.insert(obj.toPara(' class="quotation"'));*/

		if (obj instanceof BQuote && obj.level === this.level && obj.elements.length) {
			obj =obj.elements[0];
			if (this.last instanceof Paragraph && obj.elements.length){
				obj =obj.elements[0];
			}
		}
		return super.insert(obj);
	}
	toString() {
		return this.wrap(super.toString(), 'blockquote');
	}
	end(root, level){
		let parent = root.last;
		while (parent) {
			if (parent instanceof BQuote && parent.level === level){
				return parent.parent;
			}
			parent =parent.parent;
		}
		return this;
	}
}

class TableCell extends BElement {
	tag = 'td'; // {td|th}
	colspan = 1;
	rowspan = 1;
	style; // is array('width'=>, 'align'=>...);

	constructor(text, is_template = false){
		super();
		this.style = [];
		let matches = [];
		let reg = /^(?:(LEFT|CENTER|RIGHT)|(BG)?COLOR\(([#\w]+)\)|SIZE\((\d+)\)):(.*)/;
		while (reg.test(text)) {
			matches = text.match(reg);
			if (matches[1]) {
				this.style['align'] = 'text-align:'+matches[1].toLowerCase()+ ';';
				text = matches[5];
			} else if (matches[3]) {
				let name = matches[2] ? 'background-color' : 'color';
				this.style[name] = name+ ':'+htmlsc(matches[3])+';';
				text = matches[5];
			} else if (matches[4]) {
				this.style['size'] = 'font-size:'+htmlsc(matches[4])+ 'px;';
				text = matches[5];
			}
		}
		if (is_template && !Number.isNaN(Number(text)))
			this.style['width'] = 'width:'+text+ 'px;';
		if (text === '>') {
			this.colspan = 0;
		} else if (text === '~') {
			this.rowspan = 0;
		} else if (text.substr(0, 1) === '~') {
			this.tag = 'th';
			text = text.substr(1);
		}
		let obj;
		if (text != '' && text[0] === '#') {
			// Try using Div class for this text
			obj =Factory_Div(this, text);
			if (obj instanceof Paragraph)
				obj =obj.elements[0];
		} else {
			obj =Factory_Inline(text);
		}
		this.insert(obj);
	}
	setStyle(style) {
		style.forEach((val, key) => {
			if (!this.style[key])
			this.style[key] = val;
		});
	}
	toString() {
		if (this.rowspan === 0 || this.colspan === 0) return '';
		let param = ' class="style_'+this.tag+ '"';
		if (this.rowspan > 1)
			param+= ' rowspan="'+this.rowspan+'"';
		if (this.colspan > 1) {
			param+= ' colspan="'+this.colspan+ '"';
			delete this.style['width'];
		}
		if (this.style)
			param+= ' style="'+ this.style.join(' ') + '"';
		return this.wrap(super.toString(), this.tag, param, false);
	}
}

// | title1 | title2 | title3 |
// | cell1  | cell2  | cell3  |
// | cell4  | cell5  | cell6  |
class Table extends BElement {
	type;
	types;
	col; // number of column
	constructor(out){
		super();
		let cells = out[1].split('|');
		this.col   = cells.length;
		this.type  = out[2].toLowerCase();
		this.types = [this.type];
		let is_template = (this.type === 'c');
		let row = [];
		cells.forEach(cell => {
			row.push(new TableCell(cell, is_template));
		});
		this.elements.push(row);
	}
	canContain(obj) {
		return obj instanceof Table && (obj.col === this.col);
	}
	insert(obj){
		this.elements.push(obj.elements[0]);
		this.types.push(obj.type);
		return this;
	}
	toString() {
		let parts = {'h':'thead', 'f':'tfoot', '': 'tbody'};
		// Set rowspan (from bottom, to top)
		for (let ncol = 0; ncol < this.col; ncol++) {
			let rowspan = 1;
			this.elements.reverse().forEach((val,nrow)  => {
				let row =val;
				if (row[ncol].rowspan === 0) {
					rowspan++;
					return;
				}
				row[ncol].rowspan = rowspan;
				// Inherits row type
				while (--rowspan)
					this.types[nrow + rowspan] = this.types[nrow];
				rowspan = 1;
			})
		}
		// Set colspan and style
		let stylerow = null;
		this.elements.forEach((val, nrow) => {
			let row =val;
			if (this.types[nrow] === 'c')
				stylerow =row;
			let colspan = 1;
			row.forEach((c, ncol) => {
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
		})

	// toString
	let string = '';
	for(const type of Object.keys(parts)){
		let part_string = '';
		this.elements.forEach((_, nrow)=> {
			if (this.types[nrow] != type){
				return;
			}
			let row =this.elements[nrow];
			let row_string = '';
			row.forEach((_, ncol) => {
				row_string+= row[ncol].toString();
			});
			part_string+= this.wrap(row_string, 'tr');
		});
		string+= this.wrap(part_string, parts[type]);
	}
	string = this.wrap(string, 'table', ' class="style_table" cellspacing="1" border="0"');
	return this.wrap(string, 'div', ' class="ie5"');
}
}

// , cell1  , cell2  ,  cell3 
// , cell4  , cell5  ,  cell6 
// , cell7  ,        right,==
// ,left          ,==,  cell8
class YTable extends BElement {
	col;	// Number of columns

	// TODO: Seems unable to show literal '==' without tricks.
	//       But it will be imcompatible.
	// TODO: Why toString() or toXHTML() here
	constructor(row = ['cell1 ', ' cell2 ', ' cell3']){
		super();
		let str = [];
		let col = row.length;
		let matches = [];
		let _value =[];
		let _align = [];
		row.forEach(cell => {
			let match = cell.match(/^(\s+)?(.+?)(\s+)?/);
			if (match) {
				if (matches[2] === '==') {
					// Colspan
					_value.push(false);
					_align.push(false);
				} else {
					_value.push(matches[2]);
					if (matches[1] === '') {
						_align.push('');	// left
					} else if (matches[3]) {
						_align.push('center');
					} else {
						_align.push('right');
					}
				}
			} else {
				_value.push(cell);
				_align.push('');
			}
		});
		for (let i = 0; i < col; i++) {
			if (_value[i] === false) continue;
			let colspan = 1;
			while (_value[i + colspan] && _value[i + colspan] === false)++colspan;
			let _colspan = (colspan > 1) ? ' colspan="'+colspan+'"' : '';
			let align = _align[i] ? ' style="text-align:'+_align[i]+ '"' : '';
			str.push('<td class="style_td"'+align+_colspan+ '>');
			str.push(_value[i]);
			str.push('</td>');
			delete _value[i];
			delete _align[i];
		}
		this.col        = col;
		this.elements.push(str.join(''));
	}
	canContain( obj) {
		return obj instanceof YTable && (obj.col === this.col);
	}
	insert( obj){
		this.elements.push(obj.elements[0]);
		return this;
	}
	toString() {
		let rows = '';
		this.elements.forEach(str => {
			rows+= "\n"+ '<tr class="style_tr">'+str+ '</tr>'+"\n";
		});
		rows = this.wrap(rows, 'table', ' class="style_table" cellspacing="1" border="0"');
		return this.wrap(rows, 'div', ' class="ie5"');
	}
}
// ' 'Space-beginning sentence
// ' 'Space-beginning sentence
// ' 'Space-beginning sentence
class Pre extends BElement {
	constructor(root, text) {
		super();
		this.elements.push(htmlsc(
			(!preformat_ltrim || text === '' || text[0] != ' ') ? text : text.substr(1)));
	}
	canContain( obj) {
		return obj instanceof Pre;
	}
	insert( obj){
		this.elements.push(obj.elements[0]);
		return this;
	}
	toString() {
		return this.wrap(this.elements.join("\n"), 'pre');
	}
}
// Block plugin: #something (started with '#')
class Div extends BElement {
	name: string;
	param: string;
	constructor(out){
		super();
		[, this.name = '', this.param = ''] = out;
	}
	canContain(obj) {
		return false;
	}
	toString() {
		// Call #plugin
		return '#'+this.name;
		//return do_plugin_convert(this.name, this.param);
	}
}

// LEFT:/CENTER:/RIGHT:
class Align extends BElement {
	constructor(public align){
		super();
	}
	canContain(obj) {
		return obj instanceof Inline;
	}
	toString() {
		return this.wrap(super.toString(), 'div', ' style="text-align:'+this.align+ '"');
	}
}
// Body
class Body extends BElement {
	id;
	count = 0;
	contents;
	contents_last;
	classes = {
		'-': 'UList',
		'+': 'OList',
		'>': 'BQuote',
		'<': 'BQuote'
	};
	factories = {
		':': 'DList',
		'|': 'Table',
		',': 'YTable',
		'#': 'Div'
	};
	constructor(id){
		super();
		this.id            = id;
		this.contents      = new BElement();
		this.contents_last =this.contents;
	}
	parse(lines: string[]) {
		this.last =this;
		let matches = [];
		while (lines.length !== 0) {
			console.log(lines);
			let line = lines.shift();
			// Escape comments
			if (line.substr(0, 2) === '//') continue;
			let matches = line.match(/^(LEFT|CENTER|RIGHT):(.*)/);
			if (matches) {
				// <div style="text-align:...">
				this.last =this.last.add(new Align(matches[1].toLowerCase()));
				if (matches[2] === '') continue;
				line = matches[2];
			}
			line = rtrim(line, /^[\r\n]+/);
			// Empty
			if (line === '') {
				this.last =this;
				continue;
			}
			// Horizontal Rule
			if (line.substr(0, 4) === '----') {
				this.insert(new HRule(this, line));
				continue;
			}
			// The first character
			let head = line[0];
			// Heading
			if (head === '*') {
				this.insert(new Heading(this, line));
				continue;
			}
			// Pre
			if (head === ' ' || head === "\t") {
				this.last =this.last.add(new Pre(this, line));
				continue;
			}
			// Line Break
			if (line.substr(-1) === '~')
				line = line.substr(0, line.length-1)+ "<br>";
			// Other Character
			if (this.classes[head]) {
				let classname = this.classes[head];
				this.last =this.last.add(eval("new "+classname+"(this, line)"));
				continue;
			}
			// Other Character
			if (this.factories[head]) {
				let factoryname = 'Factory_'+this.factories[head];
				this.last  =this.last.add(eval(factoryname+"(this, line)"));
				continue;
			}
			// Default
			this.last =this.last.add(Factory_Inline(line));
		}
	}
	getAnchor(text, level) {
		// Heading id (auto-generated)
		let autoid = 'content_'+this.id+ '_'+this.count;
		this.count++;
		// Heading id (specified by users)
		let id = make_heading(text, false); // Cut fixed-anchor from text
		let anchor;
		if (id === '') {
			// Not specified
			id =autoid;
			anchor = '';
		} else {
			anchor = ' &aname('+id+ ',super,full){'+_symbol_anchor+ '};';
		}
		text = ' '+text;
		// Add 'page contents' link to its heading
		this.contents_last =this.contents_last.add(new Contents_UList(text, level, id));

		// Add heding
		return [text+anchor, this.count > 1 ? "\n"+msg_content_back_to_top : '', autoid];
	}
	insert(obj){
		if (obj instanceof Inline) obj =obj.toPara();
		return super.insert(obj);
	}
	toString() {
		let text = super.toString();
		// #contents
		text = text.replace(/<#_contents_>/,this.replace_contents);
		return text+ "\n";
	}
	replace_contents(arr) {
		return '<div class="contents">'+ "\n"+
					'<a id="contents_'+this.id+ '"></a>'+ "\n"+
			this.contents.toString()+ "\n"+
					'</div>'+ "\n";
	}
}
class Contents_UList extends ListContainer {
	constructor(text: string, level: number, id) {
		// Reformatting text
		// A line started with "\n" means "preformatted" ... X(
			super('ul', 'li', '-', '-'.repeat(level));
		make_heading(text); // GLOB
		text = `
<a href="#${id}">${text}</a>
`;
		super.insert(Factory_Inline(text));
	}
	setParent(parent) {
		super.setParent(parent);
		let step = this.level;
		let margin = this.left_margin;
		if (parent.parent && parent.parent instanceof ListContainer) {
			step -= parent.parent.level;
			margin = 0;
		}
		margin += this.margin * (step === this.level ? 1 : step);
		this.style = _list_pad_str(this.level, margin, margin);
	}
}
