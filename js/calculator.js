/**
 * calculator.js - 评分算法、象限判断
 * 企业战略自助诊断H5
 */

/**
 * 计算市场吸引力得分
 * @param {Array} marketAnswers - 4个市场题目的得分数组 (1-5)
 * @returns {number} 0-100
 */
function calcMarketScore(marketAnswers) {
  if (!marketAnswers || marketAnswers.length !== 4) {
    return 0;
  }
  var sum = 0;
  for (var i = 0; i < marketAnswers.length; i++) {
    sum += marketAnswers[i];
  }
  var avg = sum / marketAnswers.length;
  return Math.round(avg * 20);
}

/**
 * 计算竞争地位得分
 * @param {Array} compAnswers - 4个竞争题目的得分数组 (1-5)
 * @returns {number} 0-100
 */
function calcCompScore(compAnswers) {
  if (!compAnswers || compAnswers.length !== 4) {
    return 0;
  }
  var sum = 0;
  for (var i = 0; i < compAnswers.length; i++) {
    sum += compAnswers[i];
  }
  var avg = sum / compAnswers.length;
  return Math.round(avg * 20);
}

/**
 * 判断象限
 * 分界线：50分
 * market>=50 && comp>=50 → 明星区
 * market>=50 && comp<50  → 机会区
 * market<50  && comp<50  → 陷阱区
 * market<50  && comp>=50 → 保护区
 * @param {number} marketScore 0-100
 * @param {number} compScore 0-100
 * @returns {string} 象限名称
 */
function getQuadrant(marketScore, compScore) {
  if (marketScore >= 60 && compScore >= 60) {
    return '明星区';
  }
  if (marketScore >= 60 && compScore < 60) {
    return '机会区';
  }
  if (marketScore < 60 && compScore < 60) {
    return '陷阱区';
  }
  return '保护区';
}

/**
 * 获取象限报告数据
 * @param {string} quadrant - 象限名称
 * @returns {Object} 报告模板
 */
function getQuadrantReport(quadrant) {
  return QUADRANT_REPORTS[quadrant] || QUADRANT_REPORTS['陷阱区'];
}

/**
 * 生成完整诊断结果
 * @param {Object} data - 用户数据
 * @param {Array} data.marketAnswers - 市场题目答案 [1-5, 1-5, 1-5, 1-5]
 * @param {Array} data.compAnswers - 竞争题目答案 [1-5, 1-5, 1-5, 1-5]
 * @returns {Object} 诊断结果
 */
function generateResult(data) {
  var marketScore = calcMarketScore(data.marketAnswers);
  var compScore = calcCompScore(data.compAnswers);
  var quadrant = getQuadrant(marketScore, compScore);
  var report = getQuadrantReport(quadrant);

  return {
    marketScore: marketScore,
    compScore: compScore,
    quadrant: quadrant,
    quadrantColor: report.color,
    subtitle: report.subtitle,
    summary: report.summary,
    suggestions: report.suggestions,
    l2Guide: report.l2Guide,
    marketAnswers: data.marketAnswers,
    compAnswers: data.compAnswers,
    industry: data.industry,
    size: data.size,
    revenue: data.revenue,
    direction: data.direction,
    digitalAttitude: data.digitalAttitude
  };
}

/**
 * 获取8维度分析数据
 * @param {Array} marketAnswers - 市场题目答案
 * @param {Array} compAnswers - 竞争题目答案
 * @returns {Array} 维度分析数组
 */
function getDimensionAnalysis(marketAnswers, compAnswers) {
  var dimensions = ['m1', 'm2', 'm3', 'm4', 'c1', 'c2', 'c3', 'c4'];
  var answers = marketAnswers.concat(compAnswers);
  var result = [];

  for (var i = 0; i < dimensions.length; i++) {
    var key = dimensions[i];
    var score = answers[i] || 3;
    var analysis = DIMENSION_ANALYSIS[key];

    var text;
    if (score >= 4) {
      text = analysis.high;
    } else if (score >= 3) {
      text = analysis.mid;
    } else {
      text = analysis.low;
    }

    result.push({
      dimension: analysis.name,
      score: score,
      text: text
    });
  }

  return result;
}

/**
 * 获取雷达图数据
 * @param {Array} marketAnswers - 市场题目答案
 * @param {Array} compAnswers - 竞争题目答案
 * @returns {Object} Chart.js兼容的数据格式
 */
function getRadarChartData(marketAnswers, compAnswers) {
  var dimNames = ['市场规模', '市场增长', '利润空间', '政策环境', '技术实力', '品牌认知', '渠道能力', '成本结构'];
  var allAnswers = (marketAnswers || []).concat(compAnswers || []);

  return {
    labels: dimNames,
    datasets: [{
      data: allAnswers,
      backgroundColor: 'rgba(30, 58, 138, 0.2)',
      borderColor: '#1E3A8A',
      pointBackgroundColor: '#1E3A8A',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5
    }]
  };
}
