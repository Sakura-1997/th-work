# 实操考题审核原型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在实操考题管理原型中加入考试点申请、地市考试中心审核、地市发证机关审核的两级审核流程。

**Architecture:** 保持实操抽题页面无审核。考题页面增加申请状态、审核记录和角色模拟操作；考题申请在审核通过后才成为当前考试点的可抽题考题。

**Tech Stack:** HTML5、原生 JavaScript、Lucide CDN、Node.js 静态断言。

## Global Constraints

- 新增、修改、停用均按考试点、地市考试中心、地市发证机关的两级审核流转。
- 停用审核通过后停止进入候选池，不物理删除历史数据。
- 抽题不走审核，只从当前考试点已审核通过且启用的考题中抽取。

---

### Task 1: 增加实操考题两级审核原型

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`

- [ ] **Step 1: 写出失败断言**

```powershell
$file='需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
node -e "const h=require('fs').readFileSync(process.argv[1],'utf8');if(h.includes('待地市考试中心审核'))throw new Error('review flow already exists')" $file
```

- [ ] **Step 2: 实现申请状态与审核操作**

在实操考题列表展示申请类型、审核状态和操作。新增/修改/停用申请进入“待地市考试中心审核”；通过后进入“待地市发证机关审核”；最终通过后生效。驳回显示意见并允许考试点修改后重新提交。

- [ ] **Step 3: 保留抽题边界**

仅把当前考试点、已审核通过、已启用的考题作为抽题候选；抽题页面不增加审核状态或审核操作。

- [ ] **Step 4: 验证与提交**

```powershell
$file='需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
node -e "const h=require('fs').readFileSync(process.argv[1],'utf8');for(const value of ['待地市考试中心审核','待地市发证机关审核','地市发证机关审核通过','停用申请','审核意见']){if(!h.includes(value))throw new Error('missing '+value)}const scripts=[...h.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);scripts.forEach(s=>new Function(s));console.log('PASS: practical question review prototype')" $file
git diff --check
git add -- $file
git commit -m "docs: add practical question review prototype"
```
