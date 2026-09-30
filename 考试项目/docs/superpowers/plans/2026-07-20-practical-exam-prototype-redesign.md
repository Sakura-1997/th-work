# 实操考试 V2 原型改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有实操随机抽题审核原型改造成与 V2 需求一致的交互原型，体现按学员抽题、无审核、双层厂商接入配置和按题目实例回传成绩。

**Architecture:** 原型继续使用单一 HTML 文件中的语义化结构、CSS 和原生 JavaScript，不引入构建工具。抽题视图维护考试计划级摘要和按学员展开的结果；厂商配置分为平台厂商主数据与考试点厂商接入配置，题库只保留评分方式。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、Lucide CDN、Playwright CLI。

## Global Constraints

- 抽题必须按“每名学员 x 每个科目大类”独立进行，学员之间允许抽到相同题目。
- 不出现审核、驳回、审核意见、审核状态、厂商题目编码、设备题组、设备编号、设备调度或设备可用状态。
- 设备平台评分题应展示唯一题目实例 ID；原型中的“推送范围”为该考试点全部启用厂商。
- 厂商重复回传同一题目实例在原型文案中是接口异常，不应表现为成绩竞争或人工裁决。
- 不新增依赖、不修改已确认的 V2 需求文档；页面文案使用中文，证件号示例必须脱敏。

---

## 文件结构

| 路径 | 职责 |
| --- | --- |
| `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html` | 唯一交互原型。包含抽题管理、考题管理、厂商管理和考点厂商接入配置视图，以及所有静态交互。 |
| `需求设计/实操考试相关/实操考试抽题与设备成绩接入V2需求设计.md` | 已确认的产品契约；实施时仅作核对依据。 |
| `output/playwright/practical-exam-v2/` | 浏览器验收截图和 CLI 工件，运行时生成，不提交到版本库。 |

当前工作区没有业务系统的前后端源码、数据库迁移或测试工程。因此本计划只覆盖需求原型改造。真实系统开发必须在目标代码仓中另建计划，并沿用 V2 文档第 7 至 9 节定义的对象、约束和接口字段。

### Task 1: 重构抽题管理与考题管理原型

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`
- Test: `output/playwright/practical-exam-v2-draw.png`

**Interfaces:**
- Consumes: `drawBatch`, `candidateDrawResult` 和 `questionInstance` 的展示字段，见 V2 需求第 7 节。
- Produces: 考试计划级抽题视图、按学员展开的抽题结果弹窗，以及不含厂商映射的考题配置视图。

- [ ] **Step 1: 写出原型验收清单并确认旧页面不符合 V2**

在浏览器中打开原型，记录以下旧元素必须被移除：`审核状态`筛选和列表列、`审核`操作、审核记录时间线、审核结论表单、`确认并提交考试中心审核`按钮、考题列表的`设备厂商`和`厂商题目编码`列、考题弹窗的两个厂商字段。

运行：

```powershell
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 open "file:///E:/泰豪工作目录/考试项目/需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 snapshot
```

预期：快照中存在上述旧审核和题库厂商映射元素，证明当前原型与 V2 不一致。

- [ ] **Step 2: 改造抽题列表与抽题弹窗**

在 `#draw` 视图完成以下替换：

```html
<th>抽题进度</th>
<th>最近抽题时间</th>
<th>操作人</th>
<th>操作</th>
```

列表行使用 `未抽题`、`48 / 48 名学员已完成`、`已进入考试，不可重抽` 等业务状态文案，不使用任何审核状态。将抽题弹窗底部按钮替换为：

```html
<button class="primary" id="confirmDraw" disabled>
  <i data-lucide="shuffle"></i>确认生成 48 名学员题目
</button>
```

点击“开始随机抽取”后，JavaScript 必须基于 `candidateDrawResults` 示例数组生成至少三名不同学员的结果；每名学员按 K1 至 K4 展示题目、评分方式和 `questionInstanceId`。抽题完成提示使用“抽题结果已生效，已生成学员题目实例”，不得出现提交审核或下一级审核文案。

```js
const candidateDrawResults = [
  { candidate: '张*', idCard: '3601**********1023', questions: [
    { category: 'K1', question: '绝缘手套检查与佩戴', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-001-01' },
    { category: 'K2', question: '高压开关柜停送电操作', scoreSource: '设备平台评分', questionInstanceId: 'PQI-20260720-001-02' },
    { category: 'K3', question: '触电急救现场处置', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-001-03' },
    { category: 'K4', question: '电气火灾初期处置', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-001-04' }
  ]},
  { candidate: '李*', idCard: '3601**********2048', questions: [
    { category: 'K1', question: '高压验电器安全使用', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-002-01' },
    { category: 'K2', question: '高压断路器分合闸操作', scoreSource: '设备平台评分', questionInstanceId: 'PQI-20260720-002-02' },
    { category: 'K3', question: '高压设备异常声光判断', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-002-03' },
    { category: 'K4', question: '作业现场安全风险辨识', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-002-04' }
  ]},
  { candidate: '王*', idCard: '3601**********3886', questions: [
    { category: 'K1', question: '绝缘杆检查与使用', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-003-01' },
    { category: 'K2', question: '倒闸操作票填写与复核', scoreSource: '设备平台评分', questionInstanceId: 'PQI-20260720-003-02' },
    { category: 'K3', question: '作业现场隐患排查', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-003-03' },
    { category: 'K4', question: '设备故障应急处置', scoreSource: '考评员评分', questionInstanceId: 'PQI-20260720-003-04' }
  ]}
];
```

