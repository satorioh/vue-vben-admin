<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';

  const props = defineProps({
    currentUser: {
      type: String,
      default: '王杨',
    },
    teamData: {
      type: Array,
      default: () => [
        { value: 1019, name: '王杨' },
        { value: 1500, name: '员工A' },
        { value: 1200, name: '员工B' },
        { value: 2000, name: '员工C' },
        { value: 1800, name: '员工D' },
        { value: 800, name: '员工E' },
        { value: 1000, name: '员工F' },
        { value: 681, name: '员工G' },
      ],
    },
  });

  const chartRef = ref(null);
  let myChart = null;

  const colors = [
    '#859CFF',
    '#9076ED',
    '#962EEE',
    '#5B42FA',
    '#8B8BFA',
    '#5171E7',
    '#C6CFFC',
    '#9069D1',
  ];

  const initChart = () => {
    if (!chartRef.value) return;

    myChart = echarts.init(chartRef.value);

    // --- 数据处理逻辑 ---

    // 1. 基础层数据：所有人都显示，但半径较短
    const baseData = props.teamData.map((item, index) => {
      const isCurrentUser = item.name === props.currentUser;
      return {
        ...item,
        // 基础层不需要显示标签，标签交给高亮层显示
        label: { show: false },
        itemStyle: {
          // 如果是当前用户，颜色保持一致；其他人按顺序取色
          color: isCurrentUser ? colors[0] : colors[(index % (colors.length - 1)) + 1],
        },
      };
    });

    // 2. 高亮层数据：只有当前用户有颜色，其他人透明
    const highlightData = props.teamData.map((item, index) => {
      const isCurrentUser = item.name === props.currentUser;
      return {
        ...item,
        label: {
          show: isCurrentUser, // 只有当前员工显示标签
          position: 'inner',
          formatter: '{d}%',
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
        },
        itemStyle: {
          // 关键点：当前用户显示颜色，其他人设置透明
          color: isCurrentUser ? colors[0] : 'transparent',
        },
      };
    });

    const option = {
      title: {
        text: props.currentUser,
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#000',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'Alibaba PuHuiTi 3.0',
        },
      },
      series: [
        // --- 第一层：基础圆环 (较小) ---
        {
          name: 'BaseRing',
          type: 'pie',
          // 内半径35%，外半径80%（比最大值小，留出高亮空间）
          radius: ['35%', '80%'],
          center: ['50%', '50%'],
          silent: true, // 禁用交互
          avoidLabelOverlap: false,
          data: baseData,
          z: 1, // 层级在下
        },
        // --- 第二层：高亮扇区 (较大) ---
        {
          name: 'HighlightRing',
          type: 'pie',
          // 内半径35%，外半径95%（这就是“超出”的部分）
          radius: ['35%', '95%'],
          center: ['50%', '50%'],
          silent: true,
          data: highlightData,
          z: 2, // 层级在上，覆盖基础层
          // 确保透明部分不响应鼠标，虽然 silent:true 已经禁用了，但这是双保险
          itemStyle: {
            borderWidth: 0,
          },
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
    window.removeEventListener('resize', handleResize);
    if (myChart) myChart.dispose();
  });

  const handleResize = () => {
    myChart && myChart.resize();
  };
</script>

<style scoped>
  .chart-container {
    width: 100%;
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
  }
  .chart {
    width: 100%;
    height: 100%;
  }
</style>
