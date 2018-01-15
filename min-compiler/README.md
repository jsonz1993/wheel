
## welcome

今天在看 babel 的时候，无意中被引到一个外链

> 关于编译器的优秀/简单的教程，请查看 [the-super-tiny-compiler](https://babeljs.cn/docs/plugins/) ，同时它也从宏观角度上解释了 Babel 本身是如何工作的。

觉得挺感兴趣的，加上代码也不多，就跟着思路自己理解敲了一遍。

本文主要是帮助理解编译器的原理 不做过多的其他扩展

## 编译器的基本组成

一般简单的编译器可以由以下几部分组成:

- tokenizer 分词器 把代码或文本按类型分开，返回: `tokens`
- parser 语法剖析器 对分词后的文本按照语法分析转换成 抽象语法树 返回：ast
- transformer 语法转换器 把语法剖析后的抽象语法树转换成我们想要的: newAst
- codeGenerator 代码生成器 把AST 转换为 目标代码

> babel 初始阶段并没有做任何事，基本上等于 `const babel = code=> code`;
> 先 tokenizer， parser 解析代码，再 transformer 的时候，完全不改动原来的 ast


接下来以最简单的编译器组成 一个环节一个环节走下去

## tokenizer 分词器

分词器其实可以理解为简单的将文本切割，然后将有价值的按照相邻同等类型的 文本组合一起输出。
_<small>ps:无价值指对代码生成没有影响的部分，比如js里面非文本 一个空格和一百个空格对编译器来说是没有区别的</small>_

实现思路：
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

```JavaScript tokenizer
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
```

```JavaScript
const input = '(add 2 (subtract 4 2 "djwaqp"))';
tokenizer(input);
// 输出
/*
[{ type: 'paren', value: '(' },
{ type: 'name', value: 'add' },
{ type: 'number', value: '2' },
{ type: 'paren', value: '(' },
{ type: 'name', value: 'subtract' },
{ type: 'number', value: '4' },
{ type: 'number', value: '2' },
{ type: 'string', value: 'djwaqp' },
{ type: 'paren', value: ')' },
{ type: 'paren', value: ')' }];
*/
```

## parser

语法剖析器就是把 `tokens` 解析，转化为抽象语法树(AST)🌲🌲🌲，方便后续的处理。

```javascript
 [{ type: 'paren', value: '(' }, ...]   =>   { type: 'Program', body: [...] }
 ```

实现思路：
1. 首先也要有一个 `current` 对 `tokens` 进行遍历，每一项 `token` 进行分析处理
2. 有一棵树，顶级结构为 `{type: 'Program' , body: [...]}`
3. 根据 `token.type` 进行相应的归类处理:
  1. `number`： 直接返回  `{type: 'NumberLiteral', value, }`
  2. `string`： 直接返回 `{type: 'StringLiteral', value, }`
  3. `paren (` ： 对下一个进行递归，直到出现 `paren )`
4. 将处理后的 ast 返回

```JavaScript parser
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

```

```JavaScript
input:
[{ type: 'paren', value: '(' },
{ type: 'name', value: 'add' },
{ type: 'number', value: '2' },
{ type: 'paren', value: '(' },
{ type: 'name', value: 'subtract' },
{ type: 'number', value: '4' },
{ type: 'number', value: '2' },
{ type: 'string', value: 'djwaqp' },
{ type: 'paren', value: ')' },
{ type: 'paren', value: ')' }]
=>
output:
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
```

## transformer

transformer 顾名思义，为转换部分，最复杂 也最常用。
`.babelrc` 添加的插件，也只是在这个环节进行操作，将原本的 ast( es6 ) 转换为目标的 newAst (es5)。

```javascript
 ast { type: 'Program', body: [...] }   =>   newAst { type: 'Program', body: [...] }
 ```

实现思路：
1. 首先，要有一颗树，和 ast 一样。 顶级结构为 `{ type: 'Program', body: [...] }`
2. 在 `ast` 上建一个引用`_context`到 `newAst.body`;
3. 对 ast 树进行处理, 直接处理 `_context`
4. 对 ast 上 每个类型都做 enter 处理与 exit处理的钩子
  1. Number 或 String 直接处理并添加到树节点上即可
  2. CallExpression 则要创建一个数组去存参数
5. 对类型为：`Program` 或 `CallExpression` 对子级进行 递归 `4` 处理
6. 将处理后的 newAst 返回

```JavaScript transformer 部分
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
```

```JavaScript
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
=>
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
```


## codeGenerator
最后一步就是 `codeGenerator`， 用 `newAst` 递归调用，根据 `node` 与一系列规则去生成一个 string。

```javascript
newAst { type: 'Program', body: [...] } => call(argumentsA, ...argumentsN);
```

实现思路：
1. 根据 node.type 做对应逻辑：
2. `Program` => 对 node.body 进行递归
3. `ExpressionStatement`=> 对 node.expression 进行处理
4. `CallExpression` => 对 node.callee 与 node.arguments 进行处理
5. `Identifier` && `NumberLiteral` && `StringLiteral` 直接返回对应的字段

```JavaScript codeGenerator
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
```
```JavaScript
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
=> 
output:
add(2, subtract(4, 2, "djwaqp"));
```

## compiler
至此，编译器所需的几个步骤： 分词，解析，转换，生成都已经完成。

```javascript compiler
function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst);
  return output;
}
const input = '(add 2 (subtract 4 2 "djwaqp"))';
const output = compilter(input); // 'add(2, subtract(4, 2, "djwaqp"));'
```

# emmm

最后再推一波关于学习中看到的好网站

[esprima 解析语法树🌲](http://esprima.org/demo/parse.html#)
[ast名词解释](https://zh.wikipedia.org/zh-cn/%E6%8A%BD%E8%B1%A1%E8%AA%9E%E6%B3%95%E6%A8%B9)