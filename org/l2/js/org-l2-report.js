/**
 * org-l2-report.js - L2报告生成（9个模块）
 * 组织诊断H5 - L2深度诊断
 */

/* ========== 通用工具函数 ========== */
function toPercent(score, max) {
  return Math.round(score / max * 100);
}

/* ========== 全局结果对象 ========== */
var L2_RESULT = null;

/* ========== 初始化（report.html 直接访问时调用） ========== */
function initL2Report() {
  try {
    var params = new URLSearchParams(window.location.search);
    L2_RESULT = buildL2Result(params);
    renderL2Report();
  } catch (e) {
    var overlay = document.getElementById('report-loading-overlay');
    if (overlay) {
      overlay.innerHTML = '<div style="text-align:center;color:#EF4444;font-size:16px;">报告生成失败，请返回重试<br><small style="color:#94A3B8;">' + e.message + '</small></div>';
    }
    return;
  }
  hideLoadingOverlay();
}

/* ========== 内联渲染（survey 页面同页调用，数据由 survey 传入） ========== */
function renderL2ReportFromData(l2Result) {
  L2_RESULT = l2Result;
  renderL2Report();
}

function hideLoadingOverlay() {
  var overlay = document.getElementById('report-loading-overlay');
  if (!overlay) return;
  overlay.style.transition = 'opacity 0.3s ease';
  overlay.style.opacity = '0';
  setTimeout(function() {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 350);
}

function buildL2Result(params) {
  // L1数据
  var l1DimScores = [
    parseInt(params.get('dim1')) || 0,
    parseInt(params.get('dim2')) || 0,
    parseInt(params.get('dim3')) || 0,
    parseInt(params.get('dim4')) || 0,
    parseInt(params.get('dim5')) || 0
  ];
  var l1Stage = params.get('stage') || '';
  var role = params.get('role') || '';
  var l1AiScore = parseInt(params.get('aiScore')) || 0;
  var l1AiLevel = params.get('aiLevel') || '';

  // L2新增答案（12题）
  var l2NewAnswers = [];
  for (var i = 1; i <= 12; i++) {
    l2NewAnswers.push(parseInt(params.get('new_q' + i)) || 0);
  }

  // 计算合并得分
  var scores = calcL2Scores(l1DimScores, l2NewAnswers);
  var stage = getL2Stage(scores.totalScore);
  var stageData = L2_STAGE_INFO[stage] || {};
  var weakDims = getL2WeakDimensions(scores.dimScores);
  var top3 = calcTop3Problems(scores.dimScores);
  var aiResult = calcL2AIReadiness(l1AiScore, [l2NewAnswers[10] || 0, l2NewAnswers[11] || 0]);
  var aiLevelData = L2_AI_LEVELS[aiResult.level] || {};
  var showCrossProduct = shouldShowCrossProduct(scores);

  // 延伸服务推荐
  var services = getRecommendedServices(scores.dimScores, aiResult);

  return {
    role: role,
    l1DimScores: l1DimScores,
    l1Stage: l1Stage,
    l1TotalScore: l1DimScores[0] + l1DimScores[1] + l1DimScores[2] + l1DimScores[3] + l1DimScores[4],
    scores: scores,
    stage: stage,
    stageData: stageData,
    weakDims: weakDims,
    top3: top3,
    aiResult: aiResult,
    aiLevelData: aiLevelData,
    services: services,
    showCrossProduct: showCrossProduct,
    l2Answers: l2NewAnswers  // 保留原始答案，供报告个性化引用
  };
}

function getRecommendedServices(dimScores, aiResult) {
  var result = [];
  for (var i = 0; i < SERVICE_RECOMMENDATIONS.length; i++) {
    var s = SERVICE_RECOMMENDATIONS[i];
    if (dimScores[s.dimIndex] < s.threshold) {
      result.push(s);
    }
  }
  // 如果AI就绪度低，追加AI服务推荐
  if (aiResult && aiResult.score < 10) {
    result.push({
      dimName: 'AI就绪度',
      serviceName: 'AI管理实战训练营',
      price: '¥999',
      reason: '您的AI就绪度处于' + (aiResult.level || '') + '，系统化AI管理培训能加速组织数字化转型。'
    });
  }
  // 最多显示3个
  return result.slice(0, 3);
}

/* ========== 主渲染 ========== */
var _chartJsReady = typeof Chart !== 'undefined';

function renderL2Report() {
  // 渲染顺序：头部 → 阶段结论 → AI就绪度（紧接阶段，作为"下一阶段预告"）→ 薄弱维度 → Top3 → 路线图 → 服务 → 跨产品 → L3转化 → 免责
  renderModule1Header();
  renderModule2StageConclusion();
  renderModule6AIReadiness();
  renderModule3WeakDims();
  renderModule4Top3();
  renderModule5Roadmap();
  renderModule7Services();
  renderModule8CrossProduct();
  renderModule9L3Conversion();
  renderL2Disclaimer();

  // Chart.js 已就绪则立即绘制，否则异步加载
  if (_chartJsReady) {
    drawL2RadarChart();
  } else {
    loadChartJsAndDraw();
  }
}

function loadChartJsAndDraw() {
  // 雷达图区域显示加载中占位
  var canvas = document.getElementById('l2-radar-canvas');
  if (canvas && canvas.parentNode) {
    var placeholder = document.createElement('div');
    placeholder.id = 'radar-loading';
    placeholder.style.cssText = 'text-align:center;padding:60px 20px;color:#94A3B8;font-size:14px;min-height:200px;display:flex;align-items:center;justify-content:center;';
    placeholder.textContent = '雷达图加载中…';
    canvas.parentNode.insertBefore(placeholder, canvas);
    canvas.style.display = 'none';
  }

  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
  script.onload = function() {
    _chartJsReady = true;
    // 移除占位，显示canvas
    var ph = document.getElementById('radar-loading');
    if (ph) ph.remove();
    if (canvas) canvas.style.display = 'block';
    drawL2RadarChart();
  };
  script.onerror = function() {
    var ph = document.getElementById('radar-loading');
    if (ph) {
      ph.textContent = '雷达图加载失败，请刷新页面重试';
      ph.style.color = '#EF4444';
    }
  };
  document.head.appendChild(script);
}

/* ========== 模块1：报告头部 + 80分雷达图 ========== */
function renderModule1Header() {
  var el = document.getElementById('report-header');
  if (!el) return;

  var R = L2_RESULT;
  var now = new Date();
  var dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

  var html = '';
  html += '<div class="report-header">';
  html += '<h2 class="text-xl font-extrabold text-gray-900 mb-2">组织深度诊断报告</h2>';
  if (R.role) {
    html += '<span class="text-xs text-gray-500">' + R.role + '</span>';
  }
  html += '<span class="text-xs text-gray-400 ml-2">' + dateStr + '</span>';
  html += '<div class="report-divider"></div>';

  // 得分对比：L1 vs L2
  html += '<div class="text-center mb-2">';
  html += '<span class="text-sm text-gray-400">' + R.l1TotalScore + '/40分（L1）</span>';
  html += '<span class="text-sm text-gray-400 mx-2">→</span>';
  html += '<span class="text-3xl font-extrabold" style="color:#0F4C81">' + toPercent(R.scores.totalScore, 80) + '%</span>';
  html += '</div>';

  // 阶段标签
  html += '<div class="report-stage" style="background:' + (R.stageData.bgColor || '#EFF6FF') + ';color:' + (R.stageData.color || '#3B82F6') + '">';
  html += '<span class="text-2xl mr-1">' + (R.stageData.emoji || '') + '</span>' + R.stage;
  html += '</div>';
  html += '</div>';

  // 雷达图Canvas
  html += '<div class="bg-white rounded-xl p-2 mb-4">';
  html += '<canvas id="l2-radar-canvas" width="320" height="320" style="width:100%;height:auto;max-width:340px;margin:0 auto;display:block;"></canvas>';
  html += '</div>';

  // 维度得分明细
  html += '<div class="report-card">';
  html += '<h4 class="text-sm font-bold text-gray-700 mb-3">维度得分明细</h4>';

  var dimNames = ['流程与制度', '团队与执行力', '决策与授权', '文化与氛围', '组织健康感知'];
  for (var i = 0; i < dimNames.length; i++) {
    var pct = Math.round((R.scores.dimScores[i] / R.scores.dimMaxScores[i]) * 100);
    var barColor = pct >= 70 ? '#10B981' : (pct >= 40 ? '#F59E0B' : '#EF4444');
    html += '<div class="score-bar-row">';
    html += '<span class="score-bar-label">' + dimNames[i] + '</span>';
    html += '<div class="score-bar-track">';
    html += '<div class="score-bar-fill" style="width:' + pct + '%;background:' + barColor + '"></div>';
    html += '</div>';
    html += '<span class="score-bar-value">' + toPercent(R.scores.dimScores[i], R.scores.dimMaxScores[i]) + '%</span>';
    html += '</div>';
  }
  html += '</div>';

  el.innerHTML = html;
}

function drawL2RadarChart() {
  var canvas = document.getElementById('l2-radar-canvas');
  if (!canvas || typeof Chart === 'undefined') return;

  if (window._l2RadarChartInstance) {
    window._l2RadarChartInstance.destroy();
  }

  // 标准化到百分制用于雷达图显示
  var R = L2_RESULT;
  var scores = R.scores.dimScores;
  var maxScores = R.scores.dimMaxScores;
  var normalizedScores = [];
  for (var i = 0; i < scores.length; i++) {
    normalizedScores.push(toPercent(scores[i], maxScores[i]));
  }

  // L1对比数据
  var l1Normalized = [];
  for (var j = 0; j < R.l1DimScores.length; j++) {
    l1Normalized.push(toPercent(R.l1DimScores[j], 8));
  }

  var labels = ['流程与制度', '团队与执行力', '决策与授权', '文化与氛围', '组织健康感知'];

  var dpr = window.devicePixelRatio || 1;
  var displayWidth = Math.min(canvas.clientWidth || 340, 340);
  canvas.width = displayWidth * dpr;
  canvas.height = displayWidth * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayWidth + 'px';

  var ctx = canvas.getContext('2d');

  window._l2RadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'L2完整诊断',
          data: normalizedScores,
          backgroundColor: 'rgba(15, 76, 129, 0.12)',
          borderColor: '#3B82F6',
          borderWidth: 2,
          pointBackgroundColor: '#0F4C81',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        },
        {
          label: 'L1快速诊断（参考）',
          data: l1Normalized,
          backgroundColor: 'transparent',
          borderColor: 'rgba(148, 163, 184, 0.6)',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointBackgroundColor: '#94A3B8',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { size: 10 },
            padding: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              var idx = context.dataIndex;
              var dsIdx = context.datasetIndex;
              if (dsIdx === 0) {
                return 'L2: ' + toPercent(R.scores.dimScores[idx], R.scores.dimMaxScores[idx]) + '%';
              }
              return 'L1: ' + toPercent(R.l1DimScores[idx], 8) + '%';
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 9 },
            backdropColor: 'transparent',
            color: '#94A3B8'
          },
          pointLabels: {
            font: { size: 11, weight: '500' },
            color: '#1E293B'
          },
          grid: { color: 'rgba(0, 0, 0, 0.06)' },
          angleLines: { color: 'rgba(0, 0, 0, 0.06)' }
        }
      }
    }
  });
}

