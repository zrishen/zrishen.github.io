import { defineConfig } from 'astro/config';

// 正文外链自动开新标签页（http/https 链接；站内链接不受影响）
const rehypeExternalBlank = () => (tree) => {
  const walk = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string' &&
      /^https?:/.test(node.properties.href)
    ) {
      node.properties.target = '_blank';
      node.properties.rel = 'noopener noreferrer';
    }
    node.children?.forEach(walk);
  };
  walk(tree);
};

// https://astro.build/config
export default defineConfig({
  site: 'https://zrishen.github.io',
  base: '/',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  devToolbar: {
    enabled: false
  },
  markdown: {
    rehypePlugins: [rehypeExternalBlank]
  }
});

