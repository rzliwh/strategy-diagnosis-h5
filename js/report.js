/**
 * report.js - 报告渲染（四象限图、雷达图、文本）
 * 企业战略自助诊断H5
 */

/* ========== 光晕颜色映射（修复Bug 4） ========== */
var GLOW_COLORS = {
  '明星区': 'rgba(16, 185, 129, 0.25)',
  '机会区': 'rgba(59, 130, 246, 0.25)',
  '陷阱区': 'rgba(239, 68, 68, 0.25)',
  '保护区': 'rgba(245, 158, 11, 0.25)'
};

/* ========== 主渲染函数 ========== */
function renderReport(result) {
  renderDiagnosisResult(result);
  renderRadarChartSection(result);
  renderDimensionAnalysisText(result);
  renderSuggestions(result);
  renderL2Guide(result);
  renderDonation();
  renderDisclaimer(result);
}

/* ========== 板块1：诊断结果 ========== */
function renderDiagnosisResult(result) {
  var el = document.getElementById('report-quadrant');
  if (!el) return;

  var color = result.quadrantColor;
  var html = '';

  // 象限标识 + 标题
  html += '<div class="text-center mb-6">';
  html += '<div class="inline-block px-4 py-1 rounded-full text-white text-sm font-bold mb-3" style="background-color:' + color + '">';
  html += result.quadrant;
  html += '</div>';
  html += '<h3 class="text-xl font-bold text-gray-900">' + result.subtitle + '</h3>';
  html += '</div>';

  // 总结文字
  html += '<div class="bg-gray-50 rounded-xl p-4 mb-6 text-sm leading-relaxed text-gray-700">';
  html += '<p>' + result.summary + '</p>';
  html += '</div>';

  // 两个得分
  html += '<div class="flex gap-4 mb-6">';
  html += '<div class="flex-1 bg-blue-50 rounded-xl p-4 text-center">';
  html += '<div class="text-xs text-gray-500 mb-1">市场吸引力</div>';
  html += '<div class="text-2xl font-bold text-blue-600">' + result.marketScore + '</div>';
  html += '</div>';
  html += '<div class="flex-1 bg-blue-50 rounded-xl p-4 text-center">';
  html += '<div class="text-xs text-gray-500 mb-1">竞争地位</div>';
  html += '<div class="text-2xl font-bold text-blue-600">' + result.compScore + '</div>';
  html += '</div>';
  html += '</div>';

  // 四象限Canvas
  html += '<div class="bg-white rounded-xl p-2">';
  html += '<canvas id="quadrant-canvas" width="400" height="400" style="width:100%;height:auto;max-width:400px;margin:0 auto;display:block;"></canvas>';
  html += '</div>';

  el.innerHTML = html;

  // 渲染Canvas四象限图
  renderQuadrantChart(result.marketScore, result.compScore, result.quadrant);
}

