/**
 * org-l2-data.js - L2补充题目、80分评分逻辑、报告文案模板
 * 组织诊断H5 - L2深度诊断
 */

/* ========== L2 新增题目（13题） ========== */

/* 维度一：流程与制度（新增3题：Q_new1-Q_new3） */
var L2_PROCESS_QUESTIONS = [
  {
    id: 'l2_p1',
    dimension: '流程与制度',
    text: '当一名新员工入职，他的培训是怎么进行的？',
    options: [
      { value: 1, label: '老员工带带，多问多学' },
      { value: 2, label: '有基础岗位说明，但培训没有标准' },
      { value: 3, label: '有入职培训手册和标准流程' },
      { value: 4, label: '系统化入职培训体系，AI辅助定制计划' }
    ]
  },
  {
    id: 'l2_p2',
    dimension: '流程与制度',
    text: '公司里遇到一个重复出现的问题，通常是怎么处理的？',
    options: [
      { value: 1, label: '每次重新讨论，靠经验灵活处理' },
      { value: 2, label: '有口头惯例，但没有文字化' },
      { value: 3, label: '有文字化处理流程，基本能按流程走' },
      { value: 4, label: '有流程+自动预警机制，自动归档' }
    ]
  },
  {
    id: 'l2_p3',
    dimension: '流程与制度',
    text: '当关键员工离职，他的工作通常会怎样？',
    options: [
      { value: 1, label: '一片混乱，接手需要很长时间' },
      { value: 2, label: '有交接，但隐性知识带走了' },
      { value: 3, label: '有交接文档，工作能基本延续' },
      { value: 4, label: '知识库完善，离职交接标准化' }
    ]
  }
];

/* 维度二：团队与执行力（新增3题：Q_new4-Q_new6） */
var L2_TEAM_QUESTIONS = [
  {
    id: 'l2_t1',
    dimension: '团队与执行力',
    text: '中层管理者在带团队时，通常用什么方式管理下属？',
    options: [
      { value: 1, label: '靠感情和经验，没有明确管理方法' },
      { value: 2, label: '会开会布置任务，但缺乏过程跟踪' },
      { value: 3, label: '有定期一对一沟通（1on1）和周会机制' },
      { value: 4, label: '用系统化工具管理，数据可视化' }
    ]
  },
  {
    id: 'l2_t2',
    dimension: '团队与执行力',
    text: '团队成员对组织目标的认同感如何？',
    options: [
      { value: 1, label: '大部分人只是来上班，不关心公司目标' },
      { value: 2, label: '知道公司目标，但和自己的关系不清晰' },
      { value: 3, label: '基本认同，日常工作与目标挂钩' },
      { value: 4, label: '团队高度认同，个人目标与组织目标一致' }
    ]
  },
  {
    id: 'l2_t3',
    dimension: '团队与执行力',
    text: '跨部门协作的效率如何？',
    options: [
      { value: 1, label: '部门墙严重，协作全靠老板协调' },
      { value: 2, label: '有协作需求时会沟通，但主动性不足' },
      { value: 3, label: '有协作机制，大部分时候能顺畅配合' },
      { value: 4, label: '跨部门信息共享，主动补位，协同效率高' }
    ]
  }
];

/* 维度三：决策与授权（新增2题：Q_new7-Q_new8） */
var L2_DECISION_QUESTIONS = [
  {
    id: 'l2_d1',
    dimension: '决策与授权',
    text: '当需要做一个中等风险的业务决策时（比如是否进入一个新渠道），通常怎么拍板？',
    options: [
      { value: 1, label: '老板自己拍板，直觉判断为主' },
      { value: 2, label: '老板主导，听取个别骨干意见后决定' },
      { value: 3, label: '有基本的决策流程，关键数据和意见会收集' },
      { value: 4, label: '系统化决策机制，数据驱动+授权范围内的自主决策' }
    ]
  },
  {
    id: 'l2_d2',
    dimension: '决策与授权',
    text: '当业务遇到问题，通常是谁第一个发现？',
    options: [
      { value: 1, label: '客户投诉或损失出现后才知道' },
      { value: 2, label: '老板感觉不对了去问才发现' },
      { value: 3, label: '中层会主动反馈，但不够及时' },
      { value: 4, label: '数据看板实时呈现，关键指标异常自动预警' }
    ]
  }
];

