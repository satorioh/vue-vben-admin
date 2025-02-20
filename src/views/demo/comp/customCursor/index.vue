<template>
  <PageWrapper title="自定义鼠标" content="自定义鼠标示例">
    <CustomCursor />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { PageWrapper } from '@/components/Page';
  import { CustomCursor } from '@/components/CustomCursor';

  defineOptions({ name: 'CustomCursorDemo' });
</script>

<style scoped lang="less"></style>
