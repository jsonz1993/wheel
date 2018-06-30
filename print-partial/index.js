/*
 * @Author: Jsonz 
 * @Date: 2018-06-30 13:25:01 
 * @Last Modified by:   Jsonz 
 * @Last Modified time: 2018-06-30 13:25:01 
 */
function printPartial(dom, { title= document.title,}= {}) {
  if (!dom) return;
  let copyDom = document.createElement('span');
  const styleDom = document.querySelectorAll('style, link, meta');
  const titleDom = document.createElement('title');
  titleDom.innerText = title;

  copyDom.appendChild(titleDom);
  Array.from(styleDom).forEach(item=> {
    copyDom.appendChild(item.cloneNode(true));
  });
  copyDom.appendChild(dom.cloneNode(true));

  const htmlTemp = copyDom.innerHTML;
  copyDom = null;

  const iframeDom = document.createElement('iframe');
  const attrObj = {
    height: 0,
    width: 0,
    border: 0,
    wmode: 'Opaque'
  };
  const styleObj = {
    position: 'absolute',
    top: '-999px',
    left: '-999px',
  };
  Object.entries(attrObj).forEach(([key, value])=> iframeDom.setAttribute(key, value));
  Object.entries(styleObj).forEach(([key, value])=> iframeDom.style[key] = value);
  document.body.insertBefore(iframeDom, document.body.children[0]);
  const iframeWin = iframeDom.contentWindow;
  const iframeDocs = iframeWin.document;
  iframeDocs.write(`<!doctype html>`);
  iframeDocs.write(htmlTemp);
  iframeWin.focus();
  iframeWin.print();
  document.body.removeChild(iframeDom);
}

printPartial(document.querySelector('#description'));