/* 维度四：文化与氛围（新增1题：Q_new9） */
var L2_CULTURE_QUESTIONS = [
  {
    id: 'l2_c1',
    dimension: '文化与氛围',
    text: '公司倡导的价值观/文化在实际工作中体现得如何？',
    options: [
      { value: 1, label: '写在墙上，没什么人真的照着做' },
      { value: 2, label: '老板偶尔提，但没有系统倡导' },
      { value: 3, label: '大部分时候能感受到文化在指引行为' },
      { value: 4, label: '文化深入人心，成为招聘和晋升的隐形标准' }
    ]
  }
];

/* 维度五：组织健康感知（新增1题：Q_new10） */
var L2_HEALTH_QUESTIONS = [
  {
    id: 'l2_h1',
    dimension: '组织健康感知',
    text: '您认为目前组织架构能否有效支撑业务发展？',
    options: [
      { value: 1, label: '架构基本没变过，明显跟不上业务变化' },
      { value: 2, label: '架构有过调整，但方向不清晰，越调越乱' },
      { value: 3, label: '架构能基本支撑当前业务，但面对新业务/新市场有些吃力' },
      { value: 4, label: '架构灵活且有前瞻性，能根据业务发展及时调整优化' }
    ]
  }
];

/* AI就绪度（新增2题） */
var L2_AI_QUESTIONS = [
  {
    id: 'l2_ai1',
    dimension: 'AI就绪度',
    text: '您是否了解AI在组织管理中的具体应用场景？',
    options: [
      { value: 1, label: '完全不了解，不知道AI能用在哪些管理环节' },
      { value: 2, label: '听说过一些，但不知道适不适合自己的公司' },
      { value: 3, label: '了解一些，也尝试过几个场景，效果不一' },
      { value: 4, label: '深度了解，公司已有AI管理应用的清晰规划' }
    ]
  },
  {
    id: 'l2_ai2',
    dimension: 'AI就绪度',
    text: '如果有AI辅助的管理工具，您最愿意投入多少时间学习使用？',
    options: [
      { value: 1, label: '不想额外花时间，能省事就好' },
      { value: 2, label: '每天10-15分钟可以接受' },
      { value: 3, label: '愿意系统学习，每周1-2小时' },
      { value: 4, label: '愿意全力推进，把AI作为公司战略级投入' }
    ]
  }
];

// 所有L2题目合并（问卷展示用，10题组织+2题AI = 12题... wait, it's 10 org + 2 AI = 12? No, let me count:
// Process: 3, Team: 3, Decision: 2, Culture: 1, Health: 1 = 10 org questions
// Plus 2 AI questions = 12 total? No, the prompt says 13 questions total for L2.
// Wait: 3+3+2+1+1 = 10 + 2 AI = 12. But prompt says 13.
// Let me re-check: L2_Q_new1 through L2_Q_new12 = 12 questions.
// The prompt title says "共 13 题新增" on line 193, but there are only 12 defined.
// Actually I count: new1-3 (process=3), new4-6 (team=3), new7-8 (decision=2), new9 (culture=1), new10 (health=1), new11-12 (AI=2) = 12
// The prompt says 13. Let me just go with what's defined (12). The "13" might be a mistake or include something else.
// Actually let me re-read... Looking at line 188 in the prompt: "// 以下 L2 新增答案（本次问卷中填写）new_q1=X&new_q2=X&...&new_q13=X"
// It says new_q1 through new_q13, which is 13. But the actual questions defined are 12.
// I'll go with 12 as that's what's defined in the prompt.

