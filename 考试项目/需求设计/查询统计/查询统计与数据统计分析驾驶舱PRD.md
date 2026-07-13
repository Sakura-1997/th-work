# 查询统计与数据统计分析驾驶舱 PRD

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品模块 | 查询统计、数据统计分析、监管驾驶舱 |
| 文档版本 | V1.1 |
| 更新日期 | 2026-07-09 |
| 关联原型 | `查询统计与数据统计分析驾驶舱原型.html` |
| 数据依据 | `spx.sql` |
| 适用对象 | 监管人员、考试中心管理人员、培训机构监管人员 |

## 2. 背景与目标

查询统计模块用于集中展示培训、考试、证书、考务人员、缴费等业务运行数据，辅助监管人员查看全省及各地市业务情况、横向对比和趋势变化。

本期设计遵循两个约束：

1. 只设计 `spx.sql` 中已有表字段能够支撑的指标。
2. 不统计考题相关数据，包括题库、题目、题型、知识点、正确率、难度、错题、试卷质量等。

## 3. 本期范围

| 模块 | 本期保留内容 |
| --- | --- |
| 全局筛选 | 地市、培训机构、时间范围、查询、重置 |
| 总览 | 趋势对比、地市排名、区域监管态势地图、机构通过率排行、人员分类分布 |
| 培训分析 | 培训人数趋势、培训机构考生考试通过率 |
| 考试分析 | 地市考试人数分布、人员分类考试人数、考试安排明细 |
| 证书分析 | 证书状态、证书办理量、持证人员分布 |
| 考务人员 | 人员类别占比、人员数量概览、考务人员明细 |
| 缴费分析 | 地市人员分类缴费情况堆叠柱状图 |

## 4. 不做内容

| 不做内容 | 说明 |
| --- | --- |
| 考题相关统计 | 不统计题库、题目、题型、知识点、错题、难度等 |
| 顶部 KPI 指标卡 | 已从原型移除 |
| 业务链路转化 | 已从原型移除，不再统计报名至发证流程卡片 |
| 业务待处理列表 | 已从原型移除 |
| 省级监管查询条件 | 不作为页面查询条件 |
| 作业类别、操作项目查询条件 | 不作为页面查询条件；涉及分类统计统一改为人员分类 |
| 缴费订单明细列表 | 已从缴费分析移除 |
| 缴费同比、环比、退款率、对账差异 | 当前缴费分析不展示 |
| 评价反馈、投诉、好评率、闭环率 | 当前页面不设计 |
| 证书到期提醒、制证完成率、推送成功率 | 当前证书分析不展示 |
| 履职分析、履职评分、任务负荷、待关注人员、任务类型分布 | 当前考务人员模块不展示 |
| 机构处罚次数 | 当前页面不设计 |

## 5. 页面结构

页面采用白底驾驶舱统计风格，一级内容上下滚动展示，不使用 tab 点击切换。

1. 顶部筛选区：地市、培训机构、时间范围。
2. 总览：左侧趋势与排名，中部高德地图区域监管态势，右侧机构排行与人员分类分布。
3. 培训分析：培训人数趋势、机构考生考试通过率。
4. 考试分析：地市考试人数、人员分类考试人数、考试安排明细。
5. 证书分析：证书状态、证书办理量、持证人员分布。
6. 考务人员：人员类型占比、数量概览、明细表。
7. 缴费分析：按地市、人员分类展示缴费金额。

## 6. 公共数据口径

| 口径项 | 规则 |
| --- | --- |
| 删除标识 | 涉及业务表默认过滤 `del_flag = '0'`，没有该字段的表不加该条件 |
| 租户隔离 | 有 `tenant_id` 字段的表按当前登录租户过滤 |
| 数据权限 | 按用户授权区域过滤；区域字段优先使用业务表自身 `area_id/area_ids`，无区域字段时通过关联机构、考试点、发证机关获取 |
| 时间范围 | 按各指标对应业务时间字段过滤，详见指标口径表 |
| 人数去重 | 涉及人员数时优先按人员唯一 ID 去重；没有唯一 ID 时按身份证号字段去重 |
| 比率展示 | 分母为 0 时展示 `--`，不展示 0% |
| 金额单位 | 支付订单金额按元存储时，展示万元 = `SUM(amount) / 10000`；如来源字段为分，则先除以 100 再换算万元 |
| 人员分类 | 统一展示为特种作业人员、安全生产管理人员、主要负责人 |

## 7. 人员分类取数规则

