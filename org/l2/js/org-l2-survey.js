/**
 * org-l2-survey.js - L2问卷交互（状态机）
 * 组织诊断H5 - L2深度诊断
 */

/* ========== 全局状态 ========== */
var SURVEY_INDEX = 0;
var _SURVEY_LOCKED = false;
var L2_ANSWERS = [];      // 10题组织答案 + 2题AI答案
var L1_PARAMS = {};       // 从URL解析的L1数据

/* ========== 初始化 ========== */
function initL2Survey() {
  parseUrlParams();
  SURVEY_INDEX = 0;
  _SURVEY_LOCKED = false;
  L2_ANSWERS = [];
  showSurveyQuestion();
}

function parseUrlParams() {
  var params = new URLSearchParams(window.location.search);
  L1_PARAMS = {
    dim1: parseInt(params.get('dim1')) || 0,
    dim2: parseInt(params.get('dim2')) || 0,
    dim3: parseInt(params.get('dim3')) || 0,
    dim4: parseInt(params.get('dim4')) || 0,
    dim5: parseInt(params.get('dim5')) || 0,
    stage: params.get('stage') || '',
    role: params.get('role') || '',
    aiScore: parseInt(params.get('aiScore')) || 0,
    aiLevel: params.get('aiLevel') || ''
  };
}

/* ========== 进度条更新 ========== */
function updateSurveyProgress() {
  var bar = document.getElementById('progress-bar');
  var label = document.getElementById('progress-label');
  if (!bar || !label) return;

  var totalOrgQuestions = L2_ORG_QUESTION_COUNT; // 10
  var totalQuestions = L2_ALL_QUESTIONS.length; // 12

  if (SURVEY_INDEX < totalOrgQuestions) {
    // 组织诊断题
    label.textContent = '第 ' + (SURVEY_INDEX + 1) + ' / ' + totalOrgQuestions + ' 题';
  } else {
    // AI附加评估题
    var aiIdx = SURVEY_INDEX - totalOrgQuestions + 1;
    label.textContent = '附加评估 ' + aiIdx + ' / ' + (totalQuestions - totalOrgQuestions);
  }

  var pct = Math.round(((SURVEY_INDEX + 1) / totalQuestions) * 100);
  bar.style.width = pct + '%';
}

