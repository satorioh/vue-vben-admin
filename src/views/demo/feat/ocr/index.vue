<template>
  <PageWrapper title="OCR示例">
    <Upload :file-list="fileList" :before-upload="beforeUpload" @remove="handleRemove">
      <a-button>
        <upload-outlined />
        Select File
      </a-button>
    </Upload>
    <Button
      type="primary"
      :disabled="fileList.length === 0"
      :loading="uploading"
      style="margin-top: 16px"
      @click="handleUpload"
    >
      {{ uploading ? 'Uploading' : 'Start Upload' }}
    </Button>
    <Tinymce v-model="ocrResult" width="100%" class="mt-4" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { message, Upload, Button } from 'ant-design-vue';
  import type { UploadProps } from 'ant-design-vue';
  import { orcUpload } from '@/api/sys/upload';
  import { Tinymce } from '/@/components/Tinymce/index';

  defineOptions({
    name: 'OcrDemo',
  });

  const fileList = ref([]);
  const ocrResult = ref<string>('');
  const uploading = ref<boolean>(false);

  const handleRemove: UploadProps['onRemove'] = (file) => {
    const index = fileList.value.indexOf(file);
    const newFileList = fileList.value.slice();
    newFileList.splice(index, 1);
    fileList.value = newFileList;
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    fileList.value = [...(fileList.value || []), file];
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
</script>

<style scoped lang="less"></style>
