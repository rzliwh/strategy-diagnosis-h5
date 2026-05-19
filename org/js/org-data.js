/**
 * org-data.js - 问卷题目、评分逻辑、报告文案模板
 * 组织诊断H5
 */

/* ========== 基础信息 ========== */
var ROLE_OPTIONS = [
  { value: 'owner', label: '创始人/老板/联合创始人' },
  { value: 'senior', label: '中高层管理者（总监/副总/部门负责人）' },
  { value: 'middle', label: '中层管理者（经理/主管/团队负责人）' },
  { value: 'other', label: '其他' }
];

var ROLE_LABELS = {
  'owner': '创始人/老板',
  'senior': '中高层管理者',
  'middle': '中层管理者',
  'other': '其他'
};

/* ========== 维度一：流程与制度（Q2-Q3，各4分，共8分）========== */
var PROCESS_QUESTIONS = [
  {
    id: 'p1',
    dimension: '流程与制度',
    text: '公司的核心业务流程（销售/采购/生产），有没有文字版的SOP？',
    options: [
      { value: 1, label: '基本没有，全靠人传人' },
      { value: 2, label: '有一些，但不完整，执行靠人自觉' },
      { value: 3, label: '主要流程有SOP，基本能执行' },
      { value: 4, label: '全面的SOP体系，并且在持续更新和优化' }
    ]
  },
  {
    id: 'p2',
    dimension: '流程与制度',
    text: '公司的审批流程（请假/报销/采购等）是怎么运转的？',
    options: [
      { value: 1, label: '全靠找人，不知道该找谁' },
      { value: 2, label: '有基本流程，但经常卡住，要靠催' },
      { value: 3, label: '流程清晰，权限明确，大部分能按时完成' },
      { value: 4, label: '线上化审批，自动流转，数据可追踪' }
    ]
  }
];

/* ========== 维度二：团队与执行力（Q4-Q5，各4分，共8分）========== */
var TEAM_QUESTIONS = [
  {
    id: 't1',
    dimension: '团队与执行力',
    text: '你把一个任务交给中层之后，通常会发生什么？',
    options: [
      { value: 1, label: '需要反复跟进，否则要么没进展，要么结果跑偏' },
      { value: 2, label: '大方向对，但细节出错多，需要频繁纠偏' },
      { value: 3, label: '大部分任务能按时完成，偶尔需要介入' },
      { value: 4, label: '中层能独立拆解目标、配置资源、追踪过程，基本不需要老板介入' }
    ]
  },
  {
    id: 't2',
    dimension: '团队与执行力',
    text: '公司的绩效考核是怎么运转的？',
    options: [
      { value: 1, label: '基本靠感觉打分，或者年底算总账' },
      { value: 2, label: '有KPI，但目标设定主观，执行流于形式' },
      { value: 3, label: 'KPI与业务目标挂钩，有定期复盘，基本能客观反映贡献' },
      { value: 4, label: 'OKR/KPI体系成熟，过程数据化追踪，定期复盘迭代' }
    ]
  }
];

/* ========== 维度三：决策与授权（Q6-Q7，各4分，共8分）========== */
var DECISION_QUESTIONS = [
  {
    id: 'd1',
    dimension: '决策与授权',
    text: '老板一天的时间，大概怎么分配？',
    options: [
      { value: 1, label: '大部分时间在处理具体事务和救火，几乎没有时间思考战略' },
      { value: 2, label: '一半以上时间在处理事务，战略思考时间严重不够' },
      { value: 3, label: '事务性工作在减少，有一定时间做战略思考' },
      { value: 4, label: '日常运营基本由团队自主推进，老板专注战略和关键决策' }
    ]
  },
  {
    id: 'd2',
    dimension: '决策与授权',
    text: '中层有没有被授权做决定？',
    options: [
      { value: 1, label: '几乎没有，大小事都要请示老板' },
      { value: 2, label: '小事可以自己决定，但稍微重要一点就要上报' },
      { value: 3, label: '有清晰的授权范围，中层在职责内可以独立决策' },
      { value: 4, label: '授权充分且有数据支撑，中层基于数据做决策，老板只看结果' }
    ]
  }
];

/* ========== 维度四：文化与氛围（Q8-Q9，各4分，共8分）========== */
var CULTURE_QUESTIONS = [
  {
    id: 'c1',
    dimension: '文化与氛围',
    text: '当团队内部出现冲突或配合不畅，通常是怎么解决的？',
    options: [
      { value: 1, label: '拖着，或者靠老板出面裁决' },
      { value: 2, label: '开会沟通，但根本问题没解决，下次还会发生' },
      { value: 3, label: '有规范的沟通机制，大部分问题能在团队内部消化' },
      { value: 4, label: '有清晰的职责边界和协作规范，冲突少，有问题能快速找到责任人' }
    ]
  },
  {
    id: 'c2',
    dimension: '文化与氛围',
    text: '如果用一句话描述公司目前的管理状态，最接近哪个？',
    options: [
      { value: 1, label: '"每天像在打仗，老板最累，但问题还是不断"' },
      { value: 2, label: '"大方向没问题，就是落地总是差一口气"' },
      { value: 3, label: '"基本稳了，但想要更高效，感觉有瓶颈"' },
      { value: 4, label: '"团队能自己跑，我在想更大的事"' }
    ]
  }
];

/* ========== 维度五：组织健康感知（Q10-Q11，各4分，共8分）========== */
var HEALTH_QUESTIONS = [
  {
    id: 'h1',
    dimension: '组织健康感知',
    text: '您觉得公司最大的管理瓶颈在哪里？',
    options: [
      { value: 1, label: '没有标准化流程，全靠人' },
      { value: 2, label: '流程有了，但执行力不行，推不动' },
      { value: 3, label: '执行力不错，但效率遇到天花板，需要系统升级' },
      { value: 4, label: '系统已比较完善，核心挑战是管理升级和人才发展' }
    ]
  },
  {
    id: 'h2',
    dimension: '组织健康感知',
    text: '公司里有没有"少了某个人就转不动"的情况？',
    options: [
      { value: 1, label: '有好几个，老板本人最不能缺' },
      { value: 2, label: '有1-2个关键人物，他们一走就会出问题' },
      { value: 3, label: '核心业务有备份，但某些岗位还是依赖特定人' },
      { value: 4, label: '基本实现"流程管人"，关键岗位有备份和交接机制' }
    ]
  }
];

/* ========== AI就绪度专项（附加，2题，不计入总分）========== */
var AI_QUESTIONS = [
  {
    id: 'ai1',
    text: '目前公司有没有在用AI工具辅助管理工作？',
    options: [
      { value: 1, label: '几乎没有，AI对我们来说很陌生' },
      { value: 2, label: '个人偶尔用，但没系统化用于管理' },
      { value: 3, label: '有几个场景在用，但还没形成体系' },
      { value: 4, label: 'AI已嵌入多个管理流程，有专人推进' }
    ]
  },
  {
    id: 'ai2',
    text: '如果用AI工具提升管理效率，您最希望先解决什么？',
    options: [
      { value: 1, label: '减少重复性行政工作（写文档/整理数据）' },
      { value: 2, label: '提升团队执行效率（任务追踪/自动提醒）' },
      { value: 3, label: '数据分析与决策支持（预测趋势/优化资源）' },
      { value: 4, label: '不是AI的问题，是管理机制的问题' }
    ]
  }
];

/* ========== 维度中文标签（用于雷达图）========== */
var DIM_LABELS = ['流程与制度', '团队与执行力', '决策与授权', '文化与氛围', '组织健康感知'];

/* ========== 维度Key列表 ========== */
var DIM_KEYS = ['process', 'team', 'decision', 'culture', 'health'];

/* ========== 阶段文案模板 ========== */
var STAGE_INFO = {
  '草莽期': {
    emoji: '🌱',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    summary: '您的公司目前处于"草莽期"，以老板个人驱动为主，组织能力尚未成型。',
    signals: [
      '制度少或者写在纸上没人执行',
      '大事小事基本靠老板拍板',
      '员工来了靠"传帮带"，没有标准流程',
      '团队不稳定，关键岗位没有备份'
    ]
  },
  '立规矩期': {
    emoji: '🔧',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    summary: '您的公司正在从"靠老板个人驱动"向"靠制度和团队驱动"过渡。',
    signals: [
      '有制度，但员工当成摆设',
      '中层说"我尽力了"，但结果还是差一口气',
      '想规范化，但不知道从哪里开始',
      '开过管理培训，但公司没什么变化'
    ]
  },
  '正规军期': {
    emoji: '🎯',
    color: '#10B981',
    bgColor: '#ECFDF5',
    summary: '您的公司已进入"正规军期"，制度体系基本成型，主要挑战是持续优化和人才培养。',
    signals: [
      '核心流程有SOP，中层能独立执行大部分任务',
      '有基本的授权机制，但还有优化空间',
      '绩效管理在运转，但需要更精细化',
      '组织凝聚力不错，但效率还有提升空间'
    ]
  },
  'AI驱动期': {
    emoji: '🚀',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    summary: '您的公司已进入"AI驱动期"，组织运转高效，具备持续学习和迭代能力。',
    signals: [
      '流程高度标准化，数据驱动决策',
      '中层充分授权，老板专注战略',
      'AI已嵌入多个管理场景',
      '持续优化机制在运转'
    ]
  }
};

/* ========== 薄弱维度建议文案 ========== */
var WEAK_SUGGESTIONS = {
  '流程与制度': {
    low: '您的流程体系尚未建立，关键业务缺乏标准化支撑。建议从最影响业务的1-2个核心流程开始，用AI辅助撰写SOP文档。',
    mid: '您的流程有基础但执行不力，核心问题是"有制度没人管"。建议建立流程检查机制，指定流程负责人。'
  },
  '团队与执行力': {
    low: '中层还停留在"执行者"角色，缺乏独立带团队的能力。建议从1on1周会机制开始，每周固定时间与中层一对一沟通目标与进展。',
    mid: '中层有一定能力，但目标拆解和过程追踪不够系统。建议导入简单目标追踪工具，建立周度复盘机制。'
  },
  '决策与授权': {
    low: '老板在日常事务中陷得过深，中层没有授权空间。建议明确中层授权清单（哪些事可以自己决定），保护老板的战略思考时间。',
    mid: '有一定授权但边界不清，重要决策还是要上报。建议细化授权边界，导入数据汇报机制，减少口头汇报依赖。'
  },
  '文化与氛围': {
    low: '团队冲突靠老板出面"裁决"，问题治标不治本。建议建立规范的沟通机制，明确职责边界，培养团队自行解决问题的能力。',
    mid: '有基本协作文化但主动性不足，部门墙明显。建议建立跨部门协作机制，用共同目标驱动协同。'
  },
  '组织健康感知': {
    low: '"少了谁就转不动"的情况严重，风险极高。建议立即梳理关键岗位，建立备份和交接机制，从"人管人"逐步过渡到"流程管人"。',
    mid: '组织基本健康，但效率遇到瓶颈。建议系统梳理核心业务流程，找出效率损失最大的环节进行优化。'
  }
};

/* ========== AI就绪度文案 ========== */
var AI_LEVELS = {
  '起步阶段': {
    desc: '尚未系统使用AI，靠人工处理管理工作',
    suggestions: ['AI辅助撰写标准文档（SOP/制度模板）', 'AI会议纪要和周报自动生成']
  },
  '初步应用': {
    desc: '个人偶尔用DeepSeek/豆包等AI工具，但未形成组织级应用',
    suggestions: ['用AI辅助中层目标拆解和任务分解', '用AI辅助客户问题分析和方案撰写']
  },
  '有体系应用': {
    desc: '多个场景在用AI，但缺乏整体规划',
    suggestions: ['建立AI工具使用规范和知识库', '系统规划AI落地路径，避免碎片化应用']
  },
  'AI驱动': {
    desc: 'AI已嵌入核心管理流程，有专人推进',
    suggestions: ['深度定制AI管理方案，探索行业垂直AI应用']
  }
};

/* ========== 评分逻辑 ========== */

