<template>
  <div class="wx-ocr-demo-page">
    <div class="flex mb-4">
      <el-upload
        :file-list="fileList"
        :showUploadList="false"
        :maxCount="1"
        accept="image/*,.pdf,.docx,.doc,.xlsx,.xls,.ppt,.pptx"
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
      <el-switch class="ml-6" v-model="showBorder" inactive-text="边框" />
    </div>
    <div
      class="preview-container"
      :class="{ boarder: showBorder }"
      v-loading.fullscreen.lock="loading"
    >
      <div class="preview-area" ref="previewRef">
        <PdfViewer
          v-if="objectFile.type === PDF_TYPE"
          :source="objectFile.url"
          class="pdf-viewer"
        />
        <el-image
          v-else
          style="width: 100%; height: auto"
          :src="objectFile.url"
          preview-teleported
          fit="contain"
        />
      </div>
      <transition name="sidebar-fade">
        <div v-if="objectFile.url" class="ocr-sidebar">
          <h3>AI识图</h3>
          <div class="btn-group">
            <a-button type="primary" @click="initScreenShot" class="mr-4">截图</a-button>
            <a-button type="primary" danger @click="emptyScreenShot">清空</a-button>
          </div>
          <div class="ocr-result-list">
            <div v-if="loading" class="ocr-loading-mask"> AI识别中... </div>
            <template v-else>
              <OcrResultItem
                v-for="(item, index) in ocrResult"
                :key="index"
                class="ocr-result-item"
                :model-value="item"
                @update:model-value="updateOcrResult(index, $event)"
              />
            </template>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
  import { useResizeObserver } from '@vueuse/core';
  import { debounce } from 'lodash-es';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import PdfViewer from '@/components/PdfViewer/index.vue';
  import { message } from 'ant-design-vue';
  import OcrResultItem from '@/views/demo/feat/ocr/OcrResultItem.vue';
  import { snapdom } from '@zumer/snapdom';
  import ScreenShot from 'js-web-screen-shot';

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

  // const apiPrefix = 'http://127.0.0.1:17654';
  // const apiPrefix = 'http://100.127.94.201:7111';
  // const apiPrefix = 'http://127.0.0.1:7111';
  // 将绝对地址改为相对前缀，走 Vite 代理
  const apiPrefix = '/py-api';

  const apiUrl = `${apiPrefix}/ocr/recognize_bbox`;
  const screenShotApiUrl = `${apiPrefix}/ocr/recognize`;
  const PDF_TYPE = 'application/pdf';

  const fileList = ref<File[]>([]);
  const objectFile = ref({
    url: '',
    type: '',
  });

  const previewRef = ref<HTMLElement | null>(null);
  const previewWidth = ref(0);
  const previewHeight = ref(0);

  const loading = ref<boolean>(false);
  const showBorder = ref(false);
  const ocrData = ref<OcrData>({
    originWidth: 0,
    originHeight: 0,
    locations: [],
  });

  const relayoutOnResize = debounce(() => {
    setOcrTextDiv();
  }, 200);

  useResizeObserver(previewRef, (entries) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    // console.log('图片尺寸变化：', width, height);
    previewWidth.value = width;
    previewHeight.value = height;
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
    const filename = fileList.value[0]?.name || file.name || 'image.jpg';
    console.log(filename);

    let formData = new FormData();
    formData.append('file', file, filename);
    formData.append('filename', filename);
    // formData.append('mode', 'line');

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
    if (!previewRef.value) return;
    if (ocrData.value.locations.length === 0) return;
    if (previewWidth.value === 0 || previewHeight.value === 0) return;
    console.log('设置 OCR 文字位置');
    clearOcrTextDiv();

    ocrData.value.locations.forEach((ocr) => {
      // 过滤空字符
      if (!ocr.text) return;
      const div = document.createElement('div');

      div.className = 'ocr-text';
      const widthRatio = previewWidth.value / ocrData.value.originWidth;
      const heightRatio = previewHeight.value / ocrData.value.originHeight;
      const itemWidth = ocr.width + 0;
      div.style.top = heightRatio * ocr.y + 'px';
      div.style.left = widthRatio * ocr.x - 4 + 'px';
      div.style.width = (widthRatio * itemWidth >= 14 ? widthRatio * itemWidth : 14) + 'px';
      div.style.height = heightRatio * ocr.height + 'px';
      // div.style.fontSize =
      //   calculateFontSize(ocr.text, ocr.width * widthRatio, ocr.height * heightRatio) + 'px';
      // div.textContent = ocr.text;
      // 使用data-属性存储文本
      div.setAttribute('data-text', ocr.text);

      document.getElementsByClassName('preview-container')[0].appendChild(div);
    });
  };

  // 选中与框选逻辑新增
  const SELECTED_CLASS = 'selected';

  const getOcrContainer = (): HTMLElement | null => {
    return document.getElementsByClassName('preview-container')[0] as HTMLElement | null;
  };

  const clearAllSelections = () => {
    document.querySelectorAll('.ocr-text.' + SELECTED_CLASS).forEach((el) => {
      el.classList.remove(SELECTED_CLASS);
    });
  };

  // 鼠标拖拽选取逻辑（重写）
  let isSelecting = false;
  let startEl: HTMLElement | null = null;
  let endEl: HTMLElement | null = null;

  const getPos = (el: HTMLElement) => ({
    x: parseFloat(el.style.left) || 0,
    y: parseFloat(el.style.top) || 0,
  });

  const isSameLine = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.abs(a.y - b.y) <= lineThreshold;

  const updateDragSelection = () => {
    if (!startEl || !endEl) return;

    const startPos = getPos(startEl);
    const endPos = getPos(endEl);
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.ocr-text'));

    clearAllSelections();

    // 未跨行：同行选择 x 区间（含反向拖拽）
    if (isSameLine(startPos, endPos)) {
      const minX = Math.min(startPos.x, endPos.x);
      const maxX = Math.max(startPos.x, endPos.x);
      for (const el of nodes) {
        const p = getPos(el);
        if (isSameLine(p, startPos) && p.x >= minX && p.x <= maxX) {
          el.classList.add(SELECTED_CLASS);
        }
      }
      return;
    }

    // 跨行：按规则选择
    const minY = Math.min(startPos.y, endPos.y);
    const maxY = Math.max(startPos.y, endPos.y);

    for (const el of nodes) {
      const p = getPos(el);

      // 中间行（严格在 start/end 之间，不含两端行，留出阈值）
      if (p.y > minY + lineThreshold && p.y < maxY - lineThreshold) {
        el.classList.add(SELECTED_CLASS);
        continue;
      }

      // 开始行：x >= start.x
      if (isSameLine(p, startPos) && p.x >= startPos.x) {
        el.classList.add(SELECTED_CLASS);
        continue;
      }

      // 结束行：x <= start.x（按你的描述执行）
      if (isSameLine(p, endPos) && p.x <= endPos.x) {
        el.classList.add(SELECTED_CLASS);
        continue;
      }
    }
  };

  const handleContainerMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const container = getOcrContainer();
    if (!container) return;

    const target = e.target as HTMLElement | null;
    if (!target?.classList.contains('ocr-text')) return;

    container.focus(); // 聚焦容器以接收键盘事件

    // 开始新的选取
    clearAllSelections();
    isSelecting = true;
    startEl = target;
    endEl = target;
    updateDragSelection();
    e.preventDefault();
  };

  const handleContainerMouseUp = (e: MouseEvent) => {
    if (e.button !== 0) return;
    // console.log('handleContainerMouseUp');
    isSelecting = false;
  };

  const handleContainerMouseLeave = () => {
    // console.log('handleContainerMouseLeave');
    isSelecting = false;
  };

  const handleContainerMouseOver = (e: MouseEvent) => {
    if (!isSelecting) return;
    const target = e.target as HTMLElement | null;
    if (!target?.classList.contains('ocr-text')) return;

    endEl = target;
    updateDragSelection();
  };

  // 新增：在容器上兜底处理 Cmd/Ctrl+C
  const handleContainerKeydown = (e: KeyboardEvent) => {
    console.log('handleContainerKeydown', e.key);
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      const text = buildSelectedOcrText();
      if (!text) return;
      e.preventDefault();
      // 复用已有复制逻辑（也顺便消除 copyText 未使用的 ESLint 告警）
      copyText(text);
    }
  };

  /* ---------------- 复制功能新增开始 ---------------- */

  /**
   * 提取当前已选中的 OCR 文本并进行行聚合与排序
   * 行聚合: 若两块 top 差值 < lineThreshold 视为同一行
   */
  const lineThreshold = 6; // px 行合并阈值，可按需要调整

  const buildSelectedOcrText = (): string => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.ocr-text.' + SELECTED_CLASS));
    if (!nodes.length) return '';

    // 排序: 先按 top 再按 left
    nodes.sort((a, b) => {
      const ta = parseFloat(a.style.top);
      const tb = parseFloat(b.style.top);
      if (Math.abs(ta - tb) > lineThreshold) return ta - tb;
      const la = parseFloat(a.style.left);
      const lb = parseFloat(b.style.left);
      return la - lb;
    });

    // 行聚合
    const lines: { top: number; items: string[] }[] = [];
    nodes.forEach((el) => {
      const top = parseFloat(el.style.top);
      const text = el.getAttribute('data-text') || '';
      if (!text) return;
      const last = lines[lines.length - 1];
      if (last && Math.abs(last.top - top) <= lineThreshold) {
        last.items.push(text);
      } else {
        lines.push({ top, items: [text] });
      }
    });

    // 合并: 同行用空格, 行间用换行
    return lines
      .map((l) => l.items.join(''))
      .join('\n')
      .trim();
  };

  /**
   * 复制事件处理: 拦截系统 copy, 写入聚合文本
   */
  const handleCopyEvent = (e: ClipboardEvent) => {
    console.log('handleCopyEvent');
    const text = buildSelectedOcrText();
    if (!text) return; // 没有选中则不拦截, 保持默认行为
    e.preventDefault();
    writeToClipboard(e, text);
  };

  const writeToClipboard = (e: ClipboardEvent, text: string) => {
    try {
      // 首选：在 copy 事件里写入剪贴板（无需安全上下文）
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', text);
        message.success('复制成功');
      } else {
        throw new Error('clipboardData 不可用');
      }
    } catch (err) {
      message.error('复制失败', err);
    }
  };

  const copyText = async (text) => {
    console.log('复制文本:', text);
    try {
      await navigator.clipboard.writeText(text);
      message.success('复制成功');
    } catch (err) {
      // 降级处理：使用传统方式复制
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('复制成功');
      } catch (fallbackErr) {
        message.error('复制失败', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  /* ---------------- 复制功能新增结束 ---------------- */

  const bindContainerEvents = () => {
    const c = getOcrContainer();
    if (!c) return;
    console.log('绑定 OCR 容器事件');

    c.setAttribute('tabindex', '0'); // 使容器可聚焦以接收键盘事件
    c.addEventListener('mousedown', handleContainerMouseDown);
    c.addEventListener('mouseup', handleContainerMouseUp);
    c.addEventListener('mouseleave', handleContainerMouseLeave);
    c.addEventListener('mouseover', handleContainerMouseOver);
    // c.addEventListener('copy', handleCopyEvent);
    c.addEventListener('keydown', handleContainerKeydown);
  };

  const unbindContainerEvents = () => {
    const c = getOcrContainer();
    if (!c) return;
    console.log('解绑 OCR 容器事件');
    c.removeEventListener('mousedown', handleContainerMouseDown);
    c.removeEventListener('mouseup', handleContainerMouseUp);
    c.removeEventListener('mouseleave', handleContainerMouseLeave);
    c.removeEventListener('mouseover', handleContainerMouseOver);
    // c.removeEventListener('copy', handleCopyEvent);
    c.removeEventListener('keydown', handleContainerKeydown);
  };

  /******************************* 侧边栏功能 ***************************************/
  const screenShotHandler = ref<ScreenShot | null>(null);
  const ocrResult = ref<string[]>([]);

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // 结果是 base64 字符串（带 data:... 前缀）
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob); // 转 base64
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

  const getBodySnapshot = async () => {
    const blob = await snapdom.toBlob(document.body);
    // return URL.createObjectURL(blob);
    return (await blobToBase64(blob)) as string;
  };

  const completeScreenShotCallback = (data: any) => {
    console.log('Screenshot complete:', data);
    const fileName = `screenshot-${Date.now()}.png`;
    const file = base64ToFile(data.base64, fileName);
    handleScreenshotUpload(file);
  };

  const initScreenShot = async () => {
    const url = await getBodySnapshot();
    screenShotHandler.value = new ScreenShot({
      imgSrc: url,
      enableWebRtc: false,
      completeCallback: completeScreenShotCallback,
    });
  };

  const handleScreenshotUpload = async (file) => {
    showLoading(true);

    let formData = new FormData();
    formData.append('file', file);

    try {
      let res = await fetch(screenShotApiUrl, {
        method: 'POST',
        body: formData,
      });
      let data = await res.json();
      console.log('上传成功：', data);
      const resultText = data.data.result.join('');
      ocrResult.value.push(resultText);
    } catch (err) {
      console.error('上传失败：', err);
    } finally {
      showLoading(false);
    }
  };

  const emptyScreenShot = () => {
    ocrResult.value = [];
  };

  const updateOcrResult = (index, value) => {
    ocrResult.value[index] = value;
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
    padding: 20px 0 20px 20px;
    .preview-container {
      display: flex;
      width: 100%;
      overflow: auto;
      text-align: center;
      position: relative;
      ::v-deep(img) {
        user-select: none;
      }
      &.boarder {
        ::v-deep(.ocr-text) {
          border: 1px solid blue;
        }
      }

      .preview-area {
        flex: 1;
      }

      .ocr-sidebar {
        display: flex;
        flex-direction: column;
        width: 300px;
        background: #fff;
        border-left: 1px solid #eee;
        border-radius: 12px 0 0 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        padding: 24px 16px;
        box-sizing: border-box;
        transition: box-shadow 0.3s;
        overflow: hidden;
        margin-left: 20px;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 0;
        }

        .btn-group {
          margin: 10px 0;
        }
      }
      .ocr-result-list {
        position: relative;
        flex: 1;
        overflow: hidden;
        overflow-y: auto;
        .ocr-loading-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          font-size: 14px;
          color: #333;
        }
        .ocr-result-item {
          margin-bottom: 12px;
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
  }

  .ocr-text.selected {
    /* 使用系统色 + 回退 */
    background: Highlight;
    color: HighlightText;
    /* 回退颜色 */
    background-color: rgba(64, 158, 255, 0.35);
    color: #000;
  }
</style>
