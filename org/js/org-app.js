/**
 * org-app.js - 主状态机（欢迎→问卷→加载→报告）
 * 组织诊断H5
 */

/* ========== 全局状态 ========== */
var CURRENT_PAGE = 'welcome';
var APP_DATA = {
  role: '',
  diagAnswers: [],   // Q2-Q11 共10题答案
  aiAnswers: []      // Q12-Q13 共2题答案
};

// 问卷当前题目索引（在所有题目中的索引，0-based）
var SURVEY_INDEX = 0;
var _SURVEY_LOCKED = false;

// 构建完整题目数组
var ALL_QUESTIONS = buildAllQuestions();

function buildAllQuestions() {
  var all = [];
  // Q1: 角色
  all.push({
    type: 'role',
    id: 'role',
    text: '您在公司中的角色是？',
    options: ROLE_OPTIONS
  });
  // Q2-Q3: 流程与制度
  for (var i = 0; i < PROCESS_QUESTIONS.length; i++) {
    all.push({ type: 'diag', data: PROCESS_QUESTIONS[i] });
  }
  // Q4-Q5: 团队与执行力
  for (var i = 0; i < TEAM_QUESTIONS.length; i++) {
    all.push({ type: 'diag', data: TEAM_QUESTIONS[i] });
  }
  // Q6-Q7: 决策与授权
  for (var i = 0; i < DECISION_QUESTIONS.length; i++) {
    all.push({ type: 'diag', data: DECISION_QUESTIONS[i] });
  }
  // Q8-Q9: 文化与氛围
  for (var i = 0; i < CULTURE_QUESTIONS.length; i++) {
    all.push({ type: 'diag', data: CULTURE_QUESTIONS[i] });
  }
  // Q10-Q11: 组织健康感知
  for (var i = 0; i < HEALTH_QUESTIONS.length; i++) {
    all.push({ type: 'diag', data: HEALTH_QUESTIONS[i] });
  }
  // Q12-Q13: AI就绪度
  for (var i = 0; i < AI_QUESTIONS.length; i++) {
    all.push({ type: 'ai', data: AI_QUESTIONS[i] });
  }
  return all;
}

/* ========== 诊断题目数量（Q2-Q11）========== */
var DIAG_COUNT = PROCESS_QUESTIONS.length + TEAM_QUESTIONS.length + DECISION_QUESTIONS.length + CULTURE_QUESTIONS.length + HEALTH_QUESTIONS.length;

/* ========== 页面初始化 ========== */
var IS_RETEST = false;

function initOrgApp() {
  var urlParams = new URLSearchParams(window.location.search);
  IS_RETEST = urlParams.get('retest') === '1';
  showPage('welcome');
}

/* ========== 页面切换 ========== */
function showPage(pageName) {
  var sections = document.querySelectorAll('.page-section');
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove('active');
    sections[i].style.display = 'none';
  }

  var target = document.getElementById('page-' + pageName);
  if (target) {
    target.style.display = 'block';
    setTimeout(function() {
      target.classList.add('active');
    }, 10);
  }

  updateProgressBar(pageName);
  window.scrollTo(0, 0);
  CURRENT_PAGE = pageName;
}

/* ========== 进度条 ========== */
function updateProgressBar(pageName) {
  var bar = document.getElementById('progress-bar');
  var container = document.getElementById('progress-container');
  var label = document.getElementById('progress-label');
  if (!bar || !container) return;

  if (pageName === 'survey' && SURVEY_INDEX > 0) {
    container.style.display = 'block';

    // 进度条覆盖Q2-Q13（共 ALL_QUESTIONS.length - 1 步）
    var progressSteps = ALL_QUESTIONS.length - 1; // 不含Q1（角色）
    var currentStep = SURVEY_INDEX; // 当前在数组中的索引（Q1=0时不显示进度）
    var pct = Math.round((currentStep / progressSteps) * 100);
    bar.style.width = pct + '%';

    // 进度文字
    if (SURVEY_INDEX <= DIAG_COUNT) {
      // Q2-Q11: 诊断题目
      label.textContent = '第 ' + SURVEY_INDEX + ' / ' + DIAG_COUNT + ' 题';
    } else {
      // Q12-Q13: AI附加评估
      var aiIdx = SURVEY_INDEX - DIAG_COUNT;
      label.textContent = '附加评估 ' + aiIdx + ' / ' + AI_QUESTIONS.length;
    }
  } else {
    container.style.display = 'none';
  }
}

