const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 讓 Markdown 編輯器可以順利被編譯
};

module.exports = removeImports(nextConfig);
