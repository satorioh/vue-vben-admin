<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import * as echarts from 'echarts';

  // 模拟数据：实际开发中可从 props 接收
  const props = defineProps({
    currentUser: {
      type: String,
      default: '王杨',
    },
    teamData: {
      type: Array,
      default: () => [
        { value: 1019, name: '王杨' }, // 约 10.19%
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

  // 颜色盘：取色自你提供的图片（紫色/蓝色系）
  const colors = [
    '#859CFF', // 高亮色（近似）
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

    // 处理数据：标记出当前员工，设置其特殊样式
    const processedData = props.teamData.map((item, index) => {
      const isCurrentUser = item.name === props.currentUser;
      return {
        ...item,
        // 只有当前员工设置为“选中”状态，使其扇区弹出
        selected: isCurrentUser,
        // 样式配置
        label: {
          show: isCurrentUser, // 只有当前员工显示标签
          position: 'inner', // 标签在扇区内部
          formatter: '{d}%', // 显示百分比
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
        },
        itemStyle: {
          // 可以在这里微调特定扇区的颜色，或者依赖 color 数组
          // 如果是当前员工，强制使用第一个颜色（浅蓝），确保与图片一致
          color: isCurrentUser ? colors[0] : colors[(index % (colors.length - 1)) + 1],
        },
      };
    });

    const option = {
      // 1. 图形中间为当前员工姓名
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
        {
          type: 'pie',
          radius: ['35%', '95%'], // 内外半径，形成圆环
          center: ['50%', '50%'],

          // 5. 不要由任何区域的自动切换或交互 -> silent: true
          silent: true,

          // 3. & 4. 始终高亮（弹出）当前员工
          selectedMode: 'single', // 虽然 silent 禁用了交互，但 selected 属性依然生效
          selectedOffset: 10, // 弹出距离，数值越大离中心越远

          // 标签布局配置
          avoidLabelOverlap: false,

          data: processedData,

          // 如果不手动指定 itemStyle 里的颜色，可以使用全局调色盘
          // color: colors
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
    background-color: #fff; /* 确保背景白底 */
  }
  .chart {
    width: 100%; /* 根据实际需求调整 */
    height: 100%;
  }
</style>
