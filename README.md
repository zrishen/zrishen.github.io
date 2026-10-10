# 钟日深 (Rishen Zhong) - 个人主页

这是个人学术与技术主页的源码，基于现代化静态框架 **Astro 5.x** 开发，通过 **GitHub Actions** 自动化构建并发布到 GitHub Pages。

- **在线访问**：[https://zrishen.github.io](https://zrishen.github.io)
- **技术栈**：Astro 5 + TypeScript + CSS 原生变量 + 自动化图片 WebP 压缩
- **特性**：
  - **内容与代码解耦**：所有履历数据独立管理，更新只需修改数据文件，无需触碰 HTML/CSS。
  - **秒级打开**：编译输出 0 运行时 JS 的纯净极速 HTML。
  - **资源深度优化**：头像大图在构建时自动从 2.6MB 压缩至 ~5KB（WebP 格式）。
  - **自动化部署**：每次代码 `git push` 到 `main` 分支后，GitHub Actions 自动完成打包与发布。

---

## 🛠 本地开发与预览

在项目根目录下：

```bash
# 安装依赖
npm install

# 启动本地开发服务 (默认 http://localhost:4321)
npm run dev

# 生产环境静态打包
npm run build

# 本地预览打包产物
npm run preview
```

---

## 🖥 方式一：在浏览器可视化后台编辑（最推荐）

本网站已接入纯静态可视化内容管理后台：
1. 访问后台网址：[https://zrishen.github.io/admin](https://zrishen.github.io/admin)
2. **首次登录**：页面会提示输入 GitHub Personal Access Token (PAT)：
   - 前往 GitHub 快速生成一个 Token：[GitHub Token Settings](https://github.com/settings/tokens/new?scopes=repo&description=zrishen-homepage-cms)
   - 勾选 `repo` 权限（允许更新仓库内容），点击生成并复制。
   - 粘贴到后台登录框中，即可登录（Token 仅保存在你的浏览器本地，安全可靠）。
3. 登录后会有类似表单的可视化界面，可以直接添加项目、编辑经历、修改文字。
4. 修改完成后点击右上角的 **“保存/发布 (Save)”**，后台会自动提交到 GitHub 并触发自动上线！

---

## 📝 方式二：在代码仓库中直接修改

所有个人信息均定义在 **`src/data/profile.json`** 文件中。更新履历时只需修改该文件：

- **个人信息**：姓名、职业、个人简介、联系方式（邮箱/GitHub/电话）。
- **教育背景**：就读学校、学位、时间跨度、专业及绩点/排名。
- **科研与实践项目**：项目名称、荣誉标签、周期时间、详细描述。
- **专业技能**：技能类别名称、图标与技术栈关键字。
- **荣誉与奖项**：获奖全称与获奖时间。

修改完成后，执行 Git 提交并推送：
```bash
git add .
git commit -m "docs: 更新个人项目与荣誉信息"
git push
```
GitHub Actions 会自动在 30 秒内完成云端打包并更新线上主页。

---

## ⚙️ GitHub Pages 首次配置说明

如果尚未配置过 GitHub Actions 部署源，请在 GitHub 仓库中确认一次：
1. 打开当前仓库的 **Settings** -> 左侧菜单 **Pages**。
2. 在 **Build and deployment** 下的 **Source** 下拉菜单中，选择 **GitHub Actions** 即可。
