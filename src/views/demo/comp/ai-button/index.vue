<template>
  <div class="container">
    <h3>默认状态</h3>
    <AiButton />

    <h3>加载状态 (Loading)</h3>
    <AiButton :loading="true" />

    <h3>交互测试 (点击触发 Loading)</h3>
    <AiButton :loading="isVerifying" @click="startVerify"> 立即核验 </AiButton>

    <h3>自定义 Icon</h3>
    <AiButton>
      <template #icon>
        <span>🤖</span>
      </template>
      AI 助手
    </AiButton>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import AiButton from '@/components/AiButton/src/AiButton.vue';

  defineOptions({
    name: 'AiButtonDemo',
  });

  const isVerifying = ref(false);

  const startVerify = () => {
    isVerifying.value = true;
    // 模拟2秒后的请求结束
    setTimeout(() => {
      isVerifying.value = false;
    }, 2000);
  };
</script>

<style>
  .container {
    padding: 50px;
    background: #333; /*以此模拟图片中的深色背景，查看效果更佳*/
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
    color: white;
  }
</style>
