# Trilightlab · 3D Icons

持续维护的 Three.js 3D 图标橱窗。支持旋转、缩放、材质预览、PNG 截图和模型切换。

- 公开展示：https://yitao2020.github.io/trilight-3d-icons/
- 项目仓库：https://github.com/yitao2020/trilight-3d-icons
- 模型目录：`models.json`

## 本地开发

安装 Node.js 22，然后运行：

```sh
npm ci
npm start
```

访问 http://127.0.0.1:4174 。`npm run check` 检查语法、模型清单和资源路径并构建网站，输出位于 `dist/`。构建后的页面不依赖第三方 CDN。

## 新增 GLB 图标

1. 新建 `assets/图标英文名/`，放入 `model.glb` 和 `cover.png`。
2. 在 `models.json` 数组末尾追加一项，注意上一项后面加逗号：

```json
{
  "id": "new-icon",
  "type": "glb",
  "title": ["New", "Icon."],
  "label": "NEW ICON",
  "description": ["图标介绍。", "材质 / 风格"],
  "thumbnail": "assets/new-icon/cover.png",
  "src": "assets/new-icon/model.glb",
  "camera": [-2.35, 1.7, 8.3],
  "rotation": [0, 0, 0]
}
```

3. 执行 `npm run check`，本地浏览确认后提交并推送 `main`。GitHub Actions 会自动构建发布。

也可以在 GitHub 网页通过 **Add file → Upload files** 上传模型和图片，再编辑 `models.json`。不用上传 node_modules 或 dist。

使用内嵌贴图的普通 GLB；暂不支持 Draco/Meshopt/KTX2 压缩或动画播放。模型自动居中、统一显示尺寸；rotation 单位为弧度。建议单个模型控制在 20 MB 内，封面约 512 像素。GLB 使用自身材质，通透切换仅用于两款内置模型。

## 继续添加程序化模型

现有橙色容器在 `main.js`，涂鸦手雷外观在 `grenade.js`。新建模型模块并在 main.js 的 models Map 注册 `{group, setGlass?}`，再在 models.json 增加 type 为 builtin 的条目。后续提供参考图时，可继续在本项目中制作并发布。

## 发布、检查与回退

GitHub **Settings → Pages → Source** 使用 **GitHub Actions**。每次 main 提交触发 `.github/workflows/pages.yml`，可在 Actions 查看状态或手动 Run workflow 重发。只有成功完成的部署会更新公开页面；出现问题可撤销对应提交，再推送触发部署。

这是公开静态展示站，没有访客上传接口和后台数据库；新增内容通过仓库维护，访问者不能直接修改网站。原始参考图与部分图形含第三方品牌元素，其权利属于各自权利人。本仓库未额外授予模型或图片的商业使用许可。Three.js 的许可证随构建输出。
