<template>
  <div class="charts">
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script setup lang="ts">
  import { useECharts } from '@/hooks/web/useECharts';
  import { onMounted, Ref, ref } from 'vue';

  defineOptions({ name: 'PictorialBar' });

  const chartRef = ref<HTMLElement | null>(null);
  const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);

  const value = 15;
  const maxValue = 100;

  const initChart = () => {
    setOptions({
      backgroundColor: '#0e202d',

      grid: {
        top: 200,
        bottom: 150,
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
              value: value,
              symbolPosition: 'end',
              itemStyle: {
                color: 'rgba(0, 255, 136, 0.5)', //圆柱顶部颜色
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
              value: value,
              itemStyle: {
                color: 'rgba(0, 255, 136, 1)', //圆柱底部颜色
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
              value: value,
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
                      color: 'rgba(0, 255, 136, 0)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(0, 255, 136, 1)', //底部渐变颜色
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
              value: maxValue,
              symbolPosition: 'end',
              itemStyle: {
                color: 'rgba(0, 255, 136, 0.1)', //圆柱顶部颜色
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
              value: maxValue,

              itemStyle: {
                color: 'rgba(0, 255, 136, .1)', //圆柱底部颜色
              },
            },
          ],
        },

        // 外-渐变色
        {
          type: 'bar',
          silent: true,
          barWidth: 140,
          barGap: '-120%',
          data: [
            {
              name: '',
              value: maxValue,

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
                      color: 'rgba(0, 255, 136, 0)',
                    },
                    {
                      offset: 0.3,
                      color: 'rgba(0, 255, 136, .1)',
                    },
                    {
                      offset: 0.5,
                      color: 'rgba(0, 255, 136, .1)',
                    },
                    {
                      offset: 0.8,
                      color: 'rgba(0, 255, 136, .1)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(0, 255, 136, 0)', //底部渐变颜色
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

  onMounted(() => initChart());
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