/* ========== 导航函数 ========== */
function goToSurvey() {
  SURVEY_INDEX = 0;
  _SURVEY_LOCKED = false;
  APP_DATA.diagAnswers = [];
  APP_DATA.aiAnswers = [];
  showPage('survey');
  renderSurveyQuestion();
}

function goToLoading() {
  showPage('loading');
  startLoadingAnimation();
}

function goToReport() {
  var result = generateOrgResult(APP_DATA);
  if (IS_RETEST) {
    var params = new URLSearchParams();
    params.set('retest', '1');
    params.set('dim1', result.scores.dimScores[0]);
    params.set('dim2', result.scores.dimScores[1]);
    params.set('dim3', result.scores.dimScores[2]);
    params.set('dim4', result.scores.dimScores[3]);
    params.set('dim5', result.scores.dimScores[4]);
    params.set('stage', result.stage);
    params.set('role', result.roleLabel);
    params.set('aiScore', result.aiResult.score);
    params.set('aiLevel', result.aiResult.level);
    window.location.href = 'l2/survey.html?' + params.toString();
    return;
  }
  showPage('report');
  renderOrgReport(result);
}

/* ========== 问卷渲染 ========== */
function renderSurveyQuestion() {
  var container = document.getElementById('survey-question');
  if (!container) return;

  var q = ALL_QUESTIONS[SURVEY_INDEX];
  if (!q) return;

  var html = '';

  // 题号进度（非角色题显示）
  if (q.type !== 'role') {
    html += '<div class="text-center mb-2">';
    if (SURVEY_INDEX <= DIAG_COUNT) {
      html += '<span class="text-xs text-gray-400">组织健康诊断 — 第 ' + SURVEY_INDEX + ' / ' + DIAG_COUNT + ' 题</span>';
    } else {
      html += '<span class="text-xs text-gray-400">AI就绪度评估 — 附加评估</span>';
    }
    html += '</div>';
  }

  // 维度标签（诊断题显示）
  if (q.type === 'diag' && q.data.dimension) {
    html += '<div class="text-center mb-4">';
    html += '<span class="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">' + q.data.dimension + '</span>';
    html += '</div>';
  }

  // 题目文本
  html += '<div class="text-center mb-6">';
  html += '<h3 class="text-lg font-bold text-gray-900">' + (q.type === 'role' ? q.text : q.data.text) + '</h3>';
  html += '</div>';

  // 选项列表
  var options = q.type === 'role' ? q.options : q.data.options;
  html += '<div class="space-y-3" id="survey-options">';
  for (var i = 0; i < options.length; i++) {
    var opt = options[i];
    html += '<div class="option-card" data-value="' + opt.value + '" onclick="selectSurveyOption(this)">';
    html += '<div class="flex-1">';
    html += '<div class="font-medium text-gray-900">' + opt.label + '</div>';
    html += '</div>';
    html += '<div class="radio-circle">';
    html += '<span class="radio-dot"></span>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function selectSurveyOption(el) {
  if (_SURVEY_LOCKED) return;
  _SURVEY_LOCKED = true;

  // 从 data-value 读取值，数字转 number，字符串保持 string
  var rawValue = el.getAttribute('data-value');
  var value = isNaN(Number(rawValue)) ? rawValue : parseInt(rawValue, 10);

  // 取消同组选中
  var options = document.querySelectorAll('#survey-options .option-card');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.remove('selected');
  }

  // 选中当前
  el.classList.add('selected');

  // 保存答案
  var q = ALL_QUESTIONS[SURVEY_INDEX];
  if (q.type === 'role') {
    APP_DATA.role = value;
  } else if (q.type === 'diag') {
    APP_DATA.diagAnswers.push(value);
  } else if (q.type === 'ai') {
    APP_DATA.aiAnswers.push(value);
  }

  // 延迟后自动跳转或提交
  setTimeout(function() {
    _SURVEY_LOCKED = false;
    if (SURVEY_INDEX < ALL_QUESTIONS.length - 1) {
      SURVEY_INDEX++;
      renderSurveyQuestion();
      updateProgressBar('survey');
      window.scrollTo(0, 0);
    } else {
      goToLoading();
    }
  }, 400);
}

