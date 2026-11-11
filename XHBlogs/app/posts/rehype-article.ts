import type { Element, Root, RootContent } from 'hast';

const siteOrigin = 'https://lyraselene.github.io';

export default function rehypeArticle() {
  return (tree: Root) => {
    function visit(parent: Root | Element) {
      parent.children = parent.children.map((node): RootContent => {
        if (node.type !== 'element') return node;
        if (node.tagName === 'a' && typeof node.properties.href === 'string') {
          const href = node.properties.href;
          if (/^(https?:)?\/\//i.test(href)) {
            const url = new URL(href, siteOrigin);
            if (url.origin !== siteOrigin) {
              node.properties.target = '_blank';
              const rel = node.properties.rel;
              node.properties.rel = [...new Set([
                ...(Array.isArray(rel) ? rel.map(String) : String(rel || '').split(/\s+/)).filter(Boolean),
                'noopener', 'noreferrer',
              ])];
            }
          }
        }
        visit(node);
        if (node.tagName === 'table') {
          return {
            type: 'element', tagName: 'div',
            properties: {
              className: ['article-table-scroll'], tabIndex: 0,
              role: 'region', ariaLabel: '文章表格，可左右滚动',
            },
            children: [node],
          };
        }
        return node;
      });
    }
    visit(tree);
  };
}
