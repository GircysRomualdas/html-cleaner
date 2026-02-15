var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/js-beautify/js/src/core/output.js
var require_output = __commonJS((exports, module) => {
  function OutputLine(parent) {
    this.__parent = parent;
    this.__character_count = 0;
    this.__indent_count = -1;
    this.__alignment_count = 0;
    this.__wrap_point_index = 0;
    this.__wrap_point_character_count = 0;
    this.__wrap_point_indent_count = -1;
    this.__wrap_point_alignment_count = 0;
    this.__items = [];
  }
  OutputLine.prototype.clone_empty = function() {
    var line = new OutputLine(this.__parent);
    line.set_indent(this.__indent_count, this.__alignment_count);
    return line;
  };
  OutputLine.prototype.item = function(index) {
    if (index < 0) {
      return this.__items[this.__items.length + index];
    } else {
      return this.__items[index];
    }
  };
  OutputLine.prototype.has_match = function(pattern) {
    for (var lastCheckedOutput = this.__items.length - 1;lastCheckedOutput >= 0; lastCheckedOutput--) {
      if (this.__items[lastCheckedOutput].match(pattern)) {
        return true;
      }
    }
    return false;
  };
  OutputLine.prototype.set_indent = function(indent, alignment) {
    if (this.is_empty()) {
      this.__indent_count = indent || 0;
      this.__alignment_count = alignment || 0;
      this.__character_count = this.__parent.get_indent_size(this.__indent_count, this.__alignment_count);
    }
  };
  OutputLine.prototype._set_wrap_point = function() {
    if (this.__parent.wrap_line_length) {
      this.__wrap_point_index = this.__items.length;
      this.__wrap_point_character_count = this.__character_count;
      this.__wrap_point_indent_count = this.__parent.next_line.__indent_count;
      this.__wrap_point_alignment_count = this.__parent.next_line.__alignment_count;
    }
  };
  OutputLine.prototype._should_wrap = function() {
    return this.__wrap_point_index && this.__character_count > this.__parent.wrap_line_length && this.__wrap_point_character_count > this.__parent.next_line.__character_count;
  };
  OutputLine.prototype._allow_wrap = function() {
    if (this._should_wrap()) {
      this.__parent.add_new_line();
      var next = this.__parent.current_line;
      next.set_indent(this.__wrap_point_indent_count, this.__wrap_point_alignment_count);
      next.__items = this.__items.slice(this.__wrap_point_index);
      this.__items = this.__items.slice(0, this.__wrap_point_index);
      next.__character_count += this.__character_count - this.__wrap_point_character_count;
      this.__character_count = this.__wrap_point_character_count;
      if (next.__items[0] === " ") {
        next.__items.splice(0, 1);
        next.__character_count -= 1;
      }
      return true;
    }
    return false;
  };
  OutputLine.prototype.is_empty = function() {
    return this.__items.length === 0;
  };
  OutputLine.prototype.last = function() {
    if (!this.is_empty()) {
      return this.__items[this.__items.length - 1];
    } else {
      return null;
    }
  };
  OutputLine.prototype.push = function(item) {
    this.__items.push(item);
    var last_newline_index = item.lastIndexOf(`
`);
    if (last_newline_index !== -1) {
      this.__character_count = item.length - last_newline_index;
    } else {
      this.__character_count += item.length;
    }
  };
  OutputLine.prototype.pop = function() {
    var item = null;
    if (!this.is_empty()) {
      item = this.__items.pop();
      this.__character_count -= item.length;
    }
    return item;
  };
  OutputLine.prototype._remove_indent = function() {
    if (this.__indent_count > 0) {
      this.__indent_count -= 1;
      this.__character_count -= this.__parent.indent_size;
    }
  };
  OutputLine.prototype._remove_wrap_indent = function() {
    if (this.__wrap_point_indent_count > 0) {
      this.__wrap_point_indent_count -= 1;
    }
  };
  OutputLine.prototype.trim = function() {
    while (this.last() === " ") {
      this.__items.pop();
      this.__character_count -= 1;
    }
  };
  OutputLine.prototype.toString = function() {
    var result = "";
    if (this.is_empty()) {
      if (this.__parent.indent_empty_lines) {
        result = this.__parent.get_indent_string(this.__indent_count);
      }
    } else {
      result = this.__parent.get_indent_string(this.__indent_count, this.__alignment_count);
      result += this.__items.join("");
    }
    return result;
  };
  function IndentStringCache(options, baseIndentString) {
    this.__cache = [""];
    this.__indent_size = options.indent_size;
    this.__indent_string = options.indent_char;
    if (!options.indent_with_tabs) {
      this.__indent_string = new Array(options.indent_size + 1).join(options.indent_char);
    }
    baseIndentString = baseIndentString || "";
    if (options.indent_level > 0) {
      baseIndentString = new Array(options.indent_level + 1).join(this.__indent_string);
    }
    this.__base_string = baseIndentString;
    this.__base_string_length = baseIndentString.length;
  }
  IndentStringCache.prototype.get_indent_size = function(indent, column) {
    var result = this.__base_string_length;
    column = column || 0;
    if (indent < 0) {
      result = 0;
    }
    result += indent * this.__indent_size;
    result += column;
    return result;
  };
  IndentStringCache.prototype.get_indent_string = function(indent_level, column) {
    var result = this.__base_string;
    column = column || 0;
    if (indent_level < 0) {
      indent_level = 0;
      result = "";
    }
    column += indent_level * this.__indent_size;
    this.__ensure_cache(column);
    result += this.__cache[column];
    return result;
  };
  IndentStringCache.prototype.__ensure_cache = function(column) {
    while (column >= this.__cache.length) {
      this.__add_column();
    }
  };
  IndentStringCache.prototype.__add_column = function() {
    var column = this.__cache.length;
    var indent = 0;
    var result = "";
    if (this.__indent_size && column >= this.__indent_size) {
      indent = Math.floor(column / this.__indent_size);
      column -= indent * this.__indent_size;
      result = new Array(indent + 1).join(this.__indent_string);
    }
    if (column) {
      result += new Array(column + 1).join(" ");
    }
    this.__cache.push(result);
  };
  function Output(options, baseIndentString) {
    this.__indent_cache = new IndentStringCache(options, baseIndentString);
    this.raw = false;
    this._end_with_newline = options.end_with_newline;
    this.indent_size = options.indent_size;
    this.wrap_line_length = options.wrap_line_length;
    this.indent_empty_lines = options.indent_empty_lines;
    this.__lines = [];
    this.previous_line = null;
    this.current_line = null;
    this.next_line = new OutputLine(this);
    this.space_before_token = false;
    this.non_breaking_space = false;
    this.previous_token_wrapped = false;
    this.__add_outputline();
  }
  Output.prototype.__add_outputline = function() {
    this.previous_line = this.current_line;
    this.current_line = this.next_line.clone_empty();
    this.__lines.push(this.current_line);
  };
  Output.prototype.get_line_number = function() {
    return this.__lines.length;
  };
  Output.prototype.get_indent_string = function(indent, column) {
    return this.__indent_cache.get_indent_string(indent, column);
  };
  Output.prototype.get_indent_size = function(indent, column) {
    return this.__indent_cache.get_indent_size(indent, column);
  };
  Output.prototype.is_empty = function() {
    return !this.previous_line && this.current_line.is_empty();
  };
  Output.prototype.add_new_line = function(force_newline) {
    if (this.is_empty() || !force_newline && this.just_added_newline()) {
      return false;
    }
    if (!this.raw) {
      this.__add_outputline();
    }
    return true;
  };
  Output.prototype.get_code = function(eol) {
    this.trim(true);
    var last_item = this.current_line.pop();
    if (last_item) {
      if (last_item[last_item.length - 1] === `
`) {
        last_item = last_item.replace(/\n+$/g, "");
      }
      this.current_line.push(last_item);
    }
    if (this._end_with_newline) {
      this.__add_outputline();
    }
    var sweet_code = this.__lines.join(`
`);
    if (eol !== `
`) {
      sweet_code = sweet_code.replace(/[\n]/g, eol);
    }
    return sweet_code;
  };
  Output.prototype.set_wrap_point = function() {
    this.current_line._set_wrap_point();
  };
  Output.prototype.set_indent = function(indent, alignment) {
    indent = indent || 0;
    alignment = alignment || 0;
    this.next_line.set_indent(indent, alignment);
    if (this.__lines.length > 1) {
      this.current_line.set_indent(indent, alignment);
      return true;
    }
    this.current_line.set_indent();
    return false;
  };
  Output.prototype.add_raw_token = function(token) {
    for (var x = 0;x < token.newlines; x++) {
      this.__add_outputline();
    }
    this.current_line.set_indent(-1);
    this.current_line.push(token.whitespace_before);
    this.current_line.push(token.text);
    this.space_before_token = false;
    this.non_breaking_space = false;
    this.previous_token_wrapped = false;
  };
  Output.prototype.add_token = function(printable_token) {
    this.__add_space_before_token();
    this.current_line.push(printable_token);
    this.space_before_token = false;
    this.non_breaking_space = false;
    this.previous_token_wrapped = this.current_line._allow_wrap();
  };
  Output.prototype.__add_space_before_token = function() {
    if (this.space_before_token && !this.just_added_newline()) {
      if (!this.non_breaking_space) {
        this.set_wrap_point();
      }
      this.current_line.push(" ");
    }
  };
  Output.prototype.remove_indent = function(index) {
    var output_length = this.__lines.length;
    while (index < output_length) {
      this.__lines[index]._remove_indent();
      index++;
    }
    this.current_line._remove_wrap_indent();
  };
  Output.prototype.trim = function(eat_newlines) {
    eat_newlines = eat_newlines === undefined ? false : eat_newlines;
    this.current_line.trim();
    while (eat_newlines && this.__lines.length > 1 && this.current_line.is_empty()) {
      this.__lines.pop();
      this.current_line = this.__lines[this.__lines.length - 1];
      this.current_line.trim();
    }
    this.previous_line = this.__lines.length > 1 ? this.__lines[this.__lines.length - 2] : null;
  };
  Output.prototype.just_added_newline = function() {
    return this.current_line.is_empty();
  };
  Output.prototype.just_added_blankline = function() {
    return this.is_empty() || this.current_line.is_empty() && this.previous_line.is_empty();
  };
  Output.prototype.ensure_empty_line_above = function(starts_with, ends_with) {
    var index = this.__lines.length - 2;
    while (index >= 0) {
      var potentialEmptyLine = this.__lines[index];
      if (potentialEmptyLine.is_empty()) {
        break;
      } else if (potentialEmptyLine.item(0).indexOf(starts_with) !== 0 && potentialEmptyLine.item(-1) !== ends_with) {
        this.__lines.splice(index + 1, 0, new OutputLine(this));
        this.previous_line = this.__lines[this.__lines.length - 2];
        break;
      }
      index--;
    }
  };
  exports.Output = Output;
});

// node_modules/js-beautify/js/src/core/token.js
var require_token = __commonJS((exports, module) => {
  function Token(type, text, newlines, whitespace_before) {
    this.type = type;
    this.text = text;
    this.comments_before = null;
    this.newlines = newlines || 0;
    this.whitespace_before = whitespace_before || "";
    this.parent = null;
    this.next = null;
    this.previous = null;
    this.opened = null;
    this.closed = null;
    this.directives = null;
  }
  exports.Token = Token;
});

// node_modules/js-beautify/js/src/javascript/acorn.js
var require_acorn = __commonJS((exports) => {
  var baseASCIIidentifierStartChars = "\\x23\\x24\\x40\\x41-\\x5a\\x5f\\x61-\\x7a";
  var baseASCIIidentifierChars = "\\x24\\x30-\\x39\\x41-\\x5a\\x5f\\x61-\\x7a";
  var nonASCIIidentifierStartChars = "\\xaa\\xb5\\xba\\xc0-\\xd6\\xd8-\\xf6\\xf8-\\u02c1\\u02c6-\\u02d1\\u02e0-\\u02e4\\u02ec\\u02ee\\u0370-\\u0374\\u0376\\u0377\\u037a-\\u037d\\u0386\\u0388-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03f5\\u03f7-\\u0481\\u048a-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05d0-\\u05ea\\u05f0-\\u05f2\\u0620-\\u064a\\u066e\\u066f\\u0671-\\u06d3\\u06d5\\u06e5\\u06e6\\u06ee\\u06ef\\u06fa-\\u06fc\\u06ff\\u0710\\u0712-\\u072f\\u074d-\\u07a5\\u07b1\\u07ca-\\u07ea\\u07f4\\u07f5\\u07fa\\u0800-\\u0815\\u081a\\u0824\\u0828\\u0840-\\u0858\\u08a0\\u08a2-\\u08ac\\u0904-\\u0939\\u093d\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097f\\u0985-\\u098c\\u098f\\u0990\\u0993-\\u09a8\\u09aa-\\u09b0\\u09b2\\u09b6-\\u09b9\\u09bd\\u09ce\\u09dc\\u09dd\\u09df-\\u09e1\\u09f0\\u09f1\\u0a05-\\u0a0a\\u0a0f\\u0a10\\u0a13-\\u0a28\\u0a2a-\\u0a30\\u0a32\\u0a33\\u0a35\\u0a36\\u0a38\\u0a39\\u0a59-\\u0a5c\\u0a5e\\u0a72-\\u0a74\\u0a85-\\u0a8d\\u0a8f-\\u0a91\\u0a93-\\u0aa8\\u0aaa-\\u0ab0\\u0ab2\\u0ab3\\u0ab5-\\u0ab9\\u0abd\\u0ad0\\u0ae0\\u0ae1\\u0b05-\\u0b0c\\u0b0f\\u0b10\\u0b13-\\u0b28\\u0b2a-\\u0b30\\u0b32\\u0b33\\u0b35-\\u0b39\\u0b3d\\u0b5c\\u0b5d\\u0b5f-\\u0b61\\u0b71\\u0b83\\u0b85-\\u0b8a\\u0b8e-\\u0b90\\u0b92-\\u0b95\\u0b99\\u0b9a\\u0b9c\\u0b9e\\u0b9f\\u0ba3\\u0ba4\\u0ba8-\\u0baa\\u0bae-\\u0bb9\\u0bd0\\u0c05-\\u0c0c\\u0c0e-\\u0c10\\u0c12-\\u0c28\\u0c2a-\\u0c33\\u0c35-\\u0c39\\u0c3d\\u0c58\\u0c59\\u0c60\\u0c61\\u0c85-\\u0c8c\\u0c8e-\\u0c90\\u0c92-\\u0ca8\\u0caa-\\u0cb3\\u0cb5-\\u0cb9\\u0cbd\\u0cde\\u0ce0\\u0ce1\\u0cf1\\u0cf2\\u0d05-\\u0d0c\\u0d0e-\\u0d10\\u0d12-\\u0d3a\\u0d3d\\u0d4e\\u0d60\\u0d61\\u0d7a-\\u0d7f\\u0d85-\\u0d96\\u0d9a-\\u0db1\\u0db3-\\u0dbb\\u0dbd\\u0dc0-\\u0dc6\\u0e01-\\u0e30\\u0e32\\u0e33\\u0e40-\\u0e46\\u0e81\\u0e82\\u0e84\\u0e87\\u0e88\\u0e8a\\u0e8d\\u0e94-\\u0e97\\u0e99-\\u0e9f\\u0ea1-\\u0ea3\\u0ea5\\u0ea7\\u0eaa\\u0eab\\u0ead-\\u0eb0\\u0eb2\\u0eb3\\u0ebd\\u0ec0-\\u0ec4\\u0ec6\\u0edc-\\u0edf\\u0f00\\u0f40-\\u0f47\\u0f49-\\u0f6c\\u0f88-\\u0f8c\\u1000-\\u102a\\u103f\\u1050-\\u1055\\u105a-\\u105d\\u1061\\u1065\\u1066\\u106e-\\u1070\\u1075-\\u1081\\u108e\\u10a0-\\u10c5\\u10c7\\u10cd\\u10d0-\\u10fa\\u10fc-\\u1248\\u124a-\\u124d\\u1250-\\u1256\\u1258\\u125a-\\u125d\\u1260-\\u1288\\u128a-\\u128d\\u1290-\\u12b0\\u12b2-\\u12b5\\u12b8-\\u12be\\u12c0\\u12c2-\\u12c5\\u12c8-\\u12d6\\u12d8-\\u1310\\u1312-\\u1315\\u1318-\\u135a\\u1380-\\u138f\\u13a0-\\u13f4\\u1401-\\u166c\\u166f-\\u167f\\u1681-\\u169a\\u16a0-\\u16ea\\u16ee-\\u16f0\\u1700-\\u170c\\u170e-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176c\\u176e-\\u1770\\u1780-\\u17b3\\u17d7\\u17dc\\u1820-\\u1877\\u1880-\\u18a8\\u18aa\\u18b0-\\u18f5\\u1900-\\u191c\\u1950-\\u196d\\u1970-\\u1974\\u1980-\\u19ab\\u19c1-\\u19c7\\u1a00-\\u1a16\\u1a20-\\u1a54\\u1aa7\\u1b05-\\u1b33\\u1b45-\\u1b4b\\u1b83-\\u1ba0\\u1bae\\u1baf\\u1bba-\\u1be5\\u1c00-\\u1c23\\u1c4d-\\u1c4f\\u1c5a-\\u1c7d\\u1ce9-\\u1cec\\u1cee-\\u1cf1\\u1cf5\\u1cf6\\u1d00-\\u1dbf\\u1e00-\\u1f15\\u1f18-\\u1f1d\\u1f20-\\u1f45\\u1f48-\\u1f4d\\u1f50-\\u1f57\\u1f59\\u1f5b\\u1f5d\\u1f5f-\\u1f7d\\u1f80-\\u1fb4\\u1fb6-\\u1fbc\\u1fbe\\u1fc2-\\u1fc4\\u1fc6-\\u1fcc\\u1fd0-\\u1fd3\\u1fd6-\\u1fdb\\u1fe0-\\u1fec\\u1ff2-\\u1ff4\\u1ff6-\\u1ffc\\u2071\\u207f\\u2090-\\u209c\\u2102\\u2107\\u210a-\\u2113\\u2115\\u2119-\\u211d\\u2124\\u2126\\u2128\\u212a-\\u212d\\u212f-\\u2139\\u213c-\\u213f\\u2145-\\u2149\\u214e\\u2160-\\u2188\\u2c00-\\u2c2e\\u2c30-\\u2c5e\\u2c60-\\u2ce4\\u2ceb-\\u2cee\\u2cf2\\u2cf3\\u2d00-\\u2d25\\u2d27\\u2d2d\\u2d30-\\u2d67\\u2d6f\\u2d80-\\u2d96\\u2da0-\\u2da6\\u2da8-\\u2dae\\u2db0-\\u2db6\\u2db8-\\u2dbe\\u2dc0-\\u2dc6\\u2dc8-\\u2dce\\u2dd0-\\u2dd6\\u2dd8-\\u2dde\\u2e2f\\u3005-\\u3007\\u3021-\\u3029\\u3031-\\u3035\\u3038-\\u303c\\u3041-\\u3096\\u309d-\\u309f\\u30a1-\\u30fa\\u30fc-\\u30ff\\u3105-\\u312d\\u3131-\\u318e\\u31a0-\\u31ba\\u31f0-\\u31ff\\u3400-\\u4db5\\u4e00-\\u9fcc\\ua000-\\ua48c\\ua4d0-\\ua4fd\\ua500-\\ua60c\\ua610-\\ua61f\\ua62a\\ua62b\\ua640-\\ua66e\\ua67f-\\ua697\\ua6a0-\\ua6ef\\ua717-\\ua71f\\ua722-\\ua788\\ua78b-\\ua78e\\ua790-\\ua793\\ua7a0-\\ua7aa\\ua7f8-\\ua801\\ua803-\\ua805\\ua807-\\ua80a\\ua80c-\\ua822\\ua840-\\ua873\\ua882-\\ua8b3\\ua8f2-\\ua8f7\\ua8fb\\ua90a-\\ua925\\ua930-\\ua946\\ua960-\\ua97c\\ua984-\\ua9b2\\ua9cf\\uaa00-\\uaa28\\uaa40-\\uaa42\\uaa44-\\uaa4b\\uaa60-\\uaa76\\uaa7a\\uaa80-\\uaaaf\\uaab1\\uaab5\\uaab6\\uaab9-\\uaabd\\uaac0\\uaac2\\uaadb-\\uaadd\\uaae0-\\uaaea\\uaaf2-\\uaaf4\\uab01-\\uab06\\uab09-\\uab0e\\uab11-\\uab16\\uab20-\\uab26\\uab28-\\uab2e\\uabc0-\\uabe2\\uac00-\\ud7a3\\ud7b0-\\ud7c6\\ud7cb-\\ud7fb\\uf900-\\ufa6d\\ufa70-\\ufad9\\ufb00-\\ufb06\\ufb13-\\ufb17\\ufb1d\\ufb1f-\\ufb28\\ufb2a-\\ufb36\\ufb38-\\ufb3c\\ufb3e\\ufb40\\ufb41\\ufb43\\ufb44\\ufb46-\\ufbb1\\ufbd3-\\ufd3d\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufdf0-\\ufdfb\\ufe70-\\ufe74\\ufe76-\\ufefc\\uff21-\\uff3a\\uff41-\\uff5a\\uff66-\\uffbe\\uffc2-\\uffc7\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc";
  var nonASCIIidentifierChars = "\\u0300-\\u036f\\u0483-\\u0487\\u0591-\\u05bd\\u05bf\\u05c1\\u05c2\\u05c4\\u05c5\\u05c7\\u0610-\\u061a\\u0620-\\u0649\\u0672-\\u06d3\\u06e7-\\u06e8\\u06fb-\\u06fc\\u0730-\\u074a\\u0800-\\u0814\\u081b-\\u0823\\u0825-\\u0827\\u0829-\\u082d\\u0840-\\u0857\\u08e4-\\u08fe\\u0900-\\u0903\\u093a-\\u093c\\u093e-\\u094f\\u0951-\\u0957\\u0962-\\u0963\\u0966-\\u096f\\u0981-\\u0983\\u09bc\\u09be-\\u09c4\\u09c7\\u09c8\\u09d7\\u09df-\\u09e0\\u0a01-\\u0a03\\u0a3c\\u0a3e-\\u0a42\\u0a47\\u0a48\\u0a4b-\\u0a4d\\u0a51\\u0a66-\\u0a71\\u0a75\\u0a81-\\u0a83\\u0abc\\u0abe-\\u0ac5\\u0ac7-\\u0ac9\\u0acb-\\u0acd\\u0ae2-\\u0ae3\\u0ae6-\\u0aef\\u0b01-\\u0b03\\u0b3c\\u0b3e-\\u0b44\\u0b47\\u0b48\\u0b4b-\\u0b4d\\u0b56\\u0b57\\u0b5f-\\u0b60\\u0b66-\\u0b6f\\u0b82\\u0bbe-\\u0bc2\\u0bc6-\\u0bc8\\u0bca-\\u0bcd\\u0bd7\\u0be6-\\u0bef\\u0c01-\\u0c03\\u0c46-\\u0c48\\u0c4a-\\u0c4d\\u0c55\\u0c56\\u0c62-\\u0c63\\u0c66-\\u0c6f\\u0c82\\u0c83\\u0cbc\\u0cbe-\\u0cc4\\u0cc6-\\u0cc8\\u0cca-\\u0ccd\\u0cd5\\u0cd6\\u0ce2-\\u0ce3\\u0ce6-\\u0cef\\u0d02\\u0d03\\u0d46-\\u0d48\\u0d57\\u0d62-\\u0d63\\u0d66-\\u0d6f\\u0d82\\u0d83\\u0dca\\u0dcf-\\u0dd4\\u0dd6\\u0dd8-\\u0ddf\\u0df2\\u0df3\\u0e34-\\u0e3a\\u0e40-\\u0e45\\u0e50-\\u0e59\\u0eb4-\\u0eb9\\u0ec8-\\u0ecd\\u0ed0-\\u0ed9\\u0f18\\u0f19\\u0f20-\\u0f29\\u0f35\\u0f37\\u0f39\\u0f41-\\u0f47\\u0f71-\\u0f84\\u0f86-\\u0f87\\u0f8d-\\u0f97\\u0f99-\\u0fbc\\u0fc6\\u1000-\\u1029\\u1040-\\u1049\\u1067-\\u106d\\u1071-\\u1074\\u1082-\\u108d\\u108f-\\u109d\\u135d-\\u135f\\u170e-\\u1710\\u1720-\\u1730\\u1740-\\u1750\\u1772\\u1773\\u1780-\\u17b2\\u17dd\\u17e0-\\u17e9\\u180b-\\u180d\\u1810-\\u1819\\u1920-\\u192b\\u1930-\\u193b\\u1951-\\u196d\\u19b0-\\u19c0\\u19c8-\\u19c9\\u19d0-\\u19d9\\u1a00-\\u1a15\\u1a20-\\u1a53\\u1a60-\\u1a7c\\u1a7f-\\u1a89\\u1a90-\\u1a99\\u1b46-\\u1b4b\\u1b50-\\u1b59\\u1b6b-\\u1b73\\u1bb0-\\u1bb9\\u1be6-\\u1bf3\\u1c00-\\u1c22\\u1c40-\\u1c49\\u1c5b-\\u1c7d\\u1cd0-\\u1cd2\\u1d00-\\u1dbe\\u1e01-\\u1f15\\u200c\\u200d\\u203f\\u2040\\u2054\\u20d0-\\u20dc\\u20e1\\u20e5-\\u20f0\\u2d81-\\u2d96\\u2de0-\\u2dff\\u3021-\\u3028\\u3099\\u309a\\ua640-\\ua66d\\ua674-\\ua67d\\ua69f\\ua6f0-\\ua6f1\\ua7f8-\\ua800\\ua806\\ua80b\\ua823-\\ua827\\ua880-\\ua881\\ua8b4-\\ua8c4\\ua8d0-\\ua8d9\\ua8f3-\\ua8f7\\ua900-\\ua909\\ua926-\\ua92d\\ua930-\\ua945\\ua980-\\ua983\\ua9b3-\\ua9c0\\uaa00-\\uaa27\\uaa40-\\uaa41\\uaa4c-\\uaa4d\\uaa50-\\uaa59\\uaa7b\\uaae0-\\uaae9\\uaaf2-\\uaaf3\\uabc0-\\uabe1\\uabec\\uabed\\uabf0-\\uabf9\\ufb20-\\ufb28\\ufe00-\\ufe0f\\ufe20-\\ufe26\\ufe33\\ufe34\\ufe4d-\\ufe4f\\uff10-\\uff19\\uff3f";
  var unicodeEscapeOrCodePoint = "\\\\u[0-9a-fA-F]{4}|\\\\u\\{[0-9a-fA-F]+\\}";
  var identifierStart = "(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierStartChars + nonASCIIidentifierStartChars + "])";
  var identifierChars = "(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])*";
  exports.identifier = new RegExp(identifierStart + identifierChars, "g");
  exports.identifierStart = new RegExp(identifierStart);
  exports.identifierMatch = new RegExp("(?:" + unicodeEscapeOrCodePoint + "|[" + baseASCIIidentifierChars + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "])+");
  exports.newline = /[\n\r\u2028\u2029]/;
  exports.lineBreak = new RegExp(`\r
|` + exports.newline.source);
  exports.allLineBreaks = new RegExp(exports.lineBreak.source, "g");
});

// node_modules/js-beautify/js/src/core/options.js
var require_options = __commonJS((exports, module) => {
  function Options(options, merge_child_field) {
    this.raw_options = _mergeOpts(options, merge_child_field);
    this.disabled = this._get_boolean("disabled");
    this.eol = this._get_characters("eol", "auto");
    this.end_with_newline = this._get_boolean("end_with_newline");
    this.indent_size = this._get_number("indent_size", 4);
    this.indent_char = this._get_characters("indent_char", " ");
    this.indent_level = this._get_number("indent_level");
    this.preserve_newlines = this._get_boolean("preserve_newlines", true);
    this.max_preserve_newlines = this._get_number("max_preserve_newlines", 32786);
    if (!this.preserve_newlines) {
      this.max_preserve_newlines = 0;
    }
    this.indent_with_tabs = this._get_boolean("indent_with_tabs", this.indent_char === "\t");
    if (this.indent_with_tabs) {
      this.indent_char = "\t";
      if (this.indent_size === 1) {
        this.indent_size = 4;
      }
    }
    this.wrap_line_length = this._get_number("wrap_line_length", this._get_number("max_char"));
    this.indent_empty_lines = this._get_boolean("indent_empty_lines");
    this.templating = this._get_selection_list("templating", ["auto", "none", "angular", "django", "erb", "handlebars", "php", "smarty"], ["auto"]);
  }
  Options.prototype._get_array = function(name, default_value) {
    var option_value = this.raw_options[name];
    var result = default_value || [];
    if (typeof option_value === "object") {
      if (option_value !== null && typeof option_value.concat === "function") {
        result = option_value.concat();
      }
    } else if (typeof option_value === "string") {
      result = option_value.split(/[^a-zA-Z0-9_\/\-]+/);
    }
    return result;
  };
  Options.prototype._get_boolean = function(name, default_value) {
    var option_value = this.raw_options[name];
    var result = option_value === undefined ? !!default_value : !!option_value;
    return result;
  };
  Options.prototype._get_characters = function(name, default_value) {
    var option_value = this.raw_options[name];
    var result = default_value || "";
    if (typeof option_value === "string") {
      result = option_value.replace(/\\r/, "\r").replace(/\\n/, `
`).replace(/\\t/, "\t");
    }
    return result;
  };
  Options.prototype._get_number = function(name, default_value) {
    var option_value = this.raw_options[name];
    default_value = parseInt(default_value, 10);
    if (isNaN(default_value)) {
      default_value = 0;
    }
    var result = parseInt(option_value, 10);
    if (isNaN(result)) {
      result = default_value;
    }
    return result;
  };
  Options.prototype._get_selection = function(name, selection_list, default_value) {
    var result = this._get_selection_list(name, selection_list, default_value);
    if (result.length !== 1) {
      throw new Error("Invalid Option Value: The option '" + name + `' can only be one of the following values:
` + selection_list + `
You passed in: '` + this.raw_options[name] + "'");
    }
    return result[0];
  };
  Options.prototype._get_selection_list = function(name, selection_list, default_value) {
    if (!selection_list || selection_list.length === 0) {
      throw new Error("Selection list cannot be empty.");
    }
    default_value = default_value || [selection_list[0]];
    if (!this._is_valid_selection(default_value, selection_list)) {
      throw new Error("Invalid Default Value!");
    }
    var result = this._get_array(name, default_value);
    if (!this._is_valid_selection(result, selection_list)) {
      throw new Error("Invalid Option Value: The option '" + name + `' can contain only the following values:
` + selection_list + `
You passed in: '` + this.raw_options[name] + "'");
    }
    return result;
  };
  Options.prototype._is_valid_selection = function(result, selection_list) {
    return result.length && selection_list.length && !result.some(function(item) {
      return selection_list.indexOf(item) === -1;
    });
  };
  function _mergeOpts(allOptions, childFieldName) {
    var finalOpts = {};
    allOptions = _normalizeOpts(allOptions);
    var name;
    for (name in allOptions) {
      if (name !== childFieldName) {
        finalOpts[name] = allOptions[name];
      }
    }
    if (childFieldName && allOptions[childFieldName]) {
      for (name in allOptions[childFieldName]) {
        finalOpts[name] = allOptions[childFieldName][name];
      }
    }
    return finalOpts;
  }
  function _normalizeOpts(options) {
    var convertedOpts = {};
    var key;
    for (key in options) {
      var newKey = key.replace(/-/g, "_");
      convertedOpts[newKey] = options[key];
    }
    return convertedOpts;
  }
  exports.Options = Options;
  exports.normalizeOpts = _normalizeOpts;
  exports.mergeOpts = _mergeOpts;
});