/* ========== 加载动画 ========== */
function startLoadingAnimation() {
  var bar = document.getElementById('loading-bar');
  var text = document.getElementById('loading-text');
  if (!bar) return;

  bar.style.width = '0%';
  var pct = 0;
  var messages = [
    '正在分析您的组织流程...',
    '正在评估团队执行力...',
    '正在匹配组织健康模型...',
    '正在生成诊断报告...'
  ];

  var timer = setInterval(function() {
    pct += Math.floor(Math.random() * 8) + 3;
    if (pct >= 100) {
      pct = 100;
      clearInterval(timer);
      bar.style.width = '100%';
      if (text) text.textContent = '报告生成完成！';
      setTimeout(function() {
        goToReport();
      }, 500);
      return;
    }
    bar.style.width = pct + '%';
    var msgIdx = Math.floor((pct / 100) * messages.length);
    if (msgIdx >= messages.length) msgIdx = messages.length - 1;
    if (text) text.textContent = messages[msgIdx];
  }, 300);
}

/* ========== 报告渲染 ========== */
function renderOrgReport(result) {
  renderReportHeader(result);
  renderRadarAndBars(result);
  renderStageConclusion(result);
  renderWeakDimensions(result);
  renderAIReadiness(result);
  renderL2Upgrade(result);
  renderDisclaimer();
}

/* ========== 模块1：报告头部 ========== */
function renderReportHeader(result) {
  var el = document.getElementById('report-header');
  if (!el) return;

  var now = new Date();
  var dateStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
  var stageData = result.stageData;

  var html = '';
  html += '<div class="report-header">';
  html += '<h2 class="text-xl font-extrabold text-gray-900 mb-2">组织管理诊断报告</h2>';
  html += '<div class="report-tag">' + result.roleLabel + '</div>';
  html += '<span class="text-xs text-gray-400 ml-2">' + dateStr + '</span>';
  html += '<div class="report-divider"></div>';
  html += '<div class="text-4xl font-extrabold mb-2" style="color:#0F4C81">' + result.scores.totalScore + '<span class="text-lg text-gray-400 font-normal"> / 40分</span></div>';
  html += '<div class="report-stage" style="background:' + stageData.bgColor + ';color:' + stageData.color + '">';
  html += '<span class="text-2xl mr-1">' + stageData.emoji + '</span>' + result.stage;
  html += '</div>';
  html += '</div>';

  el.innerHTML = html;
}

/* ========== 模块2：雷达图 + 得分条 ========== */
function renderRadarAndBars(result) {
  var el = document.getElementById('report-radar');
  if (!el) return;

  var scores = result.scores.dimScores;

  var html = '';
  html += '<h3 class="report-section-title">五维度雷达图</h3>';

  // Canvas
  html += '<div class="bg-white rounded-xl p-2 mb-4">';
  html += '<canvas id="org-radar-canvas" width="300" height="300" style="width:100%;height:auto;max-width:340px;margin:0 auto;display:block;"></canvas>';
  html += '</div>';

  // 得分条
  html += '<div class="report-card">';
  html += '<h4 class="text-sm font-bold text-gray-700 mb-3">各维度得分明细</h4>';

  var barColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
  for (var i = 0; i < DIM_LABELS.length; i++) {
    var pct = Math.round((scores[i] / 8) * 100);
    var barColor = scores[i] >= 6 ? '#10B981' : (scores[i] >= 4 ? '#F59E0B' : '#EF4444');
    html += '<div class="score-bar-row">';
    html += '<span class="score-bar-label">' + DIM_LABELS[i] + '</span>';
    html += '<div class="score-bar-track">';
    html += '<div class="score-bar-fill" style="width:' + pct + '%;background:' + barColor + '"></div>';
    html += '</div>';
    html += '<span class="score-bar-value">' + scores[i] + '/8分</span>';
    html += '</div>';
  }

  html += '</div>';

  el.innerHTML = html;

  // 绘制雷达图
  setTimeout(function() {
    drawOrgRadarChart('org-radar-canvas', scores, DIM_LABELS);
  }, 100);
}

