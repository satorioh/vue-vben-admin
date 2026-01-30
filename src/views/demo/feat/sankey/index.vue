<template>
  <div class="sankey-complete-demo">
    <h1>项目资金流向桑基图</h1>
    <p class="description"> 特性：数据分离模式 | 交互状态 </p>
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
  .sankey-complete-demo {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background-color: #f9f9f9;
    min-height: 100vh;
    width: 100%;
  }

  h1 {
    color: #333;
    margin-bottom: 5px;
  }

  .description {
    color: #666;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .toggle-btn {
    margin-bottom: 15px;
    padding: 6px 12px;
    background: #5b8ff9;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .toggle-btn:hover {
    background: #4075e0;
  }
</style>