// node_modules/js-beautify/js/src/javascript/options.js
var require_options2 = __commonJS((exports, module) => {
  var BaseOptions = require_options().Options;
  var validPositionValues = ["before-newline", "after-newline", "preserve-newline"];
  function Options(options) {
    BaseOptions.call(this, options, "js");
    var raw_brace_style = this.raw_options.brace_style || null;
    if (raw_brace_style === "expand-strict") {
      this.raw_options.brace_style = "expand";
    } else if (raw_brace_style === "collapse-preserve-inline") {
      this.raw_options.brace_style = "collapse,preserve-inline";
    } else if (this.raw_options.braces_on_own_line !== undefined) {
      this.raw_options.brace_style = this.raw_options.braces_on_own_line ? "expand" : "collapse";
    }
    var brace_style_split = this._get_selection_list("brace_style", ["collapse", "expand", "end-expand", "none", "preserve-inline"]);
    this.brace_preserve_inline = false;
    this.brace_style = "collapse";
    for (var bs = 0;bs < brace_style_split.length; bs++) {
      if (brace_style_split[bs] === "preserve-inline") {
        this.brace_preserve_inline = true;
      } else {
        this.brace_style = brace_style_split[bs];
      }
    }
    this.unindent_chained_methods = this._get_boolean("unindent_chained_methods");
    this.break_chained_methods = this._get_boolean("break_chained_methods");
    this.space_in_paren = this._get_boolean("space_in_paren");
    this.space_in_empty_paren = this._get_boolean("space_in_empty_paren");
    this.jslint_happy = this._get_boolean("jslint_happy");
    this.space_after_anon_function = this._get_boolean("space_after_anon_function");
    this.space_after_named_function = this._get_boolean("space_after_named_function");
    this.keep_array_indentation = this._get_boolean("keep_array_indentation");
    this.space_before_conditional = this._get_boolean("space_before_conditional", true);
    this.unescape_strings = this._get_boolean("unescape_strings");
    this.e4x = this._get_boolean("e4x");
    this.comma_first = this._get_boolean("comma_first");
    this.operator_position = this._get_selection("operator_position", validPositionValues);
    this.test_output_raw = this._get_boolean("test_output_raw");
    if (this.jslint_happy) {
      this.space_after_anon_function = true;
    }
  }
  Options.prototype = new BaseOptions;
  exports.Options = Options;
});

// node_modules/js-beautify/js/src/core/inputscanner.js
var require_inputscanner = __commonJS((exports, module) => {
  var regexp_has_sticky = RegExp.prototype.hasOwnProperty("sticky");
  function InputScanner(input_string) {
    this.__input = input_string || "";
    this.__input_length = this.__input.length;
    this.__position = 0;
  }
  InputScanner.prototype.restart = function() {
    this.__position = 0;
  };
  InputScanner.prototype.back = function() {
    if (this.__position > 0) {
      this.__position -= 1;
    }
  };
  InputScanner.prototype.hasNext = function() {
    return this.__position < this.__input_length;
  };
  InputScanner.prototype.next = function() {
    var val = null;
    if (this.hasNext()) {
      val = this.__input.charAt(this.__position);
      this.__position += 1;
    }
    return val;
  };
  InputScanner.prototype.peek = function(index) {
    var val = null;
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__input_length) {
      val = this.__input.charAt(index);
    }
    return val;
  };
  InputScanner.prototype.__match = function(pattern, index) {
    pattern.lastIndex = index;
    var pattern_match = pattern.exec(this.__input);
    if (pattern_match && !(regexp_has_sticky && pattern.sticky)) {
      if (pattern_match.index !== index) {
        pattern_match = null;
      }
    }
    return pattern_match;
  };
  InputScanner.prototype.test = function(pattern, index) {
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__input_length) {
      return !!this.__match(pattern, index);
    } else {
      return false;
    }
  };
  InputScanner.prototype.testChar = function(pattern, index) {
    var val = this.peek(index);
    pattern.lastIndex = 0;
    return val !== null && pattern.test(val);
  };
  InputScanner.prototype.match = function(pattern) {
    var pattern_match = this.__match(pattern, this.__position);
    if (pattern_match) {
      this.__position += pattern_match[0].length;
    } else {
      pattern_match = null;
    }
    return pattern_match;
  };
  InputScanner.prototype.read = function(starting_pattern, until_pattern, until_after) {
    var val = "";
    var match;
    if (starting_pattern) {
      match = this.match(starting_pattern);
      if (match) {
        val += match[0];
      }
    }
    if (until_pattern && (match || !starting_pattern)) {
      val += this.readUntil(until_pattern, until_after);
    }
    return val;
  };
  InputScanner.prototype.readUntil = function(pattern, until_after) {
    var val = "";
    var match_index = this.__position;
    pattern.lastIndex = this.__position;
    var pattern_match = pattern.exec(this.__input);
    if (pattern_match) {
      match_index = pattern_match.index;
      if (until_after) {
        match_index += pattern_match[0].length;
      }
    } else {
      match_index = this.__input_length;
    }
    val = this.__input.substring(this.__position, match_index);
    this.__position = match_index;
    return val;
  };
  InputScanner.prototype.readUntilAfter = function(pattern) {
    return this.readUntil(pattern, true);
  };
  InputScanner.prototype.get_regexp = function(pattern, match_from) {
    var result = null;
    var flags = "g";
    if (match_from && regexp_has_sticky) {
      flags = "y";
    }
    if (typeof pattern === "string" && pattern !== "") {
      result = new RegExp(pattern, flags);
    } else if (pattern) {
      result = new RegExp(pattern.source, flags);
    }
    return result;
  };
  InputScanner.prototype.get_literal_regexp = function(literal_string) {
    return RegExp(literal_string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
  };
  InputScanner.prototype.peekUntilAfter = function(pattern) {
    var start = this.__position;
    var val = this.readUntilAfter(pattern);
    this.__position = start;
    return val;
  };
  InputScanner.prototype.lookBack = function(testVal) {
    var start = this.__position - 1;
    return start >= testVal.length && this.__input.substring(start - testVal.length, start).toLowerCase() === testVal;
  };
  exports.InputScanner = InputScanner;
});

// node_modules/js-beautify/js/src/core/tokenstream.js
var require_tokenstream = __commonJS((exports, module) => {
  function TokenStream(parent_token) {
    this.__tokens = [];
    this.__tokens_length = this.__tokens.length;
    this.__position = 0;
    this.__parent_token = parent_token;
  }
  TokenStream.prototype.restart = function() {
    this.__position = 0;
  };
  TokenStream.prototype.isEmpty = function() {
    return this.__tokens_length === 0;
  };
  TokenStream.prototype.hasNext = function() {
    return this.__position < this.__tokens_length;
  };
  TokenStream.prototype.next = function() {
    var val = null;
    if (this.hasNext()) {
      val = this.__tokens[this.__position];
      this.__position += 1;
    }
    return val;
  };
  TokenStream.prototype.peek = function(index) {
    var val = null;
    index = index || 0;
    index += this.__position;
    if (index >= 0 && index < this.__tokens_length) {
      val = this.__tokens[index];
    }
    return val;
  };
  TokenStream.prototype.add = function(token) {
    if (this.__parent_token) {
      token.parent = this.__parent_token;
    }
    this.__tokens.push(token);
    this.__tokens_length += 1;
  };
  exports.TokenStream = TokenStream;
});

// node_modules/js-beautify/js/src/core/pattern.js
var require_pattern = __commonJS((exports, module) => {
  function Pattern(input_scanner, parent) {
    this._input = input_scanner;
    this._starting_pattern = null;
    this._match_pattern = null;
    this._until_pattern = null;
    this._until_after = false;
    if (parent) {
      this._starting_pattern = this._input.get_regexp(parent._starting_pattern, true);
      this._match_pattern = this._input.get_regexp(parent._match_pattern, true);
      this._until_pattern = this._input.get_regexp(parent._until_pattern);
      this._until_after = parent._until_after;
    }
  }
  Pattern.prototype.read = function() {
    var result = this._input.read(this._starting_pattern);
    if (!this._starting_pattern || result) {
      result += this._input.read(this._match_pattern, this._until_pattern, this._until_after);
    }
    return result;
  };
  Pattern.prototype.read_match = function() {
    return this._input.match(this._match_pattern);
  };
  Pattern.prototype.until_after = function(pattern) {
    var result = this._create();
    result._until_after = true;
    result._until_pattern = this._input.get_regexp(pattern);
    result._update();
    return result;
  };
  Pattern.prototype.until = function(pattern) {
    var result = this._create();
    result._until_after = false;
    result._until_pattern = this._input.get_regexp(pattern);
    result._update();
    return result;
  };
  Pattern.prototype.starting_with = function(pattern) {
    var result = this._create();
    result._starting_pattern = this._input.get_regexp(pattern, true);
    result._update();
    return result;
  };
  Pattern.prototype.matching = function(pattern) {
    var result = this._create();
    result._match_pattern = this._input.get_regexp(pattern, true);
    result._update();
    return result;
  };
  Pattern.prototype._create = function() {
    return new Pattern(this._input, this);
  };
  Pattern.prototype._update = function() {};
  exports.Pattern = Pattern;
});

// node_modules/js-beautify/js/src/core/whitespacepattern.js
var require_whitespacepattern = __commonJS((exports, module) => {
  var Pattern = require_pattern().Pattern;
  function WhitespacePattern(input_scanner, parent) {
    Pattern.call(this, input_scanner, parent);
    if (parent) {
      this._line_regexp = this._input.get_regexp(parent._line_regexp);
    } else {
      this.__set_whitespace_patterns("", "");
    }
    this.newline_count = 0;
    this.whitespace_before_token = "";
  }
  WhitespacePattern.prototype = new Pattern;
  WhitespacePattern.prototype.__set_whitespace_patterns = function(whitespace_chars, newline_chars) {
    whitespace_chars += "\\t ";
    newline_chars += "\\n\\r";
    this._match_pattern = this._input.get_regexp("[" + whitespace_chars + newline_chars + "]+", true);
    this._newline_regexp = this._input.get_regexp("\\r\\n|[" + newline_chars + "]");
  };
  WhitespacePattern.prototype.read = function() {
    this.newline_count = 0;
    this.whitespace_before_token = "";
    var resulting_string = this._input.read(this._match_pattern);
    if (resulting_string === " ") {
      this.whitespace_before_token = " ";
    } else if (resulting_string) {
      var matches = this.__split(this._newline_regexp, resulting_string);
      this.newline_count = matches.length - 1;
      this.whitespace_before_token = matches[this.newline_count];
    }
    return resulting_string;
  };
  WhitespacePattern.prototype.matching = function(whitespace_chars, newline_chars) {
    var result = this._create();
    result.__set_whitespace_patterns(whitespace_chars, newline_chars);
    result._update();
    return result;
  };
  WhitespacePattern.prototype._create = function() {
    return new WhitespacePattern(this._input, this);
  };
  WhitespacePattern.prototype.__split = function(regexp, input_string) {
    regexp.lastIndex = 0;
    var start_index = 0;
    var result = [];
    var next_match = regexp.exec(input_string);
    while (next_match) {
      result.push(input_string.substring(start_index, next_match.index));
      start_index = next_match.index + next_match[0].length;
      next_match = regexp.exec(input_string);
    }
    if (start_index < input_string.length) {
      result.push(input_string.substring(start_index, input_string.length));
    } else {
      result.push("");
    }
    return result;
  };
  exports.WhitespacePattern = WhitespacePattern;
});

// node_modules/js-beautify/js/src/core/tokenizer.js
var require_tokenizer = __commonJS((exports, module) => {
  var InputScanner = require_inputscanner().InputScanner;
  var Token = require_token().Token;
  var TokenStream = require_tokenstream().TokenStream;
  var WhitespacePattern = require_whitespacepattern().WhitespacePattern;
  var TOKEN = {
    START: "TK_START",
    RAW: "TK_RAW",
    EOF: "TK_EOF"
  };
  var Tokenizer = function(input_string, options) {
    this._input = new InputScanner(input_string);
    this._options = options || {};
    this.__tokens = null;
    this._patterns = {};
    this._patterns.whitespace = new WhitespacePattern(this._input);
  };
  Tokenizer.prototype.tokenize = function() {
    this._input.restart();
    this.__tokens = new TokenStream;
    this._reset();
    var current;
    var previous = new Token(TOKEN.START, "");
    var open_token = null;
    var open_stack = [];
    var comments = new TokenStream;
    while (previous.type !== TOKEN.EOF) {
      current = this._get_next_token(previous, open_token);
      while (this._is_comment(current)) {
        comments.add(current);
        current = this._get_next_token(previous, open_token);
      }
      if (!comments.isEmpty()) {
        current.comments_before = comments;
        comments = new TokenStream;
      }
      current.parent = open_token;
      if (this._is_opening(current)) {
        open_stack.push(open_token);
        open_token = current;
      } else if (open_token && this._is_closing(current, open_token)) {
        current.opened = open_token;
        open_token.closed = current;
        open_token = open_stack.pop();
        current.parent = open_token;
      }
      current.previous = previous;
      previous.next = current;
      this.__tokens.add(current);
      previous = current;
    }
    return this.__tokens;
  };
  Tokenizer.prototype._is_first_token = function() {
    return this.__tokens.isEmpty();
  };
  Tokenizer.prototype._reset = function() {};
  Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
    this._readWhitespace();
    var resulting_string = this._input.read(/.+/g);
    if (resulting_string) {
      return this._create_token(TOKEN.RAW, resulting_string);
    } else {
      return this._create_token(TOKEN.EOF, "");
    }
  };
  Tokenizer.prototype._is_comment = function(current_token) {
    return false;
  };
  Tokenizer.prototype._is_opening = function(current_token) {
    return false;
  };
  Tokenizer.prototype._is_closing = function(current_token, open_token) {
    return false;
  };
  Tokenizer.prototype._create_token = function(type, text) {
    var token = new Token(type, text, this._patterns.whitespace.newline_count, this._patterns.whitespace.whitespace_before_token);
    return token;
  };
  Tokenizer.prototype._readWhitespace = function() {
    return this._patterns.whitespace.read();
  };
  exports.Tokenizer = Tokenizer;
  exports.TOKEN = TOKEN;
});

// node_modules/js-beautify/js/src/core/directives.js
var require_directives = __commonJS((exports, module) => {
  function Directives(start_block_pattern, end_block_pattern) {
    start_block_pattern = typeof start_block_pattern === "string" ? start_block_pattern : start_block_pattern.source;
    end_block_pattern = typeof end_block_pattern === "string" ? end_block_pattern : end_block_pattern.source;
    this.__directives_block_pattern = new RegExp(start_block_pattern + / beautify( \w+[:]\w+)+ /.source + end_block_pattern, "g");
    this.__directive_pattern = / (\w+)[:](\w+)/g;
    this.__directives_end_ignore_pattern = new RegExp(start_block_pattern + /\sbeautify\signore:end\s/.source + end_block_pattern, "g");
  }
  Directives.prototype.get_directives = function(text) {
    if (!text.match(this.__directives_block_pattern)) {
      return null;
    }
    var directives = {};
    this.__directive_pattern.lastIndex = 0;
    var directive_match = this.__directive_pattern.exec(text);
    while (directive_match) {
      directives[directive_match[1]] = directive_match[2];
      directive_match = this.__directive_pattern.exec(text);
    }
    return directives;
  };
  Directives.prototype.readIgnored = function(input) {
    return input.readUntilAfter(this.__directives_end_ignore_pattern);
  };
  exports.Directives = Directives;
});

