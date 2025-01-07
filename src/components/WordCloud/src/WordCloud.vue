<template>
  <div class="wordCloud-tagBall" :style="{ width: `${width}px`, height: `${height}px` }">
    <span
      class="wordCloud-tag"
      v-for="(item, index) of data"
      :key="index"
      :style="{ ...contentEle[index]?.style }"
      :title="item"
      @mouseenter="stop(index)"
      @mouseleave="start"
      >{{ item.length > 8 ? item.slice(0, 8) + '...' : item }}</span
    >
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { DirectionEnum } from './wordCloudEnum';
  import type { contentEleItemFE } from './wordCloud';

  defineOptions({ name: 'WordCloud' });
  const props = defineProps({
    data: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    width: {
      type: Number,
      default: 300,
    },
    height: {
      type: Number,
      default: 300,
    },
    direction: {
      type: Number as PropType<DirectionEnum>,
      default: DirectionEnum.XForward,
    },
    speed: {
      type: Number,
      default: 400,
    },
  });
  const contentEle = ref<contentEleItemFE[]>([]);
  let animateID = 0;

  const rotateX = () => {
    const angleX = [DirectionEnum.XForward, DirectionEnum.XBackward].includes(props.direction)
      ? Math.PI / Infinity
      : Math.PI / ((Number(props.direction) / 2) * Number(props.speed));
    const cos = Math.cos(angleX);
    const sin = Math.sin(angleX);

    contentEle.value = contentEle.value.map((t) => {
      const y1 = t.y * cos - t.z * sin;
      const z1 = t.z * cos + t.y * sin;
      return {
        ...t,
        y: y1,
        z: z1,
      };
    });
  };

  const rotateY = () => {
    const angleY = [DirectionEnum.YForward, DirectionEnum.YBackward].includes(props.direction)
      ? Math.PI / Infinity
      : Math.PI / (Number(props.direction) * Number(props.speed));
    const cos = Math.cos(angleY);
    const sin = Math.sin(angleY);
    contentEle.value = contentEle.value.map((t) => {
      const x1 = t.x * cos - t.z * sin;
      const z1 = t.z * cos + t.x * sin;
      return {
        ...t,
        x: x1,
        z: z1,
      };
    });
  };

  const move = () => {
    const CX = props.width / 2;
    const CY = props.height / 2;
    contentEle.value = contentEle.value.map((singleEle) => {
      const { x, y, z } = singleEle;
      const fallLength = 500;
      const RADIUS = (props.width - 50) / 2;
      const scale = fallLength / (fallLength - z);
      const alpha = (z + RADIUS) / (2 * RADIUS);
      const left = `${x + CX - 15}px`;
      const top = `${y + CY - 15}px`;
      const transform = `translate(${left}, ${top}) scale(${scale})`;
      const style = {
        ...singleEle.style,
        opacity: alpha + 0.5,
        zIndex: parseInt(scale * 100, 10),
        transform,
      };
      return {
        x,
        y,
        z,
        style,
      };
    });
  };

  const animate = () => {
    rotateX();
    rotateY();
    move();
    animateID = window.requestAnimationFrame(animate);
  };

  const changeStyle = (index: number) => {
    const ele = contentEle.value[index];
    const { transform } = ele.style;
    if (transform) {
      const transformValue = transform.split(' scale')[0];
      ele.style = {
        ...ele.style,
        opacity: 1,
        transform: `${transformValue} scale(1.8)`,
        transition: 'all 0.3s',
      };
    }
  };

  const cancelAnimation = () => {
    window.cancelAnimationFrame(animateID);
  };

  // 鼠标移入暂停
  const stop = (index: number) => {
    cancelAnimation();
    changeStyle(index);
  };

  // 鼠标离开恢复
  const start = () => {
    animate();
  };

  const init = () => {
    const RADIUSX = (props.width - 50) / 2;
    const RADIUSY = (props.height - 50) / 2;
    contentEle.value = [];
    for (let i = 0; i < props.data.length; i += 1) {
      const k = -1 + (2 * (i + 1) - 1) / props.data.length;
      const a = Math.acos(k);
      const b = a * Math.sqrt(props.data.length * Math.PI);
      const x = RADIUSX * Math.sin(a) * Math.cos(b);
      const y = RADIUSY * Math.sin(a) * Math.sin(b);
      const z = RADIUSX * Math.cos(a);
      const singleEle = {
        x,
        y,
        z,
        style: {},
      };
      contentEle.value.push(singleEle);
    }
    animate();
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    cancelAnimation();
  });
</script>

<style scoped lang="less">
  .wordCloud-tagBall {
    margin: 50px auto;
    position: relative;
  }

  .wordCloud-tag {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    color: rgba(246, 187, 66, 1);
    text-decoration: none;
    font-size: 16px;
    font-family: '微软雅黑';
    font-weight: bold;
    cursor: pointer;
  }
</style>
