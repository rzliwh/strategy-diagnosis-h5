/**
 * app.js - 页面状态机、用户交互
 * 企业战略自助诊断H5
 */

/* ========== 全局状态 ========== */
var CURRENT_PAGE = 'welcome';
var APP_DATA = {
  industry: '',
  size: '',
  revenue: '',
  marketAnswers: [],
  compAnswers: [],
  direction: '',
  digitalAttitude: ''
};

// Step2/3 当前题目索引（0-3）
var STEP2_INDEX = 0;
var STEP3_INDEX = 0;
var _STEP2_LOCKED = false;
var _STEP3_LOCKED = false;
var _RESULT_GENERATING = false;

/* ========== 页面初始化 ========== */
function initApp() {
  showPage('welcome');
  bindEvents();
}

/* ========== 页面切换 ========== */
function showPage(pageName) {
  // 隐藏所有页面
  var sections = document.querySelectorAll('.page-section');
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove('active');
    sections[i].style.display = 'none';
  }

  // 显示目标页面
  var target = document.getElementById('page-' + pageName);
  if (target) {
    target.style.display = 'block';
    // 用requestAnimationFrame确保display生效后再加active触发动画
    setTimeout(function() {
      target.classList.add('active');
    }, 10);
  }

  // 更新进度条
  updateProgressBar(pageName);

  // 滚动到顶部
  window.scrollTo(0, 0);

  CURRENT_PAGE = pageName;
}

/* ========== 进度条 ========== */
function updateProgressBar(pageName) {
  var bar = document.getElementById('progress-bar');
  var container = document.getElementById('progress-container');
  if (!bar || !container) return;

  var steps = ['step1', 'step2', 'step3', 'step4'];
  var idx = steps.indexOf(pageName);

  if (idx >= 0) {
    container.style.display = 'block';
    var pct = (idx + 1) * 25;
    bar.style.width = pct + '%';
    bar.setAttribute('data-pct', pct + '%');
    var label = document.getElementById('progress-label');
    if (label) {
      label.textContent = pct + '%';
    }
  } else {
    container.style.display = 'none';
  }
}

/* ========== 事件绑定 ========== */
function bindEvents() {
  // 按钮已通过HTML inline onclick绑定，此处留空避免重复触发
}

/* ========== 导航函数 ========== */
function goToStep1() {
  showPage('step1');
}

function goToStep2() {
  STEP2_INDEX = 0;
  _STEP2_LOCKED = false;
  APP_DATA.marketAnswers = [];
  showPage('step2');
  renderStep2Question();
}

function goToStep3() {
  STEP3_INDEX = 0;
  _STEP3_LOCKED = false;
  APP_DATA.compAnswers = [];
  showPage('step3');
  renderStep3Question();
}

function goToStep4() {
  showPage('step4');
}

function goToLoading() {
  showPage('loading');
  startLoadingAnimation();
}

function goToReport() {
  showPage('report');
  var result = generateResult(APP_DATA);
  renderReport(result);
}

/* ========== Step1 提交 ========== */
function submitStep1() {
  var industry = document.getElementById('industry');
  var industryVal = industry ? industry.value : '';

  var sizeEls = document.getElementsByName('size');
  var sizeVal = '';
  for (var i = 0; i < sizeEls.length; i++) {
    if (sizeEls[i].checked) {
      sizeVal = sizeEls[i].value;
      break;
    }
  }

  var revenueEls = document.getElementsByName('revenue');
  var revenueVal = '';
  for (var j = 0; j < revenueEls.length; j++) {
    if (revenueEls[j].checked) {
      revenueVal = revenueEls[j].value;
      break;
    }
  }

  // 验证
  if (!industryVal) {
    alert('请选择所属行业');
    return;
  }
  if (!sizeVal) {
    alert('请选择企业规模');
    return;
  }
  if (!revenueVal) {
    alert('请选择营收区间');
    return;
  }

  APP_DATA.industry = industryVal;
  APP_DATA.size = sizeVal;
  APP_DATA.revenue = revenueVal;

  goToStep2();
}

