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

  // 1. 定义颜色变量
  const colors = {
    enterprise: '#5680F5', // 企业项目 - 蓝
    funding: '#F2BE05', // 资金方项目 - 黄
    newProject: '#15C0E6', // 新建项目 - 青
    landed: '#007D99', // 落地项目 - 深青
    individual: '#31A12B', // 个人客户 - 绿
    company: '#C70612', // 公司客户 - 红
  };

  // 2. 定义连线颜色变量
  const lineColors = {
    enterprise: '#A8C0F3', // 企业项目 - 浅蓝
    funding: '#F4DB83', // 资金方项目 - 浅黄
    newProject: '#A4EFFF', // 新建项目 - 浅青
    individual: '#9BCE9A', // 个人客户 - 浅绿
    company: '#DC8688', // 公司客户 - 浅红
  };

  // 3. 新增：名称到颜色Key的映射表，用于查找连线颜色
  const nodeKeyMap = {
    企业项目: 'enterprise',
    资金方项目: 'funding',
    新建项目: 'newProject',
    落地项目: 'landed',
    个人客户: 'individual',
    公司客户: 'company',
  };

  // 准备数据
  const data = [
    { name: '企业项目', value: 12, itemStyle: { color: colors.enterprise } },
    { name: '资金方项目', value: 10, itemStyle: { color: colors.funding } },
    { name: '新建项目', value: 5, itemStyle: { color: colors.newProject } },
    { name: '落地项目', value: 4, itemStyle: { color: colors.landed } },
    { name: '个人客户', value: 2, itemStyle: { color: colors.individual } },
    { name: '公司客户', value: 2, itemStyle: { color: colors.company } },
  ].map((v) => ({
    ...v,
    label: {
      color: v.itemStyle.color,
    },
  }));

  // 原始连线数据
  const rawLinks = [
    { source: '企业项目', target: '新建项目', value: 12 },
    { source: '资金方项目', target: '新建项目', value: 10 },
    { source: '新建项目', target: '落地项目', value: 4 },
    { source: '落地项目', target: '个人客户', value: 2 },
    { source: '落地项目', target: '公司客户', value: 2 },
  ];

  // 4. 处理连线颜色逻辑
  // 逻辑：使用 lineColors 中对应的开始节点的颜色，如果找不到，则使用结束节点的颜色
  const formattedLinks = rawLinks.map((link) => {
    const sourceKey = nodeKeyMap[link.source];
    const targetKey = nodeKeyMap[link.target];

    // 优先取 sourceKey 对应的颜色，如果没有则取 targetKey
    // 注意：需要确保 lineColors 中有对应的 key
    let linkColor = lineColors[sourceKey];

    if (!linkColor && lineColors[targetKey]) {
      linkColor = lineColors[targetKey];
    }

    // 兜底颜色，防止字典缺失导致透明
    if (!linkColor) linkColor = '#ccc';

    return {
      ...link,
      lineStyle: {
        color: linkColor,
      },
    };
  });

  const initChart = () => {
    if (!chartRef.value) return;

    myChart = echarts.init(chartRef.value);

    const option = {
      silent: true,
      tooltip: { show: false },
      series: [
        {
          type: 'sankey',
          layout: 'none',
          left: '8%',
          right: '15%',
          top: '30%',
          bottom: '10%',
          nodeWidth: 16,
          nodeGap: 50,

          // 全局连线样式 (颜色已下放到 data 中，这里只保留形状配置)
          lineStyle: {
            curveness: 0.6,
            opacity: 0.6,
          },

          label: {
            show: true,
            position: 'top',
            distance: 4,
            // 【核心修复点】添加这行，让 label 先继承节点的颜色
            color: 'inherit',
            formatter: function (params) {
              return `{title|${params.name}}\n{num|${params.value}}`;
            },
            rich: {
              title: {
                fontSize: 12,
                lineHeight: 14,
                color: 'inherit', // 继承节点颜色
                align: 'center', // 【修改点】文字居中
              },
              num: {
                fontSize: 12,
                lineHeight: 14,
                color: 'inherit', // 继承节点颜色
                align: 'center', // 【修改点】数字相对于文字居中
              },
            },
          },

          data: data,
          links: formattedLinks, // 使用处理过颜色的 links
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
    height: 175px;
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
