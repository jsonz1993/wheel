// 入门
const t = require('babel-types');

module.exports=  function() {
  // plugin contents
  return {
    visitor: {
      // visitor contents
      BinaryExpression(path, state) {
        if (path.node.operator !== '===') {
          return;
        }
        path.node.left = t.identifier('"sebmck"');
        path.node.right = t.identifier('"dork"');
      }
    }
  };
};