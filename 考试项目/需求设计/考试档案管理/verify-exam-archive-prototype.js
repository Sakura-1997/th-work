const fs = require('fs');
const path = require('path');

const prototypePath = path.join(__dirname, 'exam-archive-management-statistics.html');

if (!fs.existsSync(prototypePath)) {
  throw new Error(`Prototype file not found: ${prototypePath}`);
}

const html = fs.readFileSync(prototypePath, 'utf8');

const mustInclude = [
  '姓名',
  '人员类型',
  '归档状态',
  '批量归档',
  '批量取消归档',
  '作业类别',
  '操作项目',
  '发证机关',
  '发证状态',
  '操作',
  '取消归档',
  '详情',
  'detail-modal',
  '关闭',
  '报考信息',
  '个人信息',
  '政治面貌',
  '最高学历',
  '从业所在地',
  '毕业院校',
  '所学专业',
  '职业技能等级',
  '移动电话',
  '联系邮箱',
  '固定电话',
  '工作单位',
  '备注',
  '本科或同等学历',
  '江西省 / 景德镇市',
  '中级',
  '13006206641',
  '手动蝶阀',
  '免培训材料',
  '申请资料信息',
  '约考记录',
  '学历',
  '考核申请表',
  '学员照片',
  '身份证正面',
  '身份证反面',
  '签名',
  '免培训证明文件',
  '特种作业操作证',
];

const forbidden = [
  '特种工复审类型',
  '主责安管复审类型',
  '申请发证状态',
  '申请受理状态',
  '是否特种设备操作证',
  '查询统计',
  'statistics',
  '考试人数统计',
  '知识点考试统计',
  '题型统计',
  '培训统计',
  '教师统计',
  '导出统计',
  '未归档列表',
  '可归档列表',
  '已归档列表',
  '强制归档',
  'data-page="archive-detail"',
];

for (const text of mustInclude) {
  if (!html.includes(text)) {
    throw new Error(`Missing required text: ${text}`);
  }
}

for (const text of forbidden) {
  if (html.includes(text)) {
    throw new Error(`Forbidden text present: ${text}`);
  }
}

const listQueryMatch = html.match(/<section[^>]*id="archive-list"[\s\S]*?<div class="list-actions">/);
if (!listQueryMatch) {
  throw new Error('Could not find archive list query area.');
}

const queryArea = listQueryMatch[0];
const queryLabels = [...queryArea.matchAll(/<label>(.*?)<\/label>/g)].map((match) => match[1].trim());
const expectedLabels = ['姓名', '人员类型', '归档状态'];

if (queryLabels.join('|') !== expectedLabels.join('|')) {
  throw new Error(`Archive list query labels mismatch. Expected ${expectedLabels.join(', ')}, got ${queryLabels.join(', ')}`);
}

const archiveHeaderMatch = html.match(/<section[^>]*id="archive-list"[\s\S]*?<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>/);
if (!archiveHeaderMatch) {
  throw new Error('Could not find archive list table header.');
}

const archiveHeaders = [...archiveHeaderMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)]
  .map((match) => match[1].replace(/<[^>]*>/g, '').trim())
  .filter(Boolean);

for (const removedHeader of ['申请发证状态', '申请受理状态']) {
  if (archiveHeaders.includes(removedHeader)) {
    throw new Error(`Removed table header is still present: ${removedHeader}`);
  }
}

if (!archiveHeaders.includes('操作')) {
  throw new Error('Archive list table missing 操作 column.');
}

const pageTabsMatch = html.match(/<nav class="page-tabs"[\s\S]*?<\/nav>/);
if (!pageTabsMatch) {
  throw new Error('Could not find page tabs.');
}

const tabLabels = [...pageTabsMatch[0].matchAll(/<button[^>]*>(.*?)<\/button>/g)]
  .map((match) => match[1].replace(/<[^>]*>/g, '').trim());

const expectedTabs = ['考试档案管理'];
if (tabLabels.join('|') !== expectedTabs.join('|')) {
  throw new Error(`Page tabs mismatch. Expected ${expectedTabs.join(', ')}, got ${tabLabels.join(', ')}`);
}

if (!html.includes('class="modal-overlay"') || !html.includes('id="detail-modal"')) {
  throw new Error('Detail modal structure is missing.');
}

console.log('Prototype checks passed.');
