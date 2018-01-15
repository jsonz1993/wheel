/*
 * @Author: Jsonz 
 * @Date: 2018-01-15 15:57:45 
 * @Last Modified by: Jsonz
 * @Last Modified time: 2018-01-15 16:04:30
 * @original Project: https://github.com/thejameskyle/the-super-tiny-compiler
 * @line: https://jsonz1993.github.io/2018/01/%E6%89%8B%E6%8A%8A%E6%89%8B%E5%AE%9E%E7%8E%B0%E4%B8%80%E4%B8%AA%E6%9E%81%E7%AE%80%E7%BC%96%E8%AF%91%E5%99%A8-%E2%80%94%E2%80%94-%E4%BA%86%E8%A7%A3%E7%BC%96%E8%AF%91%E5%99%A8%E5%8E%9F%E7%90%86/
 */

const assert = require('assert');

const input = '(add 2 (subtract 4 2 "djwaqp"))';
const tokens = [{ type: 'paren', value: '(' },
{ type: 'name', value: 'add' },
{ type: 'number', value: '2' },
{ type: 'paren', value: '(' },
{ type: 'name', value: 'subtract' },
{ type: 'number', value: '4' },
{ type: 'number', value: '2' },
{ type: 'string', value: 'djwaqp' },
{ type: 'paren', value: ')' },
{ type: 'paren', value: ')' }];
const ast = {
  "type": "Program",
  "body": [{
    "type": "CallExpression",
    "name": "add",
    "params": [{
      "type": "NumberLiteral",
      "value": "2"
    }, {
      "type": "CallExpression",
      "name": "subtract",
      "params": [{
        "type": "NumberLiteral",
        "value": "4"
      }, {
        "type": "NumberLiteral",
        "value": "2"
      }, {
        "type": "StringLiteral",
        "value": "djwaqp"
      }]
    }]
  }]
};
const newAst = {
  "type": "Program",
  "body": [{
    "type": "ExpressionStatement",
    "expression": {
      "type": "CallExpression",
      "callee": {
        "type": "Identifier",
        "name": "add"
      },
      "arguments": [{
        "type": "NumberLiteral",
        "value": "2"
      }, {
        "type": "CallExpression",
        "callee": {
          "type": "Identifier",
          "name": "subtract"
        },
        "arguments": [{
          "type": "NumberLiteral",
          "value": "4"
        }, {
          "type": "NumberLiteral",
          "value": "2"
        }, {
          "type": "StringLiteral",
          "value": "djwaqp"
        }]
      }]
    }
  }]
};
const output = 'add(2, subtract(4, 2, "djwaqp"));';
/*
1. 有一个值存着当前的光标 `current`
2. 有一个数组用来存放按类型分出来的值 `tokens`
3. 对文本进行循环， 取 `current` 的值做 分类型处理
  1. `(`
  2. `)`
  3. 空格
  4. 数字
  5. 字符串
  6. 方法名
4. 将处理后的值存进数组 `token` 并返回
*/
/*
input: (add 2 (subtract 4 2 "djwaqp"))
output: [ { type: 'paren', value: '(' },
  { type: 'name', value: 'add' },
  { type: 'number', value: '2' },
  { type: 'paren', value: '(' },
  { type: 'name', value: 'subtract' },
  { type: 'number', value: '4' },
  { type: 'number', value: '2' },
  { type: 'string', value: 'djwaqp' },
  { type: 'paren', value: ')' },
  { type: 'paren', value: ')' } ]
*/
function tokenizer(input) {
  let current = 0;
  const tokens = [];
  while (current < input.length) {
    let char = input[current];

    if (char === "(" || char === ")") {
      tokens.push({
        type: 'paren',
        value: char
      });
      current++;
      continue;
    }

    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let name = "";
      
      while (LETTERS.test(char)) {
        name += char;
        current++;
        char = input[current];
      }
      
      tokens.push({
        type: 'name',
        value: name
      });
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let numbers = "";

      while(NUMBERS.test(char)) {
        numbers += char;
        current++;
        char = input[current];
      }

      tokens.push({
        type: 'number',
        value: numbers
      });
      continue;
    }

    if (char === '"') {
      let string = '';
      current++;
      char = input[current];

      while(char !== '"') {
        string += char;
        current++;
        char = input[current];
      }

      tokens.push({
        type: 'string',
        value: string
      });
      current++;
      continue;
    }

    throw new TypeError('不知道你输入的是什么鬼东西 ' + char);
  }
  return tokens;
}


/*
1. 首先也要有一个 `current` 对 `tokens` 进行遍历，每一项 `token` 进行分析处理
2. 有一棵树，顶级结构为 `{type: 'Program' , body: [...]}`
3. 根据 `token.type` 进行相应的归类处理
input: [ { type: 'paren', value: '(' },
  { type: 'name', value: 'add' },
  { type: 'number', value: '2' },
  { type: 'paren', value: '(' },
  { type: 'name', value: 'subtract' },
  { type: 'number', value: '4' },
  { type: 'number', value: '2' },
  { type: 'string', value: 'djwaqp' },
  { type: 'paren', value: ')' },
  { type: 'paren', value: ')' }
]
output: {
	"type": "Program",
	"body": [{
		"type": "CallExpression",
		"name": "ADD",
		"params": [{
			"type": "NumberLiteral",
			"value": "2"
		}, {
			"type": "CallExpression",
			"name": "subtract",
			"params": [{
				"type": "NumberLiteral",
				"value": "4"
			}, {
				"type": "NumberLiteral",
				"value": "2"
			}, {
				"type": "StringLiteral",
				"value": "djwaqp"
			}]
		}]
	}]
}
*/
function parser(tokens) {
  let current = 0;
  const ast = { 
    type: 'Program', 
    body: []
  };

  function walk() {
    let token = tokens[current];

    if (token.type === 'number') {
      current ++;
      return {
        type: 'NumberLiteral',
        value: token.value
      }
    }

    if (token.type === 'string') {
      current ++;
      return {
        type: 'StringLiteral',
        value: token.value
      }
    }

    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current];
      let node = {
        type: "CallExpression",
        name: token.value,
        params: []
      }
      
      token = tokens[++current];
      while ((token.type !== 'paren') || (token.type === 'paren' && token.value !== ')')) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;
      return node;
    }
    throw new TypeError(token.type);
  }

  while(current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}