// node_modules/js-beautify/js/src/core/templatablepattern.js
var require_templatablepattern = __commonJS((exports, module) => {
  var Pattern = require_pattern().Pattern;
  var template_names = {
    django: false,
    erb: false,
    handlebars: false,
    php: false,
    smarty: false,
    angular: false
  };
  function TemplatablePattern(input_scanner, parent) {
    Pattern.call(this, input_scanner, parent);
    this.__template_pattern = null;
    this._disabled = Object.assign({}, template_names);
    this._excluded = Object.assign({}, template_names);
    if (parent) {
      this.__template_pattern = this._input.get_regexp(parent.__template_pattern);
      this._excluded = Object.assign(this._excluded, parent._excluded);
      this._disabled = Object.assign(this._disabled, parent._disabled);
    }
    var pattern = new Pattern(input_scanner);
    this.__patterns = {
      handlebars_comment: pattern.starting_with(/{{!--/).until_after(/--}}/),
      handlebars_unescaped: pattern.starting_with(/{{{/).until_after(/}}}/),
      handlebars: pattern.starting_with(/{{/).until_after(/}}/),
      php: pattern.starting_with(/<\?(?:[= ]|php)/).until_after(/\?>/),
      erb: pattern.starting_with(/<%[^%]/).until_after(/[^%]%>/),
      django: pattern.starting_with(/{%/).until_after(/%}/),
      django_value: pattern.starting_with(/{{/).until_after(/}}/),
      django_comment: pattern.starting_with(/{#/).until_after(/#}/),
      smarty: pattern.starting_with(/{(?=[^}{\s\n])/).until_after(/[^\s\n]}/),
      smarty_comment: pattern.starting_with(/{\*/).until_after(/\*}/),
      smarty_literal: pattern.starting_with(/{literal}/).until_after(/{\/literal}/)
    };
  }
  TemplatablePattern.prototype = new Pattern;
  TemplatablePattern.prototype._create = function() {
    return new TemplatablePattern(this._input, this);
  };
  TemplatablePattern.prototype._update = function() {
    this.__set_templated_pattern();
  };
  TemplatablePattern.prototype.disable = function(language) {
    var result = this._create();
    result._disabled[language] = true;
    result._update();
    return result;
  };
  TemplatablePattern.prototype.read_options = function(options) {
    var result = this._create();
    for (var language in template_names) {
      result._disabled[language] = options.templating.indexOf(language) === -1;
    }
    result._update();
    return result;
  };
  TemplatablePattern.prototype.exclude = function(language) {
    var result = this._create();
    result._excluded[language] = true;
    result._update();
    return result;
  };
  TemplatablePattern.prototype.read = function() {
    var result = "";
    if (this._match_pattern) {
      result = this._input.read(this._starting_pattern);
    } else {
      result = this._input.read(this._starting_pattern, this.__template_pattern);
    }
    var next = this._read_template();
    while (next) {
      if (this._match_pattern) {
        next += this._input.read(this._match_pattern);
      } else {
        next += this._input.readUntil(this.__template_pattern);
      }
      result += next;
      next = this._read_template();
    }
    if (this._until_after) {
      result += this._input.readUntilAfter(this._until_pattern);
    }
    return result;
  };
  TemplatablePattern.prototype.__set_templated_pattern = function() {
    var items = [];
    if (!this._disabled.php) {
      items.push(this.__patterns.php._starting_pattern.source);
    }
    if (!this._disabled.handlebars) {
      items.push(this.__patterns.handlebars._starting_pattern.source);
    }
    if (!this._disabled.angular) {
      items.push(this.__patterns.handlebars._starting_pattern.source);
    }
    if (!this._disabled.erb) {
      items.push(this.__patterns.erb._starting_pattern.source);
    }
    if (!this._disabled.django) {
      items.push(this.__patterns.django._starting_pattern.source);
      items.push(this.__patterns.django_value._starting_pattern.source);
      items.push(this.__patterns.django_comment._starting_pattern.source);
    }
    if (!this._disabled.smarty) {
      items.push(this.__patterns.smarty._starting_pattern.source);
    }
    if (this._until_pattern) {
      items.push(this._until_pattern.source);
    }
    this.__template_pattern = this._input.get_regexp("(?:" + items.join("|") + ")");
  };
  TemplatablePattern.prototype._read_template = function() {
    var resulting_string = "";
    var c = this._input.peek();
    if (c === "<") {
      var peek1 = this._input.peek(1);
      if (!this._disabled.php && !this._excluded.php && peek1 === "?") {
        resulting_string = resulting_string || this.__patterns.php.read();
      }
      if (!this._disabled.erb && !this._excluded.erb && peek1 === "%") {
        resulting_string = resulting_string || this.__patterns.erb.read();
      }
    } else if (c === "{") {
      if (!this._disabled.handlebars && !this._excluded.handlebars) {
        resulting_string = resulting_string || this.__patterns.handlebars_comment.read();
        resulting_string = resulting_string || this.__patterns.handlebars_unescaped.read();
        resulting_string = resulting_string || this.__patterns.handlebars.read();
      }
      if (!this._disabled.django) {
        if (!this._excluded.django && !this._excluded.handlebars) {
          resulting_string = resulting_string || this.__patterns.django_value.read();
        }
        if (!this._excluded.django) {
          resulting_string = resulting_string || this.__patterns.django_comment.read();
          resulting_string = resulting_string || this.__patterns.django.read();
        }
      }
      if (!this._disabled.smarty) {
        if (this._disabled.django && this._disabled.handlebars) {
          resulting_string = resulting_string || this.__patterns.smarty_comment.read();
          resulting_string = resulting_string || this.__patterns.smarty_literal.read();
          resulting_string = resulting_string || this.__patterns.smarty.read();
        }
      }
    }
    return resulting_string;
  };
  exports.TemplatablePattern = TemplatablePattern;
});

// node_modules/js-beautify/js/src/javascript/tokenizer.js
var require_tokenizer2 = __commonJS((exports, module) => {
  var InputScanner = require_inputscanner().InputScanner;
  var BaseTokenizer = require_tokenizer().Tokenizer;
  var BASETOKEN = require_tokenizer().TOKEN;
  var Directives = require_directives().Directives;
  var acorn = require_acorn();
  var Pattern = require_pattern().Pattern;
  var TemplatablePattern = require_templatablepattern().TemplatablePattern;
  function in_array(what, arr) {
    return arr.indexOf(what) !== -1;
  }
  var TOKEN = {
    START_EXPR: "TK_START_EXPR",
    END_EXPR: "TK_END_EXPR",
    START_BLOCK: "TK_START_BLOCK",
    END_BLOCK: "TK_END_BLOCK",
    WORD: "TK_WORD",
    RESERVED: "TK_RESERVED",
    SEMICOLON: "TK_SEMICOLON",
    STRING: "TK_STRING",
    EQUALS: "TK_EQUALS",
    OPERATOR: "TK_OPERATOR",
    COMMA: "TK_COMMA",
    BLOCK_COMMENT: "TK_BLOCK_COMMENT",
    COMMENT: "TK_COMMENT",
    DOT: "TK_DOT",
    UNKNOWN: "TK_UNKNOWN",
    START: BASETOKEN.START,
    RAW: BASETOKEN.RAW,
    EOF: BASETOKEN.EOF
  };
  var directives_core = new Directives(/\/\*/, /\*\//);
  var number_pattern = /0[xX][0123456789abcdefABCDEF_]*n?|0[oO][01234567_]*n?|0[bB][01_]*n?|\d[\d_]*n|(?:\.\d[\d_]*|\d[\d_]*\.?[\d_]*)(?:[eE][+-]?[\d_]+)?/;
  var digit = /[0-9]/;
  var dot_pattern = /[^\d\.]/;
  var positionable_operators = (">>> === !== &&= ??= ||= " + "<< && >= ** != == <= >> || ?? |> " + "< / - + > : & % ? ^ | *").split(" ");
  var punct = ">>>= " + "... >>= <<= === >>> !== **= &&= ??= ||= " + "=> ^= :: /= << <= == && -= >= >> != -- += ** || ?? ++ %= &= *= |= |> " + "= ! ? > < : / ^ - + * & % ~ |";
  punct = punct.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
  punct = "\\?\\.(?!\\d) " + punct;
  punct = punct.replace(/ /g, "|");
  var punct_pattern = new RegExp(punct);
  var line_starters = "continue,try,throw,return,var,let,const,if,switch,case,default,for,while,break,function,import,export".split(",");
  var reserved_words = line_starters.concat(["do", "in", "of", "else", "get", "set", "new", "catch", "finally", "typeof", "yield", "async", "await", "from", "as", "class", "extends"]);
  var reserved_word_pattern = new RegExp("^(?:" + reserved_words.join("|") + ")$");
  var in_html_comment;
  var Tokenizer = function(input_string, options) {
    BaseTokenizer.call(this, input_string, options);
    this._patterns.whitespace = this._patterns.whitespace.matching(/\u00A0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff/.source, /\u2028\u2029/.source);
    var pattern_reader = new Pattern(this._input);
    var templatable = new TemplatablePattern(this._input).read_options(this._options);
    this.__patterns = {
      template: templatable,
      identifier: templatable.starting_with(acorn.identifier).matching(acorn.identifierMatch),
      number: pattern_reader.matching(number_pattern),
      punct: pattern_reader.matching(punct_pattern),
      comment: pattern_reader.starting_with(/\/\//).until(/[\n\r\u2028\u2029]/),
      block_comment: pattern_reader.starting_with(/\/\*/).until_after(/\*\//),
      html_comment_start: pattern_reader.matching(/<!--/),
      html_comment_end: pattern_reader.matching(/-->/),
      include: pattern_reader.starting_with(/#include/).until_after(acorn.lineBreak),
      shebang: pattern_reader.starting_with(/#!/).until_after(acorn.lineBreak),
      xml: pattern_reader.matching(/[\s\S]*?<(\/?)([-a-zA-Z:0-9_.]+|{[^}]+?}|!\[CDATA\[[^\]]*?\]\]|)(\s*{[^}]+?}|\s+[-a-zA-Z:0-9_.]+|\s+[-a-zA-Z:0-9_.]+\s*=\s*('[^']*'|"[^"]*"|{([^{}]|{[^}]+?})+?}))*\s*(\/?)\s*>/),
      single_quote: templatable.until(/['\\\n\r\u2028\u2029]/),
      double_quote: templatable.until(/["\\\n\r\u2028\u2029]/),
      template_text: templatable.until(/[`\\$]/),
      template_expression: templatable.until(/[`}\\]/)
    };
  };
  Tokenizer.prototype = new BaseTokenizer;
  Tokenizer.prototype._is_comment = function(current_token) {
    return current_token.type === TOKEN.COMMENT || current_token.type === TOKEN.BLOCK_COMMENT || current_token.type === TOKEN.UNKNOWN;
  };
  Tokenizer.prototype._is_opening = function(current_token) {
    return current_token.type === TOKEN.START_BLOCK || current_token.type === TOKEN.START_EXPR;
  };
  Tokenizer.prototype._is_closing = function(current_token, open_token) {
    return (current_token.type === TOKEN.END_BLOCK || current_token.type === TOKEN.END_EXPR) && (open_token && (current_token.text === "]" && open_token.text === "[" || current_token.text === ")" && open_token.text === "(" || current_token.text === "}" && open_token.text === "{"));
  };
  Tokenizer.prototype._reset = function() {
    in_html_comment = false;
  };
  Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
    var token = null;
    this._readWhitespace();
    var c = this._input.peek();
    if (c === null) {
      return this._create_token(TOKEN.EOF, "");
    }
    token = token || this._read_non_javascript(c);
    token = token || this._read_string(c);
    token = token || this._read_pair(c, this._input.peek(1));
    token = token || this._read_word(previous_token);
    token = token || this._read_singles(c);
    token = token || this._read_comment(c);
    token = token || this._read_regexp(c, previous_token);
    token = token || this._read_xml(c, previous_token);
    token = token || this._read_punctuation();
    token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
    return token;
  };
  Tokenizer.prototype._read_word = function(previous_token) {
    var resulting_string;
    resulting_string = this.__patterns.identifier.read();
    if (resulting_string !== "") {
      resulting_string = resulting_string.replace(acorn.allLineBreaks, `
`);
      if (!(previous_token.type === TOKEN.DOT || previous_token.type === TOKEN.RESERVED && (previous_token.text === "set" || previous_token.text === "get")) && reserved_word_pattern.test(resulting_string)) {
        if ((resulting_string === "in" || resulting_string === "of") && (previous_token.type === TOKEN.WORD || previous_token.type === TOKEN.STRING)) {
          return this._create_token(TOKEN.OPERATOR, resulting_string);
        }
        return this._create_token(TOKEN.RESERVED, resulting_string);
      }
      return this._create_token(TOKEN.WORD, resulting_string);
    }
    resulting_string = this.__patterns.number.read();
    if (resulting_string !== "") {
      return this._create_token(TOKEN.WORD, resulting_string);
    }
  };
  Tokenizer.prototype._read_singles = function(c) {
    var token = null;
    if (c === "(" || c === "[") {
      token = this._create_token(TOKEN.START_EXPR, c);
    } else if (c === ")" || c === "]") {
      token = this._create_token(TOKEN.END_EXPR, c);
    } else if (c === "{") {
      token = this._create_token(TOKEN.START_BLOCK, c);
    } else if (c === "}") {
      token = this._create_token(TOKEN.END_BLOCK, c);
    } else if (c === ";") {
      token = this._create_token(TOKEN.SEMICOLON, c);
    } else if (c === "." && dot_pattern.test(this._input.peek(1))) {
      token = this._create_token(TOKEN.DOT, c);
    } else if (c === ",") {
      token = this._create_token(TOKEN.COMMA, c);
    }
    if (token) {
      this._input.next();
    }
    return token;
  };
  Tokenizer.prototype._read_pair = function(c, d) {
    var token = null;
    if (c === "#" && d === "{") {
      token = this._create_token(TOKEN.START_BLOCK, c + d);
    }
    if (token) {
      this._input.next();
      this._input.next();
    }
    return token;
  };
  Tokenizer.prototype._read_punctuation = function() {
    var resulting_string = this.__patterns.punct.read();
    if (resulting_string !== "") {
      if (resulting_string === "=") {
        return this._create_token(TOKEN.EQUALS, resulting_string);
      } else if (resulting_string === "?.") {
        return this._create_token(TOKEN.DOT, resulting_string);
      } else {
        return this._create_token(TOKEN.OPERATOR, resulting_string);
      }
    }
  };
  Tokenizer.prototype._read_non_javascript = function(c) {
    var resulting_string = "";
    if (c === "#") {
      if (this._is_first_token()) {
        resulting_string = this.__patterns.shebang.read();
        if (resulting_string) {
          return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + `
`);
        }
      }
      resulting_string = this.__patterns.include.read();
      if (resulting_string) {
        return this._create_token(TOKEN.UNKNOWN, resulting_string.trim() + `
`);
      }
      c = this._input.next();
      var sharp = "#";
      if (this._input.hasNext() && this._input.testChar(digit)) {
        do {
          c = this._input.next();
          sharp += c;
        } while (this._input.hasNext() && c !== "#" && c !== "=");
        if (c === "#") {} else if (this._input.peek() === "[" && this._input.peek(1) === "]") {
          sharp += "[]";
          this._input.next();
          this._input.next();
        } else if (this._input.peek() === "{" && this._input.peek(1) === "}") {
          sharp += "{}";
          this._input.next();
          this._input.next();
        }
        return this._create_token(TOKEN.WORD, sharp);
      }
      this._input.back();
    } else if (c === "<" && this._is_first_token()) {
      resulting_string = this.__patterns.html_comment_start.read();
      if (resulting_string) {
        while (this._input.hasNext() && !this._input.testChar(acorn.newline)) {
          resulting_string += this._input.next();
        }
        in_html_comment = true;
        return this._create_token(TOKEN.COMMENT, resulting_string);
      }
    } else if (in_html_comment && c === "-") {
      resulting_string = this.__patterns.html_comment_end.read();
      if (resulting_string) {
        in_html_comment = false;
        return this._create_token(TOKEN.COMMENT, resulting_string);
      }
    }
    return null;
  };
  Tokenizer.prototype._read_comment = function(c) {
    var token = null;
    if (c === "/") {
      var comment = "";
      if (this._input.peek(1) === "*") {
        comment = this.__patterns.block_comment.read();
        var directives = directives_core.get_directives(comment);
        if (directives && directives.ignore === "start") {
          comment += directives_core.readIgnored(this._input);
        }
        comment = comment.replace(acorn.allLineBreaks, `
`);
        token = this._create_token(TOKEN.BLOCK_COMMENT, comment);
        token.directives = directives;
      } else if (this._input.peek(1) === "/") {
        comment = this.__patterns.comment.read();
        token = this._create_token(TOKEN.COMMENT, comment);
      }
    }
    return token;
  };
  Tokenizer.prototype._read_string = function(c) {
    if (c === "`" || c === "'" || c === '"') {
      var resulting_string = this._input.next();
      this.has_char_escapes = false;
      if (c === "`") {
        resulting_string += this._read_string_recursive("`", true, "${");
      } else {
        resulting_string += this._read_string_recursive(c);
      }
      if (this.has_char_escapes && this._options.unescape_strings) {
        resulting_string = unescape_string(resulting_string);
      }
      if (this._input.peek() === c) {
        resulting_string += this._input.next();
      }
      resulting_string = resulting_string.replace(acorn.allLineBreaks, `
`);
      return this._create_token(TOKEN.STRING, resulting_string);
    }
    return null;
  };
  Tokenizer.prototype._allow_regexp_or_xml = function(previous_token) {
    return previous_token.type === TOKEN.RESERVED && in_array(previous_token.text, ["return", "case", "throw", "else", "do", "typeof", "yield"]) || previous_token.type === TOKEN.END_EXPR && previous_token.text === ")" && previous_token.opened.previous.type === TOKEN.RESERVED && in_array(previous_token.opened.previous.text, ["if", "while", "for"]) || in_array(previous_token.type, [
      TOKEN.COMMENT,
      TOKEN.START_EXPR,
      TOKEN.START_BLOCK,
      TOKEN.START,
      TOKEN.END_BLOCK,
      TOKEN.OPERATOR,
      TOKEN.EQUALS,
      TOKEN.EOF,
      TOKEN.SEMICOLON,
      TOKEN.COMMA
    ]);
  };
  Tokenizer.prototype._read_regexp = function(c, previous_token) {
    if (c === "/" && this._allow_regexp_or_xml(previous_token)) {
      var resulting_string = this._input.next();
      var esc = false;
      var in_char_class = false;
      while (this._input.hasNext() && ((esc || in_char_class || this._input.peek() !== c) && !this._input.testChar(acorn.newline))) {
        resulting_string += this._input.peek();
        if (!esc) {
          esc = this._input.peek() === "\\";
          if (this._input.peek() === "[") {
            in_char_class = true;
          } else if (this._input.peek() === "]") {
            in_char_class = false;
          }
        } else {
          esc = false;
        }
        this._input.next();
      }
      if (this._input.peek() === c) {
        resulting_string += this._input.next();
        resulting_string += this._input.read(acorn.identifier);
      }
      return this._create_token(TOKEN.STRING, resulting_string);
    }
    return null;
  };
  Tokenizer.prototype._read_xml = function(c, previous_token) {
    if (this._options.e4x && c === "<" && this._allow_regexp_or_xml(previous_token)) {
      var xmlStr = "";
      var match = this.__patterns.xml.read_match();
      if (match) {
        var rootTag = match[2].replace(/^{\s+/, "{").replace(/\s+}$/, "}");
        var isCurlyRoot = rootTag.indexOf("{") === 0;
        var depth = 0;
        while (match) {
          var isEndTag = !!match[1];
          var tagName = match[2];
          var isSingletonTag = !!match[match.length - 1] || tagName.slice(0, 8) === "![CDATA[";
          if (!isSingletonTag && (tagName === rootTag || isCurlyRoot && tagName.replace(/^{\s+/, "{").replace(/\s+}$/, "}"))) {
            if (isEndTag) {
              --depth;
            } else {
              ++depth;
            }
          }
          xmlStr += match[0];
          if (depth <= 0) {
            break;
          }
          match = this.__patterns.xml.read_match();
        }
        if (!match) {
          xmlStr += this._input.match(/[\s\S]*/g)[0];
        }
        xmlStr = xmlStr.replace(acorn.allLineBreaks, `
`);
        return this._create_token(TOKEN.STRING, xmlStr);
      }
    }
    return null;
  };
  function unescape_string(s) {
    var out = "", escaped = 0;
    var input_scan = new InputScanner(s);
    var matched = null;
    while (input_scan.hasNext()) {
      matched = input_scan.match(/([\s]|[^\\]|\\\\)+/g);
      if (matched) {
        out += matched[0];
      }
      if (input_scan.peek() === "\\") {
        input_scan.next();
        if (input_scan.peek() === "x") {
          matched = input_scan.match(/x([0-9A-Fa-f]{2})/g);
        } else if (input_scan.peek() === "u") {
          matched = input_scan.match(/u([0-9A-Fa-f]{4})/g);
          if (!matched) {
            matched = input_scan.match(/u\{([0-9A-Fa-f]+)\}/g);
          }
        } else {
          out += "\\";
          if (input_scan.hasNext()) {
            out += input_scan.next();
          }
          continue;
        }
        if (!matched) {
          return s;
        }
        escaped = parseInt(matched[1], 16);
        if (escaped > 126 && escaped <= 255 && matched[0].indexOf("x") === 0) {
          return s;
        } else if (escaped >= 0 && escaped < 32) {
          out += "\\" + matched[0];
        } else if (escaped > 1114111) {
          out += "\\" + matched[0];
        } else if (escaped === 34 || escaped === 39 || escaped === 92) {
          out += "\\" + String.fromCharCode(escaped);
        } else {
          out += String.fromCharCode(escaped);
        }
      }
    }
    return out;
  }
  Tokenizer.prototype._read_string_recursive = function(delimiter, allow_unescaped_newlines, start_sub) {
    var current_char;
    var pattern;
    if (delimiter === "'") {
      pattern = this.__patterns.single_quote;
    } else if (delimiter === '"') {
      pattern = this.__patterns.double_quote;
    } else if (delimiter === "`") {
      pattern = this.__patterns.template_text;
    } else if (delimiter === "}") {
      pattern = this.__patterns.template_expression;
    }
    var resulting_string = pattern.read();
    var next = "";
    while (this._input.hasNext()) {
      next = this._input.next();
      if (next === delimiter || !allow_unescaped_newlines && acorn.newline.test(next)) {
        this._input.back();
        break;
      } else if (next === "\\" && this._input.hasNext()) {
        current_char = this._input.peek();
        if (current_char === "x" || current_char === "u") {
          this.has_char_escapes = true;
        } else if (current_char === "\r" && this._input.peek(1) === `
`) {
          this._input.next();
        }
        next += this._input.next();
      } else if (start_sub) {
        if (start_sub === "${" && next === "$" && this._input.peek() === "{") {
          next += this._input.next();
        }
        if (start_sub === next) {
          if (delimiter === "`") {
            next += this._read_string_recursive("}", allow_unescaped_newlines, "`");
          } else {
            next += this._read_string_recursive("`", allow_unescaped_newlines, "${");
          }
          if (this._input.hasNext()) {
            next += this._input.next();
          }
        }
      }
      next += pattern.read();
      resulting_string += next;
    }
    return resulting_string;
  };
  exports.Tokenizer = Tokenizer;
  exports.TOKEN = TOKEN;
  exports.positionable_operators = positionable_operators.slice();
  exports.line_starters = line_starters.slice();
});

// node_modules/js-beautify/js/src/javascript/beautifier.js
var require_beautifier = __commonJS((exports, module) => {
  var Output = require_output().Output;
  var Token = require_token().Token;
  var acorn = require_acorn();
  var Options = require_options2().Options;
  var Tokenizer = require_tokenizer2().Tokenizer;
  var line_starters = require_tokenizer2().line_starters;
  var positionable_operators = require_tokenizer2().positionable_operators;
  var TOKEN = require_tokenizer2().TOKEN;
  function in_array(what, arr) {
    return arr.indexOf(what) !== -1;
  }
  function ltrim(s) {
    return s.replace(/^\s+/g, "");
  }
  function generateMapFromStrings(list) {
    var result = {};
    for (var x = 0;x < list.length; x++) {
      result[list[x].replace(/-/g, "_")] = list[x];
    }
    return result;
  }
  function reserved_word(token, word) {
    return token && token.type === TOKEN.RESERVED && token.text === word;
  }
  function reserved_array(token, words) {
    return token && token.type === TOKEN.RESERVED && in_array(token.text, words);
  }
  var special_words = ["case", "return", "do", "if", "throw", "else", "await", "break", "continue", "async"];
  var validPositionValues = ["before-newline", "after-newline", "preserve-newline"];
  var OPERATOR_POSITION = generateMapFromStrings(validPositionValues);
  var OPERATOR_POSITION_BEFORE_OR_PRESERVE = [OPERATOR_POSITION.before_newline, OPERATOR_POSITION.preserve_newline];
  var MODE = {
    BlockStatement: "BlockStatement",
    Statement: "Statement",
    ObjectLiteral: "ObjectLiteral",
    ArrayLiteral: "ArrayLiteral",
    ForInitializer: "ForInitializer",
    Conditional: "Conditional",
    Expression: "Expression"
  };
  function remove_redundant_indentation(output, frame) {
    if (frame.multiline_frame || frame.mode === MODE.ForInitializer || frame.mode === MODE.Conditional) {
      return;
    }
    output.remove_indent(frame.start_line_index);
  }
  function split_linebreaks(s) {
    s = s.replace(acorn.allLineBreaks, `
`);
    var out = [], idx = s.indexOf(`
`);
    while (idx !== -1) {
      out.push(s.substring(0, idx));
      s = s.substring(idx + 1);
      idx = s.indexOf(`
`);
    }
    if (s.length) {
      out.push(s);
    }
    return out;
  }
  function is_array(mode) {
    return mode === MODE.ArrayLiteral;
  }
  function is_expression(mode) {
    return in_array(mode, [MODE.Expression, MODE.ForInitializer, MODE.Conditional]);
  }
  function all_lines_start_with(lines, c) {
    for (var i = 0;i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.charAt(0) !== c) {
        return false;
      }
    }
    return true;
  }
  function each_line_matches_indent(lines, indent) {
    var i = 0, len = lines.length, line;
    for (;i < len; i++) {
      line = lines[i];
      if (line && line.indexOf(indent) !== 0) {
        return false;
      }
    }
    return true;
  }
  function Beautifier(source_text, options) {
    options = options || {};
    this._source_text = source_text || "";
    this._output = null;
    this._tokens = null;
    this._last_last_text = null;
    this._flags = null;
    this._previous_flags = null;
    this._flag_store = null;
    this._options = new Options(options);
  }
  Beautifier.prototype.create_flags = function(flags_base, mode) {
    var next_indent_level = 0;
    if (flags_base) {
      next_indent_level = flags_base.indentation_level;
      if (!this._output.just_added_newline() && flags_base.line_indent_level > next_indent_level) {
        next_indent_level = flags_base.line_indent_level;
      }
    }
    var next_flags = {
      mode,
      parent: flags_base,
      last_token: flags_base ? flags_base.last_token : new Token(TOKEN.START_BLOCK, ""),
      last_word: flags_base ? flags_base.last_word : "",
      declaration_statement: false,
      declaration_assignment: false,
      multiline_frame: false,
      inline_frame: false,
      if_block: false,
      else_block: false,
      class_start_block: false,
      do_block: false,
      do_while: false,
      import_block: false,
      in_case_statement: false,
      in_case: false,
      case_body: false,
      case_block: false,
      indentation_level: next_indent_level,
      alignment: 0,
      line_indent_level: flags_base ? flags_base.line_indent_level : next_indent_level,
      start_line_index: this._output.get_line_number(),
      ternary_depth: 0
    };
    return next_flags;
  };
  Beautifier.prototype._reset = function(source_text) {
    var baseIndentString = source_text.match(/^[\t ]*/)[0];
    this._last_last_text = "";
    this._output = new Output(this._options, baseIndentString);
    this._output.raw = this._options.test_output_raw;
    this._flag_store = [];
    this.set_mode(MODE.BlockStatement);
    var tokenizer = new Tokenizer(source_text, this._options);
    this._tokens = tokenizer.tokenize();
    return source_text;
  };
  Beautifier.prototype.beautify = function() {
    if (this._options.disabled) {
      return this._source_text;
    }
    var sweet_code;
    var source_text = this._reset(this._source_text);
    var eol = this._options.eol;
    if (this._options.eol === "auto") {
      eol = `
`;
      if (source_text && acorn.lineBreak.test(source_text || "")) {
        eol = source_text.match(acorn.lineBreak)[0];
      }
    }
    var current_token = this._tokens.next();
    while (current_token) {
      this.handle_token(current_token);
      this._last_last_text = this._flags.last_token.text;
      this._flags.last_token = current_token;
      current_token = this._tokens.next();
    }
    sweet_code = this._output.get_code(eol);
    return sweet_code;
  };
  Beautifier.prototype.handle_token = function(current_token, preserve_statement_flags) {
    if (current_token.type === TOKEN.START_EXPR) {
      this.handle_start_expr(current_token);
    } else if (current_token.type === TOKEN.END_EXPR) {
      this.handle_end_expr(current_token);
    } else if (current_token.type === TOKEN.START_BLOCK) {
      this.handle_start_block(current_token);
    } else if (current_token.type === TOKEN.END_BLOCK) {
      this.handle_end_block(current_token);
    } else if (current_token.type === TOKEN.WORD) {
      this.handle_word(current_token);
    } else if (current_token.type === TOKEN.RESERVED) {
      this.handle_word(current_token);
    } else if (current_token.type === TOKEN.SEMICOLON) {
      this.handle_semicolon(current_token);
    } else if (current_token.type === TOKEN.STRING) {
      this.handle_string(current_token);
    } else if (current_token.type === TOKEN.EQUALS) {
      this.handle_equals(current_token);
    } else if (current_token.type === TOKEN.OPERATOR) {
      this.handle_operator(current_token);
    } else if (current_token.type === TOKEN.COMMA) {
      this.handle_comma(current_token);
    } else if (current_token.type === TOKEN.BLOCK_COMMENT) {
      this.handle_block_comment(current_token, preserve_statement_flags);
    } else if (current_token.type === TOKEN.COMMENT) {
      this.handle_comment(current_token, preserve_statement_flags);
    } else if (current_token.type === TOKEN.DOT) {
      this.handle_dot(current_token);
    } else if (current_token.type === TOKEN.EOF) {
      this.handle_eof(current_token);
    } else if (current_token.type === TOKEN.UNKNOWN) {
      this.handle_unknown(current_token, preserve_statement_flags);
    } else {
      this.handle_unknown(current_token, preserve_statement_flags);
    }
  };
  Beautifier.prototype.handle_whitespace_and_comments = function(current_token, preserve_statement_flags) {
    var newlines = current_token.newlines;
    var keep_whitespace = this._options.keep_array_indentation && is_array(this._flags.mode);
    if (current_token.comments_before) {
      var comment_token = current_token.comments_before.next();
      while (comment_token) {
        this.handle_whitespace_and_comments(comment_token, preserve_statement_flags);
        this.handle_token(comment_token, preserve_statement_flags);
        comment_token = current_token.comments_before.next();
      }
    }
    if (keep_whitespace) {
      for (var i = 0;i < newlines; i += 1) {
        this.print_newline(i > 0, preserve_statement_flags);
      }
    } else {
      if (this._options.max_preserve_newlines && newlines > this._options.max_preserve_newlines) {
        newlines = this._options.max_preserve_newlines;
      }
      if (this._options.preserve_newlines) {
        if (newlines > 1) {
          this.print_newline(false, preserve_statement_flags);
          for (var j = 1;j < newlines; j += 1) {
            this.print_newline(true, preserve_statement_flags);
          }
        }
      }
    }
  };
  var newline_restricted_tokens = ["async", "break", "continue", "return", "throw", "yield"];
  Beautifier.prototype.allow_wrap_or_preserved_newline = function(current_token, force_linewrap) {
    force_linewrap = force_linewrap === undefined ? false : force_linewrap;
    if (this._output.just_added_newline()) {
      return;
    }
    var shouldPreserveOrForce = this._options.preserve_newlines && current_token.newlines || force_linewrap;
    var operatorLogicApplies = in_array(this._flags.last_token.text, positionable_operators) || in_array(current_token.text, positionable_operators);
    if (operatorLogicApplies) {
      var shouldPrintOperatorNewline = in_array(this._flags.last_token.text, positionable_operators) && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE) || in_array(current_token.text, positionable_operators);
      shouldPreserveOrForce = shouldPreserveOrForce && shouldPrintOperatorNewline;
    }
    if (shouldPreserveOrForce) {
      this.print_newline(false, true);
    } else if (this._options.wrap_line_length) {
      if (reserved_array(this._flags.last_token, newline_restricted_tokens)) {
        return;
      }
      this._output.set_wrap_point();
    }
  };
  Beautifier.prototype.print_newline = function(force_newline, preserve_statement_flags) {
    if (!preserve_statement_flags) {
      if (this._flags.last_token.text !== ";" && this._flags.last_token.text !== "," && this._flags.last_token.text !== "=" && (this._flags.last_token.type !== TOKEN.OPERATOR || this._flags.last_token.text === "--" || this._flags.last_token.text === "++")) {
        var next_token = this._tokens.peek();
        while (this._flags.mode === MODE.Statement && !(this._flags.if_block && reserved_word(next_token, "else")) && !this._flags.do_block) {
          this.restore_mode();
        }
      }
    }
    if (this._output.add_new_line(force_newline)) {
      this._flags.multiline_frame = true;
    }
  };
  Beautifier.prototype.print_token_line_indentation = function(current_token) {
    if (this._output.just_added_newline()) {
      if (this._options.keep_array_indentation && current_token.newlines && (current_token.text === "[" || is_array(this._flags.mode))) {
        this._output.current_line.set_indent(-1);
        this._output.current_line.push(current_token.whitespace_before);
        this._output.space_before_token = false;
      } else if (this._output.set_indent(this._flags.indentation_level, this._flags.alignment)) {
        this._flags.line_indent_level = this._flags.indentation_level;
      }
    }
  };
  Beautifier.prototype.print_token = function(current_token) {
    if (this._output.raw) {
      this._output.add_raw_token(current_token);
      return;
    }
    if (this._options.comma_first && current_token.previous && current_token.previous.type === TOKEN.COMMA && this._output.just_added_newline()) {
      if (this._output.previous_line.last() === ",") {
        var popped = this._output.previous_line.pop();
        if (this._output.previous_line.is_empty()) {
          this._output.previous_line.push(popped);
          this._output.trim(true);
          this._output.current_line.pop();
          this._output.trim();
        }
        this.print_token_line_indentation(current_token);
        this._output.add_token(",");
        this._output.space_before_token = true;
      }
    }
    this.print_token_line_indentation(current_token);
    this._output.non_breaking_space = true;
    this._output.add_token(current_token.text);
    if (this._output.previous_token_wrapped) {
      this._flags.multiline_frame = true;
    }
  };
  Beautifier.prototype.indent = function() {
    this._flags.indentation_level += 1;
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  };
  Beautifier.prototype.deindent = function() {
    if (this._flags.indentation_level > 0 && (!this._flags.parent || this._flags.indentation_level > this._flags.parent.indentation_level)) {
      this._flags.indentation_level -= 1;
      this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
    }
  };
  Beautifier.prototype.set_mode = function(mode) {
    if (this._flags) {
      this._flag_store.push(this._flags);
      this._previous_flags = this._flags;
    } else {
      this._previous_flags = this.create_flags(null, mode);
    }
    this._flags = this.create_flags(this._previous_flags, mode);
    this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
  };
  Beautifier.prototype.restore_mode = function() {
    if (this._flag_store.length > 0) {
      this._previous_flags = this._flags;
      this._flags = this._flag_store.pop();
      if (this._previous_flags.mode === MODE.Statement) {
        remove_redundant_indentation(this._output, this._previous_flags);
      }
      this._output.set_indent(this._flags.indentation_level, this._flags.alignment);
    }
  };
  Beautifier.prototype.start_of_object_property = function() {
    return this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement && (this._flags.last_token.text === ":" && this._flags.ternary_depth === 0 || reserved_array(this._flags.last_token, ["get", "set"]));
  };
  Beautifier.prototype.start_of_statement = function(current_token) {
    var start = false;
    start = start || reserved_array(this._flags.last_token, ["var", "let", "const"]) && current_token.type === TOKEN.WORD;
    start = start || reserved_word(this._flags.last_token, "do");
    start = start || !(this._flags.parent.mode === MODE.ObjectLiteral && this._flags.mode === MODE.Statement) && reserved_array(this._flags.last_token, newline_restricted_tokens) && !current_token.newlines;
    start = start || reserved_word(this._flags.last_token, "else") && !(reserved_word(current_token, "if") && !current_token.comments_before);
    start = start || this._flags.last_token.type === TOKEN.END_EXPR && (this._previous_flags.mode === MODE.ForInitializer || this._previous_flags.mode === MODE.Conditional);
    start = start || this._flags.last_token.type === TOKEN.WORD && this._flags.mode === MODE.BlockStatement && !this._flags.in_case && !(current_token.text === "--" || current_token.text === "++") && this._last_last_text !== "function" && current_token.type !== TOKEN.WORD && current_token.type !== TOKEN.RESERVED;
    start = start || this._flags.mode === MODE.ObjectLiteral && (this._flags.last_token.text === ":" && this._flags.ternary_depth === 0 || reserved_array(this._flags.last_token, ["get", "set"]));
    if (start) {
      this.set_mode(MODE.Statement);
      this.indent();
      this.handle_whitespace_and_comments(current_token, true);
      if (!this.start_of_object_property()) {
        this.allow_wrap_or_preserved_newline(current_token, reserved_array(current_token, ["do", "for", "if", "while"]));
      }
      return true;
    }
    return false;
  };
  Beautifier.prototype.handle_start_expr = function(current_token) {
    if (!this.start_of_statement(current_token)) {
      this.handle_whitespace_and_comments(current_token);
    }
    var next_mode = MODE.Expression;
    if (current_token.text === "[") {
      if (this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === ")") {
        if (reserved_array(this._flags.last_token, line_starters)) {
          this._output.space_before_token = true;
        }
        this.print_token(current_token);
        this.set_mode(next_mode);
        this.indent();
        if (this._options.space_in_paren) {
          this._output.space_before_token = true;
        }
        return;
      }
      next_mode = MODE.ArrayLiteral;
      if (is_array(this._flags.mode)) {
        if (this._flags.last_token.text === "[" || this._flags.last_token.text === "," && (this._last_last_text === "]" || this._last_last_text === "}")) {
          if (!this._options.keep_array_indentation) {
            this.print_newline();
          }
        }
      }
      if (!in_array(this._flags.last_token.type, [TOKEN.START_EXPR, TOKEN.END_EXPR, TOKEN.WORD, TOKEN.OPERATOR, TOKEN.DOT])) {
        this._output.space_before_token = true;
      }
    } else {
      if (this._flags.last_token.type === TOKEN.RESERVED) {
        if (this._flags.last_token.text === "for") {
          this._output.space_before_token = this._options.space_before_conditional;
          next_mode = MODE.ForInitializer;
        } else if (in_array(this._flags.last_token.text, ["if", "while", "switch"])) {
          this._output.space_before_token = this._options.space_before_conditional;
          next_mode = MODE.Conditional;
        } else if (in_array(this._flags.last_word, ["await", "async"])) {
          this._output.space_before_token = true;
        } else if (this._flags.last_token.text === "import" && current_token.whitespace_before === "") {
          this._output.space_before_token = false;
        } else if (in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === "catch") {
          this._output.space_before_token = true;
        }
      } else if (this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
        if (!this.start_of_object_property()) {
          this.allow_wrap_or_preserved_newline(current_token);
        }
      } else if (this._flags.last_token.type === TOKEN.WORD) {
        this._output.space_before_token = false;
        var peek_back_two = this._tokens.peek(-3);
        if (this._options.space_after_named_function && peek_back_two) {
          var peek_back_three = this._tokens.peek(-4);
          if (reserved_array(peek_back_two, ["async", "function"]) || peek_back_two.text === "*" && reserved_array(peek_back_three, ["async", "function"])) {
            this._output.space_before_token = true;
          } else if (this._flags.mode === MODE.ObjectLiteral) {
            if (peek_back_two.text === "{" || peek_back_two.text === "," || peek_back_two.text === "*" && (peek_back_three.text === "{" || peek_back_three.text === ",")) {
              this._output.space_before_token = true;
            }
          } else if (this._flags.parent && this._flags.parent.class_start_block) {
            this._output.space_before_token = true;
          }
        }
      } else {
        this.allow_wrap_or_preserved_newline(current_token);
      }
      if (this._flags.last_token.type === TOKEN.RESERVED && (this._flags.last_word === "function" || this._flags.last_word === "typeof") || this._flags.last_token.text === "*" && (in_array(this._last_last_text, ["function", "yield"]) || this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ["{", ","]))) {
        this._output.space_before_token = this._options.space_after_anon_function;
      }
    }
    if (this._flags.last_token.text === ";" || this._flags.last_token.type === TOKEN.START_BLOCK) {
      this.print_newline();
    } else if (this._flags.last_token.type === TOKEN.END_EXPR || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.END_BLOCK || this._flags.last_token.text === "." || this._flags.last_token.type === TOKEN.COMMA) {
      this.allow_wrap_or_preserved_newline(current_token, current_token.newlines);
    }
    this.print_token(current_token);
    this.set_mode(next_mode);
    if (this._options.space_in_paren) {
      this._output.space_before_token = true;
    }
    this.indent();
  };
  Beautifier.prototype.handle_end_expr = function(current_token) {
    while (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }
    this.handle_whitespace_and_comments(current_token);
    if (this._flags.multiline_frame) {
      this.allow_wrap_or_preserved_newline(current_token, current_token.text === "]" && is_array(this._flags.mode) && !this._options.keep_array_indentation);
    }
    if (this._options.space_in_paren) {
      if (this._flags.last_token.type === TOKEN.START_EXPR && !this._options.space_in_empty_paren) {
        this._output.trim();
        this._output.space_before_token = false;
      } else {
        this._output.space_before_token = true;
      }
    }
    this.deindent();
    this.print_token(current_token);
    this.restore_mode();
    remove_redundant_indentation(this._output, this._previous_flags);
    if (this._flags.do_while && this._previous_flags.mode === MODE.Conditional) {
      this._previous_flags.mode = MODE.Expression;
      this._flags.do_block = false;
      this._flags.do_while = false;
    }
  };
  Beautifier.prototype.handle_start_block = function(current_token) {
    this.handle_whitespace_and_comments(current_token);
    var next_token = this._tokens.peek();
    var second_token = this._tokens.peek(1);
    if (this._flags.last_word === "switch" && this._flags.last_token.type === TOKEN.END_EXPR) {
      this.set_mode(MODE.BlockStatement);
      this._flags.in_case_statement = true;
    } else if (this._flags.case_body) {
      this.set_mode(MODE.BlockStatement);
    } else if (second_token && (in_array(second_token.text, [":", ","]) && in_array(next_token.type, [TOKEN.STRING, TOKEN.WORD, TOKEN.RESERVED]) || in_array(next_token.text, ["get", "set", "..."]) && in_array(second_token.type, [TOKEN.WORD, TOKEN.RESERVED]))) {
      if (in_array(this._last_last_text, ["class", "interface"]) && !in_array(second_token.text, [":", ","])) {
        this.set_mode(MODE.BlockStatement);
      } else {
        this.set_mode(MODE.ObjectLiteral);
      }
    } else if (this._flags.last_token.type === TOKEN.OPERATOR && this._flags.last_token.text === "=>") {
      this.set_mode(MODE.BlockStatement);
    } else if (in_array(this._flags.last_token.type, [TOKEN.EQUALS, TOKEN.START_EXPR, TOKEN.COMMA, TOKEN.OPERATOR]) || reserved_array(this._flags.last_token, ["return", "throw", "import", "default"])) {
      this.set_mode(MODE.ObjectLiteral);
    } else {
      this.set_mode(MODE.BlockStatement);
    }
    if (this._flags.last_token) {
      if (reserved_array(this._flags.last_token.previous, ["class", "extends"])) {
        this._flags.class_start_block = true;
      }
    }
    var empty_braces = !next_token.comments_before && next_token.text === "}";
    var empty_anonymous_function = empty_braces && this._flags.last_word === "function" && this._flags.last_token.type === TOKEN.END_EXPR;
    if (this._options.brace_preserve_inline) {
      var index = 0;
      var check_token = null;
      this._flags.inline_frame = true;
      do {
        index += 1;
        check_token = this._tokens.peek(index - 1);
        if (check_token.newlines) {
          this._flags.inline_frame = false;
          break;
        }
      } while (check_token.type !== TOKEN.EOF && !(check_token.type === TOKEN.END_BLOCK && check_token.opened === current_token));
    }
    if ((this._options.brace_style === "expand" || this._options.brace_style === "none" && current_token.newlines) && !this._flags.inline_frame) {
      if (this._flags.last_token.type !== TOKEN.OPERATOR && (empty_anonymous_function || this._flags.last_token.type === TOKEN.EQUALS || reserved_array(this._flags.last_token, special_words) && this._flags.last_token.text !== "else")) {
        this._output.space_before_token = true;
      } else {
        this.print_newline(false, true);
      }
    } else {
      if (is_array(this._previous_flags.mode) && (this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.COMMA)) {
        if (this._flags.last_token.type === TOKEN.COMMA || this._options.space_in_paren) {
          this._output.space_before_token = true;
        }
        if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR && this._flags.inline_frame) {
          this.allow_wrap_or_preserved_newline(current_token);
          this._previous_flags.multiline_frame = this._previous_flags.multiline_frame || this._flags.multiline_frame;
          this._flags.multiline_frame = false;
        }
      }
      if (this._flags.last_token.type !== TOKEN.OPERATOR && this._flags.last_token.type !== TOKEN.START_EXPR) {
        if (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.SEMICOLON]) && !this._flags.inline_frame) {
          this.print_newline();
        } else {
          this._output.space_before_token = true;
        }
      }
    }
    this.print_token(current_token);
    this.indent();
    if (!empty_braces && !(this._options.brace_preserve_inline && this._flags.inline_frame)) {
      this.print_newline();
    }
  };
  Beautifier.prototype.handle_end_block = function(current_token) {
    this.handle_whitespace_and_comments(current_token);
    while (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }
    var empty_braces = this._flags.last_token.type === TOKEN.START_BLOCK;
    if (this._flags.inline_frame && !empty_braces) {
      this._output.space_before_token = true;
    } else if (this._options.brace_style === "expand") {
      if (!empty_braces) {
        this.print_newline();
      }
    } else {
      if (!empty_braces) {
        if (is_array(this._flags.mode) && this._options.keep_array_indentation) {
          this._options.keep_array_indentation = false;
          this.print_newline();
          this._options.keep_array_indentation = true;
        } else {
          this.print_newline();
        }
      }
    }
    this.restore_mode();
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_word = function(current_token) {
    if (current_token.type === TOKEN.RESERVED) {
      if (in_array(current_token.text, ["set", "get"]) && this._flags.mode !== MODE.ObjectLiteral) {
        current_token.type = TOKEN.WORD;
      } else if (current_token.text === "import" && in_array(this._tokens.peek().text, ["(", "."])) {
        current_token.type = TOKEN.WORD;
      } else if (in_array(current_token.text, ["as", "from"]) && !this._flags.import_block) {
        current_token.type = TOKEN.WORD;
      } else if (this._flags.mode === MODE.ObjectLiteral) {
        var next_token = this._tokens.peek();
        if (next_token.text === ":") {
          current_token.type = TOKEN.WORD;
        }
      }
    }
    if (this.start_of_statement(current_token)) {
      if (reserved_array(this._flags.last_token, ["var", "let", "const"]) && current_token.type === TOKEN.WORD) {
        this._flags.declaration_statement = true;
      }
    } else if (current_token.newlines && !is_expression(this._flags.mode) && (this._flags.last_token.type !== TOKEN.OPERATOR || (this._flags.last_token.text === "--" || this._flags.last_token.text === "++")) && this._flags.last_token.type !== TOKEN.EQUALS && (this._options.preserve_newlines || !reserved_array(this._flags.last_token, ["var", "let", "const", "set", "get"]))) {
      this.handle_whitespace_and_comments(current_token);
      this.print_newline();
    } else {
      this.handle_whitespace_and_comments(current_token);
    }
    if (this._flags.do_block && !this._flags.do_while) {
      if (reserved_word(current_token, "while")) {
        this._output.space_before_token = true;
        this.print_token(current_token);
        this._output.space_before_token = true;
        this._flags.do_while = true;
        return;
      } else {
        this.print_newline();
        this._flags.do_block = false;
      }
    }
    if (this._flags.if_block) {
      if (!this._flags.else_block && reserved_word(current_token, "else")) {
        this._flags.else_block = true;
      } else {
        while (this._flags.mode === MODE.Statement) {
          this.restore_mode();
        }
        this._flags.if_block = false;
        this._flags.else_block = false;
      }
    }
    if (this._flags.in_case_statement && reserved_array(current_token, ["case", "default"])) {
      this.print_newline();
      if (!this._flags.case_block && (this._flags.case_body || this._options.jslint_happy)) {
        this.deindent();
      }
      this._flags.case_body = false;
      this.print_token(current_token);
      this._flags.in_case = true;
      return;
    }
    if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
      if (!this.start_of_object_property() && !(in_array(this._flags.last_token.text, ["+", "-"]) && this._last_last_text === ":" && this._flags.parent.mode === MODE.ObjectLiteral)) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    }
    if (reserved_word(current_token, "function")) {
      if (in_array(this._flags.last_token.text, ["}", ";"]) || this._output.just_added_newline() && !(in_array(this._flags.last_token.text, ["(", "[", "{", ":", "=", ","]) || this._flags.last_token.type === TOKEN.OPERATOR)) {
        if (!this._output.just_added_blankline() && !current_token.comments_before) {
          this.print_newline();
          this.print_newline(true);
        }
      }
      if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD) {
        if (reserved_array(this._flags.last_token, ["get", "set", "new", "export"]) || reserved_array(this._flags.last_token, newline_restricted_tokens)) {
          this._output.space_before_token = true;
        } else if (reserved_word(this._flags.last_token, "default") && this._last_last_text === "export") {
          this._output.space_before_token = true;
        } else if (this._flags.last_token.text === "declare") {
          this._output.space_before_token = true;
        } else {
          this.print_newline();
        }
      } else if (this._flags.last_token.type === TOKEN.OPERATOR || this._flags.last_token.text === "=") {
        this._output.space_before_token = true;
      } else if (!this._flags.multiline_frame && (is_expression(this._flags.mode) || is_array(this._flags.mode))) {} else {
        this.print_newline();
      }
      this.print_token(current_token);
      this._flags.last_word = current_token.text;
      return;
    }
    var prefix = "NONE";
    if (this._flags.last_token.type === TOKEN.END_BLOCK) {
      if (this._previous_flags.inline_frame) {
        prefix = "SPACE";
      } else if (!reserved_array(current_token, ["else", "catch", "finally", "from"])) {
        prefix = "NEWLINE";
      } else {
        if (this._options.brace_style === "expand" || this._options.brace_style === "end-expand" || this._options.brace_style === "none" && current_token.newlines) {
          prefix = "NEWLINE";
        } else {
          prefix = "SPACE";
          this._output.space_before_token = true;
        }
      }
    } else if (this._flags.last_token.type === TOKEN.SEMICOLON && this._flags.mode === MODE.BlockStatement) {
      prefix = "NEWLINE";
    } else if (this._flags.last_token.type === TOKEN.SEMICOLON && is_expression(this._flags.mode)) {
      prefix = "SPACE";
    } else if (this._flags.last_token.type === TOKEN.STRING) {
      prefix = "NEWLINE";
    } else if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.last_token.text === "*" && (in_array(this._last_last_text, ["function", "yield"]) || this._flags.mode === MODE.ObjectLiteral && in_array(this._last_last_text, ["{", ","]))) {
      prefix = "SPACE";
    } else if (this._flags.last_token.type === TOKEN.START_BLOCK) {
      if (this._flags.inline_frame) {
        prefix = "SPACE";
      } else {
        prefix = "NEWLINE";
      }
    } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
      this._output.space_before_token = true;
      prefix = "NEWLINE";
    }
    if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ")") {
      if (this._flags.inline_frame || this._flags.last_token.text === "else" || this._flags.last_token.text === "export") {
        prefix = "SPACE";
      } else {
        prefix = "NEWLINE";
      }
    }
    if (reserved_array(current_token, ["else", "catch", "finally"])) {
      if ((!(this._flags.last_token.type === TOKEN.END_BLOCK && this._previous_flags.mode === MODE.BlockStatement) || this._options.brace_style === "expand" || this._options.brace_style === "end-expand" || this._options.brace_style === "none" && current_token.newlines) && !this._flags.inline_frame) {
        this.print_newline();
      } else {
        this._output.trim(true);
        var line = this._output.current_line;
        if (line.last() !== "}") {
          this.print_newline();
        }
        this._output.space_before_token = true;
      }
    } else if (prefix === "NEWLINE") {
      if (reserved_array(this._flags.last_token, special_words)) {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.text === "declare" && reserved_array(current_token, ["var", "let", "const"])) {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.type !== TOKEN.END_EXPR) {
        if ((this._flags.last_token.type !== TOKEN.START_EXPR || !reserved_array(current_token, ["var", "let", "const"])) && this._flags.last_token.text !== ":") {
          if (reserved_word(current_token, "if") && reserved_word(current_token.previous, "else")) {
            this._output.space_before_token = true;
          } else {
            this.print_newline();
          }
        }
      } else if (reserved_array(current_token, line_starters) && this._flags.last_token.text !== ")") {
        this.print_newline();
      }
    } else if (this._flags.multiline_frame && is_array(this._flags.mode) && this._flags.last_token.text === "," && this._last_last_text === "}") {
      this.print_newline();
    } else if (prefix === "SPACE") {
      this._output.space_before_token = true;
    }
    if (current_token.previous && (current_token.previous.type === TOKEN.WORD || current_token.previous.type === TOKEN.RESERVED)) {
      this._output.space_before_token = true;
    }
    this.print_token(current_token);
    this._flags.last_word = current_token.text;
    if (current_token.type === TOKEN.RESERVED) {
      if (current_token.text === "do") {
        this._flags.do_block = true;
      } else if (current_token.text === "if") {
        this._flags.if_block = true;
      } else if (current_token.text === "import") {
        this._flags.import_block = true;
      } else if (this._flags.import_block && reserved_word(current_token, "from")) {
        this._flags.import_block = false;
      }
    }
  };
  Beautifier.prototype.handle_semicolon = function(current_token) {
    if (this.start_of_statement(current_token)) {
      this._output.space_before_token = false;
    } else {
      this.handle_whitespace_and_comments(current_token);
    }
    var next_token = this._tokens.peek();
    while (this._flags.mode === MODE.Statement && !(this._flags.if_block && reserved_word(next_token, "else")) && !this._flags.do_block) {
      this.restore_mode();
    }
    if (this._flags.import_block) {
      this._flags.import_block = false;
    }
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_string = function(current_token) {
    if (current_token.text.startsWith("`") && current_token.newlines === 0 && current_token.whitespace_before === "" && (current_token.previous.text === ")" || this._flags.last_token.type === TOKEN.WORD)) {} else if (this.start_of_statement(current_token)) {
      this._output.space_before_token = true;
    } else {
      this.handle_whitespace_and_comments(current_token);
      if (this._flags.last_token.type === TOKEN.RESERVED || this._flags.last_token.type === TOKEN.WORD || this._flags.inline_frame) {
        this._output.space_before_token = true;
      } else if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR || this._flags.last_token.type === TOKEN.EQUALS || this._flags.last_token.type === TOKEN.OPERATOR) {
        if (!this.start_of_object_property()) {
          this.allow_wrap_or_preserved_newline(current_token);
        }
      } else if (current_token.text.startsWith("`") && this._flags.last_token.type === TOKEN.END_EXPR && (current_token.previous.text === "]" || current_token.previous.text === ")") && current_token.newlines === 0) {
        this._output.space_before_token = true;
      } else {
        this.print_newline();
      }
    }
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_equals = function(current_token) {
    if (this.start_of_statement(current_token)) {} else {
      this.handle_whitespace_and_comments(current_token);
    }
    if (this._flags.declaration_statement) {
      this._flags.declaration_assignment = true;
    }
    this._output.space_before_token = true;
    this.print_token(current_token);
    this._output.space_before_token = true;
  };
  Beautifier.prototype.handle_comma = function(current_token) {
    this.handle_whitespace_and_comments(current_token, true);
    this.print_token(current_token);
    this._output.space_before_token = true;
    if (this._flags.declaration_statement) {
      if (is_expression(this._flags.parent.mode)) {
        this._flags.declaration_assignment = false;
      }
      if (this._flags.declaration_assignment) {
        this._flags.declaration_assignment = false;
        this.print_newline(false, true);
      } else if (this._options.comma_first) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
    } else if (this._flags.mode === MODE.ObjectLiteral || this._flags.mode === MODE.Statement && this._flags.parent.mode === MODE.ObjectLiteral) {
      if (this._flags.mode === MODE.Statement) {
        this.restore_mode();
      }
      if (!this._flags.inline_frame) {
        this.print_newline();
      }
    } else if (this._options.comma_first) {
      this.allow_wrap_or_preserved_newline(current_token);
    }
  };
  Beautifier.prototype.handle_operator = function(current_token) {
    var isGeneratorAsterisk = current_token.text === "*" && (reserved_array(this._flags.last_token, ["function", "yield"]) || in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.COMMA, TOKEN.END_BLOCK, TOKEN.SEMICOLON]));
    var isUnary = in_array(current_token.text, ["-", "+"]) && (in_array(this._flags.last_token.type, [TOKEN.START_BLOCK, TOKEN.START_EXPR, TOKEN.EQUALS, TOKEN.OPERATOR]) || in_array(this._flags.last_token.text, line_starters) || this._flags.last_token.text === ",");
    if (this.start_of_statement(current_token)) {} else {
      var preserve_statement_flags = !isGeneratorAsterisk;
      this.handle_whitespace_and_comments(current_token, preserve_statement_flags);
    }
    if (current_token.text === "*" && this._flags.last_token.type === TOKEN.DOT) {
      this.print_token(current_token);
      return;
    }
    if (current_token.text === "::") {
      this.print_token(current_token);
      return;
    }
    if (in_array(current_token.text, ["-", "+"]) && this.start_of_object_property()) {
      this.print_token(current_token);
      return;
    }
    if (this._flags.last_token.type === TOKEN.OPERATOR && in_array(this._options.operator_position, OPERATOR_POSITION_BEFORE_OR_PRESERVE)) {
      this.allow_wrap_or_preserved_newline(current_token);
    }
    if (current_token.text === ":" && this._flags.in_case) {
      this.print_token(current_token);
      this._flags.in_case = false;
      this._flags.case_body = true;
      if (this._tokens.peek().type !== TOKEN.START_BLOCK) {
        this.indent();
        this.print_newline();
        this._flags.case_block = false;
      } else {
        this._flags.case_block = true;
        this._output.space_before_token = true;
      }
      return;
    }
    var space_before = true;
    var space_after = true;
    var in_ternary = false;
    if (current_token.text === ":") {
      if (this._flags.ternary_depth === 0) {
        space_before = false;
      } else {
        this._flags.ternary_depth -= 1;
        in_ternary = true;
      }
    } else if (current_token.text === "?") {
      this._flags.ternary_depth += 1;
    }
    if (!isUnary && !isGeneratorAsterisk && this._options.preserve_newlines && in_array(current_token.text, positionable_operators)) {
      var isColon = current_token.text === ":";
      var isTernaryColon = isColon && in_ternary;
      var isOtherColon = isColon && !in_ternary;
      switch (this._options.operator_position) {
        case OPERATOR_POSITION.before_newline:
          this._output.space_before_token = !isOtherColon;
          this.print_token(current_token);
          if (!isColon || isTernaryColon) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          this._output.space_before_token = true;
          return;
        case OPERATOR_POSITION.after_newline:
          this._output.space_before_token = true;
          if (!isColon || isTernaryColon) {
            if (this._tokens.peek().newlines) {
              this.print_newline(false, true);
            } else {
              this.allow_wrap_or_preserved_newline(current_token);
            }
          } else {
            this._output.space_before_token = false;
          }
          this.print_token(current_token);
          this._output.space_before_token = true;
          return;
        case OPERATOR_POSITION.preserve_newline:
          if (!isOtherColon) {
            this.allow_wrap_or_preserved_newline(current_token);
          }
          space_before = !(this._output.just_added_newline() || isOtherColon);
          this._output.space_before_token = space_before;
          this.print_token(current_token);
          this._output.space_before_token = true;
          return;
      }
    }
    if (isGeneratorAsterisk) {
      this.allow_wrap_or_preserved_newline(current_token);
      space_before = false;
      var next_token = this._tokens.peek();
      space_after = next_token && in_array(next_token.type, [TOKEN.WORD, TOKEN.RESERVED]);
    } else if (current_token.text === "...") {
      this.allow_wrap_or_preserved_newline(current_token);
      space_before = this._flags.last_token.type === TOKEN.START_BLOCK;
      space_after = false;
    } else if (in_array(current_token.text, ["--", "++", "!", "~"]) || isUnary) {
      if (this._flags.last_token.type === TOKEN.COMMA || this._flags.last_token.type === TOKEN.START_EXPR) {
        this.allow_wrap_or_preserved_newline(current_token);
      }
      space_before = false;
      space_after = false;
      if (current_token.newlines && (current_token.text === "--" || current_token.text === "++" || current_token.text === "~")) {
        var new_line_needed = reserved_array(this._flags.last_token, special_words) && current_token.newlines;
        if (new_line_needed && (this._previous_flags.if_block || this._previous_flags.else_block)) {
          this.restore_mode();
        }
        this.print_newline(new_line_needed, true);
      }
      if (this._flags.last_token.text === ";" && is_expression(this._flags.mode)) {
        space_before = true;
      }
      if (this._flags.last_token.type === TOKEN.RESERVED) {
        space_before = true;
      } else if (this._flags.last_token.type === TOKEN.END_EXPR) {
        space_before = !(this._flags.last_token.text === "]" && (current_token.text === "--" || current_token.text === "++"));
      } else if (this._flags.last_token.type === TOKEN.OPERATOR) {
        space_before = in_array(current_token.text, ["--", "-", "++", "+"]) && in_array(this._flags.last_token.text, ["--", "-", "++", "+"]);
        if (in_array(current_token.text, ["+", "-"]) && in_array(this._flags.last_token.text, ["--", "++"])) {
          space_after = true;
        }
      }
      if ((this._flags.mode === MODE.BlockStatement && !this._flags.inline_frame || this._flags.mode === MODE.Statement) && (this._flags.last_token.text === "{" || this._flags.last_token.text === ";")) {
        this.print_newline();
      }
    }
    this._output.space_before_token = this._output.space_before_token || space_before;
    this.print_token(current_token);
    this._output.space_before_token = space_after;
  };
  Beautifier.prototype.handle_block_comment = function(current_token, preserve_statement_flags) {
    if (this._output.raw) {
      this._output.add_raw_token(current_token);
      if (current_token.directives && current_token.directives.preserve === "end") {
        this._output.raw = this._options.test_output_raw;
      }
      return;
    }
    if (current_token.directives) {
      this.print_newline(false, preserve_statement_flags);
      this.print_token(current_token);
      if (current_token.directives.preserve === "start") {
        this._output.raw = true;
      }
      this.print_newline(false, true);
      return;
    }
    if (!acorn.newline.test(current_token.text) && !current_token.newlines) {
      this._output.space_before_token = true;
      this.print_token(current_token);
      this._output.space_before_token = true;
      return;
    } else {
      this.print_block_commment(current_token, preserve_statement_flags);
    }
  };
  Beautifier.prototype.print_block_commment = function(current_token, preserve_statement_flags) {
    var lines = split_linebreaks(current_token.text);
    var j;
    var javadoc = false;
    var starless = false;
    var lastIndent = current_token.whitespace_before;
    var lastIndentLength = lastIndent.length;
    this.print_newline(false, preserve_statement_flags);
    this.print_token_line_indentation(current_token);
    this._output.add_token(lines[0]);
    this.print_newline(false, preserve_statement_flags);
    if (lines.length > 1) {
      lines = lines.slice(1);
      javadoc = all_lines_start_with(lines, "*");
      starless = each_line_matches_indent(lines, lastIndent);
      if (javadoc) {
        this._flags.alignment = 1;
      }
      for (j = 0;j < lines.length; j++) {
        if (javadoc) {
          this.print_token_line_indentation(current_token);
          this._output.add_token(ltrim(lines[j]));
        } else if (starless && lines[j]) {
          this.print_token_line_indentation(current_token);
          this._output.add_token(lines[j].substring(lastIndentLength));
        } else {
          this._output.current_line.set_indent(-1);
          this._output.add_token(lines[j]);
        }
        this.print_newline(false, preserve_statement_flags);
      }
      this._flags.alignment = 0;
    }
  };
  Beautifier.prototype.handle_comment = function(current_token, preserve_statement_flags) {
    if (current_token.newlines) {
      this.print_newline(false, preserve_statement_flags);
    } else {
      this._output.trim(true);
    }
    this._output.space_before_token = true;
    this.print_token(current_token);
    this.print_newline(false, preserve_statement_flags);
  };
  Beautifier.prototype.handle_dot = function(current_token) {
    if (this.start_of_statement(current_token)) {} else {
      this.handle_whitespace_and_comments(current_token, true);
    }
    if (this._flags.last_token.text.match("^[0-9]+$")) {
      this._output.space_before_token = true;
    }
    if (reserved_array(this._flags.last_token, special_words)) {
      this._output.space_before_token = false;
    } else {
      this.allow_wrap_or_preserved_newline(current_token, this._flags.last_token.text === ")" && this._options.break_chained_methods);
    }
    if (this._options.unindent_chained_methods && this._output.just_added_newline()) {
      this.deindent();
    }
    this.print_token(current_token);
  };
  Beautifier.prototype.handle_unknown = function(current_token, preserve_statement_flags) {
    this.print_token(current_token);
    if (current_token.text[current_token.text.length - 1] === `
`) {
      this.print_newline(false, preserve_statement_flags);
    }
  };
  Beautifier.prototype.handle_eof = function(current_token) {
    while (this._flags.mode === MODE.Statement) {
      this.restore_mode();
    }
    this.handle_whitespace_and_comments(current_token);
  };
  exports.Beautifier = Beautifier;
});