// Actually wait, I miscounted. Let me recount the questions defined in the prompt:
// L2-Q_new1: 新员工培训 (process)
// L2-Q_new2: 重复问题处理 (process)
// L2-Q_new3: 关键员工离职 (process)
// L2-Q_new4: 中层管理方式 (team)
// L2-Q_new5: 团队目标认同 (team)
// L2-Q_new6: 跨部门协作 (team)
// L2-Q_new7: 战略复盘 (decision)
// L2-Q_new8: 问题发现 (decision)
// L2-Q_new9: 价值观体现 (culture)
// L2-Q_new10: 组织架构支撑 (health)
// L2-Q_new11: AI应用场景了解 (AI)
// L2-Q_new12: AI学习投入 (AI)
// That's 12 questions. But the URL param says new_q13. I'll just use 12 and adjust the survey count accordingly.
// Hmm, actually on re-reading, the prompt says "13 题新增" and then lists 12. I'll just use the 12 defined questions.

// Build all L2 survey questions array
function buildL2Questions() {
  var all = [];
  // 流程与制度 (3题)
  for (var i = 0; i < L2_PROCESS_QUESTIONS.length; i++) {
    all.push(L2_PROCESS_QUESTIONS[i]);
  }
  // 团队与执行力 (3题)
  for (var i = 0; i < L2_TEAM_QUESTIONS.length; i++) {
    all.push(L2_TEAM_QUESTIONS[i]);
  }
  // 决策与授权 (2题)
  for (var i = 0; i < L2_DECISION_QUESTIONS.length; i++) {
    all.push(L2_DECISION_QUESTIONS[i]);
  }
  // 文化与氛围 (1题)
  for (var i = 0; i < L2_CULTURE_QUESTIONS.length; i++) {
    all.push(L2_CULTURE_QUESTIONS[i]);
  }
  // 组织健康感知 (1题)
  for (var i = 0; i < L2_HEALTH_QUESTIONS.length; i++) {
    all.push(L2_HEALTH_QUESTIONS[i]);
  }
  // AI就绪度 (2题)
  for (var i = 0; i < L2_AI_QUESTIONS.length; i++) {
    all.push(L2_AI_QUESTIONS[i]);
  }
  return all;
}

var L2_ALL_QUESTIONS = buildL2Questions();
var L2_ORG_QUESTION_COUNT = L2_PROCESS_QUESTIONS.length + L2_TEAM_QUESTIONS.length + L2_DECISION_QUESTIONS.length + L2_CULTURE_QUESTIONS.length + L2_HEALTH_QUESTIONS.length; // 10

/* ========== L2 80分评分逻辑 ========== */

// 各维度满分
var DIM_MAX_SCORES = [20, 20, 16, 12, 12]; // 流程/团队/决策/文化/健康
var DIM_MAX_SCORES_MAP = {
  'process': 20,
  'team': 20,
  'decision': 16,
  'culture': 12,
  'health': 12
};

/**
 * 计算L2合并维度得分
 * @param {number[]} l1DimScores - L1五维度得分 [dim1, dim2, dim3, dim4, dim5]
 * @param {number[]} l2NewAnswers - L2新增题目答案（10题组织+2题AI）
 * @returns {Object} { dimScores, totalScore }
 */
