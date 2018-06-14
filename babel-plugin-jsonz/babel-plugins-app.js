// 入门+2
// http://forivall.com/astexplorer/
const babel = require('babel-core');
const t = require('babel-types');


const visitor = {
  BinaryExpression(path) {
    const node = path.node;
    let result;

    if (t.isNumericLiteral(node.left) && t.isNumericLiteral(node.right)) {
      switch (node.operator) {
        case '+':
          result = node.left.value + node.right.value;
          break;
        
        case '-':
          result = node.left.value - node.right.value;
          break;

        case '*':
          result =  node.left.value * node.right.value;
          break;

        case '/':
          result =  node.left.value / node.right.value;
          break;
      
        case '**':
          let i = node.right.value;
          while(--i) {
            result = result || node.left.value;
            result = result * node.left.value;
          }
        default:
          break;
      }
    }

    if (result !== undefined) {
      // 把表达式节点替换成number字面量
      path.replaceWith(t.numericLiteral(result));

      let parentPath = path.parentPath;

      // 向上遍历父级节点
      parentPath && visitor.BinaryExpression.call(this, parentPath);
    }
  }
}

module.exports = function(babel) {
  return {
    visitor
  }
}