<template>
  <SmoothTabs v-model="activeTab" />
</template>

<script setup>
  import { ref } from 'vue';
  import SmoothTabs from '@/components/SmoothTab/index.vue';

  const activeTab = ref('fund');
</script>