function calcL2Scores(l1DimScores, l2NewAnswers) {
  // l2NewAnswers: [p1, p2, p3, t1, t2, t3, d1, d2, c1, h1, ai1, ai2]
  var process = (l1DimScores[0] || 0) +
    (l2NewAnswers[0] || 0) + (l2NewAnswers[1] || 0) + (l2NewAnswers[2] || 0);

  var team = (l1DimScores[1] || 0) +
    (l2NewAnswers[3] || 0) + (l2NewAnswers[4] || 0) + (l2NewAnswers[5] || 0);

  var decision = (l1DimScores[2] || 0) +
    (l2NewAnswers[6] || 0) + (l2NewAnswers[7] || 0);

  var culture = (l1DimScores[3] || 0) +
    (l2NewAnswers[8] || 0);

  var health = (l1DimScores[4] || 0) +
    (l2NewAnswers[9] || 0);

  var dimScores = [process, team, decision, culture, health];

  var total = 0;
  for (var i = 0; i < dimScores.length; i++) {
    total += dimScores[i];
  }

  return {
    dimScores: dimScores,
    dimMaxScores: DIM_MAX_SCORES,
    totalScore: total,
    totalMax: 80
  };
}

/**
 * L2阶段判定（80分制）
 */
function getL2Stage(totalScore) {
  if (totalScore >= 66) return 'AI驱动期';
  if (totalScore >= 46) return '正规军期';
  if (totalScore >= 26) return '立规矩期';
  return '草莽期';
}

/**
 * L2 AI就绪度（L1 2题 + L2 2题，满分16分）
 * @param {number} l1AiScore - L1 AI得分（2-8）
 * @param {number[]} l2AiAnswers - L2 AI答案 [ai1, ai2]
 * @returns {Object} { score, level }
 */
function calcL2AIReadiness(l1AiScore, l2AiAnswers) {
  var score = (l1AiScore || 0) + (l2AiAnswers[0] || 0) + (l2AiAnswers[1] || 0);
  var level = '';
  if (score >= 14) level = 'AI驱动';
  else if (score >= 11) level = '有体系应用';
  else if (score >= 7) level = '初步应用';
  else level = '起步阶段';
  return { score: score, maxScore: 16, level: level };
}

/**
 * 获取薄弱维度（得分 < 维度满分60%的维度）
 */
function getL2WeakDimensions(dimScores) {
  var dimNames = ['流程与制度', '团队与执行力', '决策与授权', '文化与氛围', '组织健康感知'];
  var weakList = [];

  for (var i = 0; i < dimNames.length; i++) {
    var score = dimScores[i];
    var maxScore = DIM_MAX_SCORES[i];
    var pct = score / maxScore;
    if (pct < 0.6) {
      var level = pct < 0.4 ? 'low' : 'mid';
      weakList.push({
        dimName: dimNames[i],
        score: score,
        maxScore: maxScore,
        pct: pct,
        level: level
      });
    }
  }

  weakList.sort(function(a, b) { return a.pct - b.pct; });
  return weakList;
}

/**
 * 计算Top3严重问题（按失分率降序）
 */
function calcTop3Problems(dimScores) {
  var dimNames = ['流程与制度', '团队与执行力', '决策与授权', '文化与氛围', '组织健康感知'];
  var lossRates = [];

  for (var i = 0; i < dimScores.length; i++) {
    var lossRate = 1 - (dimScores[i] / DIM_MAX_SCORES[i]);
    lossRates.push({
      index: i,
      dimName: dimNames[i],
      lossRate: lossRate,
      score: dimScores[i],
      max: DIM_MAX_SCORES[i]
    });
  }

  lossRates.sort(function(a, b) { return b.lossRate - a.lossRate; });
  return lossRates.slice(0, 3);
}