/* ========== 模块2：阶段诊断结论（深度版） ========== */
function renderModule2StageConclusion() {
  var el = document.getElementById('report-stage');
  if (!el) return;

  var R = L2_RESULT;
  var sd = R.stageData;

  var html = '';
  html += '<div class="l2-tip-banner">保存或收藏此页面链接，即可随时查看您的组织诊断报告</div>';
  html += '<h3 class="l2-module-title">阶段诊断结论</h3>';
  html += '<div class="report-card" style="border-left:4px solid ' + (sd.color || '#3B82F6') + '">';

  html += '<div class="flex items-center gap-2 mb-3">';
  html += '<span class="text-3xl">' + (sd.emoji || '') + '</span>';
  html += '<span class="text-lg font-bold" style="color:' + (sd.color || '#3B82F6') + '">' + R.stage + '</span>';
  html += '</div>';

  html += '<p class="text-sm text-gray-700 leading-relaxed mb-4">' + (sd.summary || '') + '</p>';

  if (sd.coreTasks && sd.coreTasks.length > 0) {
    html += '<div class="text-xs font-medium text-gray-500 mb-2">该阶段的核心任务：</div>';
    html += '<ul class="stage-core-tasks">';
    for (var i = 0; i < sd.coreTasks.length; i++) {
      html += '<li data-num="' + (i + 1) + '">' + sd.coreTasks[i] + '</li>';
    }
    html += '</ul>';
  }

  html += '</div>';
  el.innerHTML = html;
}

