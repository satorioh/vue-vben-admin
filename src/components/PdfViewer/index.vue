<template>
  <VuePdfEmbed :source="sourceComputed" v-if="source" />
  <!--  <VuePdfEmbed :source="sourceComputed" v-if="source" :text-layer="true" />-->
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import VuePdfEmbed from 'vue-pdf-embed';
  // import 'vue-pdf-embed/dist/styles/textLayer.css';

  defineOptions({
    name: 'PdfViewer',
  });

  const props = defineProps({
    source: {
      // either URL, Base64, binary, or document proxy
      type: String,
      required: true,
      default: '',
    },
  });

  const sourceComputed = computed(() => {
    return {
      url: props.source,
      cMapUrl: '/cmaps/', // 指向 public 目录
      cMapPacked: true,
    };
  });
</script>

<style scoped lang="scss">
  ::v-deep(canvas) {
    width: 100% !important;
    height: auto !important;
  }
</style>
