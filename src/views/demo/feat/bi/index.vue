<template>
  <div class="main-page">
    <h1>主页面内容</h1>
    <p>这里是原本的页面...</p>

    <el-button type="primary" class="detail-btn" @click="showEmployeeBI(true)"> 详情 </el-button>
    <EmployeeBI ref="employeeBIRef" v-model="visible" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import EmployeeBI from './EmployeeBI.vue';

  const employeeBIRef = ref<InstanceType<typeof EmployeeBI> | null>(null);
  const visible = ref(false);
  const showEmployeeBI = (show: boolean) => {
    visible.value = show;
  };
</script>

<style lang="scss" scoped>
  /* 主页面 */
  .main-page {
    position: relative;
    height: 100vh;
    background-color: #f0f2f5;
    padding: 20px;
    overflow: hidden;
  }

  .detail-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }
</style>