/**
 * 计算五维度得分
 * @param {number[]} answers - Q2-Q11共10题答案（1-4分）
 * @returns {Object} { scores: {process, team, decision, culture, health}, dimScores: [5], totalScore }
 */
function calcOrgScores(answers) {
  // answers: [p1, p2, t1, t2, d1, d2, c1, c2, h1, h2]
  var dimScores = {
    process: (answers[0] || 0) + (answers[1] || 0),
    team: (answers[2] || 0) + (answers[3] || 0),
    decision: (answers[4] || 0) + (answers[5] || 0),
    culture: (answers[6] || 0) + (answers[7] || 0),
    health: (answers[8] || 0) + (answers[9] || 0)
  };

  var scoreArray = [
    dimScores.process,
    dimScores.team,
    dimScores.decision,
    dimScores.culture,
    dimScores.health
  ];

  var totalScore = 0;
  for (var i = 0; i < scoreArray.length; i++) {
    totalScore += scoreArray[i];
  }

  return {
    scores: dimScores,
    dimScores: scoreArray,
    totalScore: totalScore
  };
}

/**
 * 判定阶段
 * @param {number} totalScore - 总分（10-40）
 * @returns {string} 阶段名称
 */
function getStage(totalScore) {
  if (totalScore >= 34) return 'AI驱动期';
  if (totalScore >= 26) return '正规军期';
  if (totalScore >= 18) return '立规矩期';
  return '草莽期';
}

/**
 * 计算AI就绪度
 * @param {number[]} aiAnswers - Q12-Q13共2题答案（1-4分）
 * @returns {Object} { score, level }
 */
function calcAIReadiness(aiAnswers) {
  var score = (aiAnswers[0] || 0) + (aiAnswers[1] || 0);
  var level = '';
  if (score >= 8) level = 'AI驱动';
  else if (score >= 6) level = '有体系应用';
  else if (score >= 4) level = '初步应用';
  else level = '起步阶段';
  return { score: score, level: level };
}

/**
 * 获取薄弱维度（得分<6的维度，按升序排列）
 * @param {Object} dimScores - 各维度得分
 * @returns {Array} [{dimName, score, level, suggestion}]
 */
function getWeakDimensions(dimScores) {
  var dimNames = ['流程与制度', '团队与执行力', '决策与授权', '文化与氛围', '组织健康感知'];
  var dimKeys = ['process', 'team', 'decision', 'culture', 'health'];
  var weakList = [];

  for (var i = 0; i < dimKeys.length; i++) {
    var score = dimScores[dimKeys[i]];
    if (score < 6) {
      var level = score <= 3 ? 'low' : 'mid';
      weakList.push({
        dimName: dimNames[i],
        dimKey: dimKeys[i],
        score: score,
        level: level,
        suggestion: WEAK_SUGGESTIONS[dimNames[i]] ? WEAK_SUGGESTIONS[dimNames[i]][level] : ''
      });
    }
  }

  // 按得分升序排列（最低分在前）
  weakList.sort(function(a, b) { return a.score - b.score; });

  return weakList;
}

/**
 * 生成完整诊断结果
 * @param {Object} appData - 完整答题数据
 * @returns {Object} 报告渲染所需数据
 */
function generateOrgResult(appData) {
  var scores = calcOrgScores(appData.diagAnswers);
  var stage = getStage(scores.totalScore);
  var stageData = STAGE_INFO[stage];
  var weakDims = getWeakDimensions(scores.scores);
  var aiResult = calcAIReadiness(appData.aiAnswers);
  var aiLevelData = AI_LEVELS[aiResult.level];

  return {
    role: appData.role,
    roleLabel: ROLE_LABELS[appData.role] || '',
    scores: scores,
    stage: stage,
    stageData: stageData,
    weakDims: weakDims,
    aiResult: aiResult,
    aiLevelData: aiLevelData
  };
}

/* ========== 免责声明 ========== */
var ORG_DISCLAIMER_TEXT = '本诊断结果基于您的答题生成，仅供参考，不构成任何管理或经营决策建议。组织诊断需要结合企业实际情况和专业顾问意见综合判断。';