| 分类 | 优先取数字段 | 说明 |
| --- | --- | --- |
| 特种作业人员 | `exm_exam.exam_plan_type = 'tz'`、`exm_exam.exam_labels` 包含特种作业人员、`tr_certificate.person_type_code = '03'` | 编码以系统字典为准 |
| 安全生产管理人员 | `exm_exam.exam_labels` 或 `exm_exam.exam_codes` 中的人员类型编码、`tr_certificate.person_type_code = '02'` | 编码以系统字典为准 |
| 主要负责人 | `exm_exam.exam_labels` 或 `exm_exam.exam_codes` 中的人员类型编码、`tr_certificate.person_type_code = '01'` | 编码以系统字典为准 |

考试报名、考试安排、缴费分析优先使用 `exm_exam_signup.exam_labels/exam_codes` 或 `exm_exam.exam_labels/exam_codes` 解析人员分类；证书分析使用 `tr_certificate.person_type_code`；考务人员使用 `exam_staff.staff_type`，不混用人员分类。

## 8. 指标来源与计算口径

### 8.1 总览指标

| 图表/指标 | 来源表 | 关键字段 | 计算方式 |
| --- | --- | --- | --- |
| 培训人数趋势 | `tr_class_trainee`、`tr_class`、`tr_trainee_signup` | `class_id`、`trainee_signup_id`、`status`、`start_date`、`end_date`、`institution_id` | 按月统计正式入班人员数：`COUNT(DISTINCT tr_class_trainee.trainee_signup_id)`；过滤 `tr_class_trainee.status = 1`、相关表 `del_flag = '0'`；时间取 `tr_class.start_date`，为空时取班级 `create_time` |
| 考试通过率趋势 | `exm_exam_signup_instance`、`exm_exam_signup`、`exm_exam` | `exam_result`、`score`、`instance_status`、`signup_time`、`exam_id`、`institution_id` | `考试通过率 = 考试合格人数 / 实际参考人数`；合格人数为 `exam_result = '1'`；实际参考人数为 `exam_result IN ('1','2')` 或 `score IS NOT NULL` 的有效报名实例；过滤 `instance_status = '1'` |
| 地市排名 | `exm_exam_signup_instance`、`exm_exam`、`tr_institution` | `exam_id`、`place_id`、`area_id`、`area_name`、`exam_result` | 按地市分组计算考试通过率，地市优先取考试点机构 `tr_institution.area_id/area_name`，关联方式为 `exm_exam.place_id = tr_institution.id` |
| 区域监管态势地图 | `exm_exam_signup_instance`、`exm_exam`、`tr_institution`、`tr_certificate` | `area_id`、`exam_result`、`cert_status`、`valid_end_date` | 地图默认按考试通过率着色；证书有效率切换时按地市发证机关或证书归属区域统计；如某指标无法取到地市，地图该地市展示为空值 |
| 机构通过率排行 | `exm_exam_signup_instance`、`exm_exam_signup`、`tr_institution` | `institution_id`、`institution_name`、`exam_result`、`score` | 按培训机构计算最终考试通过率：`至少一次合格的人员数 / 有考试结果的人员数`，按通过率降序展示 |
| 人员分类分布 | `exm_exam_signup`、`exm_exam_signup_instance` | `exam_labels`、`exam_codes`、`signup_time` | 在查询时间范围内，按报名实例关联的人员分类统计人数占比 |

### 8.2 培训分析指标

| 图表/指标 | 来源表 | 关键字段 | 计算方式 |
| --- | --- | --- | --- |
| 培训人数趋势 | `tr_class_trainee`、`tr_class`、`tr_trainee_signup` | `class_id`、`trainee_signup_id`、`status`、`training_qualify_status`、`institution_id` | 按月统计正式入班人数；培训合格人数可由 `tr_trainee_signup.training_qualify_status = '1'` 统计 |
| 培训机构考生考试通过率 | `exm_exam_signup`、`exm_exam_signup_instance`、`tr_institution` | `institution_id`、`exam_result`、`exam_attempt_type`、`score`、`id_number` | 参考人数 = 有考试结果或成绩的人员数；首次考试通过率 = `初考合格人数 / 初考参考人数`，初考按 `exam_attempt_type = 0` 或 `first_score IS NOT NULL` 判断；最终考试通过率 = `至少一次考试合格人数 / 参考人数` |

### 8.3 考试分析指标