/* ========== Canvas四象限图 ========== */
function renderQuadrantChart(marketScore, compScore, quadrant) {
  var canvas = document.getElementById('quadrant-canvas');
  if (!canvas) return;

  // 修复高分边距问题：给绘图区域留边距
  var dpr = window.devicePixelRatio || 1;
  var displayWidth = Math.min(canvas.clientWidth, 400);
  var displayHeight = displayWidth;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  var padding = 50;
  var chartSize = displayWidth - padding * 2;
  var originX = padding;
  var originY = padding + chartSize;

  // 清空
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // ---- 绘制背景色块（四象限） ----
  var halfSize = chartSize / 2;

  // 明星区（右上）- 绿色 market>=50, comp>=50
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.fillRect(originX + halfSize, padding, halfSize, halfSize);

  // 机会区（左上）- 蓝色 market>=50, comp<50
  ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
  ctx.fillRect(originX, padding, halfSize, halfSize);

  // 陷阱区（左下）- 红色 market<50, comp<50
  ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
  ctx.fillRect(originX, padding + halfSize, halfSize, halfSize);

  // 保护区（右下）- 橙色 market<50, comp>=50
  ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
  ctx.fillRect(originX + halfSize, padding + halfSize, halfSize, halfSize);

  // ---- 绘制象限标签 ----
  ctx.font = Math.max(12, displayWidth * 0.035) + 'px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 上半(Y小)中心 = originY - halfSize - halfSize/2
  // 下半(Y大)中心 = originY - halfSize/2
  var labelOffset = halfSize / 2;
  var topY = originY - halfSize - labelOffset;
  var bottomY = originY - labelOffset;
  var leftX = originX + labelOffset;
  var rightX = originX + halfSize + labelOffset;

  // 机会区（左上 → market>=50, comp<50）
  ctx.fillStyle = '#3B82F6';
  ctx.fillText('机会区', leftX, topY);

  // 明星区（右上 → market>=50, comp>=50）
  ctx.fillStyle = '#10B981';
  ctx.fillText('明星区', rightX, topY);

  // 陷阱区（左下 → market<50, comp<50）
  ctx.fillStyle = '#EF4444';
  ctx.fillText('陷阱区', leftX, bottomY);

  // 保护区（右下 → market<50, comp>=50）
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('保护区', rightX, bottomY);

  // ---- 绘制坐标轴 ----
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // X轴
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + chartSize, originY);
  // Y轴
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX, originY - chartSize);
  ctx.stroke();

  // ---- 绘制刻度线 ----
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 0.5;
  ctx.setLineDash([4, 4]);

  // X轴50分线
  ctx.beginPath();
  ctx.moveTo(originX + halfSize, originY);
  ctx.lineTo(originX + halfSize, originY - chartSize);
  ctx.stroke();

  // Y轴50分线
  ctx.beginPath();
  ctx.moveTo(originX, originY - halfSize);
  ctx.lineTo(originX + chartSize, originY - halfSize);
  ctx.stroke();

  ctx.setLineDash([]);

  // ---- 轴标签 ----
  ctx.font = Math.max(10, displayWidth * 0.028) + 'px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('竞争地位 →', originX + chartSize / 2, originY + 8);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  // Y轴标签通过旋转实现，简单方法用text
  ctx.save();
  ctx.translate(originX - 8, originY - chartSize / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('← 市场吸引力', 0, 0);
  ctx.restore();

  // ---- 绘制原点（分数标记） ----
  // 竞争地位：0(左/弱) → 100(右/强)
  var dotX = padding + (compScore / 100) * chartSize;
  // 市场吸引力：0(下/低) → 100(上/高)
  var dotY = padding + chartSize - (marketScore / 100) * chartSize;

  // 光晕
  var glowColor = GLOW_COLORS[quadrant] || 'rgba(30, 58, 138, 0.25)';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 22, 0, Math.PI * 2);
  ctx.fillStyle = glowColor;
  ctx.fill();

  // 圆点
  ctx.beginPath();
  ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#1E3A8A';
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 坐标值
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('(' + compScore + ', ' + marketScore + ')', dotX, dotY - 16);
}

/* ========== 板块2：分析依据（雷达图 + 维度解读） ========== */
function renderRadarChartSection(result) {
  var el = document.getElementById('report-radar');
  if (!el) return;

  var html = '';
  html += '<h3 class="text-lg font-bold text-gray-900 mb-1">分析依据</h3>';
  html += '<p class="text-xs text-gray-500 mb-4">参考了战略管理领域的经典方法论，从8个维度综合评估</p>';
  html += '<div class="bg-white rounded-xl p-2 mb-4">';
  html += '<canvas id="radar-canvas" width="300" height="300" style="width:100%;height:auto;max-width:340px;margin:0 auto;display:block;"></canvas>';
  html += '</div>';
  html += '<div id="dimension-texts" class="space-y-3"></div>';

  el.innerHTML = html;

  // 渲染雷达图
  renderRadarChart(result.marketAnswers, result.compAnswers);
}

function renderRadarChart(marketAnswers, compAnswers) {
  var canvas = document.getElementById('radar-canvas');
  if (!canvas) return;

  if (typeof Chart === 'undefined') {
    canvas.parentNode.innerHTML += '<div class="text-center text-red-500 text-sm py-4">图表库加载失败，请检查网络连接</div>';
    return;
  }

  var dpr = window.devicePixelRatio || 1;
  var displayWidth = Math.min(canvas.clientWidth, 340);
  var displayHeight = displayWidth;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  var ctx = canvas.getContext('2d');

  // 如果已有Chart实例，先销毁
  if (window._radarChartInstance) {
    window._radarChartInstance.destroy();
    window._radarChartInstance = null;
  }

  var allAnswers = (marketAnswers || []).concat(compAnswers || []);
  var labels = ['市场规模', '市场增长', '利润空间', '政策环境', '技术实力', '品牌认知', '渠道能力', '成本结构'];

  window._radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: '评分',
        data: allAnswers,
        backgroundColor: 'rgba(30, 58, 138, 0.15)',
        borderColor: '#1E3A8A',
        borderWidth: 2,
        pointBackgroundColor: '#1E3A8A',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.r + '分';
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1,
            font: {
              size: 10
            }
          },
          pointLabels: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