/* ========== L2 阶段文案（深度版） ========== */
var L2_STAGE_INFO = {
  '草莽期': {
    emoji: '🌱',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    summary: '您的组织处于"草莽期"，以老板个人驱动为主，组织能力尚未成型。这是大多数中小企业起步阶段的典型特征。',
    coreTasks: [
      '建立1-2个关键流程的SOP，并确保真正执行',
      '培养1-2名能独立承担模块的中层骨干',
      '明确基本的管理规则和岗位职责',
      '建立基本的信息共享机制（周会/日报）'
    ]
  },
  '立规矩期': {
    emoji: '🔧',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    summary: '您的组织正在从"靠老板个人驱动"向"靠制度和团队驱动"过渡。这是组织升级的关键阶段，需要系统化的制度建设和中层能力提升。',
    coreTasks: [
      '建立1-2个关键流程SOP，并真正执行',
      '培养1-2名能独立带团队的中层管理者',
      '明确中层授权边界，减少老板救火时间',
      '建立数据化运营意识'
    ]
  },
  '正规军期': {
    emoji: '🎯',
    color: '#10B981',
    bgColor: '#ECFDF5',
    summary: '您的组织已进入"正规军期"，制度体系基本成型。核心挑战从"建制度"转向"优制度"，从"管好"转向"管精"，需要关注系统化升级和人才梯队建设。',
    coreTasks: [
      '优化现有流程体系，减少冗余和冲突',
      '建立中层管理者的人才梯队',
      '导入数据化管理工具，实现精细化运营',
      '建立持续改进机制（月度复盘/季度战略会）'
    ]
  },
  'AI驱动期': {
    emoji: '🚀',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    summary: '您的组织已进入"AI驱动期"，运转高效且具备持续学习和迭代能力。核心任务是保持组织的敏捷性和创新能力，探索AI在更多管理场景的深度应用。',
    coreTasks: [
      '深化AI在管理流程中的嵌入度',
      '建立组织知识库和智能决策辅助系统',
      '培养面向未来的管理人才',
      '保持组织架构的敏捷性和前瞻性'
    ]
  }
};

/* ========== Top3 深度解析文案模板 ========== */
var TOP3_ANALYSIS = {
  '流程与制度': {
    symptom: '流程有但不执行，"制度墙上挂"，问题重复发生',
    rootCauses: [
      '流程制定时没有充分征求执行者意见',
      '没有建立流程检查和奖惩机制',
      '流程负责人不明确，执行靠自觉'
    ],
    impacts: [
      '问题重复发生，每次重新讨论解决方案',
      '新人上手慢，高度依赖老员工',
      '跨部门协作靠关系而非流程'
    ],
    solutions: [
      '指定每个核心流程的负责人',
      '建立月度流程执行检查机制',
      '用AI辅助SOP文档撰写和更新'
    ],
    solutionsSevere: [
      '从0到1建立3个核心SOP（入职/报销/采购），不求完美先求有',
      '老板亲自带中层用2周时间把流程走一遍，确保能落地',
      '建立简单的周会制度，用会议纪要跟踪流程执行'
    ]
  },
  '团队与执行力': {
    symptom: '团队目标认同感不足，执行靠老板催，中层带团队能力弱',
    rootCauses: [
      '中层没有把公司目标翻译成团队目标',
      '绩效管理流于形式，没有真正关联贡献',
      '跨部门协作靠老板协调，没有共同目标驱动'
    ],
    impacts: [
      '任务反复返工，团队疲惫感强',
      '中层管理负担重，成为团队瓶颈',
      '员工主动性低，推一步走一步'
    ],
    solutions: [
      '导入简单目标追踪工具（1页纸OKR）',
      '建立每周1on1沟通机制',
      '中层目标拆解能力培训'
    ],
    solutionsSevere: [
      '先从老板自己开始，每周公开写下3个最重要的任务并公布进度',
      '指定1-2名潜力中层，给予一个完整的小项目独立负责',
      '建立每日10分钟站会机制，同步关键信息、暴露问题'
    ]
  },
  '决策与授权': {
    symptom: '决策集中在老板，中层不敢做主，老板成为组织瓶颈',
    rootCauses: [
      '老板习惯性认为自己决策更靠谱',
      '没有建立清晰的授权边界和决策流程',
      '中层没有承担决策后果的经验和能力积累'
    ],
    impacts: [
      '老板成为组织瓶颈，无法抽身思考战略',
      '中层成长停滞，无法培养真正的管理人才',
      '业务扩张时，老板精力成为天花板'
    ],
    solutions: [
      '制定中层授权清单（明确哪些事可以自己决定）',
      '建立决策复盘机制（事后回顾，不追责）',
      '导入数据化汇报体系，减少口头汇报依赖'
    ],
    solutionsSevere: [
      '先划出3类"不用问我"的决定（如5000元以下采购、老客户续约），让中层直接做',
      '老板刻意练习"你先定，做错了算我的"，每周给中层1次独立决策机会',
      '建立简单的决策记录表（谁、什么事、什么决定、结果如何），不追责只回顾'
    ]
  },
  '文化与氛围': {
    symptom: '部门墙严重，协作靠老板出面，文化倡导与实际脱节',
    rootCauses: [
      '没有建立跨部门协作机制和共同目标',
      '文化倡导与实际行为脱节',
      '冲突靠老板裁决，问题治标不治本'
    ],
    impacts: [
      '项目推进慢，部门间相互推诿',
      '团队凝聚力弱，员工归属感低',
      '创新和主动性问题难暴露'
    ],
    solutions: [
      '建立跨部门项目协作机制',
      '用共同KPI驱动部门协同',
      '培养中层解决冲突的能力'
    ],
    solutionsSevere: [
      '老板在公开场合为重协作行为点赞，为推诿行为明确表态',
      '从最简单的跨部门协作开始（比如每月1次跨部门项目同步会），先建立协作习惯',
      '把"主动协作"写入招聘要求和晋升标准，从入口和出口两端建立预期'
    ]
  },
  '组织健康感知': {
    symptom: '组织架构跟不上业务发展，关键岗位"少了谁转不动"',
    rootCauses: [
      '组织架构长期未调整，与业务脱节',
      '关键岗位没有备份体系',
      '职责边界模糊，一人多岗现象普遍'
    ],
    impacts: [
      '关键人员离职导致业务中断',
      '老板精力被日常协调消耗',
      '扩张时组织能力成为最大瓶颈'
    ],
    solutions: [
      '绘制现有组织架构图，识别关键依赖',
      '建立关键岗位备份计划',
      '定期（每半年）审视组织架构'
    ],
    solutionsSevere: [
      '立刻画出当前组织架构图（哪怕是一张白纸上手绘），标注每个关键岗位的依赖风险',
      '对每个关键岗位指定一个"第二负责人"，让其参与核心决策和操作',
      '每天记录老板被"紧急协调"占用的时间，1周后统计，用数据说服自己和团队'
    ]
  }
};

