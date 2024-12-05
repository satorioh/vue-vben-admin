<template>
  <div class="charts">
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref, Ref, watch } from 'vue';
  import { useECharts } from '@/hooks/web/useECharts';

  defineOptions({ name: 'PolarStackBar' });

  const years = ['2020', '2021', '2022', '2023', '2024'];
  const data1 = [320, 332, 301, 334, 390];
  const data2 = [220, 182, 191, 234, 290];

  const colorList = [
    ['rgba(148, 106, 215,1)', 'rgba(148, 106, 215,0.6)'],
    ['rgba(73, 169, 175,1)', 'rgba(73, 169, 175,0.6)'],
    ['rgba(136, 162, 255,1)', 'rgba(136, 162, 255,0.6)'],
    ['rgba(180, 191, 210,1)', 'rgba(180, 191, 210,0.6)'],
    ['rgba(246, 187, 66,1)', 'rgba(246, 187, 66,0.6)'],
  ];

  const curIndex = ref(-1);
  let myChart: any = null;
  let timer: any = null;
  const chartRef = ref<HTMLElement | null>(null);
  const { setOptions, getInstance } = useECharts(chartRef as Ref<HTMLDivElement>);

  const initChart = () => {
    setOptions({
      angleAxis: {
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      radiusAxis: {
        type: 'category',
        data: years,
        z: 10,
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
      polar: {
        radius: ['20%', '60%'],
      },
      series: [
        {
          type: 'bar',
          data: data1,
          coordinateSystem: 'polar',
          name: '赔偿准备',
          stack: 'a',
          barWidth: 8,
          itemStyle: {
            color: function (params) {
              return colorList[params.dataIndex][0];
            },
            borderRadius: 10,
          },
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'red',
            },
          },
        },
        {
          type: 'bar',
          data: data2,
          coordinateSystem: 'polar',
          name: '责任准备',
          stack: 'a',
          barWidth: 8,
          itemStyle: {
            color: function (params) {
              return colorList[params.dataIndex][1];
            },
            borderRadius: 10,
          },
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'red',
            },
          },
        },
      ],
      legend: {
        show: true,
        left: 'center',
        top: 'bottom',
        // 根据colorList动态显示不同的颜色
        data: [
          {
            name: '赔偿准备',
            itemStyle: {
              color: colorList[0][0],
            },
            textStyle: {
              color: 'white',
            },
          },
          {
            name: '责任准备',
            itemStyle: {
              color: colorList[0][1],
            },
            textStyle: {
              color: 'white',
            },
          },
        ],
      },
    }).then(() => {
      loopCurIndex();
    });
  };

  const changeLegendColor = (curYear: number) => {
    myChart = getInstance();
    const legend = myChart.getOption().legend[0];
    legend.data.forEach((item: any, index: number) => {
      item.itemStyle.color = colorList[curYear][index];
    });
    myChart.setOption({ legend });
  };

  const changeEmphasisShadowColor = (curYear: number) => {
    myChart = getInstance();
    const series = myChart.getOption().series;
    series.forEach((item: any, index: number) => {
      item.emphasis.itemStyle.shadowColor = colorList[curYear][index];
    });
    myChart.setOption({ series });
  };

  const highLightCircle = (curYear: number) => {
    myChart = getInstance();
    for (let i of years.keys()) {
      myChart.dispatchAction({
        type: i !== curYear ? 'downplay' : 'highlight',
        seriesIndex: [0, 1],
        dataIndex: i,
      });
    }
  };

  const loopCurIndex = () => {
    timer = setInterval(() => {
      curIndex.value = (curIndex.value + 1) % years.length;
    }, 2000);
  };

  const clearTimer = () => {
    timer && clearInterval(timer);
    timer = null;
  };

  watch(
    () => curIndex.value,
    (newVal) => {
      changeLegendColor(newVal);
      changeEmphasisShadowColor(newVal);
      highLightCircle(newVal);
    },
  );

  onMounted(() => initChart());
  onUnmounted(() => clearTimer());
</script>

<style scoped lang="less">
  .charts {
    width: 100%;
    height: 100%;
    position: relative;
    background: black;

    .chart {
      width: 50%;
      height: 100%;
    }
  }
</style>