/*
1. 首先，要有一颗树，和 ast 一样。 顶级结构为 `{ type: 'Program', body: [...] }`
2. 在 `ast` 上建一个引用`_context`到 `newAst.body`;
3. 对 ast 树进行处理, 直接处理 `_context`
4. 对 ast 上 每个类型都做 enter 处理与 exit处理的钩子
  1. Number 或 String 直接处理并添加到树节点上即可
  2. CallExpression 则要创建一个数组去存参数
5. 对类型为：`Program` 或 `CallExpression` 对子级进行 递归 `4` 处理
6. 将处理后的 newAst 返回

input:
{
	"type": "Program",
	"body": [{
		"type": "CallExpression",
		"name": "ADD",
		"params": [{
			"type": "NumberLiteral",
			"value": "2"
		}, {
			"type": "CallExpression",
			"name": "subtract",
			"params": [{
				"type": "NumberLiteral",
				"value": "4"
			}, {
				"type": "NumberLiteral",
				"value": "2"
			}, {
				"type": "StringLiteral",
				"value": "djwaqp"
			}]
		}]
	}]
}

output:
{
	"type": "Program",
	"body": [{
		"type": "ExpressionStatement",
		"expression": {
			"type": "CallExpression",
			"callee": {
				"type": "Identifier",
				"name": "ADD"
			},
			"arguments": [{
				"type": "NumberLiteral",
				"value": "2"
			}, {
				"type": "CallExpression",
				"callee": {
					"type": "Identifier",
					"name": "subtract"
				},
				"arguments": [{
					"type": "NumberLiteral",
					"value": "4"
				}, {
					"type": "NumberLiteral",
					"value": "2"
				}, {
					"type": "StringLiteral",
					"value": "djwaqp"
				}]
			}]
		}
	}]
}
*/
function transformer(ast) {
  const newAst = {
    type: 'Program',
    body: []
  };
  ast._context = newAst.body;

  traverser(ast, {

    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value
        });
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      }
    },

    CallExpression: {
      enter(node, parent) {

        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name
          },
          arguments: []
        }

        node._context = expression.arguments;

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression
          }
        }

        parent._context.push(expression);
      }
    }

  });

  return newAst;
}

function traverser(node, visitor) {

  function traverseArray(nodeArr, parent) {
    nodeArr.forEach(child => traverseNode(child, parent));
  }
  
  function traverseNode(node, parent) {
    const methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;

      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      case 'NumberLiteral':
      case 'StringLiteral':
      break;
    
      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }

  }

  traverseNode(node, null);
}


/*
1. 根据 node.type 做对应逻辑：
2. `Program` => 对 node.body 进行递归
3. `ExpressionStatement`=> 对 node.expression 进行处理
4. `CallExpression` => 对 node.callee 与 node.arguments 进行处理
5. `Identifier` && `NumberLiteral` && `StringLiteral` 直接返回对应的字段

input:
{
	"type": "Program",
	"body": [{
		"type": "ExpressionStatement",
		"expression": {
			"type": "CallExpression",
			"callee": {
				"type": "Identifier",
				"name": "ADD"
			},
			"arguments": [{
				"type": "NumberLiteral",
				"value": "2"
			}, {
				"type": "CallExpression",
				"callee": {
					"type": "Identifier",
					"name": "subtract"
				},
				"arguments": [{
					"type": "NumberLiteral",
					"value": "4"
				}, {
					"type": "NumberLiteral",
					"value": "2"
				}, {
					"type": "StringLiteral",
					"value": "djwaqp"
				}]
			}]
		}
	}]
}
output:
add(2, subtract(4, 2, "djwaqp"));
*/
function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');
  
    case 'ExpressionStatement':
      return codeGenerator(node.expression) + ';';

    case 'CallExpression':
      return (codeGenerator(node.callee) +'(' + node.arguments.map(codeGenerator).join(', ') + ')');

    case 'Identifier':
      return node.name;
    
    case 'NumberLiteral':
      return node.value;

    case 'StringLiteral':
      return '"' + node.value + '"';

    default:
      throw new TypeError(node.type);
  }
}

function compiler(input) {
  return codeGenerator(transformer(parser(tokenizer(input))));
}

const _tokens = tokenizer(input);
const _ast = parser(_tokens);
const _newAst = transformer(_ast);
const _output = codeGenerator(_newAst);

assert.deepStrictEqual(_tokens, tokens, 'Tokenizer should turn `input` string into `tokens` array');
assert.deepStrictEqual(parser(_tokens), ast, 'Parser should turn `tokens` array into `ast`');
assert.deepStrictEqual(transformer(_ast), newAst, 'Transformer should turn `ast` into a `newAst`');
assert.deepStrictEqual(codeGenerator(_newAst), output, 'CodeGenerator should turn `newAst` into `output`');
assert.deepStrictEqual(compiler(input), output, ' compiler ');

console.log('Jsonz yoyo ');