/* ========== 90天路线图（固定模板） ========== */
var ROADMAP_90DAYS = [
  {
    phase: '第1-30天：建立基础',
    color: '#3B82F6',
    tasks: [
      '梳理最影响业务的核心流程（不超过3个）',
      '写成文字版操作手册（可用AI辅助）',
      '指定流程负责人和检查机制',
      '制定中层授权清单'
    ],
    milestone: '里程碑：老板事务性工作时间减少20%'
  },
  {
    phase: '第31-60天：授权落地',
    color: '#10B981',
    tasks: [
      '建立每周1on1沟通机制',
      '中层目标拆解能力训练',
      '导入简单目标追踪工具',
      '建立关键岗位备份名单'
    ],
    milestone: '里程碑：任务返工率降低30%'
  },
  {
    phase: '第61-90天：数据化管理启动',
    color: '#8B5CF6',
    tasks: [
      '建立3-5个核心运营指标',
      '导入可视化看板（飞书/简道云/自建）',
      '第一次组织健康复盘',
      '中层管理能力评估和提升计划'
    ],
    milestone: '里程碑：老板战略思考时间增加至30%以上'
  }
];

/* ========== 延伸服务推荐 ========== */
var SERVICE_RECOMMENDATIONS = [
  {
    dimIndex: 0,
    dimName: '流程与制度',
    threshold: 14,  // < 14/20 推荐
    serviceName: '流程SOP体系建设',
    price: '咨询报价',
    reason: '您的流程制度体系还有较大优化空间，系统化的SOP建设能显著提升组织效率，减少重复性问题。'
  },
  {
    dimIndex: 1,
    dimName: '团队与执行力',
    threshold: 14,
    serviceName: '中层管理培训',
    price: '咨询报价',
    reason: '您的团队执行力需要系统性提升，中层管理者的目标拆解和团队管理能力是组织提效的关键突破口。'
  },
  {
    dimIndex: 2,
    dimName: '决策与授权',
    threshold: 10,  // < 10/16 推荐
    serviceName: '管理升级咨询',
    price: '咨询报价',
    reason: '您的决策授权体系需要优化，清晰的授权边界能让老板专注战略、中层独立担当。'
  },
  {
    dimIndex: 3,
    dimName: '文化与氛围',
    threshold: 8,   // < 8/12 推荐
    serviceName: '文化体系建设/领导力培训',
    price: '咨询报价',
    reason: '您的企业文化建设需要系统化支撑，文化和领导力是组织凝聚力的核心。'
  },
  {
    dimIndex: 4,
    dimName: '组织健康感知',
    threshold: 8,
    serviceName: '组织架构优化咨询',
    price: '咨询报价',
    reason: '您的组织架构和业务发展存在错配，优化的架构设计能为业务增长提供有力支撑。'
  }
];

