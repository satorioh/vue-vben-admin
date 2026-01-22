<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';

  const chartRef = ref(null);
  let myChart = null;

  // 定义颜色变量，方便统一管理
  const colors = {
    enterprise: '#5680F5', // 企业项目 - 蓝
    funding: '#F2BE05', // 资金方项目 - 黄
    newProject: '#15C0E6', // 新建项目 - 青
    landed: '#007D99', // 落地项目 - 深青
    individual: '#31A12B', // 个人客户 - 绿
    company: '#C70612', // 公司客户 - 红
  };

  // 定义连线颜色变量
  const lineColors = {
    enterprise: '#A8C0F3', // 企业项目 - 浅蓝
    funding: '#F4DB83', // 资金方项目 - 浅黄
    newProject: '#A4EFFF', // 新建项目 - 浅青
    individual: '#9BCE9A', // 个人客户 - 浅绿
    company: '#DC8688', // 公司客户 - 浅红
  };

  // 准备数据
  // value 决定了节点的高度
  const data = [
    { name: '企业项目', value: 12, itemStyle: { color: colors.enterprise } },
    { name: '资金方项目', value: 10, itemStyle: { color: colors.funding } },
    { name: '新建项目', value: 5, itemStyle: { color: colors.newProject } },
    { name: '落地项目', value: 4, itemStyle: { color: colors.landed } },
    { name: '个人客户', value: 2, itemStyle: { color: colors.individual } },
    { name: '公司客户', value: 2, itemStyle: { color: colors.company } },
  ];

  // 准备连线关系
  // 注意：为了视觉上让连线适应目标节点的大小（模拟漏斗效果），
  // 我们需要根据目标节点的 value 按比例分配连线的 value。
  // 例如：进入“新建项目”的总量是 5。来源是 12 和 10 (比例约 1.2 : 1)。
  // 连线1 ≈ 2.72, 连线2 ≈ 2.28
  const links = [
    { source: '企业项目', target: '新建项目', value: 2 },
    { source: '资金方项目', target: '新建项目', value: 3 },
    // 新建 -> 落地 (5 -> 4)，连线值取 4，在“新建项目”侧会留一点空隙，符合视觉上的收缩
    { source: '新建项目', target: '落地项目', value: 4 },
    // 落地 -> 客户 (4 -> 2+2)，完全匹配
    { source: '落地项目', target: '个人客户', value: 2 },
    { source: '落地项目', target: '公司客户', value: 2 },
  ];

  const initChart = () => {
    if (!chartRef.value) return;

    myChart = echarts.init(chartRef.value);

    const option = {
      // 核心设置：禁用所有鼠标交互
      silent: true,

      // 无需 tooltip，因为禁用了交互
      tooltip: { show: false },

      series: [
        {
          type: 'sankey',
          layout: 'none',
          left: '8%',
          right: '15%', // 右侧留空间给文字
          top: '30%',
          bottom: '10%',
          nodeWidth: 16, // 节点矩形的宽度
          nodeGap: 30, // 纵向间距

          // 连线样式：使用渐变色让视觉更顺滑
          lineStyle: {
            color: 'gradient',
            curveness: 0.6,
            opacity: 0.6, // 连线半透明
          },

          // 节点标签配置
          label: {
            show: true,
            position: 'top', // 文字在节点上方
            distance: 5,
            formatter: function (params) {
              // 使用富文本格式化：第一行文字，第二行数字
              // {name|xxx} 对应 rich 中的 name 样式
              return `{title|${params.name}}\n{num|${params.value}}`;
            },
            rich: {
              title: {
                fontSize: 12,
                lineHeight: 14,
                // 这里让文字颜色跟随节点颜色有点困难（params.color拿不到），
                // 统一用一种颜色或在 data 里单独配 label 也可以。
                // 为了简单还原图示，这里使用统一颜色，或者你可以遍历 data 给每个节点单独配 label color
                color: 'inherit', // 继承节点颜色
              },
              num: {
                fontSize: 12,
                lineHeight: 14,
                fontWeight: 'bold',
                color: 'inherit', // 继承节点颜色
              },
            },
          },

          data: data,
          links: links,
        },
      ],
    };

    myChart.setOption(option);
  };

  onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    if (myChart) {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    }
  });

  const handleResize = () => {
    myChart && myChart.resize();
  };
</script>

<style scoped>
  .chart-container {
    width: 100%;
    height: 175px; /* 根据实际需要调整高度 */
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .chart {
    width: 100%;
    height: 100%;
  }
</style>
