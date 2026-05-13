# 企业战略自助诊断H5

面向中小企业老板的战略自助诊断工具，纯前端SPA，部署在GitHub Pages上。

## 功能

- **10道题，约3分钟**完成诊断
- 基于GE-麦肯锡矩阵简化版生成**四象限诊断报告**
- 输出**雷达图**（8维度分析） + **3个战略方向建议**
- 包含L2付费版引导和打赏功能
- 移动端优先，适配手机屏幕

## 技术栈

- HTML5 + CSS3 + 原生JavaScript（ES5）
- Tailwind CSS CDN
- Chart.js CDN（雷达图）
- Canvas API（四象限图）
- 零构建工具

## 部署方法

### GitHub Pages

1. 将 `strategy-diagnosis-h5/` 目录的所有文件推送到GitHub仓库
2. 在仓库 Settings → Pages 中选择分支（如 `main`）和根目录 `/`
3. 等待几分钟即可访问

### 本地预览

直接用浏览器打开 `index.html` 即可。

> **注意**：本地 `file://` 协议下CDN资源可能加载失败，建议使用简单的HTTP服务器：
> ```
> python -m http.server 8080
> ```
> 然后访问 `http://localhost:8080`

## 文件结构

```
strategy-diagnosis-h5/
├── index.html          # 主页面，包含所有section
├── css/
│   └── style.css       # 自定义样式（移动端优先）
├── js/
│   ├── data.js         # 题目数据、报告文案模板
│   ├── calculator.js   # 评分算法、象限判断
│   ├── app.js          # 页面状态机、用户交互
│   └── report.js       # 报告渲染（四象限图、雷达图、文本）
├── images/
│   └── zhifu-code.svg  # 微信收款码占位图（需替换）
└── README.md
```

## 页面流程

```
welcome → step1 → step2 → step3 → step4 → loading → report
```

## 更换收款码

1. 准备你的微信收款码图片
2. 将图片放到 `images/` 目录
3. 修改 `js/report.js` 中 `renderDonation()` 函数里的 `<img src="...">` 路径

## 许可

仅供个人使用。