/* ========== 模块3：薄弱维度分析 ========== */
function renderModule3WeakDims() {
  var el = document.getElementById('report-weak-dims');
  if (!el) return;

  var R = L2_RESULT;

  var html = '';
  html += '<h3 class="l2-module-title">薄弱维度分析</h3>';

  if (R.weakDims.length === 0) {
    html += '<div class="report-card text-center">';
    html += '<p class="text-green-600 font-medium">所有维度均表现良好，继续保持！</p>';
    html += '</div>';
  } else {
    for (var i = 0; i < R.weakDims.length; i++) {
      var dim = R.weakDims[i];
      var levelLabel = dim.pct < 0.4 ? '需重点关注' : '有提升空间';
      var levelColor = dim.pct < 0.4 ? '#EF4444' : '#F59E0B';

      html += '<div class="suggestion-card">';
      html += '<div class="flex items-center justify-between mb-2">';
      html += '<span class="font-bold text-gray-900">' + dim.dimName + '</span>';
      html += '<span class="text-sm font-bold" style="color:' + levelColor + '">' + toPercent(dim.score, dim.maxScore) + '% · ' + levelLabel + '</span>';
      html += '</div>';

      // 进度条
      html += '<div class="w-full bg-gray-100 rounded-full h-2 mb-3">';
      html += '<div class="h-2 rounded-full" style="width:' + Math.round(dim.pct * 100) + '%;background:' + levelColor + '"></div>';
      html += '</div>';

      // 同阶段参考
      html += '<p class="text-xs text-gray-400 mb-2">📊 同阶段企业建议参考值：' + Math.round(dim.maxScore * 0.6) + '分</p>';
      html += '</div>';
    }
  }

  el.innerHTML = html;
}

