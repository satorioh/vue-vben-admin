<template>
  <div class="heatmap-card">
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

  dayjs.locale('zh-cn');

  // 配置项
  const COLUMNS = 15; // 15列
  const CELL_SIZE = 16; // 16px
  const GAP_SIZE = 4; // 4px
  const TOTAL_WEEK_WIDTH = CELL_SIZE + GAP_SIZE; // 一列占用的总宽度 (用于计算月份位置)

  const heatmapData = ref([]);
  const monthLabels = ref([]);

  // 模拟数据生成器
  const generateData = () => {
    const weeks = [];
    const months = [];

    // 1. 确定时间范围
    // 结束时间：本周日 (为了让最右边一列完整或者是当前周)
    // 如果要最右侧是“当前周”，我们取“今天”所在的周日作为锚点
    const today = dayjs();
    // 获取本周日（dayjs默认周日是0，我们要把周日当做一周的最后一天）
    // 简单的做法：找到本周一，然后+6天
    const currentWeekMonday = today.startOf('week').add(1, 'day');
    const endDate = currentWeekMonday.add(6, 'day');

    // 起始时间：向前推 15 周
    let currentDate = endDate.subtract(COLUMNS * 7 - 1, 'day');

    // 2. 遍历生成 15 周的数据
    for (let w = 0; w < COLUMNS; w++) {
      const weekData = [];
      let hasMonthChange = false;
      let monthLabelText = '';

      for (let d = 0; d < 7; d++) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        const isFirstDayOfMonth = currentDate.date() === 1;

        // 记录月份标签 (如果是每列的第一天且是月初，或者是第一列)
        // 简化逻辑：如果这一周包含了某个月的1号，或者这是第一周，就标记月份
        if ((d === 0 && w === 0) || currentDate.date() === 1) {
          // 只有当这一周还没标记过月份时才添加 (避免一周显示两次)
          const mLabel = currentDate.format('YYYY.M');
          // 简单的去重逻辑，防止同一行出现过于密集的月份
          const lastLabel = months[months.length - 1];
          if (!lastLabel || lastLabel.text !== mLabel) {
            // 计算月份标签的大致位置：当前周索引 * (块宽+间距)
            months.push({
              text: mLabel,
              left: w * TOTAL_WEEK_WIDTH,
            });
          }
        }

        // 模拟随机数据: 0-5次
        // 故意让周末数据少一点，模拟真实感
        let count = 0;
        if (currentDate.isAfter(today)) {
          // 未来日期没数据
          count = 0;
        } else {
          // 随机生成
          const baseChance = Math.random();
          if (baseChance > 0.6) count = Math.floor(Math.random() * 5); // 40%概率有数据
          if (d >= 5 && Math.random() > 0.3) count = 0; // 周末大概率没数据
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
    padding: 12px 16px;
    display: inline-block;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .title {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
    }

    .legend {
      display: flex;
      gap: 16px;
      font-size: 14px;
      color: #6b7280;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
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
