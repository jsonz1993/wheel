/*
 * @Author: 率小火汁Jsonz
 * @Date: 2019-01-22 12:23:43
 * @Last Modified by: 率小火汁Jsonz
 * @Last Modified time: 2019-01-24 17:10:36
 * esprima 源码 => AST
 * estraverse AST => new AST
 * escodegen AST => 源码
 */

const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const estraverse = require('estraverse');
const escodegen = require('escodegen');

const basePath = process.cwd();
const MAX_RELATIVE = 5;

// 获取webpack原有alias数据
const webpackConfigPath = path.resolve(basePath, './make-webpack.config');
const getWebpackConfig = require(webpackConfigPath);
const aliasConfig = getWebpackConfig().resolve.alias;
const aliasKey = Object.keys(aliasConfig);
const aliasValue = Object.values(aliasConfig);

// 允许出现的Alias
const allowAliasKey = [
  'jquery',
  'event',
  'pages',
  'global',
  'components',
  'moment',
  'src'
];

// oldMap 2 newMap
const aliasMap = {
  lib: 'src/lib',
  core: 'src/core',
  conf: 'src/core/conf',
  utils: 'global/js/utils',
  erc: 'global/js/utils/erc',
  api: 'global/js/api',
  modules: 'global/js/modules',
  arale: 'components/common/aralejs',
  moment: 'moment/moment.js',
  'data-pool': 'components/common/data-pool',
  swiper: 'components/common/swiper',
  lazyLoad: 'src/lib/ze-picLazyLoad',
  select2: 'src/lib/select2.min',
  facebook_login: 'global/js/facebook/facebook',
  btn: 'components/common/button-common',
  mask: 'components/common/mask-dialog',
  popup: 'components/common/common-popup',
  float_tip: 'components/common/float-tip/js/float-tip'
};

// 工具函数：判断是否是 require
function isRequest(node) {
  const { type, name } = node;
  return type === 'Identifier' && name === 'require';
}

// 工具函数: 判断是否是 require
function isRequireDeclaration(node, parent) {
  const { type, value } = node;
  const { callee } = parent || {};
  // 类型一致 && 该key在aliasKey中 && 是 require引入的
  return (
    type === 'Literal' &&
    aliasKey.includes(value) &&
    !allowAliasKey.includes(value) &&
    isRequest(callee)
  );
}

// 工具函数：获取路径
function getModulePath(aliasKey, filePath) {
  const firstDir = /\w*/.exec(aliasKey)[0];

  const modulePath = aliasKey.replace(firstDir, aliasConfig[firstDir]);
  const aliasPath = aliasKey.replace(firstDir, aliasMap[firstDir]);

  if (!aliasConfig[firstDir] || !aliasMap[firstDir] || allowAliasKey.includes(firstDir)) return false;

  // 获取引入的模块与当前模块相对路径，判断是否太长，是就返回alias，否则就返回相对路径就完事了
  const relativePath = path.relative(filePath, modulePath);
  const relativeTime = relativePath.split('../').length - 1;
  return (relativeTime < MAX_RELATIVE)? relativePath: aliasPath;
}

function translateAlias(filePath) {
  // 解析ast
  const demoStr = fs.readFileSync(filePath).toString();
  const ast = esprima.parseModule(demoStr);

  // 转换ast
  estraverse.traverse(ast, {
    enter(node, parent) {
      // 判断是否是我们的目标文件
      const isAliasDec = isRequireDeclaration(node, parent);
      if (isAliasDec) {
        // 替换掉alias => newAlias
        const newVal = getModulePath(node.value, filePath);
        node.value = newVal;
      }
    },
    leave(node, parent) {}
  });

  // 重新生成代码
  const newCodeStr = escodegen.generate(ast);
  const newPath = path.parse(filePath);
  // newPath.base = newPath.name + '.new' + newPath.ext;
  const newFilePath = path.format(newPath);
  fs.writeFileSync(newFilePath, newCodeStr, {});
}

const filePath = path.resolve(basePath, 'src/pages/main/pay/js/pay.js');
translateAlias(filePath);
