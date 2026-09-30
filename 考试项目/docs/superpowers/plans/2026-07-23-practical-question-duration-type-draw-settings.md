# Practical Question Duration, Type and Draw Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add practical-question duration/type and replace the practical draw-management menu with exam-point draw settings for category and subcategory counts.

**Architecture:** Questions own a required duration and type (`NEW`/`OLD`), and both fields are snapshotted in generated question instances. Draw settings are maintained by exam point and operation project, with category totals derived from active subcategory settings; identity verification reads the settings rather than a manually initiated draw action.

**Tech Stack:** Markdown requirements; standalone HTML/CSS/JavaScript prototype.

## Global Constraints

- Keep identity verification as the only practical-question generation trigger.
- Keep question creation, modification and disable under two-level review.
- New and old question types are required values; duration is a positive integer in minutes.
- Draw settings are maintained by exam point, operation project, subject category and subject subcategory.
- The practical draw-management menu is removed.

---

### Task 1: Revise the requirements and menu contract

**Files:**
- Modify: `需求设计/实操考试相关/实操考试抽题与设备成绩接入V2需求设计.md`

- [ ] Add required `durationMinutes` and `questionType` fields to practical-question creation, review details, question snapshots and question instances.
- [ ] Replace the `实操抽题管理` menu with `抽题设置` in the defined order.
- [ ] Define `exam_point_practical_draw_setting`: exam point, operation project, category, subcategory, draw count, enabled status and remark.
- [ ] Define validation: every enabled subcategory count is a positive integer; a candidate's category total is the sum of its enabled subcategory counts; each subcategory count must not exceed its eligible-question count; failed validation creates no round or question instance.

### Task 2: Update the interactive prototype

**Files:**
- Modify: `需求设计/实操考试相关/实操随机抽题审核与评分方式页面原型.html`

- [ ] Replace the navigation and draw-monitoring view with a `抽题设置` page.
- [ ] Render a settings table grouped by category with subcategory rows, draw-count controls, enabled state, validation feedback and add/edit actions.
- [ ] Add duration and question-type columns, filters and required form controls to practical-question management; include them in review detail.
- [ ] Update generation fixtures to read enabled subcategory settings and copy duration/type into each generated question instance.
- [ ] Run an inline Node test for duration/type snapshot and subcategory count validation, then parse and `git diff --check`.
