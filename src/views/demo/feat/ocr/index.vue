<template>
  <div class="ocr-demo-page">
    <Upload
      :file-list="fileList"
      :showUploadList="false"
      :maxCount="1"
      :before-upload="beforeUpload"
    >
      <a-button>
        <upload-outlined />
        选择图片
      </a-button>
    </Upload>
    <div v-if="objectFileUrl" class="ocr-content-wrapper">
      <div class="ocr-image-area">
        <img :src="objectFileUrl" alt="OCR图片" />
      </div>
      <transition name="sidebar-fade">
        <div v-if="objectFileUrl" class="ocr-sidebar">
          <h3>AI识图</h3>
          <div class="btn-group">
            <Button type="primary" @click="initScreenShot" class="mr-4">截图识别</Button>
            <Button type="primary">全部识别</Button>
          </div>
          <div class="ocr-result-list">
            <OcrResultItem v-for="(item, index) in ocrResult" :key="index" :text="item" />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onUnmounted } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { message, Upload, Button } from 'ant-design-vue';
  import type { UploadProps } from 'ant-design-vue';
  import ScreenShot from 'js-web-screen-shot';
  import OcrResultItem from './OcrResultItem.vue';

  defineOptions({
    name: 'OcrDemo',
  });

  const fileList = ref<File[]>([]);
  const objectFileUrl = ref<string>('');
  const ocrResult = ref<string[]>([]);
  const uploading = ref<boolean>(false);
  const screenShotHandler = ref<ScreenShot | null>(null);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    fileList.value = [file];
    objectFileUrl.value = URL.createObjectURL(file);
    return false;
  };

  const handleUpload = async (file) => {
    uploading.value = true;

    // You can use any AJAX library you like
    let formData = new FormData();
    formData.append('file', file);

    try {
      let res = await fetch('http://127.0.0.1:8000/py-api/ocr/recognize', {
        method: 'POST',
        body: formData,
      });
      let data = await res.json();
      console.log('上传成功：', data);
      const resultText = data.data.result.join('');
      ocrResult.value.push(resultText);
    } catch (err) {
      console.error('上传失败：', err);
    }
  };

  const initScreenShot = () => {
    screenShotHandler.value = new ScreenShot({
      enableWebRtc: false,
      completeCallback: completeScreenShotCallback,
    });
  };

  const base64ToFile = (base64, filename) => {
    let arr = base64.split(',');
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const completeScreenShotCallback = (data: any) => {
    console.log('Screenshot complete:', data);
    const fileName = `screenshot-${Date.now()}.png`;
    const file = base64ToFile(data.base64, fileName);
    handleUpload(file);
  };

  const destroyScreenShot = () => {
    if (screenShotHandler.value) {
      screenShotHandler.value.destroyComponents();
      screenShotHandler.value = null;
    }
  };

  onUnmounted(() => {
    destroyScreenShot();
  });
</script>

<style scoped lang="less">
  .ocr-demo-page {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px;
    background-color: #fff;
    overflow: hidden;

    .ocr-content-wrapper {
      display: flex;
      flex-direction: row;
      flex: 1;
      width: 100%;
      margin-top: 20px;
      overflow: hidden;
    }

    .ocr-image-area {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: #fff;
      min-height: 300px;
      overflow: hidden;
      overflow-y: auto;

      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
    }

    .ocr-sidebar {
      width: 300px;
      background: #fafafa;
      border-left: 1px solid #eee;
      border-radius: 12px 0 0 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 24px 16px;
      box-sizing: border-box;
      transition: box-shadow 0.3s;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }
    }
  }

  .sidebar-fade-enter-active,
  .sidebar-fade-leave-active {
    transition:
      opacity 0.3s,
      transform 0.3s;
  }
  .sidebar-fade-enter-from,
  .sidebar-fade-leave-to {
    opacity: 0;
    transform: translateX(40px);
  }
  .sidebar-fade-enter-to,
  .sidebar-fade-leave-from {
    opacity: 1;
    transform: translateX(0);
  }
</style>
