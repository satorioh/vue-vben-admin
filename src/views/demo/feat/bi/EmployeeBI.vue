<template>
  <Transition name="expand-from-tr">
    <div v-if="visible" class="full-screen-overlay">
      <div class="body" :style="bodyStyle">
        <div class="scale-box" ref="scaleBoxRef">
          <div class="header">
            <div class="header-left">
              <img :src="lineArrow" alt="arrow" width="20px" />
              <span>员工情况</span>
            </div>
            <el-button type="primary" link @click="showDetail(false)">收起</el-button>
          </div>

          <div class="bi-content-wrap">
            <div class="left-one">
              <EmployeeTable />
            </div>
            <div class="main-container">
              <FeedBack type="融资规模" employee-name="张三" class="feed-back" />
              <div class="area-title">融资规模</div>
              <FinanceChart />
              <el-divider border-style="dashed" class="finance-divider" />
              <div class="main-container-bottom">
                <div class="finance-ratio">
                  <div class="area-title">融资规模比例</div>
                  <div class="area-title-gray">融资规模在团队中占比</div>
                  <EmployeePieChart />
                </div>
                <el-divider direction="vertical" border-style="dashed" class="pie-divider" />
                <div class="project-flow">
                  <div class="area-title">项目流转</div>
                  <ProjectSankey />
                </div>
              </div>
            </div>
            <div class="right-top">
              <MonthInfo />
            </div>
            <div class="right-bottom">
              <VisitHotMap />
            </div>
            <div class="bottom-container">
              <Analysis />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, watch, onUnmounted, nextTick, computed, CSSProperties, defineExpose } from 'vue';
  import { debounce } from 'lodash-es';
  import lineArrow from '@/assets/images/bi/line_arrow.png';
  import EmployeeTable from '@/views/demo/feat/bi/components/EmployeeTable.vue';
  import Analysis from '@/views/demo/feat/bi/components/Analysis.vue';
  import VisitHotMap from '@/views/demo/feat/bi/components/VisitHotMap.vue';
  import MonthInfo from '@/views/demo/feat/bi/components/MonthInfo.vue';
  import FinanceChart from '@/views/demo/feat/bi/components/FinanceChart.vue';
  import EmployeePieChart from '@/views/demo/feat/bi/components/EmployeePieChart.vue';
  import ProjectSankey from '@/views/demo/feat/bi/components/ProjectSankeyChart.vue';
  import FeedBack from '@/views/demo/feat/bi/components/FeedBack.vue';

  defineOptions({
    name: 'EmployeeBI',
  });

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    /**隐藏滚动条且禁止滚动*/
    lockScroll: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue', 'open', 'close']);

  // 控制显示
  const visible = computed({
    get: () => props.modelValue,
    set: (val: boolean) => {
      emit('update:modelValue', val);
    },
  });

  // 根据配置生成 body 的样式
  const bodyStyle = computed<CSSProperties>(() => {
    if (props.lockScroll) {
      return { overflow: 'hidden' };
    }
    return { overflowY: 'auto', overflowX: 'hidden' };
  });

  // --- 适配逻辑开始 ---
  const scaleBoxRef = ref<HTMLElement | null>(null);

  // 设计稿固定尺寸
  const DESIGN_WIDTH = 1440;
  // 修改：原高度 888 + Header高度 50
  const DESIGN_HEIGHT = 938;

  const setScale = () => {
    if (!scaleBoxRef.value) return;

    // 1. 获取当前可视区域宽度
    const windowWidth = window.innerWidth;

    // 2. 计算缩放比例：只依据宽度计算，保持纵横比
    const scale = windowWidth / DESIGN_WIDTH;

    // 3. 应用缩放 (原点设为左上角)
    scaleBoxRef.value.style.transform = `scale(${scale})`;

    // 4. 设置容器高度以支撑布局
    scaleBoxRef.value.style.width = `${DESIGN_WIDTH}px`;
    scaleBoxRef.value.style.height = `${DESIGN_HEIGHT}px`;
  };

  // 防抖监听窗口变化
  const resizeHandler = debounce(() => {
    setScale();
  }, 100);

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
  });
  // --- 适配逻辑结束 ---

  const showDetail = (bool: boolean) => {
    visible.value = bool;
  };

  watch(visible, async (val) => {
    if (val) {
      emit('open');
      await nextTick();
      setScale();
      window.addEventListener('resize', resizeHandler);
    } else {
      emit('close');
      window.removeEventListener('resize', resizeHandler);
    }
  });

  defineExpose({
    showDetail,
  });
