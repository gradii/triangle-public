/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

const HIDDEN_TEXTAREA_STYLE = `
  min-height:0 !important;
  max-height:none !important;
  height:0 !important;
  visibility:hidden !important;
  overflow:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important
`;

const SIZING_STYLE = [
  'letter-spacing',
  'line-height',
  'padding-top',
  'padding-bottom',
  'font-family',
  'font-weight',
  'font-size',
  'text-rendering',
  'text-transform',
  'width',
  'text-indent',
  'padding-left',
  'padding-right',
  'border-width',
  'box-sizing'
];

const computedStyleCache: any = {};
let hiddenTextarea: any;

function calculateNodeStyling(node: any, useCache = false) {
  const nodeRef = node.getAttribute('id') || node.getAttribute('data-reactid') || node.getAttribute('name');

  if (useCache && computedStyleCache[nodeRef]) {
    return computedStyleCache[nodeRef];
  }

  const style = window.getComputedStyle(node);

  const boxSizing =
          style.getPropertyValue('box-sizing') ||
          style.getPropertyValue('-moz-box-sizing') ||
          style.getPropertyValue('-webkit-box-sizing');

  const paddingSize =
          parseFloat(style.getPropertyValue('padding-bottom')) +
          parseFloat(style.getPropertyValue('padding-top'));

  const borderSize =
          parseFloat(style.getPropertyValue('border-bottom-width')) +
          parseFloat(style.getPropertyValue('border-top-width'));

  const sizingStyle = SIZING_STYLE.map(name => `${name}:${style.getPropertyValue(name)}`).join(';');

  const nodeInfo = {
    sizingStyle,
    paddingSize,
    borderSize,
    boxSizing
  };

  if (useCache && nodeRef) {
    computedStyleCache[nodeRef] = nodeInfo;
  }

  return nodeInfo;
}