/* ========== Step2 题目渲染（逐题展示） ========== */
function renderStep2Question() {
  var container = document.getElementById('step2-question');
  if (!container) return;

  var q = MARKET_QUESTIONS[STEP2_INDEX];
  if (!q) return;

  var html = '';

  // 题号进度
  html += '<div class="text-center mb-4">';
  html += '<span class="text-xs text-gray-400">市场吸引力评估 — 第 ' + (STEP2_INDEX + 1) + ' / 4 题</span>';
  html += '</div>';

  // 题目
  html += '<div class="text-center mb-6">';
  html += '<div class="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-3">' + q.dimension + '</div>';
  html += '<h3 class="text-lg font-bold text-gray-900">' + q.text + '</h3>';
  html += '</div>';

  // 选项
  html += '<div class="space-y-3" id="step2-options">';
  for (var i = 0; i < q.options.length; i++) {
    var opt = q.options[i];
    html += '<div class="option-card" data-value="' + opt.value + '" onclick="selectStep2Option(this, ' + opt.value + ')">';
    html += '<div class="flex items-center justify-between">';
    html += '<div>';
    html += '<div class="font-medium text-gray-900">' + opt.label + '</div>';
    html += '<div class="text-xs text-gray-400 mt-0.5">' + opt.desc + '</div>';
    html += '</div>';
    html += '<div class="radio-circle w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 ml-3">';
    html += '<span class="radio-dot w-3.5 h-3.5 rounded-full"></span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function selectStep2Option(el, value) {
  if (_STEP2_LOCKED) return;
  _STEP2_LOCKED = true;

  // 取消同组选中
  var options = document.querySelectorAll('#step2-options .option-card');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.remove('selected');
  }

  // 选中当前
  el.classList.add('selected');

  // 保存答案
  APP_DATA.marketAnswers[STEP2_INDEX] = value;

  // 延迟后进入下一题
  setTimeout(function() {
    _STEP2_LOCKED = false;
    if (STEP2_INDEX < 3) {
      STEP2_INDEX++;
      renderStep2Question();
    } else {
      showStep2Complete();
    }
  }, 400);
}

function showStep2Complete() {
  var container = document.getElementById('step2-question');
  if (!container) return;

  // 显示4题评分汇总
  var html = '';
  html += '<div class="text-center mb-6">';
  html += '<div class="text-4xl mb-2">✓</div>';
  html += '<h3 class="text-lg font-bold text-gray-900">市场吸引力评估完成</h3>';
  html += '<p class="text-sm text-gray-500 mt-1">已从4个维度完成评估</p>';
  html += '</div>';

  // 显示得分摘要
  var sum = 0;
  for (var i = 0; i < APP_DATA.marketAnswers.length; i++) {
    sum += APP_DATA.marketAnswers[i];
  }
  var avgScore = Math.round((sum / APP_DATA.marketAnswers.length) * 20);

  html += '<div class="bg-blue-50 rounded-xl p-4 text-center mb-6">';
  html += '<div class="text-xs text-gray-500 mb-1">市场吸引力初步得分</div>';
  html += '<div class="text-3xl font-bold text-blue-600">' + avgScore + '</div>';
  html += '</div>';

  html += '<button onclick="goToStep3()" class="w-full py-3 rounded-xl text-white font-bold text-sm" style="background:linear-gradient(135deg,#1E3A8A,#1E40AF)">';
  html += '进入竞争地位评估 →';
  html += '</button>';

  container.innerHTML = html;
}

