# Practical Exam Identity-Verification Draw Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change practical-question generation from plan-wide pre-drawing to per-candidate generation after every successful identity verification.

**Architecture:** The exam plan continues to hold subject-category draw counts and the fixed candidate roster. A successful identity verification creates a new candidate-specific draw round and question instances; before generating it, the system invalidates that candidate's previous unstarted, unscored and score-unreceived instances. Candidate instances that have started or have any score are immutable and block another verification-triggered draw.

**Tech Stack:** Markdown requirements documentation; standalone HTML/CSS/JavaScript interactive prototype; Lucide icons.

## Global Constraints

- Keep the candidate roster fixed after the exam plan is confirmed.
- Draw independently by candidate and subject category; do not duplicate questions within a candidate/category draw round.
- Use `questionInstanceId` as the unique key for external-platform task and score association.
- Do not select or manage physical devices in the platform.
- A verification-triggered draw must not overwrite an instance that is started, scored or has received a device-platform score.
- Device-platform score questions are pushed only after their candidate-specific question instances are generated.

---

### Task 1: Revise the V2 business requirements

**Files:**
- Modify: `需求设计/实操考试相关/实操考试抽题与设备成绩接入V2需求设计.md`

**Interfaces:**
- Consumes: successful candidate identity verification and the configured category draw counts.
- Produces: a candidate draw round, candidate draw results, and candidate question instances.

- [ ] **Step 1: Replace plan-wide draw language with verification-triggered draw language**

Update the background, scope, role description and draw rules so that a candidate's questions are generated only after a successful identity verification. Remove the plan-level manual "开始抽题/重新抽题" behavior.

- [ ] **Step 2: Define the re-verification state boundary**

Add the following rule under draw rules:

```text
同一考生每次身份验证成功均触发一次新的考生抽题。系统先检查该考生当前有效题目实例：
1. 若均为待考且未接收成绩，作废该考生上一轮抽题结果及题目实例，再重新抽题；
2. 若任一题目实例已开始考试、已评分或已接收设备平台成绩，拒绝本次重新抽题，保留原题目实例；
3. 身份验证失败、身份与考试计划名单不匹配或已取消资格时，不生成题目实例。
```

- [ ] **Step 3: Align dispatch, page and data definitions**

Specify that platform task dispatch occurs after each candidate draw round; revise the draw-management page as monitoring and result lookup; add a candidate draw-round identifier and invalidation metadata to the data model.

- [ ] **Step 4: Verify document consistency**

Run:

```powershell
rg -n '整场抽题|开始抽题|重新抽题|身份验证|考生抽题轮次|抽题成功后' '需求设计\实操考试相关\实操考试抽题与设备成绩接入V2需求设计.md'
```

Expected: all remaining draw wording describes a candidate verification event, and no rule permits rewriting started or scored instances.

### Task 2: Align the external API review conclusion

**Files:**
- Modify: `需求设计/实操考试相关/实操平台对接API文档核对结论.md`

**Interfaces:**
- Consumes: per-candidate draw round and `questionInstanceId` generated after identity verification.
- Produces: a corrected external-platform integration expectation.

- [ ] **Step 1: Add the changed generation trigger**

Add a business-baseline entry stating that `questionInstanceId` is generated after successful identity verification, not at plan-wide drawing time.

- [ ] **Step 2: Clarify invalidation and dispatch timing**

State that invalidated question instances must never be dispatched or accepted for scoring, and a new draw round creates new IDs that are separately dispatched to enabled practical platforms.

- [ ] **Step 3: Verify association-key consistency**

Run:

```powershell
rg -n 'questionInstanceId|身份验证|作废|推送' '需求设计\实操考试相关\实操平台对接API文档核对结论.md'
```

Expected: the document names `questionInstanceId` as the only score association key and says it is generated after verification.

### Task 3: Update the interactive prototype flow

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`

**Interfaces:**
- Consumes: `verifyCandidate(plan, candidateId)` from the identity-verification action.
- Produces: a new per-candidate result round, invalidated earlier unstarted rounds, and new `questionInstanceId` values.

- [ ] **Step 1: Replace plan-level draw controls and copy**

Change the draw-management view from "开始随机抽取/重新抽题" to monitoring of identity-verification progress. Show total candidates, verified candidates, candidates awaiting verification and candidates blocked from redrawing because an instance has started or has a score.

- [ ] **Step 2: Add a candidate verification interaction**

Add a verification action for an eligible candidate. It must call logic equivalent to:

```javascript
function verifyCandidate(plan, candidateId) {
  const prior = plan.results.find((item) => item.candidateId === candidateId && item.isCurrent);
  if (prior && prior.questions.some((question) => question.status !== '待考')) {
    return { ok: false, reason: '该考生已开始考试或已有成绩，不能重新抽题' };
  }
  if (prior) {
    prior.isCurrent = false;
    prior.invalidatedAt = now();
    prior.invalidatedReason = '再次身份验证后重新抽题';
  }
  const round = generateCandidateResults(plan, candidateId, nextRound(plan, candidateId));
  plan.results.push(round);
  dispatchDevicePlatformQuestions(round);
  return { ok: true, round };
}
```

- [ ] **Step 3: Render verification-driven results and audit state**

Show only the current draw round by default. Include each candidate's verification time, current draw-round number and per-question status. Provide a compact history display for invalidated unstarted rounds.

- [ ] **Step 4: Run prototype behavioral checks**

In a browser or JavaScript-capable test environment, verify:

```text
1. A first successful verification creates one candidate's category questions and unique instance IDs.
2. A second successful verification invalidates only that candidate's previous unstarted instances and creates new IDs.
3. After any instance is marked started or scored, another verification reports the block reason and keeps existing IDs unchanged.
4. The plan's other candidates are not drawn or invalidated by one candidate's verification.
```

- [ ] **Step 5: Verify the modified files**

Run:

```powershell
git diff --check
git diff -- '需求设计/实操考试相关/实操考试抽题与设备成绩接入V2需求设计.md' '需求设计/实操考试相关/实操平台对接API文档核对结论.md' '需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html'
```

Expected: no whitespace errors; all edits implement verification-triggered per-candidate draws and preserve the immutable score boundary.