/* ========== 模块4：Top3核心问题深度拆解 ========== */

// 维度 → 最相关L2答案索引（用于报告引用用户具体选择）
var DIM_ANSWER_REF = {
  '流程与制度': 1,   // new_q2: 重复问题处理方式
  '团队与执行力': 3,  // new_q4: 中层管理方式
  '决策与授权': 6,    // new_q7: 业务决策拍板
  '文化与氛围': 8,    // new_q9: 价值观体现
  '组织健康感知': 9    // new_q10: 组织架构支撑
};

// 答案选项文案（索引1-4，对应value 1-4选项）
var ANSWER_LABELS = {
  1: { 1: '老员工带带，多问多学', 2: '有基础岗位说明但没有标准', 3: '有入职培训手册和标准流程', 4: '系统化入职培训体系，AI辅助' },
  2: { 1: '每次重新讨论，靠经验灵活处理', 2: '有口头惯例但没有文字化', 3: '有文字化处理流程，基本按流程走', 4: '有流程+自动预警机制' },
  3: { 1: '一片混乱，接手需要很长时间', 2: '有交接但隐性知识带走了', 3: '有交接文档，工作能基本延续', 4: '知识库完善，离职交接标准化' },
  4: { 1: '靠感情和经验，没有明确管理方法', 2: '会开会布置任务但缺乏过程跟踪', 3: '有定期1on1和周会机制', 4: '系统化工具管理，数据可视化' },
  5: { 1: '大部分人只是来上班，不关心公司目标', 2: '知道公司目标但和自己的关系不清晰', 3: '基本认同，日常工作与目标挂钩', 4: '团队高度认同，个人与组织目标一致' },
  6: { 1: '部门墙严重，协作全靠老板协调', 2: '有协作需求时会沟通但主动性不足', 3: '有协作机制，大部分时候能顺畅配合', 4: '跨部门信息共享，主动补位' },
  7: { 1: '老板自己拍板，直觉判断为主', 2: '老板主导，听取个别骨干意见后决定', 3: '有基本的决策流程，关键数据和意见会收集', 4: '系统化决策机制，数据驱动+授权范围内自主决策' },
  8: { 1: '客户投诉或损失出现后才知道', 2: '老板感觉不对了去问才发现', 3: '中层会主动反馈但不够及时', 4: '数据看板实时呈现，关键指标异常自动预警' },
  9: { 1: '写在墙上，没什么人真的照着做', 2: '老板偶尔提但没有系统倡导', 3: '大部分时候能感受到文化在指引行为', 4: '文化深入人心，成为招聘和晋升的隐形标准' },
  10: { 1: '架构基本没变过，明显跟不上业务变化', 2: '有过调整但方向不清晰，越调越乱', 3: '能基本支撑当前业务，面对新业务有些吃力', 4: '架构灵活有前瞻性，能根据业务发展及时调整' }
};

