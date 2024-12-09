<template>
  <div class="pictorial-bar-demo">
    <PictorialBar :value="value" :maxValue="maxValue" />
    <PictorialBar :value="value" :maxValue="maxValue" :base-color="blueColor" />
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
    height: 100%;
    position: relative;
    background: black;
    display: flex;
  }
</style>
