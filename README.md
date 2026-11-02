# Lyra 的博客

二次元个人博客，包含毛玻璃首页、日夜主题、文章、归档、项目、相册与本地写作管理台。

- 在线博客：https://lyraselene.github.io/Lyra-blog/
- 前台源码：`XHBlogs/`
- 本地写作管理台：`my-blog-manager/`
- 本机使用方式：[使用说明](使用说明.md)

## GitHub Pages

推送到 `main` 后，GitHub Actions 自动构建并部署静态网站。仓库 Settings → Pages 的 Source 应设置为 **GitHub Actions**。

```sh
cd XHBlogs
npm ci
cd ..
node scripts/build-pages.mjs
```

静态输出位于 `.local/pages-build/out`。构建会生成 `/Lyra-blog` 子路径的链接与素材地址。普通 Next.js 构建保持可用。

Pages 提供公开阅读网站，本地管理台用于修改资料与写作。音乐 API、AI 聊天和 OAuth 代理需要服务端，因此 Pages 版本不包含这些服务端功能；音乐显示空歌单。若需要完整服务端功能，可将 `XHBlogs` 部署到 Vercel 或 Node.js 服务器。

## 本地运行

```sh
cd XHBlogs
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3100
```

本地管理台另需在 `my-blog-manager` 安装 npm 依赖和 Python 依赖，详情见使用说明。启动脚本会在本机创建 API 端口与同步目录配置。

## 原项目与许可

基于 [XinghuisamaBlogs](https://github.com/heiehiehi/XinghuisamaBlogs) 修改，原作者 **XingHuiSama**。参考视频：[BV1RMorB7E1K](https://www.bilibili.com/video/BV1RMorB7E1K/)。

原项目采用 [CC BY-NC 4.0](LICENSE)，限非商业使用。修改包括个人资料、已有本地图片接入、本地字体、编辑器与类型兼容修复、管理配置读写与同步备份，以及 GitHub Pages 发布适配。
