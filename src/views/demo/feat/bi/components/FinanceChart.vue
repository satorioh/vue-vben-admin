<template>
  <div class="chart-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
      <el-tab-pane label="本月" name="month" />
      <el-tab-pane label="本年" name="year" />
      <el-tab-pane label="近一年" name="lastYear" />
    </el-tabs>

    <div class="chart-header">
      <div class="step-control" @click="toggleScale">
        <span class="label">步长与</span>
        <el-icon class="icon" :class="{ 'is-active': isLogScale }"><Sort /></el-icon>
        <span class="tip">(点击切换{{ isLogScale ? '线性' : '指数' }}坐标)</span>
      </div>
    </div>

    <div ref="chartRef" class="echarts-box"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
  import * as echarts from 'echarts';
  import { Sort } from '@element-plus/icons-vue'; // 需引入图标

  // --- 状态定义 ---
  const chartRef = ref(null);
  let myChart = null;

  const activeTab = ref('year'); // 默认选中本年
  const isLogScale = ref(false); // 是否为对数坐标

  // --- 数据模拟逻辑 ---
  const getMockData = (tab) => {
    let xData = [];
    let yData = [];

    if (tab === 'month') {
      // 本月：1号到31号
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        xData.push(`${i}`);
        // 模拟数据：如果切到对数轴，数据不能为0，这里做个随机
        yData.push(Math.floor(Math.random() * 500) + 10);
      }
    } else {
      // 本年 或 近一年：1月到12月
      for (let i = 1; i <= 12; i++) {
        xData.push(`${i}`);
        // 模拟波动数据
        let val = Math.floor(Math.random() * 80000);
        // 为了让图表看起来像图中的波动，特意造几个低点和高点
        if (i === 7) val = 90000;
        if (i === 3 || i === 12) val = 5000;
        yData.push(val);
      }
    }
    return { xData, yData };
  };

  // --- ECharts 配置更新 ---
  const updateChart = () => {
    if (!myChart) return;

    const { xData, yData } = getMockData(activeTab.value);
    const colorPurple = '#8979FF'; // 图中的紫色
    const shadowColor = 'rgba(137, 121, 255, 1)';

    const option = {
      backgroundColor: '#fff',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        padding: [10, 15],
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;',
        textStyle: { color: '#333' },
        // 自定义 Tooltip 内容，复刻图中样式
        formatter: (params) => {
          const item = params[0];
          const dateStr =
            activeTab.value === 'month' ? `本月${item.name}日` : `2025年${item.name}月`;

          // 格式化数字，加千分位
          const valStr = item.value.toLocaleString();

          return `
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">${dateStr}</div>
          <div style="font-size: 20px; font-weight: bold; color: #000;">
            ${valStr} <span style="font-size: 14px; font-weight: normal; color: #666;">万元</span>
          </div>
        `;
        },
      },
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false, // 线条从Y轴起始
        data: xData,
        axisLine: { show: false }, // 隐藏X轴线
        axisTick: { show: false }, // 隐藏刻度
        axisLabel: { color: '#666', fontSize: 12 },
      },
      yAxis: {
        // 核心需求：切换 type 实现等差数列(value) vs 指数级数列(log)
        type: isLogScale.value ? 'log' : 'value',
        name: '',
        min: isLogScale.value ? 1 : 0, // log轴不能从0开始，通常设为1
        logBase: 10, // 指数底数
        splitLine: {
          lineStyle: {
            type: 'dashed', // 虚线网格
            color: '#eee',
          },
        },
        axisLabel: { color: '#999' },
      },
      series: [
        {
          name: '融资金额',
          type: 'line',
          // smooth: true, // 平滑曲线
          symbol: 'circle', // 实心圆点
          symbolSize: 8,
          showSymbol: true, // 始终显示圆点
          itemStyle: {
            color: '#fff',
            borderColor: colorPurple,
            borderWidth: 2,
          },
          lineStyle: {
            color: colorPurple,
            width: 1,
            // 偏移量取 0 9px (模拟垂直方向的深度)
            // 模糊度取 15 (模拟 3px~18px 的混合柔和度)
            shadowColor: shadowColor,
            shadowOffsetY: 9,
            shadowBlur: 15,
          },
          // 区域填充渐变
          // areaStyle: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
          //     { offset: 1, color: 'rgba(139, 92, 246, 0.01)' },
          //   ]),
          // },
          data: yData,
          // 选中点的高亮样式
          emphasis: {
            scale: 1.3,
            itemStyle: {
              color: colorPurple, // 【需求3】填充色变回紫色，实现"实心"
              borderColor: '#fff', // 加一道白边增加对比度（可选，视觉效果更好）
              borderWidth: 2,
            },
          },
        },
      ],
    };

    myChart.setOption(option, true); // true表示不合并，重置配置
  };

  // --- 事件处理 ---

  // 1. Tab 切换
  const handleTabChange = () => {
    updateChart();
  };

  // 2. 步长切换
  const toggleScale = () => {
    isLogScale.value = !isLogScale.value;
    updateChart();
  };

  // --- 生命周期 ---
  onMounted(() => {
    if (chartRef.value) {
      myChart = echarts.init(chartRef.value);
      updateChart();
      window.addEventListener('resize', handleResize);
    }
  });

  onUnmounted(() => {
    if (myChart) {
      myChart.dispose();
      window.removeEventListener('resize', handleResize);
    }
  });

  const handleResize = () => {
    myChart && myChart.resize();
  };
</script>

<style scoped>
  .chart-container {
    width: 100%;
    max-width: 800px; /* 限制宽度以贴合截图 */
    margin: 20px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      sans-serif;
  }

  /* 覆盖 Element Tabs 样式以贴合设计 */
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: #f0f0f0;
  }
  :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;
    color: #666;
  }
  :deep(.el-tabs__item.is-active) {
    color: #3b82f6; /* Element 默认蓝，也可改为紫色 */
    font-weight: bold;
  }

  /* 步长控制区 */
  .chart-header {
    margin-top: 15px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
  }

  .step-control {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    color: #333;
  }

  .step-control .label {
    font-weight: bold;
    margin-right: 5px;
  }

  .step-control .icon {
    margin-right: 8px;
    transition: transform 0.3s;
  }
  .step-control .icon.is-active {
    color: #8b5cf6;
  }

  .step-control .tip {
    font-size: 12px;
    color: #999;
    margin-left: 4px;
  }

  .echarts-box {
    width: 100%;
    height: 350px;
  }
</style>
