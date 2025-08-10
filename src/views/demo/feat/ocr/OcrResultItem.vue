<template>
  <div class="ocr-result-item">
    <a-textarea class="text-content" v-model:value="textValue" autoSize :bordered="false" />
    <div class="copy-btn" @click="copyText" :title="'复制'">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="m5 15-4-4h3l4 4" />
        <path d="M5 15H1a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { message } from 'ant-design-vue';

  defineOptions({
    name: 'OcrResultItem',
  });

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const textValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(textValue.value);
      message.success('复制成功');
    } catch (err) {
      // 降级处理：使用传统方式复制
      const textArea = document.createElement('textarea');
      textArea.value = textValue.value;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('复制成功');
      } catch (fallbackErr) {
        message.error('复制失败');
      }
      document.body.removeChild(textArea);
    }
  };
</script>

<style scoped lang="less">
  .ocr-result-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background-color: #fff;

    .text-content {
      flex: 1;
      word-break: break-all;
      line-height: 1.5;
    }

    .copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      cursor: pointer;
      border-radius: 4px;
      color: #666;
      transition: all 0.2s;

      &:hover {
        background-color: #e6f7ff;
        color: #1890ff;
      }

      svg {
        pointer-events: none;
      }
    }
  }
</style>
