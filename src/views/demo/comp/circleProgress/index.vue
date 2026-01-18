<template>
  <div class="demo-progress">
    <h3>Element Plus 逆时针进度条</h3>

    <CircleProgress :percentage="percentage" direction="counter-clockwise" color="#15c0e6">
      <div class="percentage-text">{{ percentage }}</div>
    </CircleProgress>

    <div style="margin-top: 20px">
      <el-button-group>
        <el-button :icon="Minus" @click="decrease" />
        <el-button :icon="Plus" @click="increase" />
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Minus, Plus } from '@element-plus/icons-vue';
  import CircleProgress from '@/components/CircleProgress/index.vue';

  const percentage = ref(10);

  const increase = () => {
    percentage.value += 10;
    if (percentage.value > 100) {
      percentage.value = 100;
    }
  };

  const decrease = () => {
    percentage.value -= 10;
    if (percentage.value < 0) {
      percentage.value = 0;
    }
  };
</script>

<style scoped>
  .percentage-text {
    color: #15c0e6;
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 800;
    line-height: 26px;
  }
</style>
