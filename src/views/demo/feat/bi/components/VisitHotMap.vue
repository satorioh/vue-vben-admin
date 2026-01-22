<template>
  <div class="heatmap-card">
    <FeedBack type="走访热力图" employee-name="张三" class="feed-back" />
    <div class="header">
      <div class="title">走访热力图</div>
      <div class="legend">
        <div class="legend-item">
          <div class="color-box level-3"></div>
          <span>&gt; 3次</span>
        </div>
        <div class="legend-item">
          <div class="color-box level-2"></div>
          <span>1-3次</span>
        </div>
        <div class="legend-item">
          <div class="color-box level-1"></div>
          <span>1次</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <div class="week-labels">
        <div class="week-label">周一</div>
        <div class="week-label">周二</div>
        <div class="week-label">周三</div>
        <div class="week-label">周四</div>
        <div class="week-label">周五</div>
        <div class="week-label">周六</div>
        <div class="week-label">周日</div>
      </div>

      <div class="grid-wrapper">
        <div class="months-row">
          <div
            v-for="(month, index) in monthLabels"
            :key="index"
            class="month-label"
            :style="{ left: month.left + 'px' }"
          >
            {{ month.text }}
          </div>
        </div>

        <div class="heatmap-grid">
          <div v-for="(week, wIndex) in heatmapData" :key="wIndex" class="week-column">
            <div v-for="(day, dIndex) in week" :key="dIndex" class="day-cell-wrapper">
              <el-tooltip v-if="day.date" effect="dark" placement="top">
                <template #content>
                  <div class="tooltip-content">
                    <div>日期: {{ day.dateStr }}</div>
                    <div>走访: {{ day.count }} 次</div>
                  </div>
                </template>

                <div class="day-cell" :class="getLevelClass(day.count)"></div>
              </el-tooltip>

              <div v-else class="day-cell level-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import dayjs from 'dayjs'; // 建议安装 dayjs: npm install dayjs
  import 'dayjs/locale/zh-cn';
  import FeedBack from '@/views/demo/feat/bi/components/FeedBack.vue';

  dayjs.locale('zh-cn');

  // 配置项
  const COLUMNS = 15; // 15列
  const CELL_SIZE = 16; // 16px
  const GAP_SIZE = 4; // 4px
  const TOTAL_WEEK_WIDTH = CELL_SIZE + GAP_SIZE; // 一列占用的总宽度 (用于计算月份位置)

  const heatmapData = ref([]);
  const monthLabels = ref([]);

  // 模拟数据生成器
  // 模拟数据生成器
  const generateData = () => {
    const weeks = [];
    const months = [];
    const MIN_LABEL_GAP = 3; // 最小间隔列数，避免标签重叠

    const today = dayjs();
    const currentWeekMonday = today.startOf('week').add(1, 'day');
    const endDate = currentWeekMonday.add(6, 'day');

    let currentDate = endDate.subtract(COLUMNS * 7 - 1, 'day');

    for (let w = 0; w < COLUMNS; w++) {
      const weekData = [];

      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.format('YYYY-MM-DD');

        // 记录月份标签
        if ((d === 0 && w === 0) || currentDate.date() === 1) {
          const mLabel = currentDate.format('YYYY.M');
          const lastLabel = months[months.length - 1];

          // 检查与上一个标签的距离是否足够
          const lastLabelWeek = lastLabel
            ? Math.floor(lastLabel.left / TOTAL_WEEK_WIDTH)
            : -MIN_LABEL_GAP;
          const hasEnoughGap = w - lastLabelWeek >= MIN_LABEL_GAP;

          if ((!lastLabel || lastLabel.text !== mLabel) && hasEnoughGap) {
            months.push({
              text: mLabel,
              left: w * TOTAL_WEEK_WIDTH,
            });
          } else if (lastLabel && !hasEnoughGap && currentDate.date() === 1) {
            // 如果是月初但距离太近，替换上一个标签（优先显示月初）
            lastLabel.text = mLabel;
            lastLabel.left = w * TOTAL_WEEK_WIDTH;
          }
        }

        let count = 0;
        if (currentDate.isAfter(today)) {
          count = 0;
        } else {
          const baseChance = Math.random();
          if (baseChance > 0.6) count = Math.floor(Math.random() * 5);
          if (d >= 5 && Math.random() > 0.3) count = 0;
        }

        weekData.push({
          date: currentDate,
          dateStr: dateStr,
          count: count,
        });

        currentDate = currentDate.add(1, 'day');
      }
      weeks.push(weekData);
    }

    heatmapData.value = weeks;
    monthLabels.value = months;
  };

  // 根据次数返回对应的样式类
  const getLevelClass = (count) => {
    if (count === 0) return 'level-0';
    if (count === 1) return 'level-1';
    if (count <= 3) return 'level-2';
    return 'level-3';
  };

  onMounted(() => {
    generateData();
  });
