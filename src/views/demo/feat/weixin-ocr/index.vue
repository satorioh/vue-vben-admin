<template>
  <div class="wx-ocr-demo-page">
    <div class="preview-container">
      <el-image style="width: 100%; height: 100%" :src="blobUrl" preview-teleported fit="contain" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import InvoiceImage from '@/assets/images/ocr/invoice.jpg';
  import { ref, onMounted } from 'vue';

  defineOptions({
    name: 'WeiXinOcrDemo',
  });

  const blobUrl = ref('');
  const previewList = [
    'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
  ];

  const imageToBlobUrl = async (image) => {
    const resp = await fetch(image);
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  };

  onMounted(async () => {
    blobUrl.value = await imageToBlobUrl(InvoiceImage);
  });
</script>

<style scoped lang="scss">
  .wx-ocr-demo-page {
    padding: 20px;
    .preview-container {
      width: 100%;
      height: calc(100vh - 145px);
      overflow: auto;
      text-align: center;
    }
  }
</style>
