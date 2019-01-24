const path = require('path');
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const template = require('babel-template');
const t = require('babel-types');
const prettier = require('prettier');
const glob = require("glob");

console.time('处理时间');

// 这里是获取项目中的 prettier Config
const getPrettierConfig = require('./getPrettierConfig');
const prettierConfig = getPrettierConfig();

const basePath = process.cwd();
const MAX_RELATIVE = 4;

// 获取webpack原有alias数据
const webpackConfigPath = path.resolve(basePath, './make-webpack.config');
const getWebpackConfig = require(webpackConfigPath);
const aliasConfig = getWebpackConfig().resolve.alias;
const aliasKey = Object.keys(aliasConfig);

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
// oldAlias 2 newAlias
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

function getModulePath(originAlias, filePath) {
  const firstDir = /\w*/.exec(originAlias)[0];

  const modulePath = originAlias.replace(firstDir, aliasConfig[firstDir]);
  const aliasPath = originAlias.replace(firstDir, aliasMap[firstDir]);

  if (!aliasConfig[firstDir] || !aliasMap[firstDir] || allowAliasKey.includes(firstDir)) return false;

  // 获取引入的模块与当前模块相对路径，判断是否太长，是就返回alias，否则就返回相对路径就完事了
  const relativePath = path.relative(filePath, modulePath);
  const relativeTime = relativePath.split('../').length - 1;
  return (relativeTime < MAX_RELATIVE)? relativePath: aliasPath;
}

// 转换requireModulePath
function translateRequireModulePath(nodePath, filePath) {
  // 判断 require()
  if (!nodePath.isIdentifier({ name: 'require' })) return false;

  // 获取value => require(value) && 排除require.ensure的类型
  const originalModulePathNode = nodePath.parent.arguments && nodePath.parent.arguments[0];
  // 判断类型是否是我们想要的
  if (!t.isStringLiteral(originalModulePathNode)) return false;

  const originAlias = originalModulePathNode.value;
  const newAlias = getModulePath(originAlias, filePath);

  newAlias && (originalModulePathNode.value = newAlias);
}

// 转换importModulePath
function translateImportModulePath(nodePath, filePath) {
  if (!nodePath.isImportDeclaration()) return false;

  const originSourceNode = nodePath.node.source;
  // 判断类型
  if (!t.isLiteral(originSourceNode)) return
  const originAlias = originSourceNode.value;
  const newAlias = getModulePath(originAlias, filePath);
  newAlias && (originSourceNode.value = newAlias);
}

function translateAlias(filePath) {
  console.log(`开始处理第${i++}个: ${filePath}`)
  const code = fs.readFileSync(filePath).toString();

  // 获取ast
  const ast = babylon.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'objectRestSpread']
  });

  traverse(ast, {
    enter(path) {
      translateRequireModulePath(path, filePath);
      translateImportModulePath(path, filePath);
    }
  });

  const newCode = generate(ast, {});
  const prettierCode = prettier.format(newCode.code, prettierConfig);
  fs.writeFileSync(filePath, prettierCode);
  console.log(`处理结束${filePath}`)
}

const jsFileBasePath = path.resolve(basePath, 'src');
const allJsFilesList = glob.sync("{pages,global,components}/**/**/*.js", {
  cwd: jsFileBasePath,
  nodir: true,
  matchBase: true,
});

let i = 0;
allJsFilesList.forEach(filePath=> translateAlias(path.resolve(jsFileBasePath, filePath)));
console.timeEnd('处理时间');