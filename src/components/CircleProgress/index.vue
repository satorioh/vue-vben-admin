<template>
  <el-progress
    type="circle"
    :percentage="percentage"
    :width="width"
    :stroke-width="strokeWidth"
    :color="color"
    class="ring-progress-wrapper"
    :class="{ 'is-counter-clockwise': direction === 'counter-clockwise' }"
  >
    <template #default="scope">
      <slot v-bind="scope"></slot>
    </template>
  </el-progress>
</template>

<script setup lang="ts">
  const props = defineProps({
    percentage: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#3F8CFF',
    },
    width: {
      type: Number,
      default: 72,
    },
    strokeWidth: {
      type: Number,
      default: 2,
    },
    // 旋转方向：'clockwise' (顺时针) 或 'counter-clockwise' (逆时针)
    direction: {
      type: String,
      default: 'clockwise',
      validator: (value: string) => ['clockwise', 'counter-clockwise'].includes(value),
    },
    // 轨道颜色
    trackColor: {
      type: String,
      default: '#7D859234',
    },
  });
</script>

<style lang="scss" scoped>
  .ring-progress-wrapper.is-counter-clockwise :deep(.el-progress-circle) {
    transform: scaleX(-1);
  }

  .ring-progress-wrapper :deep(.el-progress-circle__track) {
    /* 如果 props.trackColor 有值，则应用；否则保留 Element Plus 默认样式 */
    stroke: v-bind('props.trackColor ? props.trackColor : undefined');
  }
</style>
