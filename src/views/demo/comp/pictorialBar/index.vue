<template>
  <div class="pictorial-bar-demo">
    <PictorialBar :value="value" :maxValue="maxValue" class="bar" />
    <PictorialBar :value="value" :maxValue="maxValue" :base-color="blueColor" class="bar" />
  </div>
</template>

<script setup lang="ts">
  import { PictorialBar } from '@/components/PictorialBar';

  defineOptions({ name: 'PictorialBarDemo' });

  const value = 45;
  const maxValue = 100;
  const blueColor = '136, 162, 255';
</script>

<style scoped lang="less">
  .pictorial-bar-demo {
    width: 100%;
    height: 160px;
    position: relative;
    background: black;
    display: flex;
    .bar {
      width: 20%;
    }
  }
</style>
