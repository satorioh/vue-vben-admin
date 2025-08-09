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
          <div class="btn-group"> </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onUnmounted } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { message, Upload } from 'ant-design-vue';
  import type { UploadProps } from 'ant-design-vue';
  import { orcUpload } from '@/api/sys/upload';
  import ScreenShot from 'js-web-screen-shot';

  defineOptions({
    name: 'OcrDemo',
  });

  const fileList = ref<File[]>([]);
  const objectFileUrl = ref<string>('');
  const ocrResult = ref<string>('');
  const uploading = ref<boolean>(false);
  const screenShotHandler = ref<ScreenShot | null>(null);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    fileList.value = [file];
    objectFileUrl.value = URL.createObjectURL(file);
    return false;
  };

  const handleUpload = () => {
    uploading.value = true;

    // You can use any AJAX library you like
    orcUpload({ file: fileList.value[0] })
      .then((res) => {
        uploading.value = false;
        const result = res.data.data.result;
        console.log(result);
        ocrResult.value = result.join('<br/>');
        message.success('upload successfully.');
      })
      .catch(() => {
        uploading.value = false;
        message.error('upload failed.');
      });
  };

  const completeScreenShotCallback = (data: any) => {
    console.log('Screenshot complete:', data);
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

    .ocr-content-wrapper {
      display: flex;
      flex-direction: row;
      flex: 1;
      width: 100%;
      margin-top: 20px;
    }

    .ocr-image-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      min-height: 300px;

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
