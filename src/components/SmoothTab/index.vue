<template>
  <div class="tabs-container">
    <div
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: modelValue === item.value }"
      :style="{ '--tab-bg-inactive': inactiveBg }"
      @click="handleTabClick(item.value)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue';

  // 定义 Props
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      required: true,
    },
    tabs: {
      type: Array,
      default: () => [
        { label: '资金方', value: 'fund' },
        { label: '企业', value: 'enterprise' },
        { label: '个人', value: 'person' },
      ],
    },
    // 未激活 tab 背景色（可外部传入）
    inactiveBg: {
      type: String,
      default: '#fff',
    },
  });

  // 定义 Emits
  const emits = defineEmits(['update:modelValue', 'change']);

  // 切换逻辑
  const handleTabClick = (val) => {
    emits('update:modelValue', val);
    emits('change', val);
  };
</script>

<style scoped>
  /* 配置变量
--tab-bg-active: 激活时的蓝色背景
--radius-size: 弧度的大小（决定那个小角的弯曲程度）
*/
  .tabs-container {
    display: flex;
    background-color: transparent; /* 或者你的整体背景色 */
    padding-top: 20px; /* 给上方留点空间看效果 */
  }

  .tab-item {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 152px;
    height: 48px;
    padding: 7px 12px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #595959;
    transition: all 0.3s;
    /* 默认状态（未激活）：可以是白色背景或者透明 */
    background: var(--tab-bg-inactive, #fff);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    /* 加上这行是为了让未激活的层级低一点，避免盖住弧度 */
    z-index: 0;
  }

  /* 激活状态样式 */
  .tab-item.active {
    color: #fff;
    background-color: #1890ff; /* 图片中的蓝色 */
    z-index: 1; /* 激活的 Tab 层级最高 */
  }

  /* --- 核心：利用伪元素制作反向圆角 --- */

  /* 左下角的弧度 */
  .tab-item.active::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: -8px; /* 宽度等于弧度大小 */
    width: 8px;
    height: 8px;
    /* 技巧：
   1. 背景透明
   2. 右下角切圆角
   3. 利用 box-shadow 填充剩余空间为蓝色
*/
    background: transparent;
    border-bottom-right-radius: 8px;
    box-shadow: 5px 0 0 0 #1890ff;
    /* box-shadow 颜色必须与 active 背景一致 */
  }

  /* 右下角的弧度 */
  .tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: -8px; /* 宽度等于弧度大小 */
    width: 8px;
    height: 8px;
    background: transparent;
    border-bottom-left-radius: 8px;
    box-shadow: -5px 0 0 0 #1890ff;
  }

  /* 第一个 tab 激活时：隐藏左下角弧度 */
  .tab-item.active:first-child::before {
    content: none;
  }

  /* 最后一个 tab 激活时：隐藏右下角弧度 */
  .tab-item.active:last-child::after {
    content: none;
  }
</style>