// node_modules/js-beautify/js/src/javascript/index.js
var require_javascript = __commonJS((exports, module) => {
  var Beautifier = require_beautifier().Beautifier;
  var Options = require_options2().Options;
  function js_beautify(js_source_text, options) {
    var beautifier = new Beautifier(js_source_text, options);
    return beautifier.beautify();
  }
  module.exports = js_beautify;
  module.exports.defaultOptions = function() {
    return new Options;
  };
});

// node_modules/js-beautify/js/src/css/options.js
var require_options3 = __commonJS((exports, module) => {
  var BaseOptions = require_options().Options;
  function Options(options) {
    BaseOptions.call(this, options, "css");
    this.selector_separator_newline = this._get_boolean("selector_separator_newline", true);
    this.newline_between_rules = this._get_boolean("newline_between_rules", true);
    var space_around_selector_separator = this._get_boolean("space_around_selector_separator");
    this.space_around_combinator = this._get_boolean("space_around_combinator") || space_around_selector_separator;
    var brace_style_split = this._get_selection_list("brace_style", ["collapse", "expand", "end-expand", "none", "preserve-inline"]);
    this.brace_style = "collapse";
    for (var bs = 0;bs < brace_style_split.length; bs++) {
      if (brace_style_split[bs] !== "expand") {
        this.brace_style = "collapse";
      } else {
        this.brace_style = brace_style_split[bs];
      }
    }
  }
  Options.prototype = new BaseOptions;
  exports.Options = Options;
});