- [ ] **Step 3: 改造考题列表和新增考题弹窗**

删除题库的厂商列和厂商表单字段，仅保留评分方式：

```html
<th>评分方式</th>
<th>创建时间</th>
<th>操作</th>
```

```html
<div class="form-item">
  <label class="required">评分方式</label>
  <select id="scoreSource">
    <option value="manual">考评员评分</option>
    <option value="device">设备平台评分</option>
  </select>
</div>
```

删除 `vendor-field` 样式、DOM 和 `scoreSource` 切换厂商字段显隐的事件处理。设备平台评分题仍显示考试标准和否定项，但不出现任何厂商选择控件。

- [ ] **Step 4: 运行浏览器验收并保存截图**

重新打开原型，先获取新快照，再点击快照中“抽取考题”对应的最新元素引用、点击“开始随机抽取”对应的最新元素引用，并验证弹窗出现“确认生成 48 名学员题目”和题目实例 ID。快照引用每次打开弹窗后都会变化，必须重新执行 `snapshot` 后再点击。

运行：

```powershell
New-Item -ItemType Directory -Force "output/playwright/practical-exam-v2" | Out-Null
Push-Location "output/playwright/practical-exam-v2"
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 snapshot
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 screenshot
Pop-Location
```

预期：抽题结果按学员展示；页面和弹窗中不存在审核字段、按钮或审核时间线；考题管理不展示厂商和厂商题目编码。

- [ ] **Step 5: 提交本任务**

```powershell
git add -- "需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
git commit -m "docs: update practical exam draw prototype"
```

### Task 2: 新增厂商管理与考点厂商接入配置原型

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`
- Test: `output/playwright/practical-exam-v2-vendors.png`

**Interfaces:**
- Consumes: `device_vendor` 和 `exam_point_vendor_connection` 字段，见 V2 需求第 7.4 节。
- Produces: 平台级厂商主数据视图和考试点直接维护的接入配置视图；两者均不含设备资源配置。

- [ ] **Step 1: 写出厂商配置原型的失败验收**

在当前完成 Task 1 的页面中，导航不存在“设备厂商管理”，且无法查看厂商主数据和考点厂商接入配置。

运行：

```powershell
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 open "file:///E:/泰豪工作目录/考试项目/需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 snapshot
```

预期：快照没有“设备厂商管理”入口，证明该功能尚未呈现。

- [ ] **Step 2: 添加厂商管理导航和双页签视图**

新增导航按钮和视图容器：

```html
<button class="nav" data-view="vendors"><i data-lucide="plug-zap"></i>设备厂商管理</button>

<section class="view" id="vendors">
  <div class="headline"><div><h1>设备厂商管理</h1><p>维护厂商接入信息和本考点启用的厂商，不管理设备资源。</p></div></div>
  <div class="tabs">
    <button class="tab active" data-vendor-tab="master">厂商信息</button>
    <button class="tab" data-vendor-tab="connection">考点厂商接入配置</button>
  </div>
  <div id="vendorMasterPanel"></div>
  <div id="vendorConnectionPanel" hidden></div>