/* ========== 渲染当前题目 ========== */
function showSurveyQuestion() {
  var container = document.getElementById('survey-question');
  var nextBtn = document.getElementById('btn-survey-next');
  if (!container) return;

  var allQuestions = L2_ALL_QUESTIONS;
  if (SURVEY_INDEX >= allQuestions.length) return;

  var q = allQuestions[SURVEY_INDEX];

  if (nextBtn) {
    nextBtn.disabled = true;
    if (SURVEY_INDEX < allQuestions.length - 1) {
      nextBtn.textContent = '下一步 →';
    } else {
      nextBtn.textContent = '提交并查看报告';
    }
  }

  updateSurveyProgress();

  var html = '';

  // 题号信息
  var totalOrg = L2_ORG_QUESTION_COUNT;
  if (SURVEY_INDEX < totalOrg) {
    html += '<div class="text-center mb-2">';
    html += '<span class="text-xs text-gray-400">组织深度诊断 — 第 ' + (SURVEY_INDEX + 1) + ' / ' + totalOrg + ' 题</span>';
    html += '</div>';
  } else {
    html += '<div class="text-center mb-2">';
    html += '<span class="text-xs text-gray-400">AI就绪度评估 — 附加评估</span>';
    html += '</div>';
  }

  // 维度标签
  if (q.dimension) {
    html += '<div class="text-center mb-4">';
    html += '<span class="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">' + q.dimension + '</span>';
    html += '</div>';
  }

  // 题目
  html += '<div class="text-center mb-6">';
  html += '<h3 class="text-lg font-bold text-gray-900">' + q.text + '</h3>';
  html += '</div>';

  // 选项
  html += '<div class="space-y-3" id="survey-options">';
  for (var i = 0; i < q.options.length; i++) {
    var opt = q.options[i];
    var valAttr = typeof opt.value === 'string' ? ("'" + opt.value + "'") : opt.value;
    html += '<div class="option-card" data-value="' + opt.value + '" onclick="selectL2Option(this)">';
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

/* ========== 选择选项 ========== */
function selectL2Option(el) {
  if (_SURVEY_LOCKED) return;
  _SURVEY_LOCKED = true;

  // 从data-value读取，数字转number
  var rawValue = el.getAttribute('data-value');
  var value = isNaN(Number(rawValue)) ? rawValue : parseInt(rawValue, 10);

  // 取消同组选中
  var options = document.querySelectorAll('#survey-options .option-card');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.remove('selected');
  }
  el.classList.add('selected');

  // 保存答案
  L2_ANSWERS[SURVEY_INDEX] = value;

  // 启用下一步
  var nextBtn = document.getElementById('btn-survey-next');
  if (nextBtn) {
    nextBtn.disabled = false;
  }

  _SURVEY_LOCKED = false;
}

/* ========== 下一步按钮 ========== */
function nextL2Question() {
  if (_SURVEY_LOCKED) return;

  if (SURVEY_INDEX >= L2_ALL_QUESTIONS.length - 1) {
    goToL2Loading();
  } else {
    SURVEY_INDEX++;
    showSurveyQuestion();
    window.scrollTo(0, 0);
  }
}

/* ========== 加载动画 → 跳转报告 ========== */
function goToL2Loading() {
  // 切换到加载页
  document.getElementById('page-survey').style.display = 'none';
  document.getElementById('page-loading').style.display = 'block';

  var bar = document.getElementById('loading-bar');
  var text = document.getElementById('loading-text');
  if (!bar) return;

  bar.style.width = '0%';
  var pct = 0;
  var messages = [
    '正在深度分析组织流程...',
    '正在评估团队执行力...',
    '正在匹配组织健康模型...',
    '正在生成深度诊断报告...'
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

/* ========== 同页渲染报告（参考L1模式，不跳转） ========== */
function goToReport() {
  // 隐藏进度条和加载页
  var progressEl = document.getElementById('progress-container');
  if (progressEl) progressEl.style.display = 'none';
  document.getElementById('page-loading').style.display = 'none';

  // 基于 L1 参数 + L2 答案构建结果对象
  var l1DimScores = [L1_PARAMS.dim1, L1_PARAMS.dim2, L1_PARAMS.dim3, L1_PARAMS.dim4, L1_PARAMS.dim5];
  var scores = calcL2Scores(l1DimScores, L2_ANSWERS);
  var stage = getL2Stage(scores.totalScore);
  var stageData = L2_STAGE_INFO[stage] || {};
  var weakDims = getL2WeakDimensions(scores.dimScores);
  var top3 = calcTop3Problems(scores.dimScores);
  var aiResult = calcL2AIReadiness(L1_PARAMS.aiScore, [L2_ANSWERS[10] || 0, L2_ANSWERS[11] || 0]);
  var aiLevelData = L2_AI_LEVELS[aiResult.level] || {};
  var showCrossProduct = shouldShowCrossProduct(scores);
  var services = getRecommendedServices(scores.dimScores, aiResult);

  var result = {
    role: L1_PARAMS.role,
    l1DimScores: l1DimScores,
    l1Stage: L1_PARAMS.stage,
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

  // 切换到报告页并渲染（参考L1的showPage逻辑）
  var reportEl = document.getElementById('page-report');
  if (reportEl) {
    reportEl.style.display = 'block';
    reportEl.style.opacity = '1';
    reportEl.style.transform = 'none';
  }
  renderL2ReportFromData(result);
  window.scrollTo(0, 0);
}

/* ========== DOM Ready ========== */
if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', initL2Survey);
}