// node_modules/js-beautify/js/src/css/beautifier.js
var require_beautifier2 = __commonJS((exports, module) => {
  var Options = require_options3().Options;
  var Output = require_output().Output;
  var InputScanner = require_inputscanner().InputScanner;
  var Directives = require_directives().Directives;
  var directives_core = new Directives(/\/\*/, /\*\//);
  var lineBreak = /\r\n|[\r\n]/;
  var allLineBreaks = /\r\n|[\r\n]/g;
  var whitespaceChar = /\s/;
  var whitespacePattern = /(?:\s|\n)+/g;
  var block_comment_pattern = /\/\*(?:[\s\S]*?)((?:\*\/)|$)/g;
  var comment_pattern = /\/\/(?:[^\n\r\u2028\u2029]*)/g;
  function Beautifier(source_text, options) {
    this._source_text = source_text || "";
    this._options = new Options(options);
    this._ch = null;
    this._input = null;
    this.NESTED_AT_RULE = {
      page: true,
      "font-face": true,
      keyframes: true,
      media: true,
      supports: true,
      document: true
    };
    this.CONDITIONAL_GROUP_RULE = {
      media: true,
      supports: true,
      document: true
    };
    this.NON_SEMICOLON_NEWLINE_PROPERTY = [
      "grid-template-areas",
      "grid-template"
    ];
  }
  Beautifier.prototype.eatString = function(endChars) {
    var result = "";
    this._ch = this._input.next();
    while (this._ch) {
      result += this._ch;
      if (this._ch === "\\") {
        result += this._input.next();
      } else if (endChars.indexOf(this._ch) !== -1 || this._ch === `
`) {
        break;
      }
      this._ch = this._input.next();
    }
    return result;
  };
  Beautifier.prototype.eatWhitespace = function(allowAtLeastOneNewLine) {
    var result = whitespaceChar.test(this._input.peek());
    var newline_count = 0;
    while (whitespaceChar.test(this._input.peek())) {
      this._ch = this._input.next();
      if (allowAtLeastOneNewLine && this._ch === `
`) {
        if (newline_count === 0 || newline_count < this._options.max_preserve_newlines) {
          newline_count++;
          this._output.add_new_line(true);
        }
      }
    }
    return result;
  };
  Beautifier.prototype.foundNestedPseudoClass = function() {
    var openParen = 0;
    var i = 1;
    var ch = this._input.peek(i);
    while (ch) {
      if (ch === "{") {
        return true;
      } else if (ch === "(") {
        openParen += 1;
      } else if (ch === ")") {
        if (openParen === 0) {
          return false;
        }
        openParen -= 1;
      } else if (ch === ";" || ch === "}") {
        return false;
      }
      i++;
      ch = this._input.peek(i);
    }
    return false;
  };
  Beautifier.prototype.print_string = function(output_string) {
    this._output.set_indent(this._indentLevel);
    this._output.non_breaking_space = true;
    this._output.add_token(output_string);
  };
  Beautifier.prototype.preserveSingleSpace = function(isAfterSpace) {
    if (isAfterSpace) {
      this._output.space_before_token = true;
    }
  };
  Beautifier.prototype.indent = function() {
    this._indentLevel++;
  };
  Beautifier.prototype.outdent = function() {
    if (this._indentLevel > 0) {
      this._indentLevel--;
    }
  };
  Beautifier.prototype.beautify = function() {
    if (this._options.disabled) {
      return this._source_text;
    }
    var source_text = this._source_text;
    var eol = this._options.eol;
    if (eol === "auto") {
      eol = `
`;
      if (source_text && lineBreak.test(source_text || "")) {
        eol = source_text.match(lineBreak)[0];
      }
    }
    source_text = source_text.replace(allLineBreaks, `
`);
    var baseIndentString = source_text.match(/^[\t ]*/)[0];
    this._output = new Output(this._options, baseIndentString);
    this._input = new InputScanner(source_text);
    this._indentLevel = 0;
    this._nestedLevel = 0;
    this._ch = null;
    var parenLevel = 0;
    var insideRule = false;
    var insidePropertyValue = false;
    var enteringConditionalGroup = false;
    var insideNonNestedAtRule = false;
    var insideScssMap = false;
    var topCharacter = this._ch;
    var insideNonSemiColonValues = false;
    var whitespace;
    var isAfterSpace;
    var previous_ch;
    while (true) {
      whitespace = this._input.read(whitespacePattern);
      isAfterSpace = whitespace !== "";
      previous_ch = topCharacter;
      this._ch = this._input.next();
      if (this._ch === "\\" && this._input.hasNext()) {
        this._ch += this._input.next();
      }
      topCharacter = this._ch;
      if (!this._ch) {
        break;
      } else if (this._ch === "/" && this._input.peek() === "*") {
        this._output.add_new_line();
        this._input.back();
        var comment = this._input.read(block_comment_pattern);
        var directives = directives_core.get_directives(comment);
        if (directives && directives.ignore === "start") {
          comment += directives_core.readIgnored(this._input);
        }
        this.print_string(comment);
        this.eatWhitespace(true);
        this._output.add_new_line();
      } else if (this._ch === "/" && this._input.peek() === "/") {
        this._output.space_before_token = true;
        this._input.back();
        this.print_string(this._input.read(comment_pattern));
        this.eatWhitespace(true);
      } else if (this._ch === "$") {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
        var variable = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);
        if (variable.match(/[ :]$/)) {
          variable = this.eatString(": ").replace(/\s+$/, "");
          this.print_string(variable);
          this._output.space_before_token = true;
        }
        if (parenLevel === 0 && variable.indexOf(":") !== -1) {
          insidePropertyValue = true;
          this.indent();
        }
      } else if (this._ch === "@") {
        this.preserveSingleSpace(isAfterSpace);
        if (this._input.peek() === "{") {
          this.print_string(this._ch + this.eatString("}"));
        } else {
          this.print_string(this._ch);
          var variableOrRule = this._input.peekUntilAfter(/[: ,;{}()[\]\/='"]/g);
          if (variableOrRule.match(/[ :]$/)) {
            variableOrRule = this.eatString(": ").replace(/\s+$/, "");
            this.print_string(variableOrRule);
            this._output.space_before_token = true;
          }
          if (parenLevel === 0 && variableOrRule.indexOf(":") !== -1) {
            insidePropertyValue = true;
            this.indent();
          } else if (variableOrRule in this.NESTED_AT_RULE) {
            this._nestedLevel += 1;
            if (variableOrRule in this.CONDITIONAL_GROUP_RULE) {
              enteringConditionalGroup = true;
            }
          } else if (parenLevel === 0 && !insidePropertyValue) {
            insideNonNestedAtRule = true;
          }
        }
      } else if (this._ch === "#" && this._input.peek() === "{") {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch + this.eatString("}"));
      } else if (this._ch === "{") {
        if (insidePropertyValue) {
          insidePropertyValue = false;
          this.outdent();
        }
        insideNonNestedAtRule = false;
        if (enteringConditionalGroup) {
          enteringConditionalGroup = false;
          insideRule = this._indentLevel >= this._nestedLevel;
        } else {
          insideRule = this._indentLevel >= this._nestedLevel - 1;
        }
        if (this._options.newline_between_rules && insideRule) {
          if (this._output.previous_line && this._output.previous_line.item(-1) !== "{") {
            this._output.ensure_empty_line_above("/", ",");
          }
        }
        this._output.space_before_token = true;
        if (this._options.brace_style === "expand") {
          this._output.add_new_line();
          this.print_string(this._ch);
          this.indent();
          this._output.set_indent(this._indentLevel);
        } else {
          if (previous_ch === "(") {
            this._output.space_before_token = false;
          } else if (previous_ch !== ",") {
            this.indent();
          }
          this.print_string(this._ch);
        }
        this.eatWhitespace(true);
        this._output.add_new_line();
      } else if (this._ch === "}") {
        this.outdent();
        this._output.add_new_line();
        if (previous_ch === "{") {
          this._output.trim(true);
        }
        if (insidePropertyValue) {
          this.outdent();
          insidePropertyValue = false;
        }
        this.print_string(this._ch);
        insideRule = false;
        if (this._nestedLevel) {
          this._nestedLevel--;
        }
        this.eatWhitespace(true);
        this._output.add_new_line();
        if (this._options.newline_between_rules && !this._output.just_added_blankline()) {
          if (this._input.peek() !== "}") {
            this._output.add_new_line(true);
          }
        }
        if (this._input.peek() === ")") {
          this._output.trim(true);
          if (this._options.brace_style === "expand") {
            this._output.add_new_line(true);
          }
        }
      } else if (this._ch === ":") {
        for (var i = 0;i < this.NON_SEMICOLON_NEWLINE_PROPERTY.length; i++) {
          if (this._input.lookBack(this.NON_SEMICOLON_NEWLINE_PROPERTY[i])) {
            insideNonSemiColonValues = true;
            break;
          }
        }
        if ((insideRule || enteringConditionalGroup) && !(this._input.lookBack("&") || this.foundNestedPseudoClass()) && !this._input.lookBack("(") && !insideNonNestedAtRule && parenLevel === 0) {
          this.print_string(":");
          if (!insidePropertyValue) {
            insidePropertyValue = true;
            this._output.space_before_token = true;
            this.eatWhitespace(true);
            this.indent();
          }
        } else {
          if (this._input.lookBack(" ")) {
            this._output.space_before_token = true;
          }
          if (this._input.peek() === ":") {
            this._ch = this._input.next();
            this.print_string("::");
          } else {
            this.print_string(":");
          }
        }
      } else if (this._ch === '"' || this._ch === "'") {
        var preserveQuoteSpace = previous_ch === '"' || previous_ch === "'";
        this.preserveSingleSpace(preserveQuoteSpace || isAfterSpace);
        this.print_string(this._ch + this.eatString(this._ch));
        this.eatWhitespace(true);
      } else if (this._ch === ";") {
        insideNonSemiColonValues = false;
        if (parenLevel === 0) {
          if (insidePropertyValue) {
            this.outdent();
            insidePropertyValue = false;
          }
          insideNonNestedAtRule = false;
          this.print_string(this._ch);
          this.eatWhitespace(true);
          if (this._input.peek() !== "/") {
            this._output.add_new_line();
          }
        } else {
          this.print_string(this._ch);
          this.eatWhitespace(true);
          this._output.space_before_token = true;
        }
      } else if (this._ch === "(") {
        if (this._input.lookBack("url")) {
          this.print_string(this._ch);
          this.eatWhitespace();
          parenLevel++;
          this.indent();
          this._ch = this._input.next();
          if (this._ch === ")" || this._ch === '"' || this._ch === "'") {
            this._input.back();
          } else if (this._ch) {
            this.print_string(this._ch + this.eatString(")"));
            if (parenLevel) {
              parenLevel--;
              this.outdent();
            }
          }
        } else {
          var space_needed = false;
          if (this._input.lookBack("with")) {
            space_needed = true;
          }
          this.preserveSingleSpace(isAfterSpace || space_needed);
          this.print_string(this._ch);
          if (insidePropertyValue && previous_ch === "$" && this._options.selector_separator_newline) {
            this._output.add_new_line();
            insideScssMap = true;
          } else {
            this.eatWhitespace();
            parenLevel++;
            this.indent();
          }
        }
      } else if (this._ch === ")") {
        if (parenLevel) {
          parenLevel--;
          this.outdent();
        }
        if (insideScssMap && this._input.peek() === ";" && this._options.selector_separator_newline) {
          insideScssMap = false;
          this.outdent();
          this._output.add_new_line();
        }
        this.print_string(this._ch);
      } else if (this._ch === ",") {
        this.print_string(this._ch);
        this.eatWhitespace(true);
        if (this._options.selector_separator_newline && (!insidePropertyValue || insideScssMap) && parenLevel === 0 && !insideNonNestedAtRule) {
          this._output.add_new_line();
        } else {
          this._output.space_before_token = true;
        }
      } else if ((this._ch === ">" || this._ch === "+" || this._ch === "~") && !insidePropertyValue && parenLevel === 0) {
        if (this._options.space_around_combinator) {
          this._output.space_before_token = true;
          this.print_string(this._ch);
          this._output.space_before_token = true;
        } else {
          this.print_string(this._ch);
          this.eatWhitespace();
          if (this._ch && whitespaceChar.test(this._ch)) {
            this._ch = "";
          }
        }
      } else if (this._ch === "]") {
        this.print_string(this._ch);
      } else if (this._ch === "[") {
        this.preserveSingleSpace(isAfterSpace);
        this.print_string(this._ch);
      } else if (this._ch === "=") {
        this.eatWhitespace();
        this.print_string("=");
        if (whitespaceChar.test(this._ch)) {
          this._ch = "";
        }
      } else if (this._ch === "!" && !this._input.lookBack("\\")) {
        this._output.space_before_token = true;
        this.print_string(this._ch);
      } else {
        var preserveAfterSpace = previous_ch === '"' || previous_ch === "'";
        this.preserveSingleSpace(preserveAfterSpace || isAfterSpace);
        this.print_string(this._ch);
        if (!this._output.just_added_newline() && this._input.peek() === `
` && insideNonSemiColonValues) {
          this._output.add_new_line();
        }
      }
    }
    var sweetCode = this._output.get_code(eol);
    return sweetCode;
  };
  exports.Beautifier = Beautifier;
});

// node_modules/js-beautify/js/src/css/index.js
var require_css = __commonJS((exports, module) => {
  var Beautifier = require_beautifier2().Beautifier;
  var Options = require_options3().Options;
  function css_beautify(source_text, options) {
    var beautifier = new Beautifier(source_text, options);
    return beautifier.beautify();
  }
  module.exports = css_beautify;
  module.exports.defaultOptions = function() {
    return new Options;
  };
});

// node_modules/js-beautify/js/src/html/options.js
var require_options4 = __commonJS((exports, module) => {
  var BaseOptions = require_options().Options;
  function Options(options) {
    BaseOptions.call(this, options, "html");
    if (this.templating.length === 1 && this.templating[0] === "auto") {
      this.templating = ["django", "erb", "handlebars", "php"];
    }
    this.indent_inner_html = this._get_boolean("indent_inner_html");
    this.indent_body_inner_html = this._get_boolean("indent_body_inner_html", true);
    this.indent_head_inner_html = this._get_boolean("indent_head_inner_html", true);
    this.indent_handlebars = this._get_boolean("indent_handlebars", true);
    this.wrap_attributes = this._get_selection("wrap_attributes", ["auto", "force", "force-aligned", "force-expand-multiline", "aligned-multiple", "preserve", "preserve-aligned"]);
    this.wrap_attributes_min_attrs = this._get_number("wrap_attributes_min_attrs", 2);
    this.wrap_attributes_indent_size = this._get_number("wrap_attributes_indent_size", this.indent_size);
    this.extra_liners = this._get_array("extra_liners", ["head", "body", "/html"]);
    this.inline = this._get_array("inline", [
      "a",
      "abbr",
      "area",
      "audio",
      "b",
      "bdi",
      "bdo",
      "br",
      "button",
      "canvas",
      "cite",
      "code",
      "data",
      "datalist",
      "del",
      "dfn",
      "em",
      "embed",
      "i",
      "iframe",
      "img",
      "input",
      "ins",
      "kbd",
      "keygen",
      "label",
      "map",
      "mark",
      "math",
      "meter",
      "noscript",
      "object",
      "output",
      "progress",
      "q",
      "ruby",
      "s",
      "samp",
      "select",
      "small",
      "span",
      "strong",
      "sub",
      "sup",
      "svg",
      "template",
      "textarea",
      "time",
      "u",
      "var",
      "video",
      "wbr",
      "text",
      "acronym",
      "big",
      "strike",
      "tt"
    ]);
    this.inline_custom_elements = this._get_boolean("inline_custom_elements", true);
    this.void_elements = this._get_array("void_elements", [
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "keygen",
      "link",
      "menuitem",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
      "!doctype",
      "?xml",
      "basefont",
      "isindex"
    ]);
    this.unformatted = this._get_array("unformatted", []);
    this.content_unformatted = this._get_array("content_unformatted", [
      "pre",
      "textarea"
    ]);
    this.unformatted_content_delimiter = this._get_characters("unformatted_content_delimiter");
    this.indent_scripts = this._get_selection("indent_scripts", ["normal", "keep", "separate"]);
  }
  Options.prototype = new BaseOptions;
  exports.Options = Options;
});

// node_modules/js-beautify/js/src/html/tokenizer.js
var require_tokenizer3 = __commonJS((exports, module) => {
  var BaseTokenizer = require_tokenizer().Tokenizer;
  var BASETOKEN = require_tokenizer().TOKEN;
  var Directives = require_directives().Directives;
  var TemplatablePattern = require_templatablepattern().TemplatablePattern;
  var Pattern = require_pattern().Pattern;
  var TOKEN = {
    TAG_OPEN: "TK_TAG_OPEN",
    TAG_CLOSE: "TK_TAG_CLOSE",
    CONTROL_FLOW_OPEN: "TK_CONTROL_FLOW_OPEN",
    CONTROL_FLOW_CLOSE: "TK_CONTROL_FLOW_CLOSE",
    ATTRIBUTE: "TK_ATTRIBUTE",
    EQUALS: "TK_EQUALS",
    VALUE: "TK_VALUE",
    COMMENT: "TK_COMMENT",
    TEXT: "TK_TEXT",
    UNKNOWN: "TK_UNKNOWN",
    START: BASETOKEN.START,
    RAW: BASETOKEN.RAW,
    EOF: BASETOKEN.EOF
  };
  var directives_core = new Directives(/<\!--/, /-->/);
  var Tokenizer = function(input_string, options) {
    BaseTokenizer.call(this, input_string, options);
    this._current_tag_name = "";
    var templatable_reader = new TemplatablePattern(this._input).read_options(this._options);
    var pattern_reader = new Pattern(this._input);
    this.__patterns = {
      word: templatable_reader.until(/[\n\r\t <]/),
      word_control_flow_close_excluded: templatable_reader.until(/[\n\r\t <}]/),
      single_quote: templatable_reader.until_after(/'/),
      double_quote: templatable_reader.until_after(/"/),
      attribute: templatable_reader.until(/[\n\r\t =>]|\/>/),
      element_name: templatable_reader.until(/[\n\r\t >\/]/),
      angular_control_flow_start: pattern_reader.matching(/\@[a-zA-Z]+[^({]*[({]/),
      handlebars_comment: pattern_reader.starting_with(/{{!--/).until_after(/--}}/),
      handlebars: pattern_reader.starting_with(/{{/).until_after(/}}/),
      handlebars_open: pattern_reader.until(/[\n\r\t }]/),
      handlebars_raw_close: pattern_reader.until(/}}/),
      comment: pattern_reader.starting_with(/<!--/).until_after(/-->/),
      cdata: pattern_reader.starting_with(/<!\[CDATA\[/).until_after(/]]>/),
      conditional_comment: pattern_reader.starting_with(/<!\[/).until_after(/]>/),
      processing: pattern_reader.starting_with(/<\?/).until_after(/\?>/)
    };
    if (this._options.indent_handlebars) {
      this.__patterns.word = this.__patterns.word.exclude("handlebars");
      this.__patterns.word_control_flow_close_excluded = this.__patterns.word_control_flow_close_excluded.exclude("handlebars");
    }
    this._unformatted_content_delimiter = null;
    if (this._options.unformatted_content_delimiter) {
      var literal_regexp = this._input.get_literal_regexp(this._options.unformatted_content_delimiter);
      this.__patterns.unformatted_content_delimiter = pattern_reader.matching(literal_regexp).until_after(literal_regexp);
    }
  };
  Tokenizer.prototype = new BaseTokenizer;
  Tokenizer.prototype._is_comment = function(current_token) {
    return false;
  };
  Tokenizer.prototype._is_opening = function(current_token) {
    return current_token.type === TOKEN.TAG_OPEN || current_token.type === TOKEN.CONTROL_FLOW_OPEN;
  };
  Tokenizer.prototype._is_closing = function(current_token, open_token) {
    return current_token.type === TOKEN.TAG_CLOSE && (open_token && ((current_token.text === ">" || current_token.text === "/>") && open_token.text[0] === "<" || current_token.text === "}}" && open_token.text[0] === "{" && open_token.text[1] === "{")) || current_token.type === TOKEN.CONTROL_FLOW_CLOSE && (current_token.text === "}" && open_token.text.endsWith("{"));
  };
  Tokenizer.prototype._reset = function() {
    this._current_tag_name = "";
  };
  Tokenizer.prototype._get_next_token = function(previous_token, open_token) {
    var token = null;
    this._readWhitespace();
    var c = this._input.peek();
    if (c === null) {
      return this._create_token(TOKEN.EOF, "");
    }
    token = token || this._read_open_handlebars(c, open_token);
    token = token || this._read_attribute(c, previous_token, open_token);
    token = token || this._read_close(c, open_token);
    token = token || this._read_script_and_style(c, previous_token);
    token = token || this._read_control_flows(c, open_token);
    token = token || this._read_raw_content(c, previous_token, open_token);
    token = token || this._read_content_word(c, open_token);
    token = token || this._read_comment_or_cdata(c);
    token = token || this._read_processing(c);
    token = token || this._read_open(c, open_token);
    token = token || this._create_token(TOKEN.UNKNOWN, this._input.next());
    return token;
  };
  Tokenizer.prototype._read_comment_or_cdata = function(c) {
    var token = null;
    var resulting_string = null;
    var directives = null;
    if (c === "<") {
      var peek1 = this._input.peek(1);
      if (peek1 === "!") {
        resulting_string = this.__patterns.comment.read();
        if (resulting_string) {
          directives = directives_core.get_directives(resulting_string);
          if (directives && directives.ignore === "start") {
            resulting_string += directives_core.readIgnored(this._input);
          }
        } else {
          resulting_string = this.__patterns.cdata.read();
        }
      }
      if (resulting_string) {
        token = this._create_token(TOKEN.COMMENT, resulting_string);
        token.directives = directives;
      }
    }
    return token;
  };
  Tokenizer.prototype._read_processing = function(c) {
    var token = null;
    var resulting_string = null;
    var directives = null;
    if (c === "<") {
      var peek1 = this._input.peek(1);
      if (peek1 === "!" || peek1 === "?") {
        resulting_string = this.__patterns.conditional_comment.read();
        resulting_string = resulting_string || this.__patterns.processing.read();
      }
      if (resulting_string) {
        token = this._create_token(TOKEN.COMMENT, resulting_string);
        token.directives = directives;
      }
    }
    return token;
  };
  Tokenizer.prototype._read_open = function(c, open_token) {
    var resulting_string = null;
    var token = null;
    if (!open_token || open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
      if (c === "<") {
        resulting_string = this._input.next();
        if (this._input.peek() === "/") {
          resulting_string += this._input.next();
        }
        resulting_string += this.__patterns.element_name.read();
        token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
      }
    }
    return token;
  };
  Tokenizer.prototype._read_open_handlebars = function(c, open_token) {
    var resulting_string = null;
    var token = null;
    if (!open_token || open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
      if ((this._options.templating.includes("angular") || this._options.indent_handlebars) && c === "{" && this._input.peek(1) === "{") {
        if (this._options.indent_handlebars && this._input.peek(2) === "!") {
          resulting_string = this.__patterns.handlebars_comment.read();
          resulting_string = resulting_string || this.__patterns.handlebars.read();
          token = this._create_token(TOKEN.COMMENT, resulting_string);
        } else {
          resulting_string = this.__patterns.handlebars_open.read();
          token = this._create_token(TOKEN.TAG_OPEN, resulting_string);
        }
      }
    }
    return token;
  };
  Tokenizer.prototype._read_control_flows = function(c, open_token) {
    var resulting_string = "";
    var token = null;
    if (!this._options.templating.includes("angular")) {
      return token;
    }
    if (c === "@") {
      resulting_string = this.__patterns.angular_control_flow_start.read();
      if (resulting_string === "") {
        return token;
      }
      var opening_parentheses_count = resulting_string.endsWith("(") ? 1 : 0;
      var closing_parentheses_count = 0;
      while (!(resulting_string.endsWith("{") && opening_parentheses_count === closing_parentheses_count)) {
        var next_char = this._input.next();
        if (next_char === null) {
          break;
        } else if (next_char === "(") {
          opening_parentheses_count++;
        } else if (next_char === ")") {
          closing_parentheses_count++;
        }
        resulting_string += next_char;
      }
      token = this._create_token(TOKEN.CONTROL_FLOW_OPEN, resulting_string);
    } else if (c === "}" && open_token && open_token.type === TOKEN.CONTROL_FLOW_OPEN) {
      resulting_string = this._input.next();
      token = this._create_token(TOKEN.CONTROL_FLOW_CLOSE, resulting_string);
    }
    return token;
  };
  Tokenizer.prototype._read_close = function(c, open_token) {
    var resulting_string = null;
    var token = null;
    if (open_token && open_token.type === TOKEN.TAG_OPEN) {
      if (open_token.text[0] === "<" && (c === ">" || c === "/" && this._input.peek(1) === ">")) {
        resulting_string = this._input.next();
        if (c === "/") {
          resulting_string += this._input.next();
        }
        token = this._create_token(TOKEN.TAG_CLOSE, resulting_string);
      } else if (open_token.text[0] === "{" && c === "}" && this._input.peek(1) === "}") {
        this._input.next();
        this._input.next();
        token = this._create_token(TOKEN.TAG_CLOSE, "}}");
      }
    }
    return token;
  };
  Tokenizer.prototype._read_attribute = function(c, previous_token, open_token) {
    var token = null;
    var resulting_string = "";
    if (open_token && open_token.text[0] === "<") {
      if (c === "=") {
        token = this._create_token(TOKEN.EQUALS, this._input.next());
      } else if (c === '"' || c === "'") {
        var content = this._input.next();
        if (c === '"') {
          content += this.__patterns.double_quote.read();
        } else {
          content += this.__patterns.single_quote.read();
        }
        token = this._create_token(TOKEN.VALUE, content);
      } else {
        resulting_string = this.__patterns.attribute.read();
        if (resulting_string) {
          if (previous_token.type === TOKEN.EQUALS) {
            token = this._create_token(TOKEN.VALUE, resulting_string);
          } else {
            token = this._create_token(TOKEN.ATTRIBUTE, resulting_string);
          }
        }
      }
    }
    return token;
  };
  Tokenizer.prototype._is_content_unformatted = function(tag_name) {
    return this._options.void_elements.indexOf(tag_name) === -1 && (this._options.content_unformatted.indexOf(tag_name) !== -1 || this._options.unformatted.indexOf(tag_name) !== -1);
  };
  Tokenizer.prototype._read_raw_content = function(c, previous_token, open_token) {
    var resulting_string = "";
    if (open_token && open_token.text[0] === "{") {
      resulting_string = this.__patterns.handlebars_raw_close.read();
    } else if (previous_token.type === TOKEN.TAG_CLOSE && previous_token.opened.text[0] === "<" && previous_token.text[0] !== "/") {
      var tag_name = previous_token.opened.text.substr(1).toLowerCase();
      if (this._is_content_unformatted(tag_name)) {
        resulting_string = this._input.readUntil(new RegExp("</" + tag_name + "[\\n\\r\\t ]*?>", "ig"));
      }
    }
    if (resulting_string) {
      return this._create_token(TOKEN.TEXT, resulting_string);
    }
    return null;
  };
  Tokenizer.prototype._read_script_and_style = function(c, previous_token) {
    if (previous_token.type === TOKEN.TAG_CLOSE && previous_token.opened.text[0] === "<" && previous_token.text[0] !== "/") {
      var tag_name = previous_token.opened.text.substr(1).toLowerCase();
      if (tag_name === "script" || tag_name === "style") {
        var token = this._read_comment_or_cdata(c);
        if (token) {
          token.type = TOKEN.TEXT;
          return token;
        }
        var resulting_string = this._input.readUntil(new RegExp("</" + tag_name + "[\\n\\r\\t ]*?>", "ig"));
        if (resulting_string) {
          return this._create_token(TOKEN.TEXT, resulting_string);
        }
      }
    }
    return null;
  };
  Tokenizer.prototype._read_content_word = function(c, open_token) {
    var resulting_string = "";
    if (this._options.unformatted_content_delimiter) {
      if (c === this._options.unformatted_content_delimiter[0]) {
        resulting_string = this.__patterns.unformatted_content_delimiter.read();
      }
    }
    if (!resulting_string) {
      resulting_string = open_token && open_token.type === TOKEN.CONTROL_FLOW_OPEN ? this.__patterns.word_control_flow_close_excluded.read() : this.__patterns.word.read();
    }
    if (resulting_string) {
      return this._create_token(TOKEN.TEXT, resulting_string);
    }
    return null;
  };
  exports.Tokenizer = Tokenizer;
  exports.TOKEN = TOKEN;
});

// node_modules/js-beautify/js/src/html/beautifier.js
var require_beautifier3 = __commonJS((exports, module) => {
  var Options = require_options4().Options;
  var Output = require_output().Output;
  var Tokenizer = require_tokenizer3().Tokenizer;
  var TOKEN = require_tokenizer3().TOKEN;
  var lineBreak = /\r\n|[\r\n]/;
  var allLineBreaks = /\r\n|[\r\n]/g;
  var Printer = function(options, base_indent_string) {
    this.indent_level = 0;
    this.alignment_size = 0;
    this.max_preserve_newlines = options.max_preserve_newlines;
    this.preserve_newlines = options.preserve_newlines;
    this._output = new Output(options, base_indent_string);
  };
  Printer.prototype.current_line_has_match = function(pattern) {
    return this._output.current_line.has_match(pattern);
  };
  Printer.prototype.set_space_before_token = function(value, non_breaking) {
    this._output.space_before_token = value;
    this._output.non_breaking_space = non_breaking;
  };
  Printer.prototype.set_wrap_point = function() {
    this._output.set_indent(this.indent_level, this.alignment_size);
    this._output.set_wrap_point();
  };
  Printer.prototype.add_raw_token = function(token) {
    this._output.add_raw_token(token);
  };
  Printer.prototype.print_preserved_newlines = function(raw_token) {
    var newlines = 0;
    if (raw_token.type !== TOKEN.TEXT && raw_token.previous.type !== TOKEN.TEXT) {
      newlines = raw_token.newlines ? 1 : 0;
    }
    if (this.preserve_newlines) {
      newlines = raw_token.newlines < this.max_preserve_newlines + 1 ? raw_token.newlines : this.max_preserve_newlines + 1;
    }
    for (var n = 0;n < newlines; n++) {
      this.print_newline(n > 0);
    }
    return newlines !== 0;
  };
  Printer.prototype.traverse_whitespace = function(raw_token) {
    if (raw_token.whitespace_before || raw_token.newlines) {
      if (!this.print_preserved_newlines(raw_token)) {
        this._output.space_before_token = true;
      }
      return true;
    }
    return false;
  };
  Printer.prototype.previous_token_wrapped = function() {
    return this._output.previous_token_wrapped;
  };
  Printer.prototype.print_newline = function(force) {
    this._output.add_new_line(force);
  };
  Printer.prototype.print_token = function(token) {
    if (token.text) {
      this._output.set_indent(this.indent_level, this.alignment_size);
      this._output.add_token(token.text);
    }
  };
  Printer.prototype.indent = function() {
    this.indent_level++;
  };
  Printer.prototype.deindent = function() {
    if (this.indent_level > 0) {
      this.indent_level--;
      this._output.set_indent(this.indent_level, this.alignment_size);
    }
  };
  Printer.prototype.get_full_indent = function(level) {
    level = this.indent_level + (level || 0);
    if (level < 1) {
      return "";
    }
    return this._output.get_indent_string(level);
  };
  var get_type_attribute = function(start_token) {
    var result = null;
    var raw_token = start_token.next;
    while (raw_token.type !== TOKEN.EOF && start_token.closed !== raw_token) {
      if (raw_token.type === TOKEN.ATTRIBUTE && raw_token.text === "type") {
        if (raw_token.next && raw_token.next.type === TOKEN.EQUALS && raw_token.next.next && raw_token.next.next.type === TOKEN.VALUE) {
          result = raw_token.next.next.text;
        }
        break;
      }
      raw_token = raw_token.next;
    }
    return result;
  };
  var get_custom_beautifier_name = function(tag_check, raw_token) {
    var typeAttribute = null;
    var result = null;
    if (!raw_token.closed) {
      return null;
    }
    if (tag_check === "script") {
      typeAttribute = "text/javascript";
    } else if (tag_check === "style") {
      typeAttribute = "text/css";
    }
    typeAttribute = get_type_attribute(raw_token) || typeAttribute;
    if (typeAttribute.search("text/css") > -1) {
      result = "css";
    } else if (typeAttribute.search(/module|((text|application|dojo)\/(x-)?(javascript|ecmascript|jscript|livescript|(ld\+)?json|method|aspect))/) > -1) {
      result = "javascript";
    } else if (typeAttribute.search(/(text|application|dojo)\/(x-)?(html)/) > -1) {
      result = "html";
    } else if (typeAttribute.search(/test\/null/) > -1) {
      result = "null";
    }
    return result;
  };
  function in_array(what, arr) {
    return arr.indexOf(what) !== -1;
  }
  function TagFrame(parent, parser_token, indent_level) {
    this.parent = parent || null;
    this.tag = parser_token ? parser_token.tag_name : "";
    this.indent_level = indent_level || 0;
    this.parser_token = parser_token || null;
  }
  function TagStack(printer) {
    this._printer = printer;
    this._current_frame = null;
  }
  TagStack.prototype.get_parser_token = function() {
    return this._current_frame ? this._current_frame.parser_token : null;
  };
  TagStack.prototype.record_tag = function(parser_token) {
    var new_frame = new TagFrame(this._current_frame, parser_token, this._printer.indent_level);
    this._current_frame = new_frame;
  };
  TagStack.prototype._try_pop_frame = function(frame) {
    var parser_token = null;
    if (frame) {
      parser_token = frame.parser_token;
      this._printer.indent_level = frame.indent_level;
      this._current_frame = frame.parent;
    }
    return parser_token;
  };
  TagStack.prototype._get_frame = function(tag_list, stop_list) {
    var frame = this._current_frame;
    while (frame) {
      if (tag_list.indexOf(frame.tag) !== -1) {
        break;
      } else if (stop_list && stop_list.indexOf(frame.tag) !== -1) {
        frame = null;
        break;
      }
      frame = frame.parent;
    }
    return frame;
  };
  TagStack.prototype.try_pop = function(tag, stop_list) {
    var frame = this._get_frame([tag], stop_list);
    return this._try_pop_frame(frame);
  };
  TagStack.prototype.indent_to_tag = function(tag_list) {
    var frame = this._get_frame(tag_list);
    if (frame) {
      this._printer.indent_level = frame.indent_level;
    }
  };
  function Beautifier(source_text, options, js_beautify, css_beautify) {
    this._source_text = source_text || "";
    options = options || {};
    this._js_beautify = js_beautify;
    this._css_beautify = css_beautify;
    this._tag_stack = null;
    var optionHtml = new Options(options, "html");
    this._options = optionHtml;
    this._is_wrap_attributes_force = this._options.wrap_attributes.substr(0, "force".length) === "force";
    this._is_wrap_attributes_force_expand_multiline = this._options.wrap_attributes === "force-expand-multiline";
    this._is_wrap_attributes_force_aligned = this._options.wrap_attributes === "force-aligned";
    this._is_wrap_attributes_aligned_multiple = this._options.wrap_attributes === "aligned-multiple";
    this._is_wrap_attributes_preserve = this._options.wrap_attributes.substr(0, "preserve".length) === "preserve";
    this._is_wrap_attributes_preserve_aligned = this._options.wrap_attributes === "preserve-aligned";
  }
  Beautifier.prototype.beautify = function() {
    if (this._options.disabled) {
      return this._source_text;
    }
    var source_text = this._source_text;
    var eol = this._options.eol;
    if (this._options.eol === "auto") {
      eol = `
`;
      if (source_text && lineBreak.test(source_text)) {
        eol = source_text.match(lineBreak)[0];
      }
    }
    source_text = source_text.replace(allLineBreaks, `
`);
    var baseIndentString = source_text.match(/^[\t ]*/)[0];
    var last_token = {
      text: "",
      type: ""
    };
    var last_tag_token = new TagOpenParserToken(this._options);
    var printer = new Printer(this._options, baseIndentString);
    var tokens = new Tokenizer(source_text, this._options).tokenize();
    this._tag_stack = new TagStack(printer);
    var parser_token = null;
    var raw_token = tokens.next();
    while (raw_token.type !== TOKEN.EOF) {
      if (raw_token.type === TOKEN.TAG_OPEN || raw_token.type === TOKEN.COMMENT) {
        parser_token = this._handle_tag_open(printer, raw_token, last_tag_token, last_token, tokens);
        last_tag_token = parser_token;
      } else if (raw_token.type === TOKEN.ATTRIBUTE || raw_token.type === TOKEN.EQUALS || raw_token.type === TOKEN.VALUE || raw_token.type === TOKEN.TEXT && !last_tag_token.tag_complete) {
        parser_token = this._handle_inside_tag(printer, raw_token, last_tag_token, last_token);
      } else if (raw_token.type === TOKEN.TAG_CLOSE) {
        parser_token = this._handle_tag_close(printer, raw_token, last_tag_token);
      } else if (raw_token.type === TOKEN.TEXT) {
        parser_token = this._handle_text(printer, raw_token, last_tag_token);
      } else if (raw_token.type === TOKEN.CONTROL_FLOW_OPEN) {
        parser_token = this._handle_control_flow_open(printer, raw_token);
      } else if (raw_token.type === TOKEN.CONTROL_FLOW_CLOSE) {
        parser_token = this._handle_control_flow_close(printer, raw_token);
      } else {
        printer.add_raw_token(raw_token);
      }
      last_token = parser_token;
      raw_token = tokens.next();
    }
    var sweet_code = printer._output.get_code(eol);
    return sweet_code;
  };
  Beautifier.prototype._handle_control_flow_open = function(printer, raw_token) {
    var parser_token = {
      text: raw_token.text,
      type: raw_token.type
    };
    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    if (raw_token.newlines) {
      printer.print_preserved_newlines(raw_token);
    } else {
      printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    }
    printer.print_token(raw_token);
    printer.indent();
    return parser_token;
  };
  Beautifier.prototype._handle_control_flow_close = function(printer, raw_token) {
    var parser_token = {
      text: raw_token.text,
      type: raw_token.type
    };
    printer.deindent();
    if (raw_token.newlines) {
      printer.print_preserved_newlines(raw_token);
    } else {
      printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    }
    printer.print_token(raw_token);
    return parser_token;
  };
  Beautifier.prototype._handle_tag_close = function(printer, raw_token, last_tag_token) {
    var parser_token = {
      text: raw_token.text,
      type: raw_token.type
    };
    printer.alignment_size = 0;
    last_tag_token.tag_complete = true;
    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    if (last_tag_token.is_unformatted) {
      printer.add_raw_token(raw_token);
    } else {
      if (last_tag_token.tag_start_char === "<") {
        printer.set_space_before_token(raw_token.text[0] === "/", true);
        if (this._is_wrap_attributes_force_expand_multiline && last_tag_token.has_wrapped_attrs) {
          printer.print_newline(false);
        }
      }
      printer.print_token(raw_token);
    }
    if (last_tag_token.indent_content && !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
      printer.indent();
      last_tag_token.indent_content = false;
    }
    if (!last_tag_token.is_inline_element && !(last_tag_token.is_unformatted || last_tag_token.is_content_unformatted)) {
      printer.set_wrap_point();
    }
    return parser_token;
  };
  Beautifier.prototype._handle_inside_tag = function(printer, raw_token, last_tag_token, last_token) {
    var wrapped = last_tag_token.has_wrapped_attrs;
    var parser_token = {
      text: raw_token.text,
      type: raw_token.type
    };
    printer.set_space_before_token(raw_token.newlines || raw_token.whitespace_before !== "", true);
    if (last_tag_token.is_unformatted) {
      printer.add_raw_token(raw_token);
    } else if (last_tag_token.tag_start_char === "{" && raw_token.type === TOKEN.TEXT) {
      if (printer.print_preserved_newlines(raw_token)) {
        raw_token.newlines = 0;
        printer.add_raw_token(raw_token);
      } else {
        printer.print_token(raw_token);
      }
    } else {
      if (raw_token.type === TOKEN.ATTRIBUTE) {
        printer.set_space_before_token(true);
      } else if (raw_token.type === TOKEN.EQUALS) {
        printer.set_space_before_token(false);
      } else if (raw_token.type === TOKEN.VALUE && raw_token.previous.type === TOKEN.EQUALS) {
        printer.set_space_before_token(false);
      }
      if (raw_token.type === TOKEN.ATTRIBUTE && last_tag_token.tag_start_char === "<") {
        if (this._is_wrap_attributes_preserve || this._is_wrap_attributes_preserve_aligned) {
          printer.traverse_whitespace(raw_token);
          wrapped = wrapped || raw_token.newlines !== 0;
        }
        if (this._is_wrap_attributes_force && last_tag_token.attr_count >= this._options.wrap_attributes_min_attrs && (last_token.type !== TOKEN.TAG_OPEN || this._is_wrap_attributes_force_expand_multiline)) {
          printer.print_newline(false);
          wrapped = true;
        }
      }
      printer.print_token(raw_token);
      wrapped = wrapped || printer.previous_token_wrapped();
      last_tag_token.has_wrapped_attrs = wrapped;
    }
    return parser_token;
  };
  Beautifier.prototype._handle_text = function(printer, raw_token, last_tag_token) {
    var parser_token = {
      text: raw_token.text,
      type: "TK_CONTENT"
    };
    if (last_tag_token.custom_beautifier_name) {
      this._print_custom_beatifier_text(printer, raw_token, last_tag_token);
    } else if (last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) {
      printer.add_raw_token(raw_token);
    } else {
      printer.traverse_whitespace(raw_token);
      printer.print_token(raw_token);
    }
    return parser_token;
  };
  Beautifier.prototype._print_custom_beatifier_text = function(printer, raw_token, last_tag_token) {
    var local = this;
    if (raw_token.text !== "") {
      var text = raw_token.text, _beautifier, script_indent_level = 1, pre = "", post = "";
      if (last_tag_token.custom_beautifier_name === "javascript" && typeof this._js_beautify === "function") {
        _beautifier = this._js_beautify;
      } else if (last_tag_token.custom_beautifier_name === "css" && typeof this._css_beautify === "function") {
        _beautifier = this._css_beautify;
      } else if (last_tag_token.custom_beautifier_name === "html") {
        _beautifier = function(html_source, options) {
          var beautifier = new Beautifier(html_source, options, local._js_beautify, local._css_beautify);
          return beautifier.beautify();
        };
      }
      if (this._options.indent_scripts === "keep") {
        script_indent_level = 0;
      } else if (this._options.indent_scripts === "separate") {
        script_indent_level = -printer.indent_level;
      }
      var indentation = printer.get_full_indent(script_indent_level);
      text = text.replace(/\n[ \t]*$/, "");
      if (last_tag_token.custom_beautifier_name !== "html" && text[0] === "<" && text.match(/^(<!--|<!\[CDATA\[)/)) {
        var matched = /^(<!--[^\n]*|<!\[CDATA\[)(\n?)([ \t\n]*)([\s\S]*)(-->|]]>)$/.exec(text);
        if (!matched) {
          printer.add_raw_token(raw_token);
          return;
        }
        pre = indentation + matched[1] + `
`;
        text = matched[4];
        if (matched[5]) {
          post = indentation + matched[5];
        }
        text = text.replace(/\n[ \t]*$/, "");
        if (matched[2] || matched[3].indexOf(`
`) !== -1) {
          matched = matched[3].match(/[ \t]+$/);
          if (matched) {
            raw_token.whitespace_before = matched[0];
          }
        }
      }
      if (text) {
        if (_beautifier) {
          var Child_options = function() {
            this.eol = `
`;
          };
          Child_options.prototype = this._options.raw_options;
          var child_options = new Child_options;
          text = _beautifier(indentation + text, child_options);
        } else {
          var white = raw_token.whitespace_before;
          if (white) {
            text = text.replace(new RegExp(`
(` + white + ")?", "g"), `
`);
          }
          text = indentation + text.replace(/\n/g, `
` + indentation);
        }
      }
      if (pre) {
        if (!text) {
          text = pre + post;
        } else {
          text = pre + text + `
` + post;
        }
      }
      printer.print_newline(false);
      if (text) {
        raw_token.text = text;
        raw_token.whitespace_before = "";
        raw_token.newlines = 0;
        printer.add_raw_token(raw_token);
        printer.print_newline(true);
      }
    }
  };
  Beautifier.prototype._handle_tag_open = function(printer, raw_token, last_tag_token, last_token, tokens) {
    var parser_token = this._get_tag_open_token(raw_token);
    if ((last_tag_token.is_unformatted || last_tag_token.is_content_unformatted) && !last_tag_token.is_empty_element && raw_token.type === TOKEN.TAG_OPEN && !parser_token.is_start_tag) {
      printer.add_raw_token(raw_token);
      parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
    } else {
      printer.traverse_whitespace(raw_token);
      this._set_tag_position(printer, raw_token, parser_token, last_tag_token, last_token);
      if (!parser_token.is_inline_element) {
        printer.set_wrap_point();
      }
      printer.print_token(raw_token);
    }
    if (parser_token.is_start_tag && this._is_wrap_attributes_force) {
      var peek_index = 0;
      var peek_token;
      do {
        peek_token = tokens.peek(peek_index);
        if (peek_token.type === TOKEN.ATTRIBUTE) {
          parser_token.attr_count += 1;
        }
        peek_index += 1;
      } while (peek_token.type !== TOKEN.EOF && peek_token.type !== TOKEN.TAG_CLOSE);
    }
    if (this._is_wrap_attributes_force_aligned || this._is_wrap_attributes_aligned_multiple || this._is_wrap_attributes_preserve_aligned) {
      parser_token.alignment_size = raw_token.text.length + 1;
    }
    if (!parser_token.tag_complete && !parser_token.is_unformatted) {
      printer.alignment_size = parser_token.alignment_size;
    }
    return parser_token;
  };
  var TagOpenParserToken = function(options, parent, raw_token) {
    this.parent = parent || null;
    this.text = "";
    this.type = "TK_TAG_OPEN";
    this.tag_name = "";
    this.is_inline_element = false;
    this.is_unformatted = false;
    this.is_content_unformatted = false;
    this.is_empty_element = false;
    this.is_start_tag = false;
    this.is_end_tag = false;
    this.indent_content = false;
    this.multiline_content = false;
    this.custom_beautifier_name = null;
    this.start_tag_token = null;
    this.attr_count = 0;
    this.has_wrapped_attrs = false;
    this.alignment_size = 0;
    this.tag_complete = false;
    this.tag_start_char = "";
    this.tag_check = "";
    if (!raw_token) {
      this.tag_complete = true;
    } else {
      var tag_check_match;
      this.tag_start_char = raw_token.text[0];
      this.text = raw_token.text;
      if (this.tag_start_char === "<") {
        tag_check_match = raw_token.text.match(/^<([^\s>]*)/);
        this.tag_check = tag_check_match ? tag_check_match[1] : "";
      } else {
        tag_check_match = raw_token.text.match(/^{{~?(?:[\^]|#\*?)?([^\s}]+)/);
        this.tag_check = tag_check_match ? tag_check_match[1] : "";
        if ((raw_token.text.startsWith("{{#>") || raw_token.text.startsWith("{{~#>")) && this.tag_check[0] === ">") {
          if (this.tag_check === ">" && raw_token.next !== null) {
            this.tag_check = raw_token.next.text.split(" ")[0];
          } else {
            this.tag_check = raw_token.text.split(">")[1];
          }
        }
      }
      this.tag_check = this.tag_check.toLowerCase();
      if (raw_token.type === TOKEN.COMMENT) {
        this.tag_complete = true;
      }
      this.is_start_tag = this.tag_check.charAt(0) !== "/";
      this.tag_name = !this.is_start_tag ? this.tag_check.substr(1) : this.tag_check;
      this.is_end_tag = !this.is_start_tag || raw_token.closed && raw_token.closed.text === "/>";
      var handlebar_starts = 2;
      if (this.tag_start_char === "{" && this.text.length >= 3) {
        if (this.text.charAt(2) === "~") {
          handlebar_starts = 3;
        }
      }
      this.is_end_tag = this.is_end_tag || this.tag_start_char === "{" && (!options.indent_handlebars || this.text.length < 3 || /[^#\^]/.test(this.text.charAt(handlebar_starts)));
    }
  };
  Beautifier.prototype._get_tag_open_token = function(raw_token) {
    var parser_token = new TagOpenParserToken(this._options, this._tag_stack.get_parser_token(), raw_token);
    parser_token.alignment_size = this._options.wrap_attributes_indent_size;
    parser_token.is_end_tag = parser_token.is_end_tag || in_array(parser_token.tag_check, this._options.void_elements);
    parser_token.is_empty_element = parser_token.tag_complete || parser_token.is_start_tag && parser_token.is_end_tag;
    parser_token.is_unformatted = !parser_token.tag_complete && in_array(parser_token.tag_check, this._options.unformatted);
    parser_token.is_content_unformatted = !parser_token.is_empty_element && in_array(parser_token.tag_check, this._options.content_unformatted);
    parser_token.is_inline_element = in_array(parser_token.tag_name, this._options.inline) || this._options.inline_custom_elements && parser_token.tag_name.includes("-") || parser_token.tag_start_char === "{";
    return parser_token;
  };
  Beautifier.prototype._set_tag_position = function(printer, raw_token, parser_token, last_tag_token, last_token) {
    if (!parser_token.is_empty_element) {
      if (parser_token.is_end_tag) {
        parser_token.start_tag_token = this._tag_stack.try_pop(parser_token.tag_name);
      } else {
        if (this._do_optional_end_element(parser_token)) {
          if (!parser_token.is_inline_element) {
            printer.print_newline(false);
          }
        }
        this._tag_stack.record_tag(parser_token);
        if ((parser_token.tag_name === "script" || parser_token.tag_name === "style") && !(parser_token.is_unformatted || parser_token.is_content_unformatted)) {
          parser_token.custom_beautifier_name = get_custom_beautifier_name(parser_token.tag_check, raw_token);
        }
      }
    }
    if (in_array(parser_token.tag_check, this._options.extra_liners)) {
      printer.print_newline(false);
      if (!printer._output.just_added_blankline()) {
        printer.print_newline(true);
      }
    }
    if (parser_token.is_empty_element) {
      if (parser_token.tag_start_char === "{" && parser_token.tag_check === "else") {
        this._tag_stack.indent_to_tag(["if", "unless", "each"]);
        parser_token.indent_content = true;
        var foundIfOnCurrentLine = printer.current_line_has_match(/{{#if/);
        if (!foundIfOnCurrentLine) {
          printer.print_newline(false);
        }
      }
      if (parser_token.tag_name === "!--" && last_token.type === TOKEN.TAG_CLOSE && last_tag_token.is_end_tag && parser_token.text.indexOf(`
`) === -1) {} else {
        if (!(parser_token.is_inline_element || parser_token.is_unformatted)) {
          printer.print_newline(false);
        }
        this._calcluate_parent_multiline(printer, parser_token);
      }
    } else if (parser_token.is_end_tag) {
      var do_end_expand = false;
      do_end_expand = parser_token.start_tag_token && parser_token.start_tag_token.multiline_content;
      do_end_expand = do_end_expand || !parser_token.is_inline_element && !(last_tag_token.is_inline_element || last_tag_token.is_unformatted) && !(last_token.type === TOKEN.TAG_CLOSE && parser_token.start_tag_token === last_tag_token) && last_token.type !== "TK_CONTENT";
      if (parser_token.is_content_unformatted || parser_token.is_unformatted) {
        do_end_expand = false;
      }
      if (do_end_expand) {
        printer.print_newline(false);
      }
    } else {
      parser_token.indent_content = !parser_token.custom_beautifier_name;
      if (parser_token.tag_start_char === "<") {
        if (parser_token.tag_name === "html") {
          parser_token.indent_content = this._options.indent_inner_html;
        } else if (parser_token.tag_name === "head") {
          parser_token.indent_content = this._options.indent_head_inner_html;
        } else if (parser_token.tag_name === "body") {
          parser_token.indent_content = this._options.indent_body_inner_html;
        }
      }
      if (!(parser_token.is_inline_element || parser_token.is_unformatted) && (last_token.type !== "TK_CONTENT" || parser_token.is_content_unformatted)) {
        printer.print_newline(false);
      }
      this._calcluate_parent_multiline(printer, parser_token);
    }
  };
  Beautifier.prototype._calcluate_parent_multiline = function(printer, parser_token) {
    if (parser_token.parent && printer._output.just_added_newline() && !((parser_token.is_inline_element || parser_token.is_unformatted) && parser_token.parent.is_inline_element)) {
      parser_token.parent.multiline_content = true;
    }
  };
  var p_closers = ["address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "main", "menu", "nav", "ol", "p", "pre", "section", "table", "ul"];
  var p_parent_excludes = ["a", "audio", "del", "ins", "map", "noscript", "video"];
  Beautifier.prototype._do_optional_end_element = function(parser_token) {
    var result = null;
    if (parser_token.is_empty_element || !parser_token.is_start_tag || !parser_token.parent) {
      return;
    }
    if (parser_token.tag_name === "body") {
      result = result || this._tag_stack.try_pop("head");
    } else if (parser_token.tag_name === "li") {
      result = result || this._tag_stack.try_pop("li", ["ol", "ul", "menu"]);
    } else if (parser_token.tag_name === "dd" || parser_token.tag_name === "dt") {
      result = result || this._tag_stack.try_pop("dt", ["dl"]);
      result = result || this._tag_stack.try_pop("dd", ["dl"]);
    } else if (parser_token.parent.tag_name === "p" && p_closers.indexOf(parser_token.tag_name) !== -1) {
      var p_parent = parser_token.parent.parent;
      if (!p_parent || p_parent_excludes.indexOf(p_parent.tag_name) === -1) {
        result = result || this._tag_stack.try_pop("p");
      }
    } else if (parser_token.tag_name === "rp" || parser_token.tag_name === "rt") {
      result = result || this._tag_stack.try_pop("rt", ["ruby", "rtc"]);
      result = result || this._tag_stack.try_pop("rp", ["ruby", "rtc"]);
    } else if (parser_token.tag_name === "optgroup") {
      result = result || this._tag_stack.try_pop("optgroup", ["select"]);
    } else if (parser_token.tag_name === "option") {
      result = result || this._tag_stack.try_pop("option", ["select", "datalist", "optgroup"]);
    } else if (parser_token.tag_name === "colgroup") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
    } else if (parser_token.tag_name === "thead") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
      result = result || this._tag_stack.try_pop("colgroup", ["table"]);
    } else if (parser_token.tag_name === "tbody" || parser_token.tag_name === "tfoot") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
      result = result || this._tag_stack.try_pop("colgroup", ["table"]);
      result = result || this._tag_stack.try_pop("thead", ["table"]);
      result = result || this._tag_stack.try_pop("tbody", ["table"]);
    } else if (parser_token.tag_name === "tr") {
      result = result || this._tag_stack.try_pop("caption", ["table"]);
      result = result || this._tag_stack.try_pop("colgroup", ["table"]);
      result = result || this._tag_stack.try_pop("tr", ["table", "thead", "tbody", "tfoot"]);
    } else if (parser_token.tag_name === "th" || parser_token.tag_name === "td") {
      result = result || this._tag_stack.try_pop("td", ["table", "thead", "tbody", "tfoot", "tr"]);
      result = result || this._tag_stack.try_pop("th", ["table", "thead", "tbody", "tfoot", "tr"]);
    }
    parser_token.parent = this._tag_stack.get_parser_token();
    return result;
  };
  exports.Beautifier = Beautifier;
});

// node_modules/js-beautify/js/src/html/index.js
var require_html = __commonJS((exports, module) => {
  var Beautifier = require_beautifier3().Beautifier;
  var Options = require_options4().Options;
  function style_html(html_source, options, js_beautify, css_beautify) {
    var beautifier = new Beautifier(html_source, options, js_beautify, css_beautify);
    return beautifier.beautify();
  }
  module.exports = style_html;
  module.exports.defaultOptions = function() {
    return new Options;
  };
});

// node_modules/js-beautify/js/src/index.js
var require_src = __commonJS((exports, module) => {
  var js_beautify = require_javascript();
  var css_beautify = require_css();
  var html_beautify = require_html();
  function style_html(html_source, options, js, css) {
    js = js || js_beautify;
    css = css || css_beautify;
    return html_beautify(html_source, options, js, css);
  }
  style_html.defaultOptions = html_beautify.defaultOptions;
  exports.js = js_beautify;
  exports.css = css_beautify;
  exports.html = style_html;
});

// node_modules/js-beautify/js/index.js
var require_js = __commonJS((exports, module) => {
  function get_beautify(js_beautify, css_beautify, html_beautify) {
    var beautify = function(src, config) {
      return js_beautify.js_beautify(src, config);
    };
    beautify.js = js_beautify.js_beautify;
    beautify.css = css_beautify.css_beautify;
    beautify.html = html_beautify.html_beautify;
    beautify.js_beautify = js_beautify.js_beautify;
    beautify.css_beautify = css_beautify.css_beautify;
    beautify.html_beautify = html_beautify.html_beautify;
    return beautify;
  }
  if (typeof define === "function" && define.amd) {
    define([
      "./lib/beautify",
      "./lib/beautify-css",
      "./lib/beautify-html"
    ], function(js_beautify, css_beautify, html_beautify) {
      return get_beautify(js_beautify, css_beautify, html_beautify);
    });
  } else {
    (function(mod) {
      var beautifier = require_src();
      beautifier.js_beautify = beautifier.js;
      beautifier.css_beautify = beautifier.css;
      beautifier.html_beautify = beautifier.html;
      mod.exports = get_beautify(beautifier, beautifier, beautifier);
    })(module);
  }
});

// src/formatters.ts
var import_js_beautify = __toESM(require_js(), 1);
function compressHTML(html) {
  const parser = new DOMParser;
  const doc = parser.parseFromString(html, "text/html");
  const codeBlocks = [];
  const codeElements = doc.querySelectorAll("pre, code");
  let i = 0;
  for (const el of codeElements) {
    codeBlocks[i] = el.innerHTML;
    el.innerHTML = `__CODE_BLOCK_${i}__`;
    i++;
  }
  const regexRemoveLineBreaks = /\n/g;
  const regexCollapseSpaces = /\s{2,}/g;
  const regexRemoveSpacesBetweenTags = />\s+</g;
  let compressed = doc.body.innerHTML.replace(regexRemoveLineBreaks, "").replace(regexCollapseSpaces, " ").replace(regexRemoveSpacesBetweenTags, "><").trim();
  for (let j = 0;j < codeBlocks.length; j++) {
    compressed = compressed.replace(`__CODE_BLOCK_${j}__`, codeBlocks[j] ?? "");
  }
  return compressed;
}
function formatHTML(html) {
  return import_js_beautify.html(html, {
    indent_size: 2
  });
}

// src/cleaner.ts
function cleanHTML(html) {
  const parser = new DOMParser;
  const doc = parser.parseFromString(html, "text/html");
  removeAttributes(doc);
  removeUselessElements(doc);
  removeEmptyElements(doc);
  return formatHTML(compressHTML(doc.body.innerHTML));
}
function removeAttributes(doc) {
  const elements = doc.querySelectorAll("*");
  const protectedAttributes = new Set(["href", "src", "alt", "title"]);
  for (const element of elements) {
    for (const attribute of Array.from(element.attributes)) {
      if (protectedAttributes.has(attribute.name)) {
        continue;
      }
      element.removeAttribute(attribute.name);
    }
  }
}
function removeEmptyElements(doc) {
  const elements = Array.from(doc.querySelectorAll("*")).reverse();
  const voidTags = new Set(["IMG", "BR", "HR", "INPUT"]);
  for (const element of elements) {
    if (voidTags.has(element.tagName)) {
      continue;
    }
    if (element.textContent?.trim() === "" && element.children.length === 0) {
      element.remove();
    }
  }
}
function removeUselessElements(doc) {
  const uselessTags = [
    "script",
    "style",
    "nav",
    "meta",
    "link",
    "base",
    "title",
    "noscript",
    "template",
    "iframe",
    "object",
    "embed",
    "param",
    "track",
    "colgroup",
    "col",
    "datalist",
    "head"
  ];
  const elements = doc.querySelectorAll(uselessTags.join(","));
  for (const element of elements) {
    element.remove();
  }
}

// node_modules/turndown/lib/turndown.browser.es.js
function extend(destination) {
  for (var i = 1;i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (source.hasOwnProperty(key))
        destination[key] = source[key];
    }
  }
  return destination;
}
function repeat(character, count) {
  return Array(count + 1).join(character);
}
function trimLeadingNewlines(string) {
  return string.replace(/^\n*/, "");
}
function trimTrailingNewlines(string) {
  var indexEnd = string.length;
  while (indexEnd > 0 && string[indexEnd - 1] === `
`)
    indexEnd--;
  return string.substring(0, indexEnd);
}
function trimNewlines(string) {
  return trimTrailingNewlines(trimLeadingNewlines(string));
}
var blockElements = [
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "AUDIO",
  "BLOCKQUOTE",
  "BODY",
  "CANVAS",
  "CENTER",
  "DD",
  "DIR",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "FRAMESET",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HGROUP",
  "HR",
  "HTML",
  "ISINDEX",
  "LI",
  "MAIN",
  "MENU",
  "NAV",
  "NOFRAMES",
  "NOSCRIPT",
  "OL",
  "OUTPUT",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL"
];
function isBlock(node) {
  return is(node, blockElements);
}
var voidElements = [
  "AREA",
  "BASE",
  "BR",
  "COL",
  "COMMAND",
  "EMBED",
  "HR",
  "IMG",
  "INPUT",
  "KEYGEN",
  "LINK",
  "META",
  "PARAM",
  "SOURCE",
  "TRACK",
  "WBR"
];
function isVoid(node) {
  return is(node, voidElements);
}
function hasVoid(node) {
  return has(node, voidElements);
}
var meaningfulWhenBlankElements = [
  "A",
  "TABLE",
  "THEAD",
  "TBODY",
  "TFOOT",
  "TH",
  "TD",
  "IFRAME",
  "SCRIPT",
  "AUDIO",
  "VIDEO"
];
function isMeaningfulWhenBlank(node) {
  return is(node, meaningfulWhenBlankElements);
}
function hasMeaningfulWhenBlank(node) {
  return has(node, meaningfulWhenBlankElements);
}
function is(node, tagNames) {
  return tagNames.indexOf(node.nodeName) >= 0;
}
function has(node, tagNames) {
  return node.getElementsByTagName && tagNames.some(function(tagName) {
    return node.getElementsByTagName(tagName).length;
  });
}
var rules = {};
rules.paragraph = {
  filter: "p",
  replacement: function(content) {
    return `

` + content + `

`;
  }
};
rules.lineBreak = {
  filter: "br",
  replacement: function(content, node, options) {
    return options.br + `
`;
  }
};
rules.heading = {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function(content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));
    if (options.headingStyle === "setext" && hLevel < 3) {
      var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
      return `

` + content + `
` + underline + `

`;
    } else {
      return `

` + repeat("#", hLevel) + " " + content + `

`;
    }
  }
};
rules.blockquote = {
  filter: "blockquote",
  replacement: function(content) {
    content = trimNewlines(content).replace(/^/gm, "> ");
    return `

` + content + `

`;
  }
};
rules.list = {
  filter: ["ul", "ol"],
  replacement: function(content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === "LI" && parent.lastElementChild === node) {
      return `
` + content;
    } else {
      return `

` + content + `

`;
    }
  }
};
rules.listItem = {
  filter: "li",
  replacement: function(content, node, options) {
    var prefix = options.bulletListMarker + "   ";
    var parent = node.parentNode;
    if (parent.nodeName === "OL") {
      var start = parent.getAttribute("start");
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + ".  ";
    }
    var isParagraph = /\n$/.test(content);
    content = trimNewlines(content) + (isParagraph ? `
` : "");
    content = content.replace(/\n/gm, `
` + " ".repeat(prefix.length));
    return prefix + content + (node.nextSibling ? `
` : "");
  }
};
rules.indentedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "indented" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    return `

    ` + node.firstChild.textContent.replace(/\n/g, `
    `) + `

`;
  }
};
rules.fencedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "fenced" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    var className = node.firstChild.getAttribute("class") || "";
    var language = (className.match(/language-(\S+)/) || [null, ""])[1];
    var code = node.firstChild.textContent;
    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
    var match;
    while (match = fenceInCodeRegex.exec(code)) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }
    var fence = repeat(fenceChar, fenceSize);
    return `

` + fence + language + `
` + code.replace(/\n$/, "") + `
` + fence + `

`;
  }
};
rules.horizontalRule = {
  filter: "hr",
  replacement: function(content, node, options) {
    return `

` + options.hr + `

`;
  }
};
rules.inlineLink = {
  filter: function(node, options) {
    return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node) {
    var href = node.getAttribute("href");
    if (href)
      href = href.replace(/([()])/g, "\\$1");
    var title = cleanAttribute(node.getAttribute("title"));
    if (title)
      title = ' "' + title.replace(/"/g, "\\\"") + '"';
    return "[" + content + "](" + href + title + ")";
  }
};
rules.referenceLink = {
  filter: function(node, options) {
    return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node, options) {
    var href = node.getAttribute("href");
    var title = cleanAttribute(node.getAttribute("title"));
    if (title)
      title = ' "' + title + '"';
    var replacement;
    var reference;
    switch (options.linkReferenceStyle) {
      case "collapsed":
        replacement = "[" + content + "][]";
        reference = "[" + content + "]: " + href + title;
        break;
      case "shortcut":
        replacement = "[" + content + "]";
        reference = "[" + content + "]: " + href + title;
        break;
      default:
        var id = this.references.length + 1;
        replacement = "[" + content + "][" + id + "]";
        reference = "[" + id + "]: " + href + title;
    }
    this.references.push(reference);
    return replacement;
  },
  references: [],
  append: function(options) {
    var references = "";
    if (this.references.length) {
      references = `

` + this.references.join(`
`) + `

`;
      this.references = [];
    }
    return references;
  }
};
rules.emphasis = {
  filter: ["em", "i"],
  replacement: function(content, node, options) {
    if (!content.trim())
      return "";
    return options.emDelimiter + content + options.emDelimiter;
  }
};
rules.strong = {
  filter: ["strong", "b"],
  replacement: function(content, node, options) {
    if (!content.trim())
      return "";
    return options.strongDelimiter + content + options.strongDelimiter;
  }
};
rules.code = {
  filter: function(node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
    return node.nodeName === "CODE" && !isCodeBlock;
  },
  replacement: function(content) {
    if (!content)
      return "";
    content = content.replace(/\r?\n|\r/g, " ");
    var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
    var delimiter = "`";
    var matches = content.match(/`+/gm) || [];
    while (matches.indexOf(delimiter) !== -1)
      delimiter = delimiter + "`";
    return delimiter + extraSpace + content + extraSpace + delimiter;
  }
};
rules.image = {
  filter: "img",
  replacement: function(content, node) {
    var alt = cleanAttribute(node.getAttribute("alt"));
    var src = node.getAttribute("src") || "";
    var title = cleanAttribute(node.getAttribute("title"));
    var titlePart = title ? ' "' + title + '"' : "";
    return src ? "![" + alt + "]" + "(" + src + titlePart + ")" : "";
  }
};
function cleanAttribute(attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, `
`) : "";
}
function Rules(options) {
  this.options = options;
  this._keep = [];
  this._remove = [];
  this.blankRule = {
    replacement: options.blankReplacement
  };
  this.keepReplacement = options.keepReplacement;
  this.defaultRule = {
    replacement: options.defaultReplacement
  };
  this.array = [];
  for (var key in options.rules)
    this.array.push(options.rules[key]);
}
Rules.prototype = {
  add: function(key, rule) {
    this.array.unshift(rule);
  },
  keep: function(filter) {
    this._keep.unshift({
      filter,
      replacement: this.keepReplacement
    });
  },
  remove: function(filter) {
    this._remove.unshift({
      filter,
      replacement: function() {
        return "";
      }
    });
  },
  forNode: function(node) {
    if (node.isBlank)
      return this.blankRule;
    var rule;
    if (rule = findRule(this.array, node, this.options))
      return rule;
    if (rule = findRule(this._keep, node, this.options))
      return rule;
    if (rule = findRule(this._remove, node, this.options))
      return rule;
    return this.defaultRule;
  },
  forEach: function(fn) {
    for (var i = 0;i < this.array.length; i++)
      fn(this.array[i], i);
  }
};
function findRule(rules2, node, options) {
  for (var i = 0;i < rules2.length; i++) {
    var rule = rules2[i];
    if (filterValue(rule, node, options))
      return rule;
  }
  return;
}
function filterValue(rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === "string") {
    if (filter === node.nodeName.toLowerCase())
      return true;
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1)
      return true;
  } else if (typeof filter === "function") {
    if (filter.call(rule, node, options))
      return true;
  } else {
    throw new TypeError("`filter` needs to be a string, array, or function");
  }
}
function collapseWhitespace(options) {
  var element = options.element;
  var isBlock2 = options.isBlock;
  var isVoid2 = options.isVoid;
  var isPre = options.isPre || function(node2) {
    return node2.nodeName === "PRE";
  };
  if (!element.firstChild || isPre(element))
    return;
  var prevText = null;
  var keepLeadingWs = false;
  var prev = null;
  var node = next(prev, element, isPre);
  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) {
      var text = node.data.replace(/[ \r\n\t]+/g, " ");
      if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === " ") {
        text = text.substr(1);
      }
      if (!text) {
        node = remove(node);
        continue;
      }
      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      if (isBlock2(node) || node.nodeName === "BR") {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, "");
        }
        prevText = null;
        keepLeadingWs = false;
      } else if (isVoid2(node) || isPre(node)) {
        prevText = null;
        keepLeadingWs = true;
      } else if (prevText) {
        keepLeadingWs = false;
      }
    } else {
      node = remove(node);
      continue;
    }
    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }
  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, "");
    if (!prevText.data) {
      remove(prevText);
    }
  }
}
function remove(node) {
  var next = node.nextSibling || node.parentNode;
  node.parentNode.removeChild(node);
  return next;
}
function next(prev, current, isPre) {
  if (prev && prev.parentNode === current || isPre(current)) {
    return current.nextSibling || current.parentNode;
  }
  return current.firstChild || current.nextSibling || current.parentNode;
}
var root = typeof window !== "undefined" ? window : {};
function canParseHTMLNatively() {
  var Parser = root.DOMParser;
  var canParse = false;
  try {
    if (new Parser().parseFromString("", "text/html")) {
      canParse = true;
    }
  } catch (e) {}
  return canParse;
}
function createHTMLParser() {
  var Parser = function() {};
  {
    if (shouldUseActiveX()) {
      Parser.prototype.parseFromString = function(string) {
        var doc = new window.ActiveXObject("htmlfile");
        doc.designMode = "on";
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    } else {
      Parser.prototype.parseFromString = function(string) {
        var doc = document.implementation.createHTMLDocument("");
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    }
  }
  return Parser;
}
function shouldUseActiveX() {
  var useActiveX = false;
  try {
    document.implementation.createHTMLDocument("").open();
  } catch (e) {
    if (root.ActiveXObject)
      useActiveX = true;
  }
  return useActiveX;
}
var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
function RootNode(input, options) {
  var root2;
  if (typeof input === "string") {
    var doc = htmlParser().parseFromString('<x-turndown id="turndown-root">' + input + "</x-turndown>", "text/html");
    root2 = doc.getElementById("turndown-root");
  } else {
    root2 = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root2,
    isBlock,
    isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  });
  return root2;
}
var _htmlParser;
function htmlParser() {
  _htmlParser = _htmlParser || new HTMLParser;
  return _htmlParser;
}
function isPreOrCode(node) {
  return node.nodeName === "PRE" || node.nodeName === "CODE";
}
function Node(node, options) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node, options);
  return node;
}
function isBlank(node) {
  return !isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node);
}
function flankingWhitespace(node, options) {
  if (node.isBlock || options.preformattedCode && node.isCode) {
    return { leading: "", trailing: "" };
  }
  var edges = edgeWhitespace(node.textContent);
  if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) {
    edges.leading = edges.leadingNonAscii;
  }
  if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) {
    edges.trailing = edges.trailingNonAscii;
  }
  return { leading: edges.leading, trailing: edges.trailing };
}
function edgeWhitespace(string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: m[1],
    leadingAscii: m[2],
    leadingNonAscii: m[3],
    trailing: m[4],
    trailingNonAscii: m[5],
    trailingAscii: m[6]
  };
}
function isFlankedByWhitespace(side, node, options) {
  var sibling;
  var regExp;
  var isFlanked;
  if (side === "left") {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }
  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (options.preformattedCode && sibling.nodeName === "CODE") {
      isFlanked = false;
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked;
}
var reduce = Array.prototype.reduce;
var escapes = [
  [/\\/g, "\\\\"],
  [/\*/g, "\\*"],
  [/^-/g, "\\-"],
  [/^\+ /g, "\\+ "],
  [/^(=+)/g, "\\$1"],
  [/^(#{1,6}) /g, "\\$1 "],
  [/`/g, "\\`"],
  [/^~~~/g, "\\~~~"],
  [/\[/g, "\\["],
  [/\]/g, "\\]"],
  [/^>/g, "\\>"],
  [/_/g, "\\_"],
  [/^(\d+)\. /g, "$1\\. "]
];
function TurndownService(options) {
  if (!(this instanceof TurndownService))
    return new TurndownService(options);
  var defaults = {
    rules,
    headingStyle: "setext",
    hr: "* * *",
    bulletListMarker: "*",
    codeBlockStyle: "indented",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    br: "  ",
    preformattedCode: false,
    blankReplacement: function(content, node) {
      return node.isBlock ? `

` : "";
    },
    keepReplacement: function(content, node) {
      return node.isBlock ? `

` + node.outerHTML + `

` : node.outerHTML;
    },
    defaultReplacement: function(content, node) {
      return node.isBlock ? `

` + content + `

` : content;
    }
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}
TurndownService.prototype = {
  turndown: function(input) {
    if (!canConvert(input)) {
      throw new TypeError(input + " is not a string, or an element/document/fragment node.");
    }
    if (input === "")
      return "";
    var output = process.call(this, new RootNode(input, this.options));
    return postProcess.call(this, output);
  },
  use: function(plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0;i < plugin.length; i++)
        this.use(plugin[i]);
    } else if (typeof plugin === "function") {
      plugin(this);
    } else {
      throw new TypeError("plugin must be a Function or an Array of Functions");
    }
    return this;
  },
  addRule: function(key, rule) {
    this.rules.add(key, rule);
    return this;
  },
  keep: function(filter) {
    this.rules.keep(filter);
    return this;
  },
  remove: function(filter) {
    this.rules.remove(filter);
    return this;
  },
  escape: function(string) {
    return escapes.reduce(function(accumulator, escape) {
      return accumulator.replace(escape[0], escape[1]);
    }, string);
  }
};
function process(parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function(output, node) {
    node = new Node(node, self.options);
    var replacement = "";
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node);
    }
    return join(output, replacement);
  }, "");
}
function postProcess(output) {
  var self = this;
  this.rules.forEach(function(rule) {
    if (typeof rule.append === "function") {
      output = join(output, rule.append(self.options));
    }
  });
  return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
}
function replacementForNode(node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing)
    content = content.trim();
  return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
}
function join(output, replacement) {
  var s1 = trimTrailingNewlines(output);
  var s2 = trimLeadingNewlines(replacement);
  var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
  var separator = `

`.substring(0, nls);
  return s1 + separator + s2;
}
function canConvert(input) {
  return input != null && (typeof input === "string" || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
}
var turndown_browser_es_default = TurndownService;

// node_modules/marked/lib/marked.esm.js
function M() {
  return { async: false, breaks: false, extensions: null, gfm: true, hooks: null, pedantic: false, renderer: null, silent: false, tokenizer: null, walkTokens: null };
}
var T = M();
function H(u) {
  T = u;
}
var _ = { exec: () => null };
function k(u, e = "") {
  let t = typeof u == "string" ? u : u.source, n = { replace: (r, i) => {
    let s = typeof i == "string" ? i : i.source;
    return s = s.replace(m.caret, "$1"), t = t.replace(r, s), n;
  }, getRegex: () => new RegExp(t, e) };
  return n;
}
var Re = (() => {
  try {
    return !!new RegExp("(?<=1)(?<!1)");
  } catch {
    return false;
  }
})();
var m = { codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm, outputLinkReplace: /\\([\[\]])/g, indentCodeCompensation: /^(\s+)(?:```)/, beginningSpace: /^\s+/, endingHash: /#$/, startingSpaceChar: /^ /, endingSpaceChar: / $/, nonSpaceChar: /[^ ]/, newLineCharGlobal: /\n/g, tabCharGlobal: /\t/g, multipleSpaceGlobal: /\s+/g, blankLine: /^[ \t]*$/, doubleBlankLine: /\n[ \t]*\n[ \t]*$/, blockquoteStart: /^ {0,3}>/, blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g, blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm, listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g, listIsTask: /^\[[ xX]\] +\S/, listReplaceTask: /^\[[ xX]\] +/, listTaskCheckbox: /\[[ xX]\]/, anyLine: /\n.*\n/, hrefBrackets: /^<(.*)>$/, tableDelimiter: /[:|]/, tableAlignChars: /^\||\| *$/g, tableRowBlankLine: /\n[ \t]*$/, tableAlignRight: /^ *-+: *$/, tableAlignCenter: /^ *:-+: *$/, tableAlignLeft: /^ *:-+ *$/, startATag: /^<a /i, endATag: /^<\/a>/i, startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i, endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i, startAngleBracket: /^</, endAngleBracket: />$/, pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/, unicodeAlphaNumeric: /[\p{L}\p{N}]/u, escapeTest: /[&<>"']/, escapeReplace: /[&<>"']/g, escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/, escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, unescapeTest: /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, caret: /(^|[^\[])\^/g, percentDecode: /%25/g, findPipe: /\|/g, splitPipe: / \|/, slashPipe: /\\\|/g, carriageReturn: /\r\n|\r/g, spaceLine: /^ +$/gm, notSpaceStart: /^\S*/, endingNewline: /\n$/, listItemRegex: (u) => new RegExp(`^( {0,3}${u})((?:[	 ][^\\n]*)?(?:\\n|$))`), nextBulletRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`), hrRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`), fencesBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}(?:\`\`\`|~~~)`), headingBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}#`), htmlBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}<(?:[a-z].*>|!--)`, "i"), blockquoteBeginRegex: (u) => new RegExp(`^ {0,${Math.min(3, u - 1)}}>`) };
var Te = /^(?:[ \t]*(?:\n|$))+/;
var Oe = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
var we = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
var I = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
var ye = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
var N = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
var re = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
var se = k(re).replace(/bull/g, N).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
var Pe = k(re).replace(/bull/g, N).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
var Q = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/;
var Se = /^[^\n]+/;
var F = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
var $e = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", F).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
var _e = k(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g, N).getRegex();
var q = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
var j = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
var Le = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))", "i").replace("comment", j).replace("tag", q).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
var ie = k(Q).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", q).getRegex();
var Me = k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", ie).getRegex();
var U = { blockquote: Me, code: Oe, def: $e, fences: we, heading: ye, hr: I, html: Le, lheading: se, list: _e, newline: Te, paragraph: ie, table: _, text: Se };
var te = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}\t)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", q).getRegex();
var ze = { ...U, lheading: Pe, table: te, paragraph: k(Q).replace("hr", I).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", te).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", q).getRegex() };
var Ce = { ...U, html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", j).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(), def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/, heading: /^(#{1,6})(.*)(?:\n+|$)/, fences: _, lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/, paragraph: k(Q).replace("hr", I).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", se).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex() };
var Ae = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
var Ie = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
var oe = /^( {2,}|\\)\n(?!\s*$)/;
var Ee = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
var v = /[\p{P}\p{S}]/u;
var K = /[\s\p{P}\p{S}]/u;
var ae = /[^\s\p{P}\p{S}]/u;
var Be = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, K).getRegex();
var le = /(?!~)[\p{P}\p{S}]/u;
var De = /(?!~)[\s\p{P}\p{S}]/u;
var qe = /(?:[^\s\p{P}\p{S}]|~)/u;
var ue = /(?![*_])[\p{P}\p{S}]/u;
var ve = /(?![*_])[\s\p{P}\p{S}]/u;
var Ge = /(?:[^\s\p{P}\p{S}]|[*_])/u;
var He = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Re ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
var pe = /^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/;
var Ze = k(pe, "u").replace(/punct/g, v).getRegex();
var Ne = k(pe, "u").replace(/punct/g, le).getRegex();
var ce = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
var Qe = k(ce, "gu").replace(/notPunctSpace/g, ae).replace(/punctSpace/g, K).replace(/punct/g, v).getRegex();
var Fe = k(ce, "gu").replace(/notPunctSpace/g, qe).replace(/punctSpace/g, De).replace(/punct/g, le).getRegex();
var je = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, ae).replace(/punctSpace/g, K).replace(/punct/g, v).getRegex();
var Ue = k(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, ue).getRegex();
var Ke = "^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)";
var We = k(Ke, "gu").replace(/notPunctSpace/g, Ge).replace(/punctSpace/g, ve).replace(/punct/g, ue).getRegex();
var Xe = k(/\\(punct)/, "gu").replace(/punct/g, v).getRegex();
var Je = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
var Ve = k(j).replace("(?:-->|$)", "-->").getRegex();
var Ye = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", Ve).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
var D = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/;
var et = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label", D).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
var he = k(/^!?\[(label)\]\[(ref)\]/).replace("label", D).replace("ref", F).getRegex();
var ke = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", F).getRegex();
var tt = k("reflink|nolink(?!\\()", "g").replace("reflink", he).replace("nolink", ke).getRegex();
var ne = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
var W = { _backpedal: _, anyPunctuation: Xe, autolink: Je, blockSkip: He, br: oe, code: Ie, del: _, delLDelim: _, delRDelim: _, emStrongLDelim: Ze, emStrongRDelimAst: Qe, emStrongRDelimUnd: je, escape: Ae, link: et, nolink: ke, punctuation: Be, reflink: he, reflinkSearch: tt, tag: Ye, text: Ee, url: _ };
var nt = { ...W, link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", D).getRegex(), reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", D).getRegex() };
var Z = { ...W, emStrongRDelimAst: Fe, emStrongLDelim: Ne, delLDelim: Ue, delRDelim: We, url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ne).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(), _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/, del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/, text: k(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ne).getRegex() };
var rt = { ...Z, br: k(oe).replace("{2,}", "*").getRegex(), text: k(Z.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex() };
var E = { normal: U, gfm: ze, pedantic: Ce };
var z = { normal: W, gfm: Z, breaks: rt, pedantic: nt };
var st = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var de = (u) => st[u];
function O(u, e) {
  if (e) {
    if (m.escapeTest.test(u))
      return u.replace(m.escapeReplace, de);
  } else if (m.escapeTestNoEncode.test(u))
    return u.replace(m.escapeReplaceNoEncode, de);
  return u;
}
function X(u) {
  try {
    u = encodeURI(u).replace(m.percentDecode, "%");
  } catch {
    return null;
  }
  return u;
}
function J(u, e) {
  let t = u.replace(m.findPipe, (i, s, a) => {
    let o = false, l = s;
    for (;--l >= 0 && a[l] === "\\"; )
      o = !o;
    return o ? "|" : " |";
  }), n = t.split(m.splitPipe), r = 0;
  if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e)
    if (n.length > e)
      n.splice(e);
    else
      for (;n.length < e; )
        n.push("");
  for (;r < n.length; r++)
    n[r] = n[r].trim().replace(m.slashPipe, "|");
  return n;
}
function C(u, e, t) {
  let n = u.length;
  if (n === 0)
    return "";
  let r = 0;
  for (;r < n; ) {
    let i = u.charAt(n - r - 1);
    if (i === e && !t)
      r++;
    else if (i !== e && t)
      r++;
    else
      break;
  }
  return u.slice(0, n - r);
}
function ge(u, e) {
  if (u.indexOf(e[1]) === -1)
    return -1;
  let t = 0;
  for (let n = 0;n < u.length; n++)
    if (u[n] === "\\")
      n++;
    else if (u[n] === e[0])
      t++;
    else if (u[n] === e[1] && (t--, t < 0))
      return n;
  return t > 0 ? -2 : -1;
}
function fe(u, e = 0) {
  let t = e, n = "";
  for (let r of u)
    if (r === "\t") {
      let i = 4 - t % 4;
      n += " ".repeat(i), t += i;
    } else
      n += r, t++;
  return n;
}
function me(u, e, t, n, r) {
  let i = e.href, s = e.title || null, a = u[1].replace(r.other.outputLinkReplace, "$1");
  n.state.inLink = true;
  let o = { type: u[0].charAt(0) === "!" ? "image" : "link", raw: t, href: i, title: s, text: a, tokens: n.inlineTokens(a) };
  return n.state.inLink = false, o;
}
function it(u, e, t) {
  let n = u.match(t.other.indentCodeCompensation);
  if (n === null)
    return e;
  let r = n[1];
  return e.split(`
`).map((i) => {
    let s = i.match(t.other.beginningSpace);
    if (s === null)
      return i;
    let [a] = s;
    return a.length >= r.length ? i.slice(r.length) : i;
  }).join(`
`);
}
var w = class {
  options;
  rules;
  lexer;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    let t = this.rules.block.newline.exec(e);
    if (t && t[0].length > 0)
      return { type: "space", raw: t[0] };
  }
  code(e) {
    let t = this.rules.block.code.exec(e);
    if (t) {
      let n = t[0].replace(this.rules.other.codeRemoveIndent, "");
      return { type: "code", raw: t[0], codeBlockStyle: "indented", text: this.options.pedantic ? n : C(n, `
`) };
    }
  }
  fences(e) {
    let t = this.rules.block.fences.exec(e);
    if (t) {
      let n = t[0], r = it(n, t[3] || "", this.rules);
      return { type: "code", raw: n, lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2], text: r };
    }
  }
  heading(e) {
    let t = this.rules.block.heading.exec(e);
    if (t) {
      let n = t[2].trim();
      if (this.rules.other.endingHash.test(n)) {
        let r = C(n, "#");
        (this.options.pedantic || !r || this.rules.other.endingSpaceChar.test(r)) && (n = r.trim());
      }
      return { type: "heading", raw: t[0], depth: t[1].length, text: n, tokens: this.lexer.inline(n) };
    }
  }
  hr(e) {
    let t = this.rules.block.hr.exec(e);
    if (t)
      return { type: "hr", raw: C(t[0], `
`) };
  }
  blockquote(e) {
    let t = this.rules.block.blockquote.exec(e);
    if (t) {
      let n = C(t[0], `
`).split(`
`), r = "", i = "", s = [];
      for (;n.length > 0; ) {
        let a = false, o = [], l;
        for (l = 0;l < n.length; l++)
          if (this.rules.other.blockquoteStart.test(n[l]))
            o.push(n[l]), a = true;
          else if (!a)
            o.push(n[l]);
          else
            break;
        n = n.slice(l);
        let p = o.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
        r = r ? `${r}
${p}` : p, i = i ? `${i}
${c}` : c;
        let d = this.lexer.state.top;
        if (this.lexer.state.top = true, this.lexer.blockTokens(c, s, true), this.lexer.state.top = d, n.length === 0)
          break;
        let h = s.at(-1);
        if (h?.type === "code")
          break;
        if (h?.type === "blockquote") {
          let R = h, f = R.raw + `
` + n.join(`
`), S = this.blockquote(f);
          s[s.length - 1] = S, r = r.substring(0, r.length - R.raw.length) + S.raw, i = i.substring(0, i.length - R.text.length) + S.text;
          break;
        } else if (h?.type === "list") {
          let R = h, f = R.raw + `
` + n.join(`
`), S = this.list(f);
          s[s.length - 1] = S, r = r.substring(0, r.length - h.raw.length) + S.raw, i = i.substring(0, i.length - R.raw.length) + S.raw, n = f.substring(s.at(-1).raw.length).split(`
`);
          continue;
        }
      }
      return { type: "blockquote", raw: r, tokens: s, text: i };
    }
  }
  list(e) {
    let t = this.rules.block.list.exec(e);
    if (t) {
      let n = t[1].trim(), r = n.length > 1, i = { type: "list", raw: "", ordered: r, start: r ? +n.slice(0, -1) : "", loose: false, items: [] };
      n = r ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = r ? n : "[*+-]");
      let s = this.rules.other.listItemRegex(n), a = false;
      for (;e; ) {
        let l = false, p = "", c = "";
        if (!(t = s.exec(e)) || this.rules.block.hr.test(e))
          break;
        p = t[0], e = e.substring(p.length);
        let d = fe(t[2].split(`
`, 1)[0], t[1].length), h = e.split(`
`, 1)[0], R = !d.trim(), f = 0;
        if (this.options.pedantic ? (f = 2, c = d.trimStart()) : R ? f = t[1].length + 1 : (f = d.search(this.rules.other.nonSpaceChar), f = f > 4 ? 1 : f, c = d.slice(f), f += t[1].length), R && this.rules.other.blankLine.test(h) && (p += h + `
`, e = e.substring(h.length + 1), l = true), !l) {
          let S = this.rules.other.nextBulletRegex(f), V = this.rules.other.hrRegex(f), Y = this.rules.other.fencesBeginRegex(f), ee = this.rules.other.headingBeginRegex(f), xe = this.rules.other.htmlBeginRegex(f), be = this.rules.other.blockquoteBeginRegex(f);
          for (;e; ) {
            let G = e.split(`
`, 1)[0], A;
            if (h = G, this.options.pedantic ? (h = h.replace(this.rules.other.listReplaceNesting, "  "), A = h) : A = h.replace(this.rules.other.tabCharGlobal, "    "), Y.test(h) || ee.test(h) || xe.test(h) || be.test(h) || S.test(h) || V.test(h))
              break;
            if (A.search(this.rules.other.nonSpaceChar) >= f || !h.trim())
              c += `
` + A.slice(f);
            else {
              if (R || d.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || Y.test(d) || ee.test(d) || V.test(d))
                break;
              c += `
` + h;
            }
            R = !h.trim(), p += G + `
`, e = e.substring(G.length + 1), d = A.slice(f);
          }
        }
        i.loose || (a ? i.loose = true : this.rules.other.doubleBlankLine.test(p) && (a = true)), i.items.push({ type: "list_item", raw: p, task: !!this.options.gfm && this.rules.other.listIsTask.test(c), loose: false, text: c, tokens: [] }), i.raw += p;
      }
      let o = i.items.at(-1);
      if (o)
        o.raw = o.raw.trimEnd(), o.text = o.text.trimEnd();
      else
        return;
      i.raw = i.raw.trimEnd();
      for (let l of i.items) {
        if (this.lexer.state.top = false, l.tokens = this.lexer.blockTokens(l.text, []), l.task) {
          if (l.text = l.text.replace(this.rules.other.listReplaceTask, ""), l.tokens[0]?.type === "text" || l.tokens[0]?.type === "paragraph") {
            l.tokens[0].raw = l.tokens[0].raw.replace(this.rules.other.listReplaceTask, ""), l.tokens[0].text = l.tokens[0].text.replace(this.rules.other.listReplaceTask, "");
            for (let c = this.lexer.inlineQueue.length - 1;c >= 0; c--)
              if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[c].src)) {
                this.lexer.inlineQueue[c].src = this.lexer.inlineQueue[c].src.replace(this.rules.other.listReplaceTask, "");
                break;
              }
          }
          let p = this.rules.other.listTaskCheckbox.exec(l.raw);
          if (p) {
            let c = { type: "checkbox", raw: p[0] + " ", checked: p[0] !== "[ ]" };
            l.checked = c.checked, i.loose ? l.tokens[0] && ["paragraph", "text"].includes(l.tokens[0].type) && "tokens" in l.tokens[0] && l.tokens[0].tokens ? (l.tokens[0].raw = c.raw + l.tokens[0].raw, l.tokens[0].text = c.raw + l.tokens[0].text, l.tokens[0].tokens.unshift(c)) : l.tokens.unshift({ type: "paragraph", raw: c.raw, text: c.raw, tokens: [c] }) : l.tokens.unshift(c);
          }
        }
        if (!i.loose) {
          let p = l.tokens.filter((d) => d.type === "space"), c = p.length > 0 && p.some((d) => this.rules.other.anyLine.test(d.raw));
          i.loose = c;
        }
      }
      if (i.loose)
        for (let l of i.items) {
          l.loose = true;
          for (let p of l.tokens)
            p.type === "text" && (p.type = "paragraph");
        }
      return i;
    }
  }
  html(e) {
    let t = this.rules.block.html.exec(e);
    if (t)
      return { type: "html", block: true, raw: t[0], pre: t[1] === "pre" || t[1] === "script" || t[1] === "style", text: t[0] };
  }
  def(e) {
    let t = this.rules.block.def.exec(e);
    if (t) {
      let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), r = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", i = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
      return { type: "def", tag: n, raw: t[0], href: r, title: i };
    }
  }
  table(e) {
    let t = this.rules.block.table.exec(e);
    if (!t || !this.rules.other.tableDelimiter.test(t[2]))
      return;
    let n = J(t[1]), r = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), i = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], s = { type: "table", raw: t[0], header: [], align: [], rows: [] };
    if (n.length === r.length) {
      for (let a of r)
        this.rules.other.tableAlignRight.test(a) ? s.align.push("right") : this.rules.other.tableAlignCenter.test(a) ? s.align.push("center") : this.rules.other.tableAlignLeft.test(a) ? s.align.push("left") : s.align.push(null);
      for (let a = 0;a < n.length; a++)
        s.header.push({ text: n[a], tokens: this.lexer.inline(n[a]), header: true, align: s.align[a] });
      for (let a of i)
        s.rows.push(J(a, s.header.length).map((o, l) => ({ text: o, tokens: this.lexer.inline(o), header: false, align: s.align[l] })));
      return s;
    }
  }
  lheading(e) {
    let t = this.rules.block.lheading.exec(e);
    if (t)
      return { type: "heading", raw: t[0], depth: t[2].charAt(0) === "=" ? 1 : 2, text: t[1], tokens: this.lexer.inline(t[1]) };
  }
  paragraph(e) {
    let t = this.rules.block.paragraph.exec(e);
    if (t) {
      let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
      return { type: "paragraph", raw: t[0], text: n, tokens: this.lexer.inline(n) };
    }
  }
  text(e) {
    let t = this.rules.block.text.exec(e);
    if (t)
      return { type: "text", raw: t[0], text: t[0], tokens: this.lexer.inline(t[0]) };
  }
  escape(e) {
    let t = this.rules.inline.escape.exec(e);
    if (t)
      return { type: "escape", raw: t[0], text: t[1] };
  }
  tag(e) {
    let t = this.rules.inline.tag.exec(e);
    if (t)
      return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = true : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = false), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = true : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = false), { type: "html", raw: t[0], inLink: this.lexer.state.inLink, inRawBlock: this.lexer.state.inRawBlock, block: false, text: t[0] };
  }
  link(e) {
    let t = this.rules.inline.link.exec(e);
    if (t) {
      let n = t[2].trim();
      if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
        if (!this.rules.other.endAngleBracket.test(n))
          return;
        let s = C(n.slice(0, -1), "\\");
        if ((n.length - s.length) % 2 === 0)
          return;
      } else {
        let s = ge(t[2], "()");
        if (s === -2)
          return;
        if (s > -1) {
          let o = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + s;
          t[2] = t[2].substring(0, s), t[0] = t[0].substring(0, o).trim(), t[3] = "";
        }
      }
      let r = t[2], i = "";
      if (this.options.pedantic) {
        let s = this.rules.other.pedanticHrefTitle.exec(r);
        s && (r = s[1], i = s[3]);
      } else
        i = t[3] ? t[3].slice(1, -1) : "";
      return r = r.trim(), this.rules.other.startAngleBracket.test(r) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? r = r.slice(1) : r = r.slice(1, -1)), me(t, { href: r && r.replace(this.rules.inline.anyPunctuation, "$1"), title: i && i.replace(this.rules.inline.anyPunctuation, "$1") }, t[0], this.lexer, this.rules);
    }
  }
  reflink(e, t) {
    let n;
    if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
      let r = (n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " "), i = t[r.toLowerCase()];
      if (!i) {
        let s = n[0].charAt(0);
        return { type: "text", raw: s, text: s };
      }
      return me(n, i, n[0], this.lexer, this.rules);
    }
  }
  emStrong(e, t, n = "") {
    let r = this.rules.inline.emStrongLDelim.exec(e);
    if (!r || r[3] && n.match(this.rules.other.unicodeAlphaNumeric))
      return;
    if (!(r[1] || r[2] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, l = s, p = 0, c = r[0][0] === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
      for (c.lastIndex = 0, t = t.slice(-1 * e.length + s);(r = c.exec(t)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a)
          continue;
        if (o = [...a].length, r[3] || r[4]) {
          l += o;
          continue;
        } else if ((r[5] || r[6]) && s % 3 && !((s + o) % 3)) {
          p += o;
          continue;
        }
        if (l -= o, l > 0)
          continue;
        o = Math.min(o, o + l + p);
        let d = [...r[0]][0].length, h = e.slice(0, s + r.index + d + o);
        if (Math.min(s, o) % 2) {
          let f = h.slice(1, -1);
          return { type: "em", raw: h, text: f, tokens: this.lexer.inlineTokens(f) };
        }
        let R = h.slice(2, -2);
        return { type: "strong", raw: h, text: R, tokens: this.lexer.inlineTokens(R) };
      }
    }
  }
  codespan(e) {
    let t = this.rules.inline.code.exec(e);
    if (t) {
      let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), r = this.rules.other.nonSpaceChar.test(n), i = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
      return r && i && (n = n.substring(1, n.length - 1)), { type: "codespan", raw: t[0], text: n };
    }
  }
  br(e) {
    let t = this.rules.inline.br.exec(e);
    if (t)
      return { type: "br", raw: t[0] };
  }
  del(e, t, n = "") {
    let r = this.rules.inline.delLDelim.exec(e);
    if (!r)
      return;
    if (!(r[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
      let s = [...r[0]].length - 1, a, o, l = s, p = this.rules.inline.delRDelim;
      for (p.lastIndex = 0, t = t.slice(-1 * e.length + s);(r = p.exec(t)) != null; ) {
        if (a = r[1] || r[2] || r[3] || r[4] || r[5] || r[6], !a || (o = [...a].length, o !== s))
          continue;
        if (r[3] || r[4]) {
          l += o;
          continue;
        }
        if (l -= o, l > 0)
          continue;
        o = Math.min(o, o + l);
        let c = [...r[0]][0].length, d = e.slice(0, s + r.index + c + o), h = d.slice(s, -s);
        return { type: "del", raw: d, text: h, tokens: this.lexer.inlineTokens(h) };
      }
    }
  }
  autolink(e) {
    let t = this.rules.inline.autolink.exec(e);
    if (t) {
      let n, r;
      return t[2] === "@" ? (n = t[1], r = "mailto:" + n) : (n = t[1], r = n), { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  url(e) {
    let t;
    if (t = this.rules.inline.url.exec(e)) {
      let n, r;
      if (t[2] === "@")
        n = t[0], r = "mailto:" + n;
      else {
        let i;
        do
          i = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
        while (i !== t[0]);
        n = t[0], t[1] === "www." ? r = "http://" + t[0] : r = t[0];
      }
      return { type: "link", raw: t[0], text: n, href: r, tokens: [{ type: "text", raw: n, text: n }] };
    }
  }
  inlineText(e) {
    let t = this.rules.inline.text.exec(e);
    if (t) {
      let n = this.lexer.state.inRawBlock;
      return { type: "text", raw: t[0], text: t[0], escaped: n };
    }
  }
};
var x = class u {
  tokens;
  options;
  state;
  inlineQueue;
  tokenizer;
  constructor(e) {
    this.tokens = [], this.tokens.links = Object.create(null), this.options = e || T, this.options.tokenizer = this.options.tokenizer || new w, this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = { inLink: false, inRawBlock: false, top: true };
    let t = { other: m, block: E.normal, inline: z.normal };
    this.options.pedantic ? (t.block = E.pedantic, t.inline = z.pedantic) : this.options.gfm && (t.block = E.gfm, this.options.breaks ? t.inline = z.breaks : t.inline = z.gfm), this.tokenizer.rules = t;
  }
  static get rules() {
    return { block: E, inline: z };
  }
  static lex(e, t) {
    return new u(t).lex(e);
  }
  static lexInline(e, t) {
    return new u(t).inlineTokens(e);
  }
  lex(e) {
    e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
    for (let t = 0;t < this.inlineQueue.length; t++) {
      let n = this.inlineQueue[t];
      this.inlineTokens(n.src, n.tokens);
    }
    return this.inlineQueue = [], this.tokens;
  }
  blockTokens(e, t = [], n = false) {
    for (this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));e; ) {
      let r;
      if (this.options.extensions?.block?.some((s) => (r = s.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), true) : false))
        continue;
      if (r = this.tokenizer.space(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        r.raw.length === 1 && s !== undefined ? s.raw += `
` : t.push(r);
        continue;
      }
      if (r = this.tokenizer.code(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (r = this.tokenizer.fences(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.heading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.hr(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.blockquote(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.list(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.html(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.def(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "paragraph" || s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.raw, this.inlineQueue.at(-1).src = s.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = { href: r.href, title: r.title }, t.push(r));
        continue;
      }
      if (r = this.tokenizer.table(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      if (r = this.tokenizer.lheading(e)) {
        e = e.substring(r.raw.length), t.push(r);
        continue;
      }
      let i = e;
      if (this.options.extensions?.startBlock) {
        let s = 1 / 0, a = e.slice(1), o;
        this.options.extensions.startBlock.forEach((l) => {
          o = l.call({ lexer: this }, a), typeof o == "number" && o >= 0 && (s = Math.min(s, o));
        }), s < 1 / 0 && s >= 0 && (i = e.substring(0, s + 1));
      }
      if (this.state.top && (r = this.tokenizer.paragraph(i))) {
        let s = t.at(-1);
        n && s?.type === "paragraph" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
        continue;
      }
      if (r = this.tokenizer.text(e)) {
        e = e.substring(r.raw.length);
        let s = t.at(-1);
        s?.type === "text" ? (s.raw += (s.raw.endsWith(`
`) ? "" : `
`) + r.raw, s.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = s.text) : t.push(r);
        continue;
      }
      if (e) {
        let s = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(s);
          break;
        } else
          throw new Error(s);
      }
    }
    return this.state.top = true, t;
  }
  inline(e, t = []) {
    return this.inlineQueue.push({ src: e, tokens: t }), t;
  }
  inlineTokens(e, t = []) {
    let n = e, r = null;
    if (this.tokens.links) {
      let o = Object.keys(this.tokens.links);
      if (o.length > 0)
        for (;(r = this.tokenizer.rules.inline.reflinkSearch.exec(n)) != null; )
          o.includes(r[0].slice(r[0].lastIndexOf("[") + 1, -1)) && (n = n.slice(0, r.index) + "[" + "a".repeat(r[0].length - 2) + "]" + n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
    }
    for (;(r = this.tokenizer.rules.inline.anyPunctuation.exec(n)) != null; )
      n = n.slice(0, r.index) + "++" + n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
    let i;
    for (;(r = this.tokenizer.rules.inline.blockSkip.exec(n)) != null; )
      i = r[2] ? r[2].length : 0, n = n.slice(0, r.index + i) + "[" + "a".repeat(r[0].length - i - 2) + "]" + n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
    let s = false, a = "";
    for (;e; ) {
      s || (a = ""), s = false;
      let o;
      if (this.options.extensions?.inline?.some((p) => (o = p.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), true) : false))
        continue;
      if (o = this.tokenizer.escape(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.tag(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.link(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.reflink(e, this.tokens.links)) {
        e = e.substring(o.raw.length);
        let p = t.at(-1);
        o.type === "text" && p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : t.push(o);
        continue;
      }
      if (o = this.tokenizer.emStrong(e, n, a)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.codespan(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.br(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.del(e, n, a)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (o = this.tokenizer.autolink(e)) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      if (!this.state.inLink && (o = this.tokenizer.url(e))) {
        e = e.substring(o.raw.length), t.push(o);
        continue;
      }
      let l = e;
      if (this.options.extensions?.startInline) {
        let p = 1 / 0, c = e.slice(1), d;
        this.options.extensions.startInline.forEach((h) => {
          d = h.call({ lexer: this }, c), typeof d == "number" && d >= 0 && (p = Math.min(p, d));
        }), p < 1 / 0 && p >= 0 && (l = e.substring(0, p + 1));
      }
      if (o = this.tokenizer.inlineText(l)) {
        e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (a = o.raw.slice(-1)), s = true;
        let p = t.at(-1);
        p?.type === "text" ? (p.raw += o.raw, p.text += o.text) : t.push(o);
        continue;
      }
      if (e) {
        let p = "Infinite loop on byte: " + e.charCodeAt(0);
        if (this.options.silent) {
          console.error(p);
          break;
        } else
          throw new Error(p);
      }
    }
    return t;
  }
};
var y = class {
  options;
  parser;
  constructor(e) {
    this.options = e || T;
  }
  space(e) {
    return "";
  }
  code({ text: e, lang: t, escaped: n }) {
    let r = (t || "").match(m.notSpaceStart)?.[0], i = e.replace(m.endingNewline, "") + `
`;
    return r ? '<pre><code class="language-' + O(r) + '">' + (n ? i : O(i, true)) + `</code></pre>
` : "<pre><code>" + (n ? i : O(i, true)) + `</code></pre>
`;
  }
  blockquote({ tokens: e }) {
    return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
  }
  html({ text: e }) {
    return e;
  }
  def(e) {
    return "";
  }
  heading({ tokens: e, depth: t }) {
    return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
  }
  hr(e) {
    return `<hr>
`;
  }
  list(e) {
    let { ordered: t, start: n } = e, r = "";
    for (let a = 0;a < e.items.length; a++) {
      let o = e.items[a];
      r += this.listitem(o);
    }
    let i = t ? "ol" : "ul", s = t && n !== 1 ? ' start="' + n + '"' : "";
    return "<" + i + s + `>
` + r + "</" + i + `>
`;
  }
  listitem(e) {
    return `<li>${this.parser.parse(e.tokens)}</li>
`;
  }
  checkbox({ checked: e }) {
    return "<input " + (e ? 'checked="" ' : "") + 'disabled="" type="checkbox"> ';
  }
  paragraph({ tokens: e }) {
    return `<p>${this.parser.parseInline(e)}</p>
`;
  }
  table(e) {
    let t = "", n = "";
    for (let i = 0;i < e.header.length; i++)
      n += this.tablecell(e.header[i]);
    t += this.tablerow({ text: n });
    let r = "";
    for (let i = 0;i < e.rows.length; i++) {
      let s = e.rows[i];
      n = "";
      for (let a = 0;a < s.length; a++)
        n += this.tablecell(s[a]);
      r += this.tablerow({ text: n });
    }
    return r && (r = `<tbody>${r}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + r + `</table>
`;
  }
  tablerow({ text: e }) {
    return `<tr>
${e}</tr>
`;
  }
  tablecell(e) {
    let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
    return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
  }
  strong({ tokens: e }) {
    return `<strong>${this.parser.parseInline(e)}</strong>`;
  }
  em({ tokens: e }) {
    return `<em>${this.parser.parseInline(e)}</em>`;
  }
  codespan({ text: e }) {
    return `<code>${O(e, true)}</code>`;
  }
  br(e) {
    return "<br>";
  }
  del({ tokens: e }) {
    return `<del>${this.parser.parseInline(e)}</del>`;
  }
  link({ href: e, title: t, tokens: n }) {
    let r = this.parser.parseInline(n), i = X(e);
    if (i === null)
      return r;
    e = i;
    let s = '<a href="' + e + '"';
    return t && (s += ' title="' + O(t) + '"'), s += ">" + r + "</a>", s;
  }
  image({ href: e, title: t, text: n, tokens: r }) {
    r && (n = this.parser.parseInline(r, this.parser.textRenderer));
    let i = X(e);
    if (i === null)
      return O(n);
    e = i;
    let s = `<img src="${e}" alt="${n}"`;
    return t && (s += ` title="${O(t)}"`), s += ">", s;
  }
  text(e) {
    return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : ("escaped" in e) && e.escaped ? e.text : O(e.text);
  }
};
var $ = class {
  strong({ text: e }) {
    return e;
  }
  em({ text: e }) {
    return e;
  }
  codespan({ text: e }) {
    return e;
  }
  del({ text: e }) {
    return e;
  }
  html({ text: e }) {
    return e;
  }
  text({ text: e }) {
    return e;
  }
  link({ text: e }) {
    return "" + e;
  }
  image({ text: e }) {
    return "" + e;
  }
  br() {
    return "";
  }
  checkbox({ raw: e }) {
    return e;
  }
};
var b = class u2 {
  options;
  renderer;
  textRenderer;
  constructor(e) {
    this.options = e || T, this.options.renderer = this.options.renderer || new y, this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new $;
  }
  static parse(e, t) {
    return new u2(t).parse(e);
  }
  static parseInline(e, t) {
    return new u2(t).parseInline(e);
  }
  parse(e) {
    let t = "";
    for (let n = 0;n < e.length; n++) {
      let r = e[n];
      if (this.options.extensions?.renderers?.[r.type]) {
        let s = r, a = this.options.extensions.renderers[s.type].call({ parser: this }, s);
        if (a !== false || !["space", "hr", "heading", "code", "table", "blockquote", "list", "html", "def", "paragraph", "text"].includes(s.type)) {
          t += a || "";
          continue;
        }
      }
      let i = r;
      switch (i.type) {
        case "space": {
          t += this.renderer.space(i);
          break;
        }
        case "hr": {
          t += this.renderer.hr(i);
          break;
        }
        case "heading": {
          t += this.renderer.heading(i);
          break;
        }
        case "code": {
          t += this.renderer.code(i);
          break;
        }
        case "table": {
          t += this.renderer.table(i);
          break;
        }
        case "blockquote": {
          t += this.renderer.blockquote(i);
          break;
        }
        case "list": {
          t += this.renderer.list(i);
          break;
        }
        case "checkbox": {
          t += this.renderer.checkbox(i);
          break;
        }
        case "html": {
          t += this.renderer.html(i);
          break;
        }
        case "def": {
          t += this.renderer.def(i);
          break;
        }
        case "paragraph": {
          t += this.renderer.paragraph(i);
          break;
        }
        case "text": {
          t += this.renderer.text(i);
          break;
        }
        default: {
          let s = 'Token with "' + i.type + '" type was not found.';
          if (this.options.silent)
            return console.error(s), "";
          throw new Error(s);
        }
      }
    }
    return t;
  }
  parseInline(e, t = this.renderer) {
    let n = "";
    for (let r = 0;r < e.length; r++) {
      let i = e[r];
      if (this.options.extensions?.renderers?.[i.type]) {
        let a = this.options.extensions.renderers[i.type].call({ parser: this }, i);
        if (a !== false || !["escape", "html", "link", "image", "strong", "em", "codespan", "br", "del", "text"].includes(i.type)) {
          n += a || "";
          continue;
        }
      }
      let s = i;
      switch (s.type) {
        case "escape": {
          n += t.text(s);
          break;
        }
        case "html": {
          n += t.html(s);
          break;
        }
        case "link": {
          n += t.link(s);
          break;
        }
        case "image": {
          n += t.image(s);
          break;
        }
        case "checkbox": {
          n += t.checkbox(s);
          break;
        }
        case "strong": {
          n += t.strong(s);
          break;
        }
        case "em": {
          n += t.em(s);
          break;
        }
        case "codespan": {
          n += t.codespan(s);
          break;
        }
        case "br": {
          n += t.br(s);
          break;
        }
        case "del": {
          n += t.del(s);
          break;
        }
        case "text": {
          n += t.text(s);
          break;
        }
        default: {
          let a = 'Token with "' + s.type + '" type was not found.';
          if (this.options.silent)
            return console.error(a), "";
          throw new Error(a);
        }
      }
    }
    return n;
  }
};
var P = class {
  options;
  block;
  constructor(e) {
    this.options = e || T;
  }
  static passThroughHooks = new Set(["preprocess", "postprocess", "processAllTokens", "emStrongMask"]);
  static passThroughHooksRespectAsync = new Set(["preprocess", "postprocess", "processAllTokens"]);
  preprocess(e) {
    return e;
  }
  postprocess(e) {
    return e;
  }
  processAllTokens(e) {
    return e;
  }
  emStrongMask(e) {
    return e;
  }
  provideLexer() {
    return this.block ? x.lex : x.lexInline;
  }
  provideParser() {
    return this.block ? b.parse : b.parseInline;
  }
};
var B = class {
  defaults = M();
  options = this.setOptions;
  parse = this.parseMarkdown(true);
  parseInline = this.parseMarkdown(false);
  Parser = b;
  Renderer = y;
  TextRenderer = $;
  Lexer = x;
  Tokenizer = w;
  Hooks = P;
  constructor(...e) {
    this.use(...e);
  }
  walkTokens(e, t) {
    let n = [];
    for (let r of e)
      switch (n = n.concat(t.call(this, r)), r.type) {
        case "table": {
          let i = r;
          for (let s of i.header)
            n = n.concat(this.walkTokens(s.tokens, t));
          for (let s of i.rows)
            for (let a of s)
              n = n.concat(this.walkTokens(a.tokens, t));
          break;
        }
        case "list": {
          let i = r;
          n = n.concat(this.walkTokens(i.items, t));
          break;
        }
        default: {
          let i = r;
          this.defaults.extensions?.childTokens?.[i.type] ? this.defaults.extensions.childTokens[i.type].forEach((s) => {
            let a = i[s].flat(1 / 0);
            n = n.concat(this.walkTokens(a, t));
          }) : i.tokens && (n = n.concat(this.walkTokens(i.tokens, t)));
        }
      }
    return n;
  }
  use(...e) {
    let t = this.defaults.extensions || { renderers: {}, childTokens: {} };
    return e.forEach((n) => {
      let r = { ...n };
      if (r.async = this.defaults.async || r.async || false, n.extensions && (n.extensions.forEach((i) => {
        if (!i.name)
          throw new Error("extension name required");
        if ("renderer" in i) {
          let s = t.renderers[i.name];
          s ? t.renderers[i.name] = function(...a) {
            let o = i.renderer.apply(this, a);
            return o === false && (o = s.apply(this, a)), o;
          } : t.renderers[i.name] = i.renderer;
        }
        if ("tokenizer" in i) {
          if (!i.level || i.level !== "block" && i.level !== "inline")
            throw new Error("extension level must be 'block' or 'inline'");
          let s = t[i.level];
          s ? s.unshift(i.tokenizer) : t[i.level] = [i.tokenizer], i.start && (i.level === "block" ? t.startBlock ? t.startBlock.push(i.start) : t.startBlock = [i.start] : i.level === "inline" && (t.startInline ? t.startInline.push(i.start) : t.startInline = [i.start]));
        }
        "childTokens" in i && i.childTokens && (t.childTokens[i.name] = i.childTokens);
      }), r.extensions = t), n.renderer) {
        let i = this.defaults.renderer || new y(this.defaults);
        for (let s in n.renderer) {
          if (!(s in i))
            throw new Error(`renderer '${s}' does not exist`);
          if (["options", "parser"].includes(s))
            continue;
          let a = s, o = n.renderer[a], l = i[a];
          i[a] = (...p) => {
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c || "";
          };
        }
        r.renderer = i;
      }
      if (n.tokenizer) {
        let i = this.defaults.tokenizer || new w(this.defaults);
        for (let s in n.tokenizer) {
          if (!(s in i))
            throw new Error(`tokenizer '${s}' does not exist`);
          if (["options", "rules", "lexer"].includes(s))
            continue;
          let a = s, o = n.tokenizer[a], l = i[a];
          i[a] = (...p) => {
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c;
          };
        }
        r.tokenizer = i;
      }
      if (n.hooks) {
        let i = this.defaults.hooks || new P;
        for (let s in n.hooks) {
          if (!(s in i))
            throw new Error(`hook '${s}' does not exist`);
          if (["options", "block"].includes(s))
            continue;
          let a = s, o = n.hooks[a], l = i[a];
          P.passThroughHooks.has(s) ? i[a] = (p) => {
            if (this.defaults.async && P.passThroughHooksRespectAsync.has(s))
              return (async () => {
                let d = await o.call(i, p);
                return l.call(i, d);
              })();
            let c = o.call(i, p);
            return l.call(i, c);
          } : i[a] = (...p) => {
            if (this.defaults.async)
              return (async () => {
                let d = await o.apply(i, p);
                return d === false && (d = await l.apply(i, p)), d;
              })();
            let c = o.apply(i, p);
            return c === false && (c = l.apply(i, p)), c;
          };
        }
        r.hooks = i;
      }
      if (n.walkTokens) {
        let i = this.defaults.walkTokens, s = n.walkTokens;
        r.walkTokens = function(a) {
          let o = [];
          return o.push(s.call(this, a)), i && (o = o.concat(i.call(this, a))), o;
        };
      }
      this.defaults = { ...this.defaults, ...r };
    }), this;
  }
  setOptions(e) {
    return this.defaults = { ...this.defaults, ...e }, this;
  }
  lexer(e, t) {
    return x.lex(e, t ?? this.defaults);
  }
  parser(e, t) {
    return b.parse(e, t ?? this.defaults);
  }
  parseMarkdown(e) {
    return (n, r) => {
      let i = { ...r }, s = { ...this.defaults, ...i }, a = this.onError(!!s.silent, !!s.async);
      if (this.defaults.async === true && i.async === false)
        return a(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
      if (typeof n > "u" || n === null)
        return a(new Error("marked(): input parameter is undefined or null"));
      if (typeof n != "string")
        return a(new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
      if (s.hooks && (s.hooks.options = s, s.hooks.block = e), s.async)
        return (async () => {
          let o = s.hooks ? await s.hooks.preprocess(n) : n, p = await (s.hooks ? await s.hooks.provideLexer() : e ? x.lex : x.lexInline)(o, s), c = s.hooks ? await s.hooks.processAllTokens(p) : p;
          s.walkTokens && await Promise.all(this.walkTokens(c, s.walkTokens));
          let h = await (s.hooks ? await s.hooks.provideParser() : e ? b.parse : b.parseInline)(c, s);
          return s.hooks ? await s.hooks.postprocess(h) : h;
        })().catch(a);
      try {
        s.hooks && (n = s.hooks.preprocess(n));
        let l = (s.hooks ? s.hooks.provideLexer() : e ? x.lex : x.lexInline)(n, s);
        s.hooks && (l = s.hooks.processAllTokens(l)), s.walkTokens && this.walkTokens(l, s.walkTokens);
        let c = (s.hooks ? s.hooks.provideParser() : e ? b.parse : b.parseInline)(l, s);
        return s.hooks && (c = s.hooks.postprocess(c)), c;
      } catch (o) {
        return a(o);
      }
    };
  }
  onError(e, t) {
    return (n) => {
      if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
        let r = "<p>An error occurred:</p><pre>" + O(n.message + "", true) + "</pre>";
        return t ? Promise.resolve(r) : r;
      }
      if (t)
        return Promise.reject(n);
      throw n;
    };
  }
};
var L = new B;
function g(u3, e) {
  return L.parse(u3, e);
}
g.options = g.setOptions = function(u3) {
  return L.setOptions(u3), g.defaults = L.defaults, H(g.defaults), g;
};
g.getDefaults = M;
g.defaults = T;
g.use = function(...u3) {
  return L.use(...u3), g.defaults = L.defaults, H(g.defaults), g;
};
g.walkTokens = function(u3, e) {
  return L.walkTokens(u3, e);
};
g.parseInline = L.parseInline;
g.Parser = b;
g.parser = b.parse;
g.Renderer = y;
g.TextRenderer = $;
g.Lexer = x;
g.lexer = x.lex;
g.Tokenizer = w;
g.Hooks = P;
g.parse = g;
var Ut = g.options;
var Kt = g.setOptions;
var Wt = g.use;
var Xt = g.walkTokens;
var Jt = g.parseInline;
var Yt = b.parse;
var en = x.lex;

// src/markdown.ts
var turndownService = new turndown_browser_es_default;
function convertHTMLToMarkdown(html) {
  return turndownService.turndown(html);
}
async function convertMarkdownToHTML(markdown) {
  return await g(markdown);
}

// src/main.ts
var btnClean = document.getElementById("btn-clean");
btnClean?.addEventListener("click", handlePurifyRawHTML);
var btnMarkdown = document.getElementById("btn-markdown");
btnMarkdown?.addEventListener("click", async () => {
  await handleConvertHTMLToMarkdown();
});
var btnFormat = document.getElementById("btn-format");
btnFormat?.addEventListener("click", handleFormatHTML);
var btnCompress = document.getElementById("btn-compress");
btnCompress?.addEventListener("click", handleCompressHTML);
var textareaMarkdown = document.getElementById("textarea-markdown");
textareaMarkdown?.addEventListener("input", async () => {
  await updatePreviewMarkdown(textareaMarkdown);
});
var textareaCleanHTML = document.getElementById("textarea-clean-html");
textareaCleanHTML?.addEventListener("input", () => {
  updatePreviewHTML(textareaCleanHTML);
});
function updatePreviewHTML(cleanHTMLArea) {
  const previewHTMLFrame = document.getElementById("iframe-preview-html");
  if (!previewHTMLFrame) {
    console.error("Missing element");
    return;
  }
  previewHTMLFrame.srcdoc = cleanHTMLArea.value;
}
async function updatePreviewMarkdown(markdownArea) {
  const previewMarkdownFrame = document.getElementById("iframe-preview-markdown");
  if (!previewMarkdownFrame) {
    console.error("Missing element");
    return;
  }
  const html = await convertMarkdownToHTML(markdownArea.value);
  previewMarkdownFrame.srcdoc = html;
}
async function handleConvertHTMLToMarkdown() {
  const markdownArea = document.getElementById("textarea-markdown");
  const cleanHTMLArea = document.getElementById("textarea-clean-html");
  if (!markdownArea || !cleanHTMLArea) {
    console.error("Missing element");
    return;
  }
  markdownArea.value = convertHTMLToMarkdown(cleanHTMLArea.value);
  await updatePreviewMarkdown(markdownArea);
}
function updateOutputHTML(htmlString) {
  const previewHTMLFrame = document.getElementById("iframe-preview-html");
  const cleanHTMLArea = document.getElementById("textarea-clean-html");
  if (!previewHTMLFrame || !cleanHTMLArea) {
    console.error("Missing element");
    return;
  }
  cleanHTMLArea.value = htmlString;
  previewHTMLFrame.srcdoc = cleanHTMLArea.value;
}
function handleFormatHTML() {
  const cleanHTMLArea = document.getElementById("textarea-clean-html");
  if (!cleanHTMLArea) {
    console.error("Missing element");
    return;
  }
  updateOutputHTML(formatHTML(cleanHTMLArea.value));
}
function handleCompressHTML() {
  const cleanHTMLArea = document.getElementById("textarea-clean-html");
  if (!cleanHTMLArea) {
    console.error("Missing element");
    return;
  }
  updateOutputHTML(compressHTML(cleanHTMLArea.value));
}
function handlePurifyRawHTML() {
  const rawHTMLArea = document.getElementById("textarea-raw-html");
  if (!rawHTMLArea) {
    console.error("Missing element");
    return;
  }
  const cleanedHTML = cleanHTML(rawHTMLArea.value);
  updateOutputHTML(cleanedHTML);
}
