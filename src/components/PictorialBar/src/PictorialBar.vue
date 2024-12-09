<template>
  <div class="pictorial-bar">
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
  import { useECharts } from '@/hooks/web/useECharts';
  import { onMounted, Ref, ref } from 'vue';

  defineOptions({ name: 'PictorialBar' });
  const props = defineProps({
    value: {
      type: Number,
      default: 0,
    },
    maxValue: {
      type: Number,
      default: 100,
    },
    baseColor: {
      type: String,
      default: '126, 172, 119',
    },
  });

  const chartRef = ref<HTMLElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const getColor = (opacity = 1) => {
    return `rgba(${props.baseColor}, ${opacity})`;
  };

  const initChart = () => {
    setOptions({
      // backgroundColor: '#0e202d',
      //
      grid: {
        top: 24,
        bottom: 44,
      },
      xAxis: {
        data: [],
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
      },
      yAxis: {
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: [
        // 内-顶部
        {
          name: '',
          type: 'pictorialBar',
          symbol: 'diamond',
          symbolSize: [100, 45],
          symbolOffset: [-10, -20],
          z: 12,
          data: [
            {
              name: '',
              value: props.value,
              symbolPosition: 'end',
              itemStyle: {
                color: getColor(0.5), //圆柱顶部颜色
              },
            },
          ],
        },

        // 内-底部
        {
          name: '',
          type: 'pictorialBar',
          symbol: 'diamond',
          symbolSize: [100, 45],
          symbolOffset: [-10, 24],
          z: 12,
          data: [
            {
              name: '',
              value: props.value,
              itemStyle: {
                color: getColor(1), //圆柱底部颜色
              },
            },
          ],
        },

        // 内-渐变色
        {
          type: 'bar',
          barWidth: 100,
          data: [
            {
              name: '',
              value: props.value,
              itemStyle: {
                color: {
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  type: 'linear',
                  global: false,
                  colorStops: [
                    {
                      offset: 0,
                      color: getColor(0),
                    },
                    {
                      offset: 1,
                      color: getColor(1), //底部渐变颜色
                    },
                  ],
                },
              },
            },
          ],
        },

        //往上是内部柱状图
        //往下是外部柱状图

        // 外-顶部
        {
          name: '',
          type: 'pictorialBar',
          symbol: 'diamond',
          symbolSize: [140, 45],
          symbolOffset: [-10, -20],
          z: 12,
          data: [
            {
              name: '',
              value: props.maxValue,
              symbolPosition: 'end',
              itemStyle: {
                color: getColor(0.1), //圆柱顶部颜色
              },
            },
          ],
        },

        // 外-底部
        {
          name: '',
          type: 'pictorialBar',
          symbol: 'diamond',
          symbolSize: [150, 75],
          symbolOffset: [-10, 41],
          z: 12,
          data: [
            {
              name: '',
              value: props.maxValue,

              itemStyle: {
                color: getColor(0.1), //圆柱底部颜色
              },
            },
          ],
        },

        // 外-渐变色
        {
          type: 'bar',
          barWidth: 140,
          barGap: '-120%',
          data: [
            {
              name: '',
              value: props.maxValue,

              label: {
                show: false,
              },
              itemStyle: {
                color: {
                  x: 1,
                  y: 1,
                  x2: 1,
                  y2: 0,
                  type: 'linear',
                  global: false,
                  colorStops: [
                    {
                      offset: 0,
                      color: getColor(0),
                    },
                    {
                      offset: 0.3,
                      color: getColor(0.1),
                    },
                    {
                      offset: 0.5,
                      color: getColor(0.1),
                    },
                    {
                      offset: 0.8,
                      color: getColor(0.1),
                    },
                    {
                      offset: 1,
                      color: getColor(0), //底部渐变颜色
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
    });
  };

  onMounted(() => {
    initChart();
  });
</script>

<style scoped lang="less">
  .pictorial-bar {
    width: 100%;
    height: 100%;
    position: relative;
    .chart {
      width: 100%;
      height: 100%;
    }
  }
</style>