</script>

<style scoped lang="scss">
  .full-screen-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: white;
    z-index: 100;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  /* 核心内容区域 */
  .body {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    /* overflow 属性现在通过 style 绑定动态控制 */
    background-color: #fff;

    /* 缩放容器 */
    .scale-box {
      position: absolute;
      transform-origin: left top;
      width: 1440px;
      height: 938px; /* 888 + 50 */
      background-color: #fff;

      /* Header 样式 - 移入此处 */
      .header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 50px;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        box-sizing: border-box;
        border-bottom: 0.571px solid #f3f4f6;
        background: linear-gradient(90deg, #f5f3ff 0%, #fefeff 100%);
        .header-left {
          display: flex;
          align-items: center;
          color: #1e2939;
          font-size: 18px;
          font-weight: 600;
          img {
            margin-right: 8px;
          }
        }
      }

      /* 内容包裹层 - 整体下移 */
      .bi-content-wrap {
        position: absolute;
        top: 50px; /* Header 高度 */
        left: 0;
        width: 100%;
        height: 888px;
      }
    }

    /* 以下样式无需变动，它们现在位于 .bi-content-wrap 内部 */
    .left-one {
      position: absolute;
      top: 0;
      left: 0;
      width: 413px;
      height: 720px;
      border-right: 1px solid #f5f5f5;
      background: #fff;
    }

    .area-title {
      color: #000;
      font-size: 16px;
      font-weight: 500;
    }

    .area-title-gray {
      color: #8c8c8c;
      font-size: 12px;
      font-weight: 500;
    }

    .main-container {
      position: absolute;
      top: 14px;
      left: 434px;
      width: 588px;
      height: 572px;
      padding: 18px;
      border-radius: 16px;
      border: 1px solid #e1e1e1;
      background: #fff;
      &:hover {
        box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.25);
        .feed-back {
          visibility: visible;
        }
      }

      .feed-back {
        visibility: hidden;
        position: absolute;
        top: 16px;
        right: 20px;
        transition: visibility 0.3s;
      }

      .finance-divider {
        margin: 12px 0;
      }

      .main-container-bottom {
        display: flex;

        .finance-ratio {
          width: 152px;
          display: flex;
          flex-direction: column;
        }

        .pie-divider {
          height: 190px;
        }

        .project-flow {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
      }
    }

    .right-top {
      position: absolute;
      top: 14px;
      right: 20px;
      width: 378px;
      height: 328px;
      border-radius: 16px;
      border: 1px solid #e1e1e1;
      background: #fff;
      &:hover {
        box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.25);
      }
    }

    .right-bottom {
      position: absolute;
      top: 360px;
      right: 20px;
      width: 378px;
      height: 225px;
      border-radius: 16px;
      border: 1px solid #e1e1e1;
      background: #fff;
      &:hover {
        box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.25);
      }
    }

    .bottom-container {
      position: absolute;
      top: 604px;
      right: 20px;
      width: 989px;
      height: 137px;
      border-radius: 16px;
      background: linear-gradient(
        120deg,
        rgba(239, 253, 255, 0.2) 18.47%,
        rgba(242, 226, 255, 0.2) 81.53%
      );
    }
  }

  /* 动画 */
  .expand-from-tr-enter-active,
  .expand-from-tr-leave-active {
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    transform-origin: top right;
  }

  .expand-from-tr-enter-from,
  .expand-from-tr-leave-to {
    opacity: 0;
    transform: scale(0);
  }

  .expand-from-tr-enter-to,
  .expand-from-tr-leave-from {
    opacity: 1;
    transform: scale(1);
  }
</style>
