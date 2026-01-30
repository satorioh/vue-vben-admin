<template>
  <div class="custom-sankey">
    <CustomSankeyChart />
  </div>
</template>

<script setup lang="ts">
  import CustomSankeyChart from '@/views/demo/feat/bi/components/CustomSankeyChart.vue';

  defineOptions({
    name: 'CustomSankeyChart',
  });
</script>

<style scoped lang="less">
  .custom-sankey {
    width: 100%;
    height: 100%;
  }
</style>
