const fs = require('fs');
const path = require('path');

const prototypePath = path.join(__dirname, 'personal-exam-archive-prototype.html');

if (!fs.existsSync(prototypePath)) {
  throw new Error(`Prototype file not found: ${prototypePath}`);
}

const html = fs.readFileSync(prototypePath, 'utf8');

const requiredText = [
  '考试档案管理',
  '考试计划归档列表',
  '批量档案归档',
  '档案详情查看',
  '考试计划名称',
  '考生姓名/身份证号',
  '操作项目',
  '考试类型',
  '考试点',
  '考试日期',
  '培训档案汇总',
  '培训档案',
  '考试档案',
  '考生档案列表',
  '课程表',
  '学时证明',
  '考核申请表',
  '学历证明',
  '考勤与打卡记录',
  '考试计划',
  '考试成绩单',
  '考试签到记录',
  '考勤记录',
  '证书',
  '考试点名称',
  '考试时间与地点',
  '监考员',
  '考评员',
  '巡考员',
  '审批信息',
  '档案归档以“考试计划”为基本单位',
  '每次考试活动的资料集中、完整',
  '一人一档',
  '标准化电子文件包',
  '个人档案状态',
  '计划内考生',
  '取消归档',
  '查看',
  '导出',
  '导出张某某个人档案包',
  '个人档案以考生为中心',
];

for (const text of requiredText) {
  if (!html.includes(text)) {
    throw new Error(`Missing required requirement text: ${text}`);
  }
}

const requiredHooks = [
  'data-open-modal',
  'data-close-modal',
  'id="archive-modal"',
  'role="dialog"',
  'aria-modal="true"',
  'class="modal-mask"',
  'class="archive-modal"',
  'class="person-modal"',
  'data-tab="training"',
  'data-tab="exam"',
  'data-tab="candidates"',
  'id="person-modal"',
  'id="document-modal"',
  'data-open-person-modal',
  'data-close-person-modal',
  'data-close-document-modal',
  'data-doc',
];

for (const hook of requiredHooks) {
  if (!html.includes(hook)) {
    throw new Error(`Missing required interaction hook: ${hook}`);
  }
}

const forbiddenText = [
  '多条件组合查询',
  '考试计划总数',
  '可归档计划',
  '待补齐材料',
  '归档后锁定',
  '待补齐',
  '可归档',
  '导出考试计划档案包',
  '导出电子文件包',
  'data-tab="person"',
  'data-panel="person"',
  '个人档案示例',
  '覆盖人数',
  '缺失人数',
  '核验状态',
  '一人一档已生成',
  '个人档案待完善',
  '可导出个人包',
  '培训资料完整',
  '待补材料',
  '可纳入计划归档',
  '查看一人一档',
  '导出个人档案包',
  '个人关联内容',
  '上传归档资料',
  '培训结业审批',
  '立即购买',
  '营销',
  '英雄区',
];

for (const text of forbiddenText) {
  if (html.includes(text)) {
    throw new Error(`Forbidden text present: ${text}`);
  }
}

const forbiddenMarkup = [
  'class="page-head"',
  'class="kpi-row"',
  'data-open-drawer',
  'data-close-drawer',
  'id="archive-drawer"',
  'drawer-mask',
  'class="drawer"',
];

for (const markup of forbiddenMarkup) {
  if (html.includes(markup)) {
    throw new Error(`Forbidden legacy markup present: ${markup}`);
  }
}

const queryPanelMatch = html.match(/<section class="panel query-panel">([\s\S]*?)<\/section>/);
if (!queryPanelMatch) {
  throw new Error('Could not locate query panel.');
}

const queryPanel = queryPanelMatch[1];
for (const removedQueryField of [
  '<label>考试机构</label>',
  'aria-label="考试机构"',
  '<label>考试点</label>',
  'aria-label="考试点"',
]) {
  if (queryPanel.includes(removedQueryField)) {
    throw new Error(`Exam plan query should not include field: ${removedQueryField}`);
  }
}

