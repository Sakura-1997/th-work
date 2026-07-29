# 实操厂商菜单拆分 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将厂商主数据和考点厂商配置拆为“实操厂商信息”和“考点厂商管理”两个独立菜单，统一归入“实操考试管理”。

**Architecture:** 原型继续使用单一 HTML 文件和原生 JavaScript。现有厂商主数据渲染函数与考点接入配置渲染函数分别挂载到两个独立视图；删除原合并菜单和页签切换状态。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、Lucide CDN、Node.js 静态断言。

## Global Constraints

- 一级分组名称固定为“实操考试管理”，菜单顺序为实操抽题管理、实操厂商信息、考点厂商管理、实操考题管理。
- 实操厂商信息仅维护厂商主数据和接口记录；考点厂商管理仅维护考试点厂商接入配置。
- 不改变抽题、评分、厂商推送、成绩回传或接口记录规则。
- 不新增厂商与题目映射、设备资源、设备调度或审核流程。
- 页面文案使用中文，不引入新依赖。

---

### Task 1: 拆分厂商菜单与独立视图

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`
- Test: Node.js 内联静态断言

**Interfaces:**
- Consumes: 现有 `renderVendorMaster()`、`renderConnections()`、`vendors`、`pointVendorConnections`、`interfaceRecords`。
- Produces: `vendor-info` 与 `point-vendor-management` 两个 `data-view` 视图，无 `data-vendor-tab`、`vendorMasterPanel` 或 `vendorConnectionPanel` 页签容器。

- [ ] **Step 1: 写出失败断言**

```powershell
$file = '需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
node -e "const fs=require('fs');const h=fs.readFileSync(process.argv[1],'utf8');for(const value of ['data-view=\"vendor-info\"','data-view=\"point-vendor-management\"']){if(!h.includes(value))throw new Error('missing '+value)}" $file
```

预期：修改前命令失败，提示缺少两个独立视图。

- [ ] **Step 2: 改造导航和视图结构**

将侧边导航替换为以下结构：

```html
<div class="group">实操考试管理</div>
<button class="nav active" data-view="draw">实操抽题管理</button>
<button class="nav" data-view="vendor-info">实操厂商信息</button>
<button class="nav" data-view="point-vendor-management">考点厂商管理</button>
<button class="nav" data-view="questions">实操考题管理</button>
```

新增 `#vendor-info` 与 `#point-vendor-management` 两个独立 `section.view`。前者标题为“实操厂商信息”，只调用 `renderVendorMaster()`；后者标题为“考点厂商管理”，只调用 `renderConnections()`。删除原合并厂商视图、`tabs`、`data-vendor-tab` 事件处理和两个页签容器。

- [ ] **Step 3: 更新导航状态与页面标题映射**

将导航标签映射替换为：

```js
const labels = {
  draw: '实操抽题管理',
  'vendor-info': '实操厂商信息',
  'point-vendor-management': '考点厂商管理',
  questions: '实操考题管理'
};
```

通用 `data-view` 点击处理必须只激活对应的 `.nav` 与 `.view`，并更新 `#crumb`。厂商新增、编辑和考点接入配置新增、编辑的现有模态框行为保持可用。

- [ ] **Step 4: 运行通过断言**

```powershell
$file = '需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
node -e "const fs=require('fs');const h=fs.readFileSync(process.argv[1],'utf8');const required=['实操考试管理','data-view=\"vendor-info\"','data-view=\"point-vendor-management\"','实操厂商信息','考点厂商管理','renderVendorMaster','renderConnections'];const forbidden=['data-vendor-tab','vendorMasterPanel','vendorConnectionPanel','设备厂商管理'];for(const value of required){if(!h.includes(value))throw new Error('missing '+value)}for(const value of forbidden){if(h.includes(value))throw new Error('stale '+value)}const scripts=[...h.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);scripts.forEach(s=>new Function(s));console.log('PASS: split vendor menus and '+scripts.length+' inline scripts parsed')" $file
git diff --check
```

预期：输出 `PASS: split vendor menus and 1 inline scripts parsed`，并且 `git diff --check` 退出码为 0。

- [ ] **Step 5: 提交**

```powershell
git add -- "需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
git commit -m "docs: split practical vendor menus"
```
