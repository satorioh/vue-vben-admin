<template>
  <PageWrapper title="Markdown 转换">
    <div class="p-4 bg-white">
      <a-form :model="formData" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          label="公司名"
          name="company_name"
          :rules="[{ required: true, message: '请输入公司名' }]"
        >
          <a-input v-model:value="formData.company_name" placeholder="请输入公司名" />
        </a-form-item>

        <a-form-item label="Markdown文件" name="file">
          <a-upload
            :before-upload="beforeUpload"
            :file-list="fileList"
            :max-count="1"
            @remove="handleRemove"
            accept=".md"
          >
            <a-button>
              <UploadOutlined />
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>

        <a-form-item label="Markdown纯文本" name="md_text">
          <a-textarea
            v-model:value="formData.md_text"
            placeholder="请输入Markdown纯文本（若已上传文件，则此项可选填）"
            :rows="10"
          />
        </a-form-item>

        <a-form-item label="转换格式" name="format">
          <a-radio-group v-model:value="formData.format">
            <a-radio value="pdf">PDF</a-radio>
            <a-radio value="docx">DOCX</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4 }">
          <a-button type="primary" :loading="loading" @click="handleConvert">
            开始转换并下载
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </PageWrapper>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { PageWrapper } from '@/components/Page';
  import {
    Form as AForm,
    FormItem as AFormItem,
    Input as AInput,
    Upload as AUpload,
    Radio as ARadio,
    RadioGroup as ARadioGroup,
    Button as AButton,
  } from 'ant-design-vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { mdToPdfApi, mdToWordApi } from '@/api/demo/markdown';
  import { downloadByData } from '@/utils/file/download';
  import { useMessage } from '@/hooks/web/useMessage';

  defineOptions({
    name: 'MarkdownConvert',
  });

  const ATextarea = AInput.TextArea;
  const { createMessage } = useMessage();

  const loading = ref(false);
  const fileList = ref<any[]>([]);

  const formData = reactive({
    company_name: '',
    md_text: '',
    format: 'pdf',
  });

  const beforeUpload = (file: File) => {
    fileList.value = [file];
    return false;
  };

  const handleRemove = () => {
    fileList.value = [];
  };

  const handleConvert = async () => {
    if (!formData.company_name) {
      createMessage.error('请输入公司名');
      return;
    }

    if (fileList.value.length === 0 && !formData.md_text) {
      createMessage.error('请上传Markdown文件或输入Markdown纯文本');
      return;
    }

    loading.value = true;
    try {
      const data = new FormData();
      data.append('company_name', formData.company_name);
      if (fileList.value.length > 0) {
        data.append('file', fileList.value[0]);
      }
      if (formData.md_text) {
        data.append('md_text', formData.md_text);
      }

      let res: any;
      let filename = '';
      if (formData.format === 'pdf') {
        res = await mdToPdfApi(data);
        filename = `${formData.company_name}.pdf`;
      } else {
        res = await mdToWordApi(data);
        filename = `${formData.company_name}.docx`;
      }

      if (res instanceof Blob) {
        downloadByData(res, filename);
        createMessage.success('转换成功');
      } else {
        // Fallback for unexpected response types
        downloadByData(res, filename);
        createMessage.success('转换成功');
      }
    } catch (error: any) {
      console.error(error);
      createMessage.error(error.message || '转换失败');
    } finally {
      loading.value = false;
    }
  };
</script>

<style scoped lang="less"></style>