if (
  !queryPanel.includes('<label>考试类型</label>') ||
  !queryPanel.includes('aria-label="考试类型"') ||
  !queryPanel.includes('<option>理论</option>') ||
  !queryPanel.includes('<option>实操</option>')
) {
  throw new Error('Exam plan query should include 考试类型 with 理论/实操 options.');
}

if (/<button[^>]*>\s*档案详情查看\s*<\/button>/.test(html)) {
  throw new Error('Top-level 档案详情查看 button should be removed.');
}

if (/<span class="link">\s*档案归档\s*<\/span>/.test(html)) {
  throw new Error('Row-level 档案归档 link should be replaced by the batch archive action.');
}

const listHeaders = [
  '考试计划',
  '操作项目',
  '考试类型',
  '考试时间',
  '考试点名称',
  '操作',
];

for (const header of listHeaders) {
  const headerPattern = new RegExp(`<th[^>]*>\\s*${header}\\s*</th>`);
  if (!headerPattern.test(html)) {
    throw new Error(`Missing list header: ${header}`);
  }
}

const listTheadMatch = html.match(/<section class="panel">\s*<div class="panel-head">[\s\S]*?<table>\s*<thead>([\s\S]*?)<\/thead>/);
if (!listTheadMatch) {
  throw new Error('Could not locate archive list table header.');
}

const listThead = listTheadMatch[1];
for (const removedHeader of ['培训档案', '考试档案']) {
  if (listThead.includes(`<th style="width:150px;">${removedHeader}</th>`)) {
    throw new Error(`Removed field still present in list header: ${removedHeader}`);
  }
}

if (/<th[^>]*>\s*归档状态\s*<\/th>/.test(listThead)) {
  throw new Error('Archive status column should be removed from the exam plan list.');
}

if (/<th[^>]*>\s*完整度\s*<\/th>/.test(listThead)) {
  throw new Error('Completeness column should be removed from the exam plan list.');
}

const listTableMatch = html.match(/<section class="panel">\s*<div class="panel-head">[\s\S]*?<table>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>\s*<\/table>/);
if (!listTableMatch) {
  throw new Error('Could not locate archive list table body.');
}

const listTableBody = listTableMatch[1];

