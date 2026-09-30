# 考务人员移动端轻量单页原型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `E:\泰豪工作目录\考试项目\需求设计\考评员端` 创建一个可直接打开、可点击走通任务响应流程的考务人员移动端原型。

**Architecture:** 使用一个独立的 `index.html`，把页面结构、样式、本地模拟数据和交互逻辑放在同一文件中，不接接口、不引入构建工具。页面用内存状态驱动四个底部页面，并用统一的任务详情抽屉/弹层承接接受、拒绝、撤销接受和查看考生名单。

**Tech Stack:** HTML5、CSS3、原生 JavaScript、内联 SVG 图标；不新增第三方依赖。使用固定的演示时间 `2026-09-30 14:00`，保证“当天未开始”“当天已开始”“未来任务”等示例状态在任何时间打开原型都稳定可复现。

**Spec:** `考试项目/需求设计/考评员端/docs/superpowers/specs/2026-09-30-examiner-mobile-prototype-design.md`

## Global Constraints

- 服务对象包含考评员、监考员和巡考员；三类人员共用同一套端，当前登录人员只看到分派给自己的考务任务。
- 角色由登录账号和权限决定，页面不提供考评员、监考员、巡考员之间的切换入口。
- 原型默认使用考评员账号演示；监考员和巡考员的专属任务内容、操作规则待后续需求确认后补充。
- 使用轻量单页实现，不引入复杂项目结构。
- 任务接受后可以查看考生名单；任务未接受前不能查看考生名单。
- 考评员接受任务后，在考试开始前可以撤销接受；撤销时需要填写原因，任务回到待处理状态。
- 不展示“开考”按钮，也不实现开考流程。
- 不自行规定“优秀、良好、待改进”等未经确认的分数段。
- 个人中心只展示：姓名、手机号、所属考点、累计考评次数、履职评分。

## Review Focus

- 待响应任务在接受前不能泄露考生名单；由任务详情流程的手工验收固定。
- 接受、拒绝、撤销接受后，任务状态、待办两个板块和任务数量必须同步变化；由任务状态验收固定。
- 考试开始时间已到后不能撤销接受，但已授权的考生名单仍可查看；由边界状态验收固定。
- 待考试任务按具体 `startAt` 判断，而不是按日期范围猜测；由固定演示时间下的过滤验收固定。
- 分析页不能出现未经确认的等级分段，个人中心不能出现额外资料字段；由页面内容验收固定。

---

### Task 1: 创建单页壳子、本地数据和四个页面

**Files:**
- Create: `考试项目/需求设计/考评员端/index.html`
- Test: 浏览器打开页面后的底部导航和默认内容手工验收

**Interfaces:**
- Produces `currentUser`：包含 `name`、`phone`、`examPoint`、`totalAssignments`、`dutyScore`，只为“我的”页面和顶部身份展示提供数据。
- Produces `tasks`：任务对象至少包含 `id`、`title`、`examDate`、`startAt`、`timeText`、`examPoint`、`subject`、`status`、`candidates`、`eventLog`、`rejectReason`、`cancelReason`。
- Produces `historyRecords`：历史考评记录包含考试名称、考点、日期、考生人数、平均分、最高分、最低分、合格人数、不合格人数和通过率。
- Produces `isBeforeExamStart(task, now)`、`getTodoBuckets(tasks, now)` 和 `getTaskBuckets(tasks)`，后续交互统一使用这些状态计算函数。

- [ ] **Step 1: 写页面基础结构**

  在 `index.html` 中创建手机外框、顶部身份区、可滚动主内容区、四项底部导航、任务详情弹层、原因选择弹层和轻提示容器。页面初始进入 `待办`，顶部展示“考务人员端”和默认考评员身份，不提供角色切换入口。

- [ ] **Step 2: 写固定演示数据和状态计算函数**

  创建以下本地数据：一条待响应任务、一条当天尚未开始的已接受任务、一条未来日期的已接受任务、一条考试开始时间已到的已接受任务、一条已完成任务和一条已拒绝任务；至少一条已接受任务带考生名单。固定 `demoNow = 2026-09-30T14:00:00`，让当天 `18:00` 的任务属于“待考试任务”，当天 `13:30` 的任务不属于“待考试任务”。

  `isBeforeExamStart(task, now)` 只比较 `task.startAt` 和 `now`；`getTodoBuckets` 返回：

  - `upcoming`: `status === 'accepted' && startAt > now`
  - `pending`: `status === 'pending'`

  `getTaskBuckets` 返回待响应、已接受、已拒绝、已完成四组任务，不因为任务已经开始而丢弃任务中心记录。

