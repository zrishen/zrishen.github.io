import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = fileURLToPath(new URL('./public/', import.meta.url));

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

// public 目录下的插图自动补上 width/height：作者在 markdown 里只写 src / style / alt
// 这两个值不控制显示尺寸，只提供长宽比，让浏览器在图片加载前就预留正确高度，避免页面跳动
const dimCache = new Map();
const readDimensions = async (src) => {
  if (dimCache.has(src)) return dimCache.get(src);
  let dims = null;
  try {
    const { width, height } = await sharp(path.join(publicDir, decodeURIComponent(src))).metadata();
    if (width && height) dims = { width, height };
  } catch {
    // 文件不存在或不是图片，跳过
  }
  dimCache.set(src, dims);
  return dims;
};

// 注意：markdown 里写的原生 HTML 在语法树里是原样字符串（raw 节点），不是元素节点，
// 所以这里两种都要处理：元素节点走属性注入，raw 节点在标签字符串里补
const imgTagRe = /<img\b[^>]*>/gi;
const attrOf = (tag, name) => new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag)?.[1];

const rehypeImageSize = () => async (tree) => {
  const nodes = [];
  const collect = (node) => {
    if (node.type === 'raw' || (node.type === 'element' && node.tagName === 'img')) nodes.push(node);
    node.children?.forEach(collect);
  };
  collect(tree);

  for (const node of nodes) {
    // 元素节点（markdown 图片语法）：直接补属性
    if (node.type === 'element') {
      const src = node.properties?.src;
      if (typeof src !== 'string' || !src.startsWith('/')) continue;
      if (node.properties.width && node.properties.height) continue;
      const dims = await readDimensions(src);
      if (dims) {
        node.properties.width = dims.width;
        node.properties.height = dims.height;
      }
      continue;
    }

    // raw 节点（<img ...> 原生 HTML）：在每个标签字符串里补
    if (!/<img\b/i.test(node.value)) continue;
    let html = '';
    let cursor = 0;
    for (const match of node.value.matchAll(imgTagRe)) {
      const tag = match[0];
      html += node.value.slice(cursor, match.index);
      cursor = match.index + tag.length;

      const src = attrOf(tag, 'src');
      const hasSize = /\swidth\s*=/i.test(tag) || /\sheight\s*=/i.test(tag);
      // 只处理站内绝对路径（public 目录），外链和已写明尺寸的图不动
      const dims = src?.startsWith('/') && !hasSize ? await readDimensions(src) : null;
      html += dims ? tag.replace(/<img/i, `<img width="${dims.width}" height="${dims.height}"`) : tag;
    }
    node.value = html + node.value.slice(cursor);
  }
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
    rehypePlugins: [rehypeExternalBlank, rehypeImageSize]
  }
});