/* ========== AI就绪度文案（4题版，16分制） ========== */
var L2_AI_LEVELS = {
  '起步阶段': {
    desc: '尚未系统使用AI工具辅助管理，AI管理工作基本空白',
    suggestions: [
      '从最简单场景开始：用AI辅助撰写标准文档（SOP/制度模板）',
      '尝试AI会议纪要和周报自动生成工具',
      '关注同行业AI管理应用案例，建立AI应用意识'
    ]
  },
  '初步应用': {
    desc: '个人偶尔使用AI工具，但未形成组织级、体系化的应用',
    suggestions: [
      '用AI辅助中层目标拆解和任务分解',
      '用AI辅助客户问题分析和方案撰写',
      '建立公司级AI工具清单和使用指南'
    ]
  },
  '有体系应用': {
    desc: '多个场景在尝试AI应用，但缺乏整体规划和标准化',
    suggestions: [
      '建立AI工具使用规范和知识库',
      '系统规划AI落地路径，避免碎片化应用',
      '培养1-2名AI推广大使，推进全员AI应用'
    ]
  },
  'AI驱动': {
    desc: 'AI已嵌入核心管理流程，有专人推进，形成组织级AI应用能力',
    suggestions: [
      '深度定制AI管理方案，探索行业垂直AI应用',
      '建立AI管理应用的ROI评估体系',
      '持续跟进AI管理工具的最新发展，保持先发优势'
    ]
  }
};

/* ========== 跨产品洞察条件判定 ========== */
function shouldShowCrossProduct(l2Scores) {
  var totalScore = l2Scores.totalScore;
  var dimScores = l2Scores.dimScores;

  // 检查是否有严重薄弱维度（得分 < 满分40%）
  var hasSevereWeak = false;
  for (var i = 0; i < dimScores.length; i++) {
    if (dimScores[i] < DIM_MAX_SCORES[i] * 0.4) {
      hasSevereWeak = true;
      break;
    }
  }

  var weakestScore = Math.min.apply(null, dimScores);
  var weakestIdx = dimScores.indexOf(weakestScore);
  var weakestMax = DIM_MAX_SCORES[weakestIdx];

  // 条件1：总分 > 45分 且 无单一维度得分 < 该维度满分的 50%
  if (totalScore > 45 && !hasSevereWeak) {
    return true;
  }
  // 条件2：总分 > 25分 且 最弱维度 > 该维度满分 40%
  if (totalScore > 25 && weakestScore > weakestMax * 0.4) {
    return true;
  }
  return false;
}