/* ========== 模块3：阶段诊断结论 ========== */
function renderStageConclusion(result) {
  var el = document.getElementById('report-stage-conclusion');
  if (!el) return;

  var stageData = result.stageData;

  var html = '';
  html += '<h3 class="report-section-title">阶段诊断结论</h3>';
  html += '<div class="report-card" style="border-left:4px solid ' + stageData.color + '">';

  // 阶段标题
  html += '<div class="flex items-center gap-2 mb-3">';
  html += '<span class="text-3xl">' + stageData.emoji + '</span>';
  html += '<span class="text-lg font-bold" style="color:' + stageData.color + '">' + result.stage + '</span>';
  html += '</div>';

  // Summary
  html += '<p class="text-sm text-gray-700 leading-relaxed mb-4">' + stageData.summary + '</p>';

  // 典型信号
  html += '<div class="text-xs font-medium text-gray-500 mb-2">典型信号（对照检查）</div>';
  html += '<ul class="signal-list">';
  for (var i = 0; i < stageData.signals.length; i++) {
    html += '<li>' + stageData.signals[i] + '</li>';
  }
  html += '</ul>';

  html += '</div>';

  el.innerHTML = html;
}

/* ========== 模块4：薄弱维度分析与建议 ========== */
function renderWeakDimensions(result) {
  var el = document.getElementById('report-weak-dims');
  if (!el) return;

  var weakDims = result.weakDims;

  var html = '';
  html += '<h3 class="report-section-title">薄弱维度分析与建议</h3>';

  if (weakDims.length === 0) {
    html += '<div class="report-card text-center">';
    html += '<p class="text-green-600 font-medium">所有维度均表现良好，继续保持！</p>';
    html += '</div>';
  } else {
    for (var i = 0; i < weakDims.length; i++) {
      var dim = weakDims[i];
      var levelLabel = dim.level === 'low' ? '需重点关注' : '有提升空间';
      var levelColor = dim.level === 'low' ? '#EF4444' : '#F59E0B';

      html += '<div class="suggestion-card">';
      html += '<div class="flex items-center justify-between mb-2">';
      html += '<span class="font-bold text-gray-900">' + dim.dimName + '</span>';
      html += '<span class="text-sm font-bold" style="color:' + levelColor + '">' + dim.score + '/8分 · ' + levelLabel + '</span>';
      html += '</div>';
      html += '<div class="w-full bg-gray-100 rounded-full h-2 mb-3">';
      html += '<div class="h-2 rounded-full" style="width:' + Math.round((dim.score / 8) * 100) + '%;background:' + levelColor + '"></div>';
      html += '</div>';
      html += '<p class="text-sm text-gray-600 leading-relaxed">' + dim.suggestion + '</p>';
      html += '</div>';
    }
  }

  el.innerHTML = html;
}