function renderDimensionAnalysisText(result) {
  var el = document.getElementById('dimension-texts');
  if (!el) return;

  var analysis = getDimensionAnalysis(result.marketAnswers, result.compAnswers);
  var html = '';

  for (var i = 0; i < analysis.length; i++) {
    var item = analysis[i];
    var scoreColor = item.score >= 4 ? 'text-green-600' : (item.score >= 3 ? 'text-yellow-600' : 'text-red-500');
    var barWidth = (item.score / 5) * 100;

    html += '<div class="border border-gray-100 rounded-xl p-3">';
    html += '<div class="flex justify-between items-center mb-2">';
    html += '<span class="text-sm font-medium text-gray-800">' + item.dimension + '</span>';
    html += '<span class="text-sm font-bold ' + scoreColor + '">' + item.score + '/5</span>';
    html += '</div>';
    html += '<div class="w-full bg-gray-100 rounded-full h-2 mb-2">';
    html += '<div class="h-2 rounded-full" style="width:' + barWidth + '%;background-color:' + (item.score >= 4 ? '#10B981' : (item.score >= 3 ? '#F59E0B' : '#EF4444')) + '"></div>';
    html += '</div>';
    html += '<p class="text-xs text-gray-600 leading-relaxed">' + item.text + '</p>';
    html += '</div>';
  }

  el.innerHTML = html;
}

