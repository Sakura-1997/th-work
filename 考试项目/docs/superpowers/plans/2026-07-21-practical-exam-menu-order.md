# 实操考试菜单顺序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将实操考题管理调整为实操考试管理分组的首个菜单。

**Architecture:** 仅调整原型侧边导航 DOM 的四个按钮顺序，不修改 `data-view` 值、视图区块或导航切换代码。

**Tech Stack:** HTML5、原生 JavaScript、Node.js 静态断言。

## Global Constraints

- 菜单顺序固定为实操考题管理、实操抽题管理、实操厂商信息、考点厂商管理。
- 不改变任何视图内容、交互、权限、抽题或厂商接入规则。

---

### Task 1: 调整实操考试管理菜单顺序

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`
- Test: Node.js 内联静态断言

- [ ] **Step 1: 写出失败断言**

```powershell
$file = '需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
node -e "const h=require('fs').readFileSync(process.argv[1],'utf8');const a=h.indexOf('data-view=\"questions\"'),b=h.indexOf('data-view=\"draw\"');if(a>=0&&a<b)throw new Error('menu already reordered')" $file
```

预期：修改前失败，提示菜单尚未调整。

- [ ] **Step 2: 调整导航按钮 DOM 顺序**

将侧边导航按钮顺序替换为：

```html
<button class="nav" data-view="questions"><i data-lucide="list-checks"></i>实操考题管理</button>
<button class="nav active" data-view="draw"><i data-lucide="shuffle"></i>实操抽题管理</button>
<button class="nav" data-view="vendor-info"><i data-lucide="plug-zap"></i>实操厂商信息</button>
<button class="nav" data-view="point-vendor-management"><i data-lucide="network"></i>考点厂商管理</button>
```

- [ ] **Step 3: 运行通过断言并提交**

```powershell
$file = '需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
node -e "const h=require('fs').readFileSync(process.argv[1],'utf8');const order=['data-view=\"questions\"','data-view=\"draw\"','data-view=\"vendor-info\"','data-view=\"point-vendor-management\"'];let cursor=-1;for(const item of order){const next=h.indexOf(item);if(next<=cursor)throw new Error('wrong order '+item);cursor=next}console.log('PASS: practical exam menu order')" $file
git diff --check
git add -- $file
git commit -m "docs: reorder practical exam prototype menu"
```

预期：输出 `PASS: practical exam menu order` 且提交成功。
