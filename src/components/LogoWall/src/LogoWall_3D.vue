<template>
  <div class="curved-surface-container" ref="container"> </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, nextTick } from 'vue';
  import { threeHandlerClass } from './curvedSurfaceThree';
  import { curvedSurfaceListItemType } from '@/components/LogoWall/src/types';

  defineOptions({ name: 'LogoWall3D' });
  const props = defineProps({
    /** 当前是否显示 */
    isShow: {
      type: Boolean,
      default: false,
    },
    /** 候选图片池，imageList会根据图片池生成 */
    imagePool: {
      type: Array<curvedSurfaceListItemType>,
      default: () => [],
    },
    /** 球体由多少个面组成：可以控制曲面的弧度 */
    face: {
      type: Number,
      default: 4,
    },
    /** 列数：建议通过列数来控制行数（规律为列数减少，行数也会减少） */
    col: {
      type: Number,
    },
    /** 自动播放速度：使用正负数控制方向，0为停止 */
    autoPlaySpeed: {
      type: Number,
      default: 7,
    },
  });

  let imageList: curvedSurfaceListItemType[][] = [];

  // 屏幕信息
  const container = ref<HTMLElement | null>();
  let containerWidth = 0;
  let containerHeight = 0;

  // 列表计算信息
  const colNumList = [8, 12, 16, 20];
  const colIndex = ref<number>(1);
  // 列数
  let colNum = 0;
  // 行数
  let rowNum = 0;
  // 元素宽度
  let itemWidth = 0;
  // 一屏元素总数量
  let allItemNum = 0;

  let threeHandler: threeHandlerClass | null = null;

  // 获取屏幕信息信息并计算相关数据
  const setContainerInfo = async () => {
    if (!container.value) {
      return Promise.reject('set container info error !');
    }
    const { clientWidth, clientHeight } = container.value;
    containerWidth = clientWidth;
    containerHeight = clientHeight;
    console.log('containerWidth', containerWidth, 'containerHeight', containerHeight);
    if (clientWidth === 0 || clientHeight === 0) {
      return Promise.reject('width or height is 0 !');
    }
    // 获取列数
    colNum = props.col || colNumList[colIndex.value];
    console.log('列数', colNum);

    // 计算每个元素的宽度
    itemWidth = clientWidth / colNum;
    console.log('每个元素的宽度', itemWidth);

    // 计算行数
    rowNum = Math.floor(clientHeight / itemWidth);
    console.log('行数', rowNum);

    // 计算总数
    allItemNum = colNum * rowNum;
    console.log('一屏展示的元素总数', allItemNum, '当前球体的面数', props.face);
  };

  // 随机生成imageList，imageList的每行共allItemNum个元素（随机选取自imagePool），共face行
  const imageListGenerate = async () => {
    for (let i = 0; i < props.face; i++) {
      const list: curvedSurfaceListItemType[] = [];
      for (let j = 0; j < allItemNum; j++) {
        const index = Math.floor(Math.random() * props.imagePool.length);
        list.push({
          url: props.imagePool[index].url,
          index: index,
        });
      }
      imageList.push(list);
    }
    console.log('随机生成imageList 个数', imageList.length * imageList[0].length);
  };

  const renderWall = async () => {
    if (!container.value) {
      return Promise.reject('Cannot get container element !');
    }
    console.log('开始渲染……');
    threeHandler = new threeHandlerClass();
    threeHandler.setInfo(
      container.value,
      containerWidth,
      containerHeight,
      colNum,
      rowNum,
      allItemNum,
      itemWidth,
      imageList,
    );
    threeHandler.init();
    threeHandler.createListView();
    threeHandler.execAnimate();
    threeHandler.mountedEvent();
    setTimeout(() => {
      threeHandler && threeHandler.setAutoPlaySpeed(props.autoPlaySpeed);
    }, 1000);
    console.log('渲染完成');
  };

  const reset = () => {
    console.log('reset');
    if (threeHandler) {
      threeHandler.cancelEvent();
      threeHandler.dispose();
      threeHandler = null;
    }
    if (container.value) {
      container.value.innerHTML = '';
    }
    imageList = [];
  };

  const init = async () => {
    try {
      if (!props.isShow) {
        reset();
      } else {
        await nextTick(async () => {
          await setContainerInfo();
          await imageListGenerate();
          await renderWall();
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  onMounted(() => {
    init();
  });

  watch(
    () => props.isShow,
    () => {
      init();
    },
  );
</script>

<style scoped lang="less">
  .curved-surface-container {
    width: 100%;
    height: 100%;
    position: relative;
    flex: 1 1 0 !important;
    background: #6d9ec4;
  }
</style>