</script>

<style scoped lang="scss">
  /* 变量定义 */
  $cell-size: 16px;
  $gap-size: 4px;

  /* 颜色定义 (参考图片色值) */
  $color-bg: #e8eaed; /* 浅灰底 */
  $color-empty: #e9ecef; /* 空数据块颜色 */
  $color-level-1: #a4efff; /* 浅蓝 (1次) */
  $color-level-2: #15c0e6; /* 亮蓝 (1-3次) */
  $color-level-3: #007d99; /* 深蓝 (>3次) */
  $color-text-sub: #9ca3af; /* 标签文字颜色 */

  .heatmap-card {
    position: relative;
    padding: 12px 16px;
    display: inline-block;
    &:hover {
      .feed-back {
        visibility: visible;
      }
    }
  }

  .feed-back {
    visibility: hidden;
    position: absolute;
    top: 10px;
    right: 8px;
    transition: visibility 0.3s;
  }

  .header {
    display: flex;
    //justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .title {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      margin-right: 12px;
    }

    .legend {
      display: flex;
      gap: 10px;
      font-size: 14px;
      color: #6b7280;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 2px;
      }

      .color-box {
        width: 14px;
        height: 14px;
        border-radius: 3px;
      }
    }
  }

  .chart-container {
    display: flex;
    gap: 12px;
  }

  /* 左侧星期标签 */
  .week-labels {
    display: flex;
    flex-direction: column;
    justify-content: flex-end; /* 对齐到底部，因为顶部有月份留白 */
    gap: $gap-size;
    padding-top: 24px; /* 留出月份标题的高度 */

    .week-label {
      height: $cell-size;
      line-height: $cell-size;
      font-size: 12px;
      color: $color-text-sub;
      text-align: right;
    }
  }

  .grid-wrapper {
    position: relative;
  }

  /* 月份行 */
  .months-row {
    height: 24px; /* 留足高度 */
    position: relative;
    margin-bottom: 4px;

    .month-label {
      position: absolute;
      font-size: 14px;
      color: $color-text-sub;
      white-space: nowrap;
      top: 0;
    }
  }

  /* 热力图网格 */
  .heatmap-grid {
    display: flex;
    gap: $gap-size;
  }

  .week-column {
    display: flex;
    flex-direction: column;
    gap: $gap-size;
  }

  .day-cell {
    width: $cell-size;
    height: $cell-size;
    border-radius: 3px;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
      transform: scale(1.15); /* 简单的 hover 放大效果 */
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
  }

  /* 颜色映射 */
  .level-0 {
    background-color: $color-empty;
  }
  .level-1 {
    background-color: $color-level-1;
  }
  .level-2 {
    background-color: $color-level-2;
  }
  .level-3 {
    background-color: $color-level-3;
  }

  /* 可以在 CSS 中复用给 Legend */
  .header .legend {
    .level-1 {
      background-color: $color-level-1;
    }
    .level-2 {
      background-color: $color-level-2;
    }
    .level-3 {
      background-color: $color-level-3;
    }
  }

  .tooltip-content {
    font-size: 12px;
    line-height: 1.5;
  }
</style>
