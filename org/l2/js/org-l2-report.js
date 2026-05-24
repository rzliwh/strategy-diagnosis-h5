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
    showCrossProduct: showCrossProduct
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
  // 先渲染所有文本内容模块（9个模块+免责声明），不依赖Chart.js
  renderModule1Header();
  renderModule2StageConclusion();
  renderModule3WeakDims();
  renderModule4Top3();
  renderModule5Roadmap();
  renderModule6AIReadiness();
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
function renderModule4Top3() {
  var el = document.getElementById('report-top3');
  if (!el) return;

  var R = L2_RESULT;
  var top3 = R.top3;

  var html = '';
  html += '<h3 class="l2-module-title">Top3核心问题深度拆解</h3>';

  var ranks = [
    { label: '第1问题', emoji: '🔴', cssClass: 'severe' },
    { label: '第2问题', emoji: '🟡', cssClass: 'warning' },
    { label: '第3问题', emoji: '🟡', cssClass: 'warning' }
  ];

  for (var i = 0; i < top3.length; i++) {
    var t = top3[i];
    var analysis = TOP3_ANALYSIS[t.dimName];
    var rank = ranks[i];
    // 严重程度：失分率>0.6 = severe, 否则warning
    var severityClass = t.lossRate > 0.6 ? 'severe' : 'warning';

    html += '<div class="top3-card ' + severityClass + '">';
    html += '<div class="top3-header">';
    html += '<span class="top3-rank ' + severityClass + '">' + (i + 1) + '</span>';
    html += '<span class="top3-title">' + t.dimName + ' — ' + toPercent(t.score, t.max) + '%（失分' + Math.round(t.lossRate * 100) + '%）</span>';
    html += '</div>';

    if (analysis) {
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

      // 解决路径
      html += '<div class="top3-section-label">解决路径（按优先级）：</div>';
      html += '<div class="top3-section-content">';
      for (var m = 0; m < analysis.solutions.length; m++) {
        html += '<div class="top3-item">' + analysis.solutions[m] + '</div>';
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
  html += '<h3 class="l2-module-title">AI就绪度专项评估（升级版）</h3>';
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
  html += '<h3 class="l2-module-title">🎯 延伸服务精准推荐</h3>';
  html += '<p class="text-xs text-gray-500 mb-3">基于您的完整诊断，为您推荐以下匹配服务（最多3个）</p>';

  if (R.services.length === 0) {
    html += '<div class="report-card text-center">';
    html += '<p class="text-green-600 font-medium">您的各维度表现良好，暂无特别推荐的服务</p>';
    html += '</div>';
  } else {
    for (var i = 0; i < R.services.length; i++) {
      var s = R.services[i];
      html += '<div class="service-reco-card">';
      html += '<span class="service-reco-num">' + (i + 1) + '</span>';
      html += '<div class="service-reco-info">';
      html += '<div class="service-reco-name">' + s.serviceName + ' <span class="text-xs text-gray-400">' + (s.price || '') + '</span></div>';
      html += '<div class="service-reco-reason">推荐理由：' + s.reason + '</div>';
      html += '<a href="#" class="service-reco-link">了解详情 →</a>';
      html += '</div>';
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
    html += '<div class="cross-product-challenge">核心挑战：战略方向与组织执行力需要进一步匹配</div>';
  } else {
    // 无战略数据，推荐做战略诊断
    html += '<div class="cross-product-info">';
    html += '<p>您的组织执行力不错，但战略方向是否同样清晰？</p>';
    html += '<p class="mt-1">一个好的战略能让组织能力发挥最大价值。建议同时完成战略诊断，获得更全面的企业健康画像。</p>';
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
    html += '<p class="sc-hint">💡 您的组织执行力不错，但战略方向是否同样清晰？</p>';
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