/* ========== Step3 题目渲染（逐题展示） ========== */
function renderStep3Question() {
  var container = document.getElementById('step3-question');
  if (!container) return;

  var q = COMP_QUESTIONS[STEP3_INDEX];
  if (!q) return;

  var html = '';

  // 题号进度
  html += '<div class="text-center mb-4">';
  html += '<span class="text-xs text-gray-400">竞争地位评估 — 第 ' + (STEP3_INDEX + 1) + ' / 4 题</span>';
  html += '</div>';

  // 题目
  html += '<div class="text-center mb-6">';
  html += '<div class="inline-block bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-3">' + q.dimension + '</div>';
  html += '<h3 class="text-lg font-bold text-gray-900">' + q.text + '</h3>';
  html += '</div>';

  // 选项
  html += '<div class="space-y-3" id="step3-options">';
  for (var i = 0; i < q.options.length; i++) {
    var opt = q.options[i];
    html += '<div class="option-card" data-value="' + opt.value + '" onclick="selectStep3Option(this, ' + opt.value + ')">';
    html += '<div class="flex items-center justify-between">';
    html += '<div>';
    html += '<div class="font-medium text-gray-900">' + opt.label + '</div>';
    html += '<div class="text-xs text-gray-400 mt-0.5">' + opt.desc + '</div>';
    html += '</div>';
    html += '<div class="radio-circle w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0 ml-3">';
    html += '<span class="radio-dot w-3.5 h-3.5 rounded-full"></span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

function selectStep3Option(el, value) {
  if (_STEP3_LOCKED) return;
  _STEP3_LOCKED = true;

  // 取消同组选中
  var options = document.querySelectorAll('#step3-options .option-card');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.remove('selected');
  }

  // 选中当前
  el.classList.add('selected');

  // 保存答案
  APP_DATA.compAnswers[STEP3_INDEX] = value;

  // 延迟后进入下一题
  setTimeout(function() {
    _STEP3_LOCKED = false;
    if (STEP3_INDEX < 3) {
      STEP3_INDEX++;
      renderStep3Question();
    } else {
      showStep3Complete();
    }
  }, 400);
}

function showStep3Complete() {
  var container = document.getElementById('step3-question');
  if (!container) return;

  var html = '';
  html += '<div class="text-center mb-6">';
  html += '<div class="text-4xl mb-2">✓</div>';
  html += '<h3 class="text-lg font-bold text-gray-900">竞争地位评估完成</h3>';
  html += '<p class="text-sm text-gray-500 mt-1">已从4个维度完成评估</p>';
  html += '</div>';

  // 显示得分摘要
  var sum = 0;
  for (var i = 0; i < APP_DATA.compAnswers.length; i++) {
    sum += APP_DATA.compAnswers[i];
  }
  var avgScore = Math.round((sum / APP_DATA.compAnswers.length) * 20);

  html += '<div class="bg-green-50 rounded-xl p-4 text-center mb-6">';
  html += '<div class="text-xs text-gray-500 mb-1">竞争地位初步得分</div>';
  html += '<div class="text-3xl font-bold text-green-600">' + avgScore + '</div>';
  html += '</div>';

  html += '<button onclick="goToStep4()" class="w-full py-3 rounded-xl text-white font-bold text-sm" style="background:linear-gradient(135deg,#1E3A8A,#1E40AF)">';
  html += '进入方向偏好 →';
  html += '</button>';

  container.innerHTML = html;
}

/* ========== Step4 方向偏好 ========== */
function selectDirection(el, value) {
  var options = document.querySelectorAll('#step4-d1 .option-card');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.remove('selected');
  }
  el.classList.add('selected');
  APP_DATA.direction = value;
}

function selectDigitalAttitude(el, value) {
  var options = document.querySelectorAll('#step4-d2 .option-card');
  for (var i = 0; i < options.length; i++) {
    options[i].classList.remove('selected');
  }
  el.classList.add('selected');
  APP_DATA.digitalAttitude = value;
}

function submitStep4() {
  if (_RESULT_GENERATING) return;
  if (!APP_DATA.direction) {
    alert('请选择您倾向的战略方向');
    return;
  }
  _RESULT_GENERATING = true;
  goToLoading();
}

/* ========== 加载动画 ========== */
function startLoadingAnimation() {
  var bar = document.getElementById('loading-bar');
  var text = document.getElementById('loading-text');
  if (!bar) return;

  bar.style.width = '0%';
  var pct = 0;
  var messages = [
    '正在分析您的市场环境...',
    '正在评估您的竞争地位...',
    '正在匹配战略模型...',
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

/* ========== 重新测试 ========== */
function resetAndRestart() {
  // 清理Chart实例
  if (window._radarChartInstance) {
    window._radarChartInstance.destroy();
    window._radarChartInstance = null;
  }

  // 重置数据
  APP_DATA.industry = '';
  APP_DATA.size = '';
  APP_DATA.revenue = '';
  APP_DATA.marketAnswers = [];
  APP_DATA.compAnswers = [];
  APP_DATA.direction = '';
  APP_DATA.digitalAttitude = '';

  STEP2_INDEX = 0;
  STEP3_INDEX = 0;
  _STEP2_LOCKED = false;
  _STEP3_LOCKED = false;
  _RESULT_GENERATING = false;

  // 清空表单
  var industryEl = document.getElementById('industry');
  if (industryEl) industryEl.value = '';

  var radioGroups = ['size', 'revenue'];
  for (var g = 0; g < radioGroups.length; g++) {
    var els = document.getElementsByName(radioGroups[g]);
    for (var e = 0; e < els.length; e++) {
      els[e].checked = false;
    }
  }

  // 回到欢迎页
  showPage('welcome');
}

/* ========== DOMReady后初始化 ========== */
if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', initApp);
} else if (document.attachEvent) {
  document.attachEvent('onreadystatechange', function() {
    if (document.readyState === 'complete') {
      initApp();
    }
  });
}