- [ ] **Step 3: 实现四个页面的静态渲染**

  完成 `renderTodoPage()`、`renderTasksPage()`、`renderAnalysisPage()`、`renderProfilePage()` 和 `renderApp()`：

  - 待办：显示“待考试任务”和“待处理考试”两个板块，卡片展示考试名称、具体日期、时间、考点、科目和状态。
  - 考务任务：用状态筛选查看待响应、已接受、已拒绝、已完成任务。
  - 分析：展示累计考评次数、本月考评次数、平均分、通过率、履职评分、最高分、最低分、合格/不合格人数、月度趋势和历史记录；不渲染优秀/良好/待改进分段。
  - 我的：只渲染姓名、手机号、所属考点、累计考评次数、履职评分。

- [ ] **Step 4: 完成第一轮手工检查**

  直接打开 `index.html`，确认四个底部入口可以切换；确认默认待办同时出现两个板块；确认已开始的已接受任务不在待考试任务板块中但在考务任务的已接受列表中；确认分析页和我的页面没有多余字段。

- [ ] **Step 5: Commit**

  ```powershell
  git add -- "考试项目/需求设计/考评员端/index.html"
  git commit -m "feat: scaffold exam affairs mobile prototype"
  ```

### Task 2: 完成任务详情和接受/拒绝/撤销流程

**Files:**
- Modify: `考试项目/需求设计/考评员端/index.html`
- Test: 任务详情、接受、拒绝、撤销接受和考生名单手工验收

**Interfaces:**
- Consumes `tasks`、`isBeforeExamStart()`、`getTodoBuckets()` 和 `renderApp()` from Task 1。
- Produces `openTaskDetail(taskId)`、`acceptTask(taskId)`、`openRejectSheet(taskId)`、`confirmReject(taskId, reason)`、`openCancelSheet(taskId)`、`confirmCancel(taskId, reason)` 和 `openCandidateList(taskId)`。
- `acceptTask` 只允许待响应任务变为已接受；`confirmReject` 只允许待响应任务变为已拒绝；`confirmCancel` 只允许已接受且 `startAt > demoNow` 的任务回到待响应。

- [ ] **Step 1: 写任务详情交互入口**

  给待办和考务任务卡片统一绑定 `openTaskDetail(taskId)`。详情根据状态显示：待响应时显示接受、拒绝和“接受后可查看考生名单”提示；已接受时显示任务信息、查看考生名单入口；已拒绝和已完成时显示结果和历史记录。

- [ ] **Step 2: 实现接受任务**

  `acceptTask(taskId)` 将待响应任务改为已接受，记录接受时间和操作日志，关闭详情弹层后重新渲染页面并提示“已接受任务”。接受后任务从待处理考试移到待考试任务（前提是 `startAt > demoNow`），并能打开考生名单。

- [ ] **Step 3: 实现拒绝任务原因弹层**

  拒绝原因使用单选项：`时间冲突`、`地点不便`、`临时有事`、`其他原因`。未选原因时不允许确认；确认后写入 `rejectReason` 和操作日志，把任务改为已拒绝，从待处理考试中移除，并在任务中心保留原因。

- [ ] **Step 4: 实现考试开始前撤销接受**

  已接受且尚未到 `startAt` 的任务显示“撤销接受”。撤销原因使用：`临时有事`、`时间冲突`、`其他原因`。确认后写入 `cancelReason` 和操作日志，把任务改回待响应，从待考试任务移到待处理考试，并保留“已接受后撤销”的记录；之后可以重新接受。

- [ ] **Step 5: 实现考试开始后的边界**

  对 `startAt <= demoNow` 的已接受任务隐藏撤销按钮，但保留任务信息和已授权考生名单入口。待响应任务默认使用尚未开始的演示时间，避免原型出现“开始后仍可接受”的未确认规则。