const tabButtonCount = (html.match(/class="tab-button/g) || []).length;
if (tabButtonCount < 3) {
  throw new Error(`Expected at least 3 detail tabs, found ${tabButtonCount}`);
}

const trainingPanelMatch = html.match(/<div class="tab-panel active" data-panel="training"[\s\S]*?<div class="notice">/);
if (!trainingPanelMatch) {
  throw new Error('Could not locate training archive summary panel.');
}

const trainingPanel = trainingPanelMatch[0];
if (trainingPanel.includes('<div class="package-list">')) {
  throw new Error('Training archive summary should not show summary cards above the table.');
}

const trainingViewButtons = (trainingPanel.match(/<button type="button" class="table-btn view" data-doc="[^"]+">查看<\/button>/g) || []).length;
if (trainingViewButtons !== 5) {
  throw new Error(`Expected 5 training summary 查看 buttons, found ${trainingViewButtons}.`);
}

const archiveDetailMatch = html.match(/<div class="modal-body">\s*<div class="detail-grid">([\s\S]*?)<\/div>\s*<div class="tabs"/);
if (!archiveDetailMatch) {
  throw new Error('Could not locate exam plan detail grid.');
}

const archiveDetailGrid = archiveDetailMatch[1];
if (archiveDetailGrid.includes('<span>归档状态</span>')) {
  throw new Error('Exam plan detail grid should replace 归档状态 with 计划内考生.');
}

if (!archiveDetailGrid.includes('<span>计划内考生</span><b>48 人</b>')) {
  throw new Error('Exam plan detail grid should show 计划内考生 as 48 人.');
}

const candidatesPanelMatch = html.match(/<div class="tab-panel" data-panel="candidates"[\s\S]*?<div class="notice">/);
if (!candidatesPanelMatch) {
  throw new Error('Could not locate candidate archive list panel.');
}

const candidatesPanel = candidatesPanelMatch[0];
if (candidatesPanel.includes('<div class="package-list">')) {
  throw new Error('Candidate archive list should not show summary cards above the table.');
}

if (candidatesPanel.includes('<th>培训档案</th>')) {
  throw new Error('Candidate archive list should not include the 培训档案 column.');
}

if (!candidatesPanel.includes('<button class="btn primary">批量归档</button>')) {
  throw new Error('Candidate archive list should include a batch archive button above the table.');
}

const examPanelMatch = html.match(/<div class="tab-panel" data-panel="exam"[\s\S]*?<\/div>\s*<div class="tab-panel" data-panel="candidates"/);
if (!examPanelMatch) {
  throw new Error('Could not locate exam archive list panel.');
}

const examPanel = examPanelMatch[0];
for (const removedExamHeader of ['<th>关键内容</th>', '<th>人员/机构</th>', '<th>状态</th>']) {
  if (examPanel.includes(removedExamHeader)) {
    throw new Error(`Exam archive list should not include ${removedExamHeader}.`);
  }
}

const examPreviewLinks = (examPanel.match(/<span class="link" data-doc="[^"]+">资料预览<\/span>/g) || []).length;
if (examPreviewLinks !== 4) {
  throw new Error(`Expected 4 exam archive preview links, found ${examPreviewLinks}.`);
}

if (examPanel.includes('<tr><td>考试计划</td>')) {
  throw new Error('Exam archive document type list should not include 考试计划.');
}

const listHeadIndex = html.indexOf('<div class="panel-head">');
const batchActionIndex = html.indexOf('批量档案归档');
const listTitleIndex = html.indexOf('考试归档管理 / 考试计划归档列表');
const tableIndex = html.indexOf('<div class="table-wrap">');

if (
  listHeadIndex === -1 ||
  batchActionIndex === -1 ||
  listTitleIndex === -1 ||
  tableIndex === -1 ||
  !(listHeadIndex < batchActionIndex && batchActionIndex < listTitleIndex && listTitleIndex < tableIndex)
) {
  throw new Error('Batch archive action must appear at the upper-left of the archive list before the table.');
}

const statusCells = [...listTableBody.matchAll(/<td><span class="badge [^"]+">(已归档|未归档)<\/span><\/td>/g)];
if (statusCells.length !== 0) {
  throw new Error(`Exam plan list should not show archive status cells, found ${statusCells.length}.`);
}

if (listTableBody.includes('class="progress"') || html.includes('class="progress-track"') || html.includes('class="progress-fill"')) {
  throw new Error('Exam plan list should not show completeness progress UI.');
}

const examTypeCells = [...listTableBody.matchAll(/<td>(理论|实操)<\/td>/g)];
if (examTypeCells.length !== 5) {
  throw new Error(`Expected 5 exam plan type cells using only 理论/实操, found ${examTypeCells.length}.`);
}

for (const legacyExamType of ['<td>初训</td>', '<td>复训</td>', '<td>补考</td>']) {
  if (listTableBody.includes(legacyExamType)) {
    throw new Error(`Exam plan list should use 理论/实操 instead of legacy type: ${legacyExamType}`);
  }
}

const archiveButtons = (listTableBody.match(/class="table-btn archive">归档<\/button>/g) || []).length;
const unarchiveButtons = (listTableBody.match(/class="table-btn unarchive">未归档<\/button>/g) || []).length;
const listDetailLinks = (listTableBody.match(/<span class="link" data-open-modal>档案详情查看<\/span>/g) || []).length;

if (archiveButtons !== 0 || unarchiveButtons !== 0 || listDetailLinks !== 5) {
  throw new Error(`Exam plan list rows should only keep detail links, found archive/unarchive/detail ${archiveButtons}/${unarchiveButtons}/${listDetailLinks}.`);
}

const personArchiveLinks = (html.match(/<button type="button" class="table-btn view" data-open-person-modal>查看<\/button>/g) || []).length;
const personalExportLinks = (candidatesPanel.match(/<button type="button" class="table-btn">导出<\/button>/g) || []).length;
const candidateArchiveButtons = (candidatesPanel.match(/<button type="button" class="table-btn archive">归档<\/button>/g) || []).length;
const candidateUnarchiveButtons = (candidatesPanel.match(/<button type="button" class="table-btn unarchive">取消归档<\/button>/g) || []).length;

if (
  personArchiveLinks !== 4 ||
  personalExportLinks !== 4 ||
  candidateArchiveButtons !== 4 ||
  candidateUnarchiveButtons !== 4
) {
  throw new Error(`Expected 4 candidate rows with 归档/取消归档/查看/导出 actions, found ${candidateArchiveButtons}/${candidateUnarchiveButtons}/${personArchiveLinks}/${personalExportLinks}.`);
}

if (!html.includes('导出张某某个人档案包') || !html.includes('张某某 / 高压电工作业 / 一人一档')) {
  throw new Error('Personal archive modal must show whose archive is being viewed and exported.');
}

const personModalMatch = html.match(/<div class="modal-mask" id="person-modal"[\s\S]*?<\/section>\s*<\/div>/);
if (!personModalMatch) {
  throw new Error('Could not locate personal archive modal.');
}

const personModalHtml = personModalMatch[0];
for (const removedPersonalHeader of ['个人关联内容', '<th>状态</th>']) {
  if (personModalHtml.includes(removedPersonalHeader)) {
    throw new Error(`Personal archive list should not include ${removedPersonalHeader}.`);
  }
}

const personalArchiveDocs = [
  '课程表',
  '学时证明',
  '考核申请表',
  '考勤记录',
  '考试成绩单',
  '考试签到记录',
  '证书',
];

for (const docName of personalArchiveDocs) {
  const rowPattern = new RegExp(`<tr><td>${docName}</td><td><button type="button" class="table-btn view" data-doc="[^"]+">查看</button></td></tr>`);
  if (!rowPattern.test(personModalHtml)) {
    throw new Error(`Personal archive modal missing view row for: ${docName}`);
  }
}

const personalDocViewButtons = (personModalHtml.match(/<button type="button" class="table-btn view" data-doc="[^"]+">查看<\/button>/g) || []).length;
if (personalDocViewButtons !== 7) {
  throw new Error(`Expected 7 personal archive 查看 buttons, found ${personalDocViewButtons}.`);
}

const requiredDocumentKeys = [
  'training-schedule',
  'training-hours',
  'assessment-application',
  'education-proof',
  'attendance-record',
  'exam-score',
  'invigilator-record',
  'assessor-record',
  'inspection-record',
  'personal-schedule',
  'personal-hours',
  'personal-application',
  'personal-attendance',
  'personal-score',
  'personal-checkin',
  'personal-certificate',
];

for (const docKey of requiredDocumentKeys) {
  if (!html.includes(`data-doc="${docKey}"`) || !html.includes(`'${docKey}':`)) {
    throw new Error(`Missing document view wiring for: ${docKey}`);
  }
}

const documentTriggerCount = (html.match(/data-doc="/g) || []).length;
if (documentTriggerCount !== requiredDocumentKeys.length) {
  throw new Error(`Expected ${requiredDocumentKeys.length} document view triggers, found ${documentTriggerCount}.`);
}

if (html.includes('id="document-meta"') || html.includes('class="document-meta"')) {
  throw new Error('Document preview modal should not render a left-side metadata panel.');
}

for (const expectedPreviewText of [
  '个人课程表',
  '学时证明',
  '考核申请表',
  '考勤记录',
  '考试成绩单',
  '考试签到记录',
  '证书记录',
  '巡考员记录',
]) {
  if (!html.includes(expectedPreviewText)) {
    throw new Error(`Missing document preview content: ${expectedPreviewText}`);
  }
}

const listPreviewDocumentKeys = [
  'training-schedule',
  'training-hours',
  'assessment-application',
  'education-proof',
  'attendance-record',
  'exam-score',
  'invigilator-record',
  'assessor-record',
  'inspection-record',
  'personal-schedule',
  'personal-hours',
  'personal-application',
  'personal-attendance',
  'personal-score',
  'personal-checkin',
];

function getDocumentPreview(docKey) {
  const previewPattern = new RegExp(`'${docKey}': \\{[\\s\\S]*?preview: '([\\s\\S]*?)'\\s*\\}`);
  const previewMatch = html.match(previewPattern);
  if (!previewMatch) {
    throw new Error(`Could not locate preview content for document: ${docKey}`);
  }

  return previewMatch[1];
}

for (const docKey of listPreviewDocumentKeys) {
  const previewHtml = getDocumentPreview(docKey);
  if (!previewHtml.includes('<table') || !previewHtml.includes('<thead>') || !previewHtml.includes('<tbody>')) {
    throw new Error(`Document preview should be rendered as a table/list: ${docKey}`);
  }
}

const trainingHoursPreview = getDocumentPreview('training-hours');
if (!trainingHoursPreview.includes('学时证明列表') || !trainingHoursPreview.includes('<th>学时</th>')) {
  throw new Error('Training hours preview should be named 学时证明列表 and include 学时 column.');
}

for (const removedHoursField of ['理论学时', '实操学时', '总学时', '签章状态']) {
  if (trainingHoursPreview.includes(removedHoursField)) {
    throw new Error(`Training hours preview should not include field: ${removedHoursField}`);
  }
}

for (const scheduleKey of ['training-schedule', 'personal-schedule']) {
  const schedulePreview = getDocumentPreview(scheduleKey);
  if (!schedulePreview.includes('<th>上课时间</th>') || schedulePreview.includes('<th>培训日期</th>')) {
    throw new Error(`${scheduleKey} should merge 培训日期 and 上课时间 into a single 上课时间 column.`);
  }
}

const educationPreview = getDocumentPreview('education-proof');
if (!educationPreview.includes('学历证明列表') || !educationPreview.includes('<th>考生姓名</th>')) {
  throw new Error('Education proof preview should be a student-dimension list.');
}

const attendancePreview = getDocumentPreview('attendance-record');
if (!attendancePreview.includes('<th>考生姓名</th>')) {
  throw new Error('Attendance record preview should be a student-dimension list.');
}

const invigilatorPreview = getDocumentPreview('invigilator-record');
for (const removedInvigilatorField of ['负责考场', '记录事项', '异常情况']) {
  if (invigilatorPreview.includes(removedInvigilatorField)) {
    throw new Error(`Invigilator record should not include field: ${removedInvigilatorField}`);
  }
}

const assessorPreview = getDocumentPreview('assessor-record');
if (!assessorPreview.includes('<th>考评员</th><th>考评时间</th>')) {
  throw new Error('Assessor record should only keep name and time fields.');
}

for (const removedAssessorField of ['考评项目', '评分人数', '复核结果', '记录说明', '签名状态']) {
  if (assessorPreview.includes(removedAssessorField)) {
    throw new Error(`Assessor record should not include field: ${removedAssessorField}`);
  }
}

const inspectionPreview = getDocumentPreview('inspection-record');
if (!inspectionPreview.includes('<th>巡考员</th><th>巡考时间</th>')) {
  throw new Error('Inspection record should only keep name and time fields.');
}

for (const removedInspectionField of ['检查内容', '问题记录', '现场照片', '审批状态']) {
  if (inspectionPreview.includes(removedInspectionField)) {
    throw new Error(`Inspection record should not include field: ${removedInspectionField}`);
  }
}

const personalCheckinPreview = getDocumentPreview('personal-checkin');
if (!personalCheckinPreview.includes('<table') || !personalCheckinPreview.includes('<th>签到时间</th>')) {
  throw new Error('Personal exam check-in record should be rendered as a list table.');
}

for (const requiredDocumentStyle of [
  '.document-preview table',
  '.document-preview th',
  'white-space: normal;',
  'text-overflow: clip;',
]) {
  if (!html.includes(requiredDocumentStyle)) {
    throw new Error(`Missing document table style override: ${requiredDocumentStyle}`);
  }
}

const candidateStatusCells = [...candidatesPanel.matchAll(/<td><span class="badge (?:green|gray)">(已归档|未归档)<\/span><\/td>/g)];
if (candidateStatusCells.length !== 4) {
  throw new Error(`Expected 4 candidate archive status cells using only 已归档/未归档, found ${candidateStatusCells.length}.`);
}

console.log('Exam archive prototype matches the simplified training summary, candidate archive actions, modal, and contract-content requirements.');