/* ========== 板块3：战略方向建议 ========== */
function renderSuggestions(result) {
  var el = document.getElementById('report-suggestions');
  if (!el) return;

  var suggestions = result.suggestions;
  if (!suggestions || suggestions.length === 0) {
    el.innerHTML = '';
    return;
  }

  var html = '';
  html += '<h3 class="text-lg font-bold text-gray-900 mb-4">战略方向建议</h3>';

  for (var i = 0; i < suggestions.length; i++) {
    var s = suggestions[i];
    html += '<div class="border border-gray-100 rounded-xl p-4 mb-3">';
    html += '<div class="flex items-start gap-3 mb-3">';
    html += '<span class="flex-shrink-0 w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center" style="background-color:' + result.quadrantColor + '">' + (i + 1) + '</span>';
    html += '<h4 class="font-bold text-gray-900 text-base">' + s.title + '</h4>';
    html += '</div>';
    html += '<div class="space-y-2 text-xs text-gray-600 ml-10">';
    html += '<p><span class="font-medium text-gray-700">适合：</span>' + s.suitable + '</p>';
    html += '<p><span class="font-medium text-green-700">优势：</span>' + s.advantage + '</p>';
    html += '<p><span class="font-medium text-red-600">注意：</span>' + s.disadvantage + '</p>';
    html += '<div class="rounded-lg p-3 mt-2">';
    html += '<p class="font-medium mb-1" style="color:#64748B">⚡ AI 落地建议</p>';
    html += '<p style="color:#64748B">' + s.aiAdvice + '</p>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  }

  el.innerHTML = html;
}

/* ========== 板块4：L2引导 ========== */
function renderL2Guide(result) {
  var el = document.getElementById('report-l2');
  if (!el) return;

  // 构建URL参数
  var industryLabel = getIndustryLabel(result.industry);
  var scaleLabel = getScaleLabel(result.size);
  var revenueLabel = getRevenueLabel(result.revenue);
  var prefLetter = getDirectionLetter(result.direction);
  var painLetter = getDigitalLetter(result.digitalAttitude);

  var params = new URLSearchParams();
  params.set('market', result.marketScore);
  params.set('comp', result.compScore);
  params.set('industry', industryLabel);
  params.set('scale', scaleLabel);
  params.set('revenue', revenueLabel);
  params.set('pref', prefLetter);
  params.set('pain', painLetter);

  var html = '';
  html += '<div class="l2-upgrade-card">';
  html += '<p class="l2-upgrade-hint">想知道具体该怎么走？</p>';
  html += '<div class="l2-upgrade-features">';
  html += '<span>行业深度洞察</span>';
  html += '<span>·</span>';
  html += '<span>3个战略方向拆解</span>';
  html += '<span>·</span>';
  html += '<span>竞争对手分析框架</span>';
  html += '<span>·</span>';
  html += '<span>90天行动计划</span>';
  html += '</div>';
  html += '<button onclick="goToL2(\'' + params.toString().replace(/'/g, "\\'") + '\')" class="l2-upgrade-btn">';
  html += '查看完整战略分析报告 →';
  html += '</button>';
  html += '<p class="l2-upgrade-price">¥299</p>';
  html += '</div>';

  el.innerHTML = html;
}

function goToL2(paramsStr) {
  window.location.href = 'l2/index.html?' + paramsStr;
}

/* 辅助：行业值→中文标签 */
function getIndustryLabel(value) {
  for (var i = 0; i < INDUSTRIES.length; i++) {
    if (INDUSTRIES[i].value === value) return INDUSTRIES[i].label;
  }
  return value || '';
}

/* 辅助：规模→显示文字 */
function getScaleLabel(size) {
  var map = { small: '20人以下', medium: '20-200', large: '200人以上' };
  return map[size] || size || '';
}

/* 辅助：营收→显示文字 */
function getRevenueLabel(revenue) {
  var map = { below_1m: '100万以下', '1m_10m': '100-1000万', '10m_100m': '1000万-1亿', above_100m: '1亿以上' };
  return map[revenue] || revenue || '';
}

/* 辅助：方向→字母 */
function getDirectionLetter(dir) {
  var map = { aggressive: 'A', steady: 'B', focus: 'C', transform: 'D' };
  return map[dir] || '';
}

/* 辅助：数字化态度→字母 */
function getDigitalLetter(att) {
  var map = { allin: 'A', keypoint: 'B', follow: 'C', wait: 'D' };
  return map[att] || '';
}

/* ========== 板块5：打赏引导 ========== */
function renderDonation() {
  var el = document.getElementById('report-donation');
  if (!el) return;

  var html = '';
  html += '<div class="report-card tip-card">';
  html += '<h3 class="report-section-title">觉得这份报告有帮助？</h3>';
  html += '<p class="tip-desc">随心支持，助力持续创作</p>';

  html += '<div class="tip-amount-options">';
  html += '<div class="tip-option selected" data-amount="9">';
  html += '<span class="tip-amount">9元</span>';
  html += '<span class="tip-label">一杯瑞幸</span>';
  html += '</div>';
  html += '<div class="tip-option" data-amount="19">';
  html += '<span class="tip-amount">19元</span>';
  html += '<span class="tip-label">一碗猪脚饭</span>';
  html += '</div>';
  html += '<div class="tip-option" data-amount="35">';
  html += '<span class="tip-amount">35元</span>';
  html += '<span class="tip-label">一杯星巴克</span>';
  html += '</div>';
  html += '</div>';

  html += '<div class="tip-image-wrapper">';
  html += '<img id="zhifu-code" src="images/wechat-pay.jpg" alt="微信收款码" class="tip-image">';
  html += '</div>';

  html += '<p class="tip-hint" id="tip-hint">扫码支付，请输入：9元</p>';
  html += '</div>';

  el.innerHTML = html;

  var tipOptions = document.querySelectorAll('.tip-option');
  tipOptions.forEach(function(option) {
    option.addEventListener('click', function() {
      tipOptions.forEach(function(o) { o.classList.remove('selected'); });
      option.classList.add('selected');
      var amount = option.getAttribute('data-amount');
      var hint = document.getElementById('tip-hint');
      if (hint) hint.textContent = '扫码支付，请输入：' + amount + '元';
    });
  });
}

/* ========== 板块6：免责声明 + 重新测试 ========== */
function renderDisclaimer(result) {
  var el = document.getElementById('report-disclaimer');
  if (!el) return;

  var html = '';
  html += '<div class="bg-gray-50 rounded-xl p-4 mb-4">';
  html += '<p class="text-xs text-gray-400 leading-relaxed">' + DISCLAIMER_TEXT + '</p>';
  html += '</div>';

  // 用户信息回顾
  var sizeLabel = '';
  for (var si = 0; si < SIZE_OPTIONS.length; si++) {
    if (SIZE_OPTIONS[si].value === result.size) {
      sizeLabel = SIZE_OPTIONS[si].label;
      break;
    }
  }
  var revenueLabel = '';
  for (var ri = 0; ri < REVENUE_OPTIONS.length; ri++) {
    if (REVENUE_OPTIONS[ri].value === result.revenue) {
      revenueLabel = REVENUE_OPTIONS[ri].label;
      break;
    }
  }
  var industryLabel = '';
  for (var ii = 0; ii < INDUSTRIES.length; ii++) {
    if (INDUSTRIES[ii].value === result.industry) {
      industryLabel = INDUSTRIES[ii].label;
      break;
    }
  }

  html += '<div class="text-xs text-gray-400 mb-4">';
  html += '<p>诊断基础：' + industryLabel + ' / ' + sizeLabel + ' / ' + revenueLabel + '</p>';
  html += '</div>';

  html += '<button onclick="resetAndRestart()" class="w-full py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors">';
  html += '重新测试';
  html += '</button>';

  el.innerHTML = html;
}
