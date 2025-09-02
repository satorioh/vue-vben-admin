<template>
  <div class="wx-ocr-demo-page">
    <div class="flex mb-4">
      <el-upload
        :file-list="fileList"
        :showUploadList="false"
        :maxCount="1"
        accept="image/*,.pdf"
        :before-upload="beforeUpload"
        :show-file-list="false"
      >
        <el-button>
          <upload-outlined />
          选择文件
        </el-button>
      </el-upload>
      <el-button class="ml-4" :disabled="fileList.length === 0" @click="recognizeImage"
        >识别</el-button
      >
    </div>
    <div class="preview-container" v-loading="loading">
      <PdfViewer v-if="objectFile.type === PDF_TYPE" :source="objectFile.url" class="pdf-viewer" />
      <el-image
        v-else
        style="width: 100%; height: auto"
        :src="objectFile.url"
        preview-teleported
        fit="contain"
        class="ocr-image"
        ref="imageRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
  import { useResizeObserver } from '@vueuse/core';
  import { debounce } from 'lodash-es';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import PdfViewer from '@/components/PdfViewer/index.vue';

  defineOptions({
    name: 'WeiXinOcrDemo',
  });

  interface OcrLocationItem {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
  }

  interface OcrData {
    originWidth: number;
    originHeight: number;
    locations: OcrLocationItem[];
  }

  const apiUrl = 'http://127.0.0.1:17654/py-api/ocr/recognize_bbox';
  const PDF_TYPE = 'application/pdf';

  const fileList = ref<File[]>([]);
  const objectFile = ref({
    url: '',
    type: '',
  });

  const imageRef = ref<HTMLElement | null>(null);
  const imageWidth = ref(0);
  const imageHeight = ref(0);

  const loading = ref<boolean>(false);
  const ocrData = ref<OcrData>({
    originWidth: 0,
    originHeight: 0,
    locations: [],
  });

  const relayoutOnResize = debounce(() => {
    setOcrTextDiv();
  }, 200);

  useResizeObserver(imageRef, (entries) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    // console.log('图片尺寸变化：', width, height);
    imageWidth.value = width;
    imageHeight.value = height;
    relayoutOnResize();
  });

  const imageToBlobUrl = async (image) => {
    const resp = await fetch(image);
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
  };

  // 将 blobUrl 转换为 File
  async function blobUrlToFile(blobUrl: string, filename = 'image.jpg'): Promise<File> {
    const resp = await fetch(blobUrl);
    const blob = await resp.blob();
    // 若无正确 type，可自行传入: { type: 'image/jpeg' }
    return new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  }

  const showLoading = (bool: boolean) => {
    loading.value = bool;
  };

  const beforeUpload = (file) => {
    fileList.value = [file];
    console.log('选择的文件类型：', file.type);
    const url = URL.createObjectURL(file);
    if (file.type === PDF_TYPE) {
      objectFile.value = {
        url: url,
        type: PDF_TYPE,
      };
    } else {
      objectFile.value = {
        url: url,
        type: 'image',
      };
    }
    clearOcrTextDiv(true);
    return false;
  };

  const handleUpload = async (file) => {
    showLoading(true);

    let formData = new FormData();
    formData.append('file', file);

    try {
      let res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      let data = await res.json();
      console.log('上传成功：', data);
      ocrData.value = data.data;
      setOcrTextDiv();
    } catch (err) {
      console.error('上传失败：', err);
    } finally {
      showLoading(false);
    }
  };

  const recognizeImage = async () => {
    await uploadFromBlobUrl(objectFile.value.url);
  };

  async function uploadFromBlobUrl(blobUrl: string) {
    try {
      const file = await blobUrlToFile(blobUrl);
      await handleUpload(file); // 复用原上传逻辑
    } catch (e) {
      console.error('转换或上传失败', e);
    }
  }

  /**
   * 计算字体大小的函数
   *
   * @param text 需要计算的文本内容
   * @param targetWidth 目标宽度
   * @param targetHeight 目标高度
   * @param minFontSize 最小字体大小，默认为 10
   * @param maxFontSize 最大字体大小，默认为 100
   * @param threshold 阈值，用于控制计算精度，默认为 1
   */
  const calculateFontSize = (
    text: string,
    targetWidth: number,
    targetHeight: number,
    minFontSize = 10,
    maxFontSize = 100,
    threshold = 1,
  ): number => {
    // 创建一个 div 元素作为容器，用于计算实际字体大小
    const container = document.createElement('div');
    container.style.display = 'inline-block';
    container.style.width = `${targetWidth}px`;
    container.style.height = `${targetHeight}px`;
    // 创建一个临时的 span 元素，并添加到容器内，用于显示需要计算的文本内容
    const tempElement = document.createElement('span');
    tempElement.style.display = 'inline-block';
    tempElement.style.whiteSpace = 'pre-wrap';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.innerText = text;
    container.appendChild(tempElement);
    document.body.appendChild(container);
    // 初始化字体大小的取值范围
    let fontSize = maxFontSize;
    let lowerBound = minFontSize;
    let upperBound = maxFontSize;
    // 使用二分法计算最适合的字体大小
    while (lowerBound <= upperBound) {
      fontSize = Math.floor((lowerBound + upperBound) / 2);
      tempElement.style.fontSize = `${fontSize}px`;
      // 当计算出的实际宽度或高度大于指定的目标宽度和高度时，缩小字体大小并继续计算
      if (
        tempElement.offsetWidth > targetWidth + threshold ||
        tempElement.offsetHeight > targetHeight + threshold
      ) {
        upperBound = fontSize - 1;
      } else {
        // 当计算出的实际宽度和高度小于等于指定的目标宽度和高度时，增大字体大小并继续计算
        lowerBound = fontSize + 1;
      }
    }
    // 从文档中移除容器及其子元素，并返回计算出的最适合的字体大小
    document.body.removeChild(container);
    return fontSize;
  };

  // 清空之前的识别结果
  const clearOcrTextDiv = (clearData?: boolean) => {
    const existingDivs = document.getElementsByClassName('ocr-text');
    console.log('清除 OCR 文字div', existingDivs.length);
    while (existingDivs.length > 0) {
      existingDivs[0].parentNode?.removeChild(existingDivs[0]);
    }
    if (clearData && ocrData.value.locations.length) {
      ocrData.value.locations = [];
    }
  };

  const setOcrTextDiv = () => {
    if (!imageRef.value) return;
    if (ocrData.value.locations.length === 0) return;
    if (imageWidth.value === 0 || imageHeight.value === 0) return;
    console.log('设置 OCR 文字位置');
    clearOcrTextDiv();

    ocrData.value.locations.forEach((ocr) => {
      // 过滤空字符
      if (!ocr.text) return;
      const div = document.createElement('div');

      div.className = 'ocr-text';
      const widthRatio = imageWidth.value / ocrData.value.originWidth;
      const heightRatio = imageHeight.value / ocrData.value.originHeight;
      div.style.top = heightRatio * ocr.y + 'px';
      div.style.left = widthRatio * ocr.x - 4 + 'px';
      div.style.width = (widthRatio * ocr.width >= 14 ? widthRatio * ocr.width : 14) + 'px';
      div.style.height = heightRatio * ocr.height + 'px';
      // div.style.fontSize =
      //   calculateFontSize(ocr.text, ocr.width * widthRatio, ocr.height * heightRatio) + 'px';
      // div.textContent = ocr.text;

      document.getElementsByClassName('ocr-image')[0].appendChild(div);
    });
  };

  // 选中与框选逻辑新增
  const SELECTED_CLASS = 'selected';

  const getOcrContainer = (): HTMLElement | null => {
    return document.getElementsByClassName('ocr-image')[0] as HTMLElement | null;
  };

  const clearAllSelections = () => {
    document.querySelectorAll('.ocr-text.' + SELECTED_CLASS).forEach((el) => {
      el.classList.remove(SELECTED_CLASS);
    });
  };

  // 鼠标拖拽选取逻辑
  let isSelecting = false;

  const handleContainerMouseDown = (e: MouseEvent) => {
    console.log('handleContainerMouseDown');
    if (e.button !== 0) return;
    const container = getOcrContainer();
    if (!container) return;
    // 若已有选中，则清空后重新开始新的选取
    if (container.querySelector('.ocr-text.' + SELECTED_CLASS)) {
      clearAllSelections();
    }
    isSelecting = true;
    e.preventDefault();
  };

  const handleContainerMouseUp = (e: MouseEvent) => {
    console.log('handleContainerMouseUp');
    if (e.button !== 0) return;
    isSelecting = false;
  };

  const handleContainerMouseLeave = () => {
    console.log('handleContainerMouseLeave');
    isSelecting = false;
  };

  const handleContainerMouseOver = (e: MouseEvent) => {
    console.log('handleContainerMouseOver');
    if (!isSelecting) return;
    const target = e.target as HTMLElement;
    if (target && target.classList.contains('ocr-text')) {
      target.classList.add(SELECTED_CLASS);
    }
  };

  const bindContainerEvents = () => {
    const c = getOcrContainer();
    if (!c) return;
    console.log('绑定 OCR 容器事件');
    c.addEventListener('mousedown', handleContainerMouseDown);
    c.addEventListener('mouseup', handleContainerMouseUp);
    c.addEventListener('mouseleave', handleContainerMouseLeave);
    c.addEventListener('mouseover', handleContainerMouseOver);
  };

  const unbindContainerEvents = () => {
    const c = getOcrContainer();
    if (!c) return;
    console.log('解绑 OCR 容器事件');
    c.removeEventListener('mousedown', handleContainerMouseDown);
    c.removeEventListener('mouseup', handleContainerMouseUp);
    c.removeEventListener('mouseleave', handleContainerMouseLeave);
    c.removeEventListener('mouseover', handleContainerMouseOver);
  };

  onMounted(() => {});

  onBeforeUnmount(() => {
    relayoutOnResize.cancel();
    unbindContainerEvents();
  });

  watch(
    () => ocrData.value,
    (newVal) => {
      if (newVal.locations.length > 0) {
        nextTick(() => {
          bindContainerEvents();
        });
      } else {
        unbindContainerEvents();
      }
    },
    { deep: true },
  );
</script>

<style scoped lang="scss">
  .wx-ocr-demo-page {
    padding: 20px;
    .preview-container {
      width: 100%;
      height: calc(100vh - 145px);
      overflow: auto;
      text-align: center;
      .ocr-image {
        position: relative;
        ::v-deep(img) {
          user-select: none;
        }
      }
    }
  }
</style>
<style>
  .ocr-text {
    position: absolute;
    user-select: none;
    cursor: text;
    transition: background-color 0.12s;
    //color: transparent;
    color: red;
    border: 1px solid blue;
  }
  .ocr-text.selected {
    /* 使用系统色 + 回退 */
    background: Highlight;
    color: HighlightText;
    /* 回退颜色 */
    background-color: rgba(64, 158, 255, 0.35);
    color: #000;
    outline: 1px solid #409eff;
  }
</style>