| 图表/指标 | 来源表 | 关键字段 | 计算方式 |
| --- | --- | --- | --- |
| 地市考试人数分布 | `exm_exam`、`tr_institution` | `exam_date`、`place_id`、`examinee_number`、`area_id` | 查询时间范围内，按考试点地市汇总 `SUM(exm_exam.examinee_number)` |
| 人员分类考试人数 | `exm_exam` | `exam_plan_type`、`exam_labels`、`exam_codes`、`examinee_number` | 按人员分类汇总 `SUM(examinee_number)`；人员分类按第 7 章规则解析 |
| 考试安排明细 | `exm_exam`、`tr_institution` | `exam_date`、`place_id`、`type`、`exam_labels`、`examinee_number` | 展示考试日期、地市、考试点、考试类型、人员分类、考试人数；考试类型 `type = 1` 为理论，`type = 2` 为实操 |

### 8.4 证书分析指标

| 图表/指标 | 来源表 | 关键字段 | 计算方式 |
| --- | --- | --- | --- |
| 证书有效率 | `tr_certificate` | `cert_status`、`valid_begin_date`、`valid_end_date` | `有效证书数 / 证书总数`；有效证书为 `cert_status = '1'` 且当前日期在 `valid_begin_date` 与 `valid_end_date` 之间 |
| 发证人数 | `tr_certificate` | `idcard_num`、`valid_begin_date`、`cert_status` | 查询时间范围内，按 `valid_begin_date` 统计已发证人员数：`COUNT(DISTINCT idcard_num)`；仅统计 `cert_status = '1'` 的证书 |
| 有效证书 | `tr_certificate` | `cert_num`、`cert_status`、`valid_end_date` | `COUNT(cert_num)`，条件同有效证书口径 |
| 证书办理量 | `tr_certificate` | `valid_begin_date`、`create_time`、`apply_cert_status` | 按月统计证书记录数；时间优先取 `valid_begin_date`，为空时取 `create_time` |
| 持证人员分布 | `tr_certificate` | `person_type_code`、`idcard_num`、`cert_status` | 按人员分类统计持证人员数和有效证书数；持证人员数按 `COUNT(DISTINCT idcard_num)` |

### 8.5 考务人员指标

| 图表/指标 | 来源表 | 关键字段 | 计算方式 |
| --- | --- | --- | --- |
| 人员类别占比 | `exam_staff` | `staff_type`、`status`、`area_id` | 按 `staff_type` 分组统计人数占比；`01` 监考员、`02` 考评员、`03` 巡考员，编码以系统字典为准 |
| 人员数量概览 | `exam_staff` | `staff_type`、`status` | 分别统计监考员、考评员、巡考员数量；过滤 `status = '0'`、`del_flag = '0'` |
| 考务人员明细 | `exam_staff` | `area_id`、`exam_point_id`、`exam_point_name`、`staff_type`、`status` | 按区域、考试点分组统计各类型人员数量；数据状态根据 `status` 显示正常或停用 |

### 8.6 缴费分析指标

| 图表/指标 | 来源表 | 关键字段 | 计算方式 |
| --- | --- | --- | --- |
| 地市人员分类缴费金额 | `tr_pay_order`、`tr_pay_order_detail`、`exm_exam_signup_instance`、`exm_exam_signup`、`exm_exam`、`tr_institution` | `order_no`、`amount`、`order_state`、`third_party_tran_status`、`pay_time`、`signup_instance_id`、`exam_signup_id`、`exam_id`、`exam_labels`、`exam_codes`、`place_id`、`area_id` | 仅统计支付成功订单：`tr_pay_order.order_state = '1'` 或 `third_party_tran_status = '1'`；金额取 `tr_pay_order.amount`，如按明细拆分则取 `tr_pay_order_detail.amount`；人员分类通过 `tr_pay_order_detail.signup_instance_id -> exm_exam_signup_instance.id -> exm_exam_signup.id` 获取，明细无报名实例时用 `tr_pay_order.exam_id -> exm_exam.id` 获取；地市通过 `exm_exam.place_id -> tr_institution.id` 获取；最终按地市、人员分类汇总金额 |
| 地市缴费合计 | 同上 | 同上 | 同一地市三类人员缴费金额求和，即堆叠柱顶展示值 |

## 9. 筛选条件

| 筛选项 | 数据来源 | 作用范围 |
| --- | --- | --- |
| 地市 | 区域字段优先取 `area_id/area_name/area_ids/area_names`；考试相关通过考试点机构 `tr_institution` 获取 | 全部模块 |
| 培训机构 | `tr_institution.id`、`tr_institution.institution_name` | 培训、考试、缴费等能关联机构的数据 |
| 时间范围 | 各业务表时间字段 | 全部模块 |

各模块时间字段如下：

