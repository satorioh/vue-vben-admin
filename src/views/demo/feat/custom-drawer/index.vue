<template>
  <div class="custom-drawer-demo">
    <div class="title">页面标题</div>
    <div class="list">
      <div class="row" @click="showDrawer(true)">按钮1</div>
      <div class="row" @click="showDrawer(true)">按钮2</div>
      <div class="row" @click="showDrawer(true)">按钮3</div>
      <CustomDrawer v-model="drawer" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { CustomDrawer } from '@/components/CustomDrawer';
  import { ref } from 'vue';

  defineOptions({
    name: 'CustomDrawerDemo',
  });

  defineProps({});

  const drawer = ref(false);

  const showDrawer = (bool: boolean) => {
    drawer.value = bool;
  };
</script>

<style scoped lang="less">
  .custom-drawer-demo {
    height: 100%;
    display: flex;
    flex-direction: column;
    .list {
      flex: 1;
      position: relative;
    }
  }
</style>
