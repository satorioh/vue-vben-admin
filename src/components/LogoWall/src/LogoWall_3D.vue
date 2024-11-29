<template>
  <div class="curved-surface-container" ref="container"> </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, nextTick } from 'vue';
  import { threeHandlerClass } from './curvedSurfaceThree';
  import {
    curvedSurfaceListItemType,
    mountedEventOptionType,
  } from '@/components/LogoWall/src/types';
  import { cloneDeep } from 'lodash-es';

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
    /** imageList生成模式：随机random、顺序order */
    imageListGenerateMode: {
      type: String,
      default: 'order',
    },
    /** 是否启用鼠标事件 */
    enableMouseEvent: {
      type: Boolean,
      default: true,
    },
    mountedEventOption: {
      type: Object as () => mountedEventOptionType,
      default: () => {
        return {
          enableMouseMove: true,
          enableMouseDrag: true,
          enableMouseWheel: true,
        };
      },
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
    console.log(
      `一屏展示的元素总数:${allItemNum}, 当前球体的面数${props.face}, 总计所需元素数量${allItemNum * props.face}`,
    );
  };

  // 随机生成imageList，生成规则如下：
  // 如果imagePool的数量大于等于 allItemNum x face 个元素，则直接取前 allItemNum x face 个元素，并切割成face个数组
  // 如果imagePool的数量小于 allItemNum x face 个元素，则按不同模式取imagePool的元素，直到取满 allItemNum x face 个元素，并切割成face个数组
  const imageListGenerate = async () => {
    let tempList: curvedSurfaceListItemType[] = [];
    const totalNum = allItemNum * props.face;
    if (props.imagePool.length >= totalNum) {
      console.log('imagePool数量大于等于所需数量，截取中……');
      tempList = props.imagePool.slice(0, totalNum);
    } else {
      console.log('imagePool数量小于所需数量');
      if (props.imageListGenerateMode === 'order') {
        // 循环顺序取imagePool的元素，直到取满 allItemNum x face 个元素
        console.log('顺序取值中……');
        const loopNum = Math.ceil(totalNum / props.imagePool.length);
        for (let i = 0; i < loopNum; i++) {
          tempList = tempList.concat(props.imagePool);
        }
      } else if (props.imageListGenerateMode === 'random') {
        // 先取imagePool中所有元素，剩下不足的个数，则随机取imagePool的元素，直到取满 allItemNum x face 个元素
        console.log('随机取值中……');
        tempList = cloneDeep(props.imagePool);
        const randomNum = totalNum - tempList.length;
        for (let i = 0; i < randomNum; i++) {
          const randomIndex = Math.floor(Math.random() * props.imagePool.length);
          tempList.push(props.imagePool[randomIndex]);
        }
      }
      tempList = tempList.slice(0, totalNum);
    }
    console.log('一维图片数量', tempList.length);
    // 切分成二维数组
    for (let i = 0; i < props.face; i++) {
      imageList.push(tempList.slice(i * allItemNum, (i + 1) * allItemNum));
    }
    console.log(`二维图片：面数${imageList.length}，每个面的元素数${imageList[0].length}`);
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
    if (props.enableMouseEvent) threeHandler.mountedEvent(props.mountedEventOption);
    setTimeout(() => {
      threeHandler && threeHandler.setAutoPlaySpeed(props.autoPlaySpeed);
    }, 1000);
    console.log('渲染完成');
  };

  const reset = () => {
    console.log('reset');
    if (threeHandler) {
      if (props.enableMouseEvent) threeHandler.cancelEvent();
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