/* ========== 模块5：AI就绪度专项评估 ========== */
function renderAIReadiness(result) {
  var el = document.getElementById('report-ai');
  if (!el) return;

  var aiResult = result.aiResult;
  var aiLevelData = result.aiLevelData;

  if (!aiLevelData) return;

  var levelWidth = Math.round((aiResult.score / 8) * 100);

  var html = '';
  html += '<h3 class="report-section-title">AI就绪度专项评估</h3>';
  html += '<div class="ai-readiness-card">';

  // 档位标签
  html += '<div class="text-center mb-3">';
  html += '<span class="inline-block px-4 py-1 rounded-full text-white text-sm font-bold" style="background:#059669">' + aiResult.level + '</span>';
  html += '</div>';

  // 进度条
  html += '<div class="ai-level-bar-track">';
  html += '<div class="ai-level-bar-fill" style="width:' + levelWidth + '%"></div>';
  html += '</div>';

  // 阶段描述
  html += '<p class="text-sm text-gray-700 mb-4 text-center">' + aiLevelData.desc + '</p>';

  // 建议
  html += '<div class="text-xs text-gray-500 mb-1">落地建议</div>';
  html += '<ul class="signal-list">';
  for (var i = 0; i < aiLevelData.suggestions.length; i++) {
    html += '<li>' + aiLevelData.suggestions[i] + '</li>';
  }
  html += '</ul>';

  // 说明文字
  html += '<p class="text-xs text-gray-400 mt-4 text-center">此评估仅供参考，不计入组织健康诊断总分</p>';

  html += '</div>';

  el.innerHTML = html;
}

/* ========== 模块6：L2升级引导 ========== */
function renderL2Upgrade(result) {
  var el = document.getElementById('report-l2');
  if (!el) return;

  var scores = result.scores.dimScores;
  var params = new URLSearchParams();
  params.set('dim1', scores[0]);
  params.set('dim2', scores[1]);
  params.set('dim3', scores[2]);
  params.set('dim4', scores[3]);
  params.set('dim5', scores[4]);
  params.set('stage', result.stage);
  params.set('role', result.roleLabel);
  params.set('aiScore', result.aiResult.score);
  params.set('aiLevel', result.aiResult.level);

  var html = '';
  html += '<div class="l2-upgrade-card">';
  html += '<p class="l2-upgrade-hint">想要更深入的组织诊断和定制化改进方案？</p>';
  html += '<div class="l2-upgrade-features">';
  html += '<span>深度组织诊断报告</span>';
  html += '<span>·</span>';
  html += '<span>5维度详细拆解</span>';
  html += '<span>·</span>';
  html += '<span>行业对标分析</span>';
  html += '<span>·</span>';
  html += '<span>90天改进路线图</span>';
  html += '</div>';
  html += '<button onclick="goToOrgL2(\'' + params.toString().replace(/'/g, "\\'") + '\')" class="l2-upgrade-btn">';
  html += '立即升级，获取完整诊断报告 →';
  html += '</button>';
  html += '<p class="l2-upgrade-price">¥299</p>';
  html += '</div>';

  el.innerHTML = html;
}

function goToOrgL2(paramsStr) {
  window.location.href = 'l2/index.html?' + paramsStr;
}

/* ========== 免责声明 + 重新测试 ========== */
function renderDisclaimer() {
  var el = document.getElementById('report-disclaimer');
  if (!el) return;

  var html = '';
  html += '<div class="bg-gray-50 rounded-xl p-4 mb-4">';
  html += '<p class="text-xs text-gray-400 leading-relaxed">' + ORG_DISCLAIMER_TEXT + '</p>';
  html += '</div>';

  html += '<button onclick="resetOrgAndRestart()" class="w-full py-3 rounded-xl border-2 font-bold text-sm hover:bg-blue-50 transition-colors" style="border-color:#0F4C81;color:#0F4C81">';
  html += '重新测试';
  html += '</button>';

  el.innerHTML = html;
}

/* ========== 重新测试 ========== */
function resetOrgAndRestart() {
  if (window._orgRadarChartInstance) {
    window._orgRadarChartInstance.destroy();
    window._orgRadarChartInstance = null;
  }

  APP_DATA.role = '';
  APP_DATA.diagAnswers = [];
  APP_DATA.aiAnswers = [];
  SURVEY_INDEX = 0;
  _SURVEY_LOCKED = false;

  showPage('welcome');
}

/* ========== DOMReady后初始化 ========== */
if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', initOrgApp);
} else if (document.attachEvent) {
  document.attachEvent('onreadystatechange', function() {
    if (document.readyState === 'complete') {
      initOrgApp();
    }
  });
}