function renderModule4Top3() {
  var el = document.getElementById('report-top3');
  if (!el) return;

  var R = L2_RESULT;
  var top3 = R.top3;

  var html = '';
  html += '<h3 class="l2-module-title">Top3核心问题深度拆解</h3>';

  for (var i = 0; i < top3.length; i++) {
    var t = top3[i];
    var analysis = TOP3_ANALYSIS[t.dimName];
    var severityClass = t.lossRate > 0.6 ? 'severe' : 'warning';
    var isSevere = t.lossRate > 0.6;

    html += '<div class="top3-card ' + severityClass + '">';
    html += '<div class="top3-header">';
    html += '<span class="top3-rank ' + severityClass + '">' + (i + 1) + '</span>';
    html += '<span class="top3-title">' + t.dimName + ' — ' + toPercent(t.score, t.max) + '%（失分' + Math.round(t.lossRate * 100) + '%）</span>';
    html += '</div>';

    if (analysis) {
      // 个性化引用：引用用户的具体选项
      var refIdx = DIM_ANSWER_REF[t.dimName];
      if (refIdx !== undefined && R.l2Answers && ANSWER_LABELS[refIdx + 1]) {
        var chosenValue = R.l2Answers[refIdx] || 0;
        var chosenLabel = ANSWER_LABELS[refIdx + 1][chosenValue] || '';
        if (chosenLabel) {
          html += '<div class="top3-section-label">您的作答：</div>';
          html += '<p class="top3-text" style="color:#0F4C81;font-style:italic;">"' + chosenLabel + '"</p>';
        }
      }

      // 问题表现
      html += '<div class="top3-section-label">问题表现：</div>';
      html += '<p class="top3-text">' + analysis.symptom + '</p>';

      // 根因分析
      html += '<div class="top3-section-label">根因分析：</div>';
      html += '<div class="top3-section-content">';
      for (var j = 0; j < analysis.rootCauses.length; j++) {
        html += '<div class="top3-item">' + analysis.rootCauses[j] + '</div>';
      }
      html += '</div>';

      // 影响评估
      html += '<div class="top3-section-label">影响评估：</div>';
      html += '<div class="top3-section-content">';
      for (var k = 0; k < analysis.impacts.length; k++) {
        html += '<div class="top3-item">' + analysis.impacts[k] + '</div>';
      }
      html += '</div>';

      // 解决路径（重度 vs 中度分层）
      var currentSolutions = (isSevere && analysis.solutionsSevere) ? analysis.solutionsSevere : analysis.solutions;
      html += '<div class="top3-section-label">解决路径（按优先级）' + (isSevere ? ' — 基础建设优先' : '') + '：</div>';
      html += '<div class="top3-section-content">';
      for (var m = 0; m < currentSolutions.length; m++) {
        html += '<div class="top3-item">' + currentSolutions[m] + '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
  }

  el.innerHTML = html;
}

/* ========== 模块5：90天组织升级路线图 ========== */
function renderModule5Roadmap() {
  var el = document.getElementById('report-roadmap');
  if (!el) return;

  var html = '';
  html += '<h3 class="l2-module-title">📅 90天组织升级路线图</h3>';

  for (var i = 0; i < ROADMAP_90DAYS.length; i++) {
    var phase = ROADMAP_90DAYS[i];
    html += '<div class="roadmap-card">';
    html += '<div class="roadmap-phase">';
    html += '<div class="roadmap-phase-header">';
    html += '<span class="roadmap-phase-num p' + (i + 1) + '">' + (i + 1) + '</span>';
    html += '<span class="roadmap-phase-title">' + phase.phase + '</span>';
    html += '</div>';
    html += '<ul class="roadmap-task-list">';
    for (var j = 0; j < phase.tasks.length; j++) {
      html += '<li>' + phase.tasks[j] + '</li>';
    }
    html += '</ul>';
    html += '<div class="roadmap-milestone">🎯 ' + phase.milestone + '</div>';
    html += '</div>';
    html += '</div>';
  }

  el.innerHTML = html;
}

/* ========== 模块6：AI就绪度V2 ========== */
function renderModule6AIReadiness() {
  var el = document.getElementById('report-ai');
  if (!el) return;

  var R = L2_RESULT;
  var ai = R.aiResult;
  var aiData = R.aiLevelData;

  if (!aiData) return;

  var levelWidth = Math.round((ai.score / ai.maxScore) * 100);

  var html = '';
  html += '<h3 class="l2-module-title">AI就绪度专项评估</h3>';
  html += '<p class="text-xs text-gray-500 mb-3">组织升级的下一个驱动力，往往不是"再建一个制度"，而是用AI工具放大现有组织能力。以下评估您的AI应用基础：</p>';
  html += '<div class="ai-readiness-card">';

  // 档位
  html += '<div class="text-center mb-3">';
  html += '<span class="inline-block px-4 py-1 rounded-full text-white text-sm font-bold" style="background:#059669">' + ai.level + '</span>';
  html += '</div>';

  // 得分（L1 + L2 合并）
  html += '<div class="text-center text-sm text-gray-500 mb-2">综合得分：' + toPercent(ai.score, ai.maxScore) + '%（L1 + L2 合并评估）</div>';

  // 进度条
  html += '<div class="ai-level-bar-track">';
  html += '<div class="ai-level-bar-fill" style="width:' + levelWidth + '%"></div>';
  html += '</div>';

  // 描述
  html += '<p class="text-sm text-gray-700 mb-4 text-center">' + aiData.desc + '</p>';

  // 建议
  html += '<div class="text-xs text-gray-500 mb-1">落地建议</div>';
  html += '<ul class="signal-list">';
  for (var i = 0; i < aiData.suggestions.length; i++) {
    html += '<li>' + aiData.suggestions[i] + '</li>';
  }
  html += '</ul>';

  html += '<p class="text-xs text-gray-400 mt-4 text-center">此评估仅供参考，不计入组织健康诊断总分</p>';
  html += '</div>';

  el.innerHTML = html;
}

/* ========== 模块7：延伸服务推荐 ========== */
function renderModule7Services() {
  var el = document.getElementById('report-services');
  if (!el) return;

  var R = L2_RESULT;

  var html = '';
  html += '<h3 class="l2-module-title">🚀 拿到你的组织升级方案</h3>';

  if (R.services.length === 0) {
    html += '<div class="report-card text-center">';
    html += '<p class="text-green-600 font-medium">您的各维度表现良好，暂无特别推荐的服务</p>';
    html += '</div>';
  } else {
    // 拼合所有弱维度的 dirParam
    var allDims = [];
    for (var i = 0; i < R.services.length; i++) {
      allDims.push(R.services[i].dirParam);
    }
    var dimParam = allDims.join(',');

    var primary = R.services[0];
    var dimCountText = R.services.length > 1 ? '涵盖' + R.services.length + '个维度' : '';

    // 主推荐CTA卡片
    html += '<div class="report-card" style="background:linear-gradient(135deg,#EFF6FF,#F0F9FF);border:2px solid #93C5FD;">';
    html += '<p class="text-sm text-gray-700 leading-relaxed mb-1">根据你的诊断结果，<strong>优先解决「' + primary.serviceName + '」</strong>' + dimCountText + '</p>';
    html += '<p class="text-xs text-gray-500 mb-4">诊断告诉你哪个环节弱，方案告诉你怎么改。</p>';

    html += '<div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:14px;">';
    html += '<p class="text-sm font-bold text-gray-800 mb-2">📦 包含内容</p>';
    html += '<ul class="text-xs text-gray-600" style="list-style:none;padding:0;">';
    html += '<li class="py-1">📘 90天分步执行手册 —— 每周干什么、谁来做、做到什么标准</li>';
    html += '<li class="py-1">📋 3个可直接填写的模板 —— 拿来就能用</li>';
    html += '<li class="py-1">📖 2个同类型企业的真实案例 —— 怎么做的、踩了什么坑</li>';
    html += '<li class="py-1">📅 90天关键节点检查清单</li>';
    html += '</ul>';
    html += '</div>';

    html += '<a href="action/index.html?dim=' + dimParam + '" style="display:block;width:100%;padding:14px 20px;border-radius:14px;background:linear-gradient(135deg,#0F4C81,#1E40AF);color:#fff;font-size:16px;font-weight:700;text-align:center;text-decoration:none;box-shadow:0 4px 16px rgba(15,76,129,0.3);">查看组织升级方案 →</a>';
    html += '<p class="text-xs text-gray-400 text-center mt-2">一份方案覆盖你的全部薄弱维度，¥99</p>';
    html += '</div>';

    // 次要弱维度提示
    if (R.services.length > 1) {
      html += '<div class="report-card" style="margin-top:14px;">';
      html += '<p class="text-sm font-bold text-gray-700 mb-2">本方案同时覆盖以下维度</p>';
      for (var j = 1; j < R.services.length; j++) {
        var sec = R.services[j];
        html += '<div style="padding:10px 0;border-bottom:1px solid #F1F5F9;">';
        html += '<span class="text-sm text-gray-700 font-medium">✅ ' + sec.serviceName + '</span>';
        html += '<span class="text-xs text-gray-500 ml-2">' + sec.reason + '</span>';
        html += '</div>';
      }
      html += '<p class="text-xs text-gray-400 mt-3">以上维度已包含在本方案中，无需额外付款</p>';
      html += '</div>';
    }
  }

  el.innerHTML = html;
}

/* ========== 模块8：跨产品洞察（条件显示） ========== */
function renderModule8CrossProduct() {
  var el = document.getElementById('report-cross-product');
  if (!el) return;

  // 检查URL中是否有战略诊断数据
  var params = new URLSearchParams(window.location.search);
  var hasStrategyData = params.get('str_dim1') !== null;

  // 只有当URL中有真实战略诊断数据时才显示Module 8
  if (!hasStrategyData) {
    el.style.display = 'none';
    return;
  }

  el.style.display = 'block';
  var R = L2_RESULT;

  var html = '';
  html += '<h3 class="l2-module-title">🔗 战略 × 组织 关联洞察</h3>';
  html += '<div class="cross-product-card">';

  html += '<div class="cross-product-header">';
  html += '<span>🔗</span>';
  html += '<span>跨产品关联洞察</span>';
  html += '</div>';

  if (hasStrategyData) {
    // 有战略数据，显示关联分析
    var strStage = params.get('str_stage') || '未知';
    html += '<div class="cross-product-info">';
    html += '<p>您已完成：战略诊断 + 组织诊断（L2）</p>';
    html += '<p class="mt-1">📍 您的战略定位：' + strStage + '</p>';
    html += '<p>🏢 您的组织现状：' + R.stage + '</p>';
    html += '</div>';
    html += '<div class="cross-product-challenge">交叉分析提示：您的战略定位（' + strStage + '）与组织现状（' + R.stage + '）之间的差距，决定了下一阶段的资源配置优先级。</div>';
  } else {
    // 无战略数据，告知信息缺口而非推测
    html += '<div class="cross-product-info">';
    html += '<p>您已完成组织诊断，覆盖5个维度、' + R.scores.totalScore + '分（满分80）。</p>';
    html += '<p class="mt-1">战略方向是组织能力的"输入"——战略清晰度直接影响您的团队该往哪使劲。目前您尚未完成战略诊断，无法做"战略×组织"的交叉分析，组织能力画像还差一块拼图。</p>';
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;
}

/* ========== 模块9：L3转化 + 跨产品转化 ========== */
function renderModule9L3Conversion() {
  var el = document.getElementById('report-l3');
  if (!el) return;

  var R = L2_RESULT;

  var html = '';
  html += '<div class="l2-tip-banner">建议收藏此报告，方便日后回顾对照</div>';

  // 主转化：L3顾问服务
  html += '<div class="l3-conversion-card">';
  html += '<div class="l3-title">🎯 需要更深度的组织支持？</div>';
  html += '<div class="l3-desc">L3组织体系建设服务（¥3000起）包含：</div>';
  html += '<div class="l3-features">';
  html += '<div class="l3-feature-item">组织诊断深度报告解读 + 定制化解决方案</div>';
  html += '<div class="l3-feature-item">2小时一对一顾问咨询（微信/电话/腾讯会议）</div>';
  html += '<div class="l3-feature-item">按需可选：绩效激励 / 薪酬体系 / 流程SOP</div>';
  html += '</div>';
  html += '<a href="#" class="l3-btn">了解L3咨询服务 →</a>';
  html += '</div>';

  // 次转化：战略诊断（条件显示）
  if (R.showCrossProduct) {
    html += '<div class="secondary-conversion-card">';
    html += '<p class="sc-hint">📋 您已完成组织诊断。战略方向是组织能力的"输入"——补上战略诊断，即可获得"战略×组织"的完整企业健康画像。</p>';
    html += '<a href="../../index.html" class="sc-btn">免费开始战略诊断 →</a>';
    html += '</div>';
  }

  el.innerHTML = html;
}

/* ========== 免责声明 ========== */
function renderL2Disclaimer() {
  var el = document.getElementById('report-disclaimer');
  if (!el) return;

  var retestUsed = (typeof localStorage !== 'undefined') && localStorage.getItem('l2_retest_used') === '1';

  var html = '';
  html += '<div class="l2-disclaimer">';
  html += '<p class="disclaimer-text">本深度诊断结果基于您的答题生成，仅供参考，不构成任何管理或经营决策建议。建议结合企业实际情况和专业顾问意见综合判断。</p>';
  if (!retestUsed) {
    html += '<button onclick="startRetest()" class="l2-reset-btn">重新诊断</button>';
  }
  html += '</div>';
  el.innerHTML = html;
}

function resetL2Report() {
  if (window._l2RadarChartInstance) {
    window._l2RadarChartInstance.destroy();
    window._l2RadarChartInstance = null;
  }
  window.location.href = '../index.html';
}

function startRetest() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('l2_retest_used', '1');
  }
  window.location.href = '../index.html?retest=1';
}

/* ========== DOM Ready ========== */
// 只在 report.html 直接访问时自动初始化
// survey 页面会通过 renderL2ReportFromData() 调用
if (window.location.pathname.indexOf('report.html') !== -1) {
  (function() {
    var bar = document.getElementById('l2-load-bar');
    var text = document.getElementById('l2-load-text');
    if (!bar) return;
    var pct = 0;
    var msgs = ['正在深度分析组织流程...', '正在评估团队执行力...', '正在匹配组织健康模型...', '正在生成深度诊断报告...'];
    var timer = setInterval(function() {
      pct += Math.floor(Math.random() * 10) + 5;
      if (pct >= 90) { pct = 90; clearInterval(timer); }
      bar.style.width = pct + '%';
      var idx = Math.min(Math.floor(pct / 25), msgs.length - 1);
      if (text) text.textContent = msgs[idx];
    }, 200);
  })();
  initL2Report();
}