- [ ] **Step 6: 实现考生名单查看**

  `openCandidateList(taskId)` 只对已接受任务生效，打开名单弹层，展示姓名、脱敏证件号、考试科目和签到状态。待响应、已拒绝任务点击名单区域时只显示锁定提示，不渲染任何考生信息。

- [ ] **Step 7: 完成状态流程手工验收**

  按以下路径逐条检查：

  1. 从“待处理考试”打开任务详情，未接受前看不到名单。
  2. 接受任务后，待处理数量减少、待考试数量增加，名单可以打开。
  3. 刷新前在另一个待响应任务上选择拒绝原因，确认后任务进入已拒绝。
  4. 打开当天 `18:00` 的已接受任务，撤销并填写原因，任务回到待处理考试。
  5. 打开当天 `13:30` 的已接受任务，确认没有撤销按钮但仍可查看名单。
  6. 撤销后重新接受，确认操作记录仍显示在详情中。

- [ ] **Step 8: Commit**

  ```powershell
  git add -- "考试项目/需求设计/考评员端/index.html"
  git commit -m "feat: add exam task response flow"
  ```

### Task 3: 完成视觉打磨、响应式适配和运行说明

**Files:**
- Modify: `考试项目/需求设计/考评员端/index.html`
- Create: `考试项目/需求设计/考评员端/README.md`
- Test: 桌面浏览器手机外框、窄屏阅读和最终内容验收

**Interfaces:**
- Consumes all render functions and interaction handlers from Tasks 1–2。
- Produces a stable standalone prototype that can be opened without a build step and reviewed with the manual checklist in `README.md`。

- [ ] **Step 1: 完成视觉系统**

  使用深蓝主色、暖黄色重点色、浅灰蓝背景和白色卡片；用有层次的标题字体和清晰的中文正文排版；为待响应、已接受、已拒绝、已完成使用固定状态色。按钮、卡片和底部导航提供按压/悬停反馈，但不加入与任务无关的装饰动画。

- [ ] **Step 2: 完成手机外框和响应式布局**

  桌面宽屏居中显示手机外框，内容区可滚动，底部导航固定在手机底部；窄屏时隐藏外框阴影和多余留白，保证卡片、弹层和操作按钮可完整点击。处理长标题、长考点名称、无数据板块和弹层超出屏幕的问题。

- [ ] **Step 3: 写运行说明和手工验收清单**

  在 `README.md` 中写明：直接双击 `index.html` 即可打开；如需本地服务可在目录执行 `python -m http.server 4173`，再访问 `http://localhost:4173`。同时记录四个底部页面、任务状态流转、开始前可撤销/开始后不可撤销、名单权限和分析页字段的验收路径。

- [ ] **Step 4: 执行最终检查**

  运行：

  ```powershell
  git diff --check
  git status --short
  ```

  然后在浏览器中完成 README 的全部验收路径，确认页面文案中没有“行为预警”“开考”“开始考试”“评分操作”，没有“优秀/良好/待改进”分数段，也没有身份证号、证书编号、擅长专业、通知设置或账号安全等未确认个人字段。

- [ ] **Step 5: Commit**

  ```powershell
  git add -- "考试项目/需求设计/考评员端/index.html" "考试项目/需求设计/考评员端/README.md"
  git commit -m "feat: polish exam affairs mobile prototype"
  ```

## Self-Review Checklist

- 设计说明中的四个底部入口、两个待办板块、四种任务状态、撤销接受规则、分析字段和个人中心五个字段，都有对应实现任务。
- 没有新增角色切换入口，没有添加监考员或巡考员未经确认的专属操作。
- 任务状态和操作函数的名称在各任务之间保持一致：`pending`、`accepted`、`rejected`、`completed`；`acceptTask`、`confirmReject`、`confirmCancel`、`openCandidateList`。
- 所有状态变化都通过重新渲染派生待办列表和任务中心列表，避免页面上出现两份不同的任务状态。
- 固定演示时间用于稳定复现边界，不会把当前电脑日期误当成业务规则。
- 原型只做本地状态变化，不模拟真实接口成功或失败；真实接入时需要将任务状态动作替换为接口调用并补充接口失败处理。
