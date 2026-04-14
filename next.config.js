const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 這是為了讓 Markdown 編輯器能正常運作的特殊設定
};

module.exports = removeImports(nextConfig);