| 模块 | 时间字段 |
| --- | --- |
| 培训 | `tr_class.start_date`、`tr_class.end_date`、`tr_class.create_time` |
| 考试 | `exm_exam.exam_date`、`exm_exam_signup_instance.signup_time` |
| 证书 | `tr_certificate.valid_begin_date`、`tr_certificate.create_time` |
| 考务人员 | `exam_staff.create_time`，明细默认查当前有效人员 |
| 缴费 | `tr_pay_order.pay_time` |

## 10. 模块需求

### 10.1 总览

总览展示趋势对比、地市排名、区域监管态势地图、机构通过率排行和人员分类分布。

区域监管态势使用高德地图 JS API，展示江西各地市区域轮廓。地市名称和指标值直接显示在对应区域内，鼠标悬停区域时高亮该地市。地图不显示方块式点位卡片。

### 10.2 培训分析

展示培训人数趋势和培训机构考生考试通过率。机构通过率表需展示机构名称、参考人数、首次考试通过率、最终考试通过率。

### 10.3 考试分析

展示查询时间范围内哪些地方有考试、考试人数是多少。页面包含地市考试人数分布、人员分类考试人数和考试安排明细。

### 10.4 证书分析

展示证书有效率、发证人数、有效证书、证书办理量和持证人员分布。不展示证书到期提醒、制证完成率、推送成功率。

### 10.5 考务人员

展示监考员、考评员、巡考员数量和区域考试点明细。不展示任务负荷、履职分析、待关注人员、任务类型分布。

### 10.6 缴费分析

仅展示一张地市人员分类缴费情况图。图表采用堆叠柱状图：横轴为地市，柱内分段为特种作业人员、安全生产管理人员、主要负责人，柱顶展示该地市缴费合计金额。

## 11. 权限与数据范围

| 权限项 | 说明 |
| --- | --- |
| 区域权限 | 监管人员只能查看授权区域内数据 |
| 机构权限 | 培训机构用户只能查看本机构相关数据 |
| 金额权限 | 缴费金额属于敏感指标，可按角色控制是否展示 |
| 明细权限 | 无明细权限时仅展示汇总图表 |

## 12. 数据刷新与质量要求

| 项目 | 要求 |
| --- | --- |
| 汇总刷新 | 驾驶舱汇总数据建议 5 到 15 分钟刷新一次 |
| 明细查询 | 明细类查询实时读取业务库 |
| 字典映射 | 人员分类、考试类型、考务人员类型均以系统字典为准 |
| 异常数据 | 缺少区域、机构、人员分类的数据进入“未归类”统计，不参与地市地图着色 |
| 空值展示 | 无数据展示 `--`，不使用模拟值代替真实统计 |

## 13. 验收标准

| 编号 | 验收项 | 通过标准 |
| --- | --- | --- |
| A01 | PRD 与原型一致 | PRD 模块、指标名称与当前 HTML 原型一致 |
| A02 | 筛选条件 | 页面只提供地市、培训机构、时间范围，不提供作业类别、操作项目、考试类型、省级监管查询条件 |
| A03 | 人员分类维度 | 涉及分类统计时使用特种作业人员、安全生产管理人员、主要负责人 |
| A04 | 总览地图 | 使用高德地图展示地市区域轮廓，区域内展示地市名称和指标值，支持 hover 高亮 |
| A05 | 培训分析 | 展示培训人数趋势和机构考生考试通过率 |
| A06 | 考试分析 | 展示地市考试人数、人员分类考试人数、考试安排明细 |
| A07 | 证书分析 | 不展示证书到期提醒、制证完成率、推送成功率 |
| A08 | 考务人员 | 不展示任务负荷、履职分析、待关注人员、任务类型分布 |
| A09 | 缴费分析 | 只展示地市人员分类缴费情况图，不展示订单明细、同比环比、退款、对账差异 |
| A10 | 数据口径 | 每个展示指标均能在 PRD 中找到来源表、字段和计算方式 |
| A11 | 考题排除 | 页面和 PRD 不出现题库、题型、知识点、试题分析等统计入口 |

## 14. 原型对应关系

| PRD 内容 | 原型位置 |
| --- | --- |
| 全局筛选 | 页面顶部筛选条 |
| 总览 | `总览` 区域 |
| 区域监管态势 | 总览中部高德地图 |
| 培训分析 | `培训分析` 小标题区域 |
| 考试分析 | `考试分析` 小标题区域 |
| 证书分析 | `证书分析` 小标题区域 |
| 考务人员 | `考务人员` 小标题区域 |
| 缴费分析 | `缴费分析` 小标题区域 |
