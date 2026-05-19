/**
 * org-chart.js - 雷达图封装（Chart.js Polygon类型）
 * 组织诊断H5
 */

/**
 * 绘制五维度雷达图
 * @param {string} canvasId - Canvas元素ID
 * @param {number[]} scores - [dim1, dim2, dim3, dim4, dim5]，每维度满分8分
 * @param {string[]} labels - 五维度中文标签
 */
function drawOrgRadarChart(canvasId, scores, labels) {
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (typeof Chart === 'undefined') {
    var parent = canvas.parentNode;
    if (parent) {
      var fallback = document.createElement('div');
      fallback.className = 'text-center text-red-500 text-sm py-4';
      fallback.textContent = '图表库加载失败，请检查网络连接';
      parent.appendChild(fallback);
    }
    return;
  }

  // 销毁已有实例
  if (window._orgRadarChartInstance) {
    window._orgRadarChartInstance.destroy();
    window._orgRadarChartInstance = null;
  }

  var dpr = window.devicePixelRatio || 1;
  var displayWidth = Math.min(canvas.clientWidth || 340, 340);
  var displayHeight = displayWidth;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  var ctx = canvas.getContext('2d');

  window._orgRadarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        data: scores,
        backgroundColor: 'rgba(15, 76, 129, 0.12)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        pointBackgroundColor: '#0F4C81',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
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
              return context.parsed.r + ' / 8 分';
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 8,
          ticks: {
            stepSize: 2,
            font: { size: 9 },
            backdropColor: 'transparent',
            color: '#94A3B8'
          },
          pointLabels: {
            font: { size: 12, weight: '500' },
            color: '#1E293B'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.06)'
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.06)'
          }
        }
      }
    }
  });
}
