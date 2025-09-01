<template>
  <div class="wx-ocr-demo-page">
    <div class="preview-container" v-loading="loading">
      <el-image
        style="width: 100%; height: auto"
        :src="blobUrl"
        preview-teleported
        fit="contain"
        class="ocr-image"
        ref="imageRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import InvoiceImage from '@/assets/images/ocr/invoice.jpg';
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useResizeObserver } from '@vueuse/core';
  import { debounce } from 'lodash-es';

  defineOptions({
    name: 'WeiXinOcrDemo',
  });

  interface OcrLocationItem {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    confidence: number;
  }

  interface OcrData {
    originWidth: number;
    originHeight: number;
    locations: OcrLocationItem[];
  }

  const imageRef = ref<HTMLElement | null>(null);
  const imageWidth = ref(0);
  const imageHeight = ref(0);

  const blobUrl = ref('');
  const previewList = [
    'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
    'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
  ];
  const apiUrl = 'http://127.0.0.1:17654/py-api/ocr/recognize_bbox';
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

  const setOcrTextDiv = () => {
    if (!imageRef.value) return;
    if (ocrData.value.locations.length === 0) return;
    if (imageWidth.value === 0 || imageHeight.value === 0) return;
    console.log('设置 OCR 文字位置');
    // 清空之前的识别结果
    const existingDivs = document.getElementsByClassName('ocr-text');
    while (existingDivs.length > 0) {
      existingDivs[0].parentNode?.removeChild(existingDivs[0]);
    }
    ocrData.value.locations.forEach((ocr) => {
      // 过滤空字符
      if (!ocr.text) return;
      const div = document.createElement('div');

      div.className = 'ocr-text';
      const widthRatio = imageWidth.value / ocrData.value.originWidth;
      const heightRatio = imageHeight.value / ocrData.value.originHeight;
      div.style.top = heightRatio * ocr.y + 'px';
      div.style.left = widthRatio * ocr.x + 'px';
      div.style.fontSize =
        calculateFontSize(ocr.text, ocr.width * widthRatio, ocr.height * heightRatio) + 'px';
      div.textContent = ocr.text;

      document.getElementsByClassName('ocr-image')[0].appendChild(div);
    });
  };

  onMounted(async () => {
    blobUrl.value = await imageToBlobUrl(InvoiceImage);
    await uploadFromBlobUrl(blobUrl.value);
  });

  onBeforeUnmount(() => {
    relayoutOnResize.cancel();
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
    //color: transparent;
    color: red;
  }
</style>
