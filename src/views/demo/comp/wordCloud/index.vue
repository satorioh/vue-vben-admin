<template>
  <div class="word-cloud-demo">
    <WordCloud :data="data" />
  </div>
</template>

<script setup lang="ts">
  import { WordCloud } from '@/components/WordCloud';

  defineOptions({ name: 'WordCloudDemo' });

  const data = [
    '中国加油肯定会战胜疫情',
    '武汉加油我们不会放弃',
    '世界加油大家一起努力',
    '一起加油',
    '一起努力',
    '一起奋斗',
    '一起战胜',
    '一起战疫',
    '哈哈哈哈',
    '嘻嘻嘻嘻',
    '一马当先',
    '一马平川',
    '一马一鞍',
    '一马一鞭',
    '蛇年大吉',
    '蛇年行大运',
    '蛇年大吉大利',
  ];
</script>

<style scoped lang="less"></style>