</section>
```

为 `.tabs`、`.tab`、`.tab.active`、`.connection-status` 添加与现有边框、5 至 6 像素圆角和蓝绿色调一致的 CSS。不得使用渐变、设备卡片或设备状态控件。

- [ ] **Step 3: 填充厂商和接入配置数据，并实现页签交互**

厂商信息表列固定为：厂商名称、厂商编码、推送地址、回调地址、鉴权方式、启停状态、最近联调结果、操作。考点接入配置表列固定为：考试点、设备厂商、厂商侧考点/租户标识、启停状态、备注、操作。

使用以下静态数据驱动表格：

```js
const vendors = [
  { name: '泰豪实训平台', code: 'TH', pushUrl: 'https://vendor.example.com/tasks', callbackUrl: 'https://exam.example.com/vendor/score', auth: 'HMAC 签名', status: '启用', checkedAt: '2026-07-20 14:20' },
  { name: '实训设备平台 B', code: 'VENDOR_B', pushUrl: 'https://vendor-b.example.com/tasks', callbackUrl: 'https://exam.example.com/vendor/score', auth: 'API Key', status: '启用', checkedAt: '2026-07-20 13:55' }
];
const pointVendorConnections = [
  { point: '高新实操考点', vendor: '泰豪实训平台', tenantCode: 'GX-TH-001', status: '启用', remark: '设备考试成绩接入' },
  { point: '高新实操考点', vendor: '实训设备平台 B', tenantCode: 'GX-VB-002', status: '启用', remark: '设备考试成绩接入' }
];
```

页签切换函数必须只切换 `vendorMasterPanel.hidden` 和 `vendorConnectionPanel.hidden`，并切换当前 `.tab` 的 `active` 类。新增/编辑弹窗中只出现 V2 定义的字段；不得出现设备编号、设备可用状态、厂商题目编码或操作项目映射。

- [ ] **Step 4: 增加厂商推送与回传日志摘要**

在厂商管理页下方增加“最近接口记录”表，展示：时间、厂商、学员、题目实例 ID、动作、处理结果、说明。必须包含以下两种示例：

```js
{ action: '题目推送', result: '推送成功', note: '已向本考点全部启用厂商推送设备评分题' }
{ action: '成绩回传', result: '接口异常', note: '该题目实例已有正式成绩，拒绝重复回传' }
```

第二条文案用于说明跨厂商同一题目实例的后到回传会被拒绝，不展示“待人工裁决”“成绩竞争”或“选择正式成绩”。

- [ ] **Step 5: 运行浏览器验收并保存截图**

重新打开原型，获取快照，点击快照中“设备厂商管理”的最新元素引用，获取新快照，再点击“考点厂商接入配置”的最新元素引用。

运行：

```powershell
New-Item -ItemType Directory -Force "output/playwright/practical-exam-v2" | Out-Null
Push-Location "output/playwright/practical-exam-v2"
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 snapshot
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 screenshot
Pop-Location
```

预期：页签显示厂商主数据和考点厂商接入配置；页面不显示任何设备资源、可用状态、调度或题目厂商映射字段。

- [ ] **Step 6: 提交本任务**

```powershell
git add -- "需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
git commit -m "docs: add practical exam vendor prototype"
```

### Task 3: 完成原型回归验收与需求交叉核对

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`
- Verify: `需求设计/实操考试相关/实操考试抽题与设备成绩接入V2需求设计.md`
- Test: `output/playwright/practical-exam-v2-final.png`

**Interfaces:**
- Consumes: Task 1 的抽题和题库视图，Task 2 的厂商与接入配置视图。
- Produces: 与 V2 需求一致、可演示的单页交互原型。

- [ ] **Step 1: 为关键交互写出验收场景**

逐项核对以下场景：

```text
1. 在实操抽题管理中开始抽题，抽题结果按学员展示，且设备评分题有题目实例 ID。
2. 在实操考题管理中切换设备平台评分，不出现厂商选择和厂商题目编码输入。
3. 在设备厂商管理中查看厂商信息和考点厂商接入配置，不出现设备资源字段。
4. 接口记录中的同一题目实例重复回传显示“接口异常”和“拒绝重复回传”。
```

- [ ] **Step 2: 执行完整浏览器回归**

运行以下命令。每次点击前先运行 `snapshot` 并使用该快照中的最新元素引用；这是因为弹窗和页签切换后旧引用无效。

```powershell
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 open "file:///E:/泰豪工作目录/考试项目/需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 snapshot
New-Item -ItemType Directory -Force "output/playwright/practical-exam-v2" | Out-Null
Push-Location "output/playwright/practical-exam-v2"
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 screenshot
Pop-Location
npx --yes --package @playwright/cli playwright-cli --session practical-exam-v2 console
```

预期：四个场景均可完成；浏览器控制台无 JavaScript 错误；最终截图中无元素重叠、文字截断或旧审核文案。

- [ ] **Step 3: 扫描禁止词并修复原型残留**

运行：

```powershell
rg -n "审核|驳回|厂商题目编码|设备题组|设备编号|设备可用状态|设备调度|待人工裁决|成绩竞争" "需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
```

预期：命令无输出。若仍有输出，删除相应 DOM、JavaScript、示例文案或 CSS 标识后，重新运行本步骤和 Step 2。

- [ ] **Step 4: 提交最终原型**

```powershell
git add -- "需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html"
git commit -m "docs: finalize practical exam v2 prototype"
```

## 后端开发前置条件

本仓库没有可修改的系统源码，不能安全地指定控制器、服务、数据库迁移和 App 文件路径。后端开发启动前，需提供考试平台目标仓库及以下边界：

1. 考试计划、报名学员、实操考题和成绩的现有表及服务位置。
2. 考评员 App 的题目拉取和成绩提交接口位置。
3. 厂商 API 网关、密钥管理、异步任务队列和操作日志的既有实现。

取得目标仓库后，应基于 V2 需求第 7 至 9 节新建源码级实施计划；该计划需覆盖题目实例唯一约束、抽题批次作废、厂商批量推送、成绩幂等、重复厂商回传拒收、权限校验和端到端测试。
