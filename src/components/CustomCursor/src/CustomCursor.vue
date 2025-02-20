<template>
  <div class="custom-cursor" ref="cursorRef"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useEventListener } from '@/hooks/event/useEventListener';
  import { throttle } from 'lodash-es';

  defineOptions({ name: 'CustomCursor' });

  const cursorRef = ref<HTMLDivElement | null>(null);
  let isAnimating = false;

  // 初始化参数
  let currentScale = 1;
  let lastX = 0;
  let lastY = 0;
  const scaleStep = 0.1;
  const minScale = 0.5;
  const maxScale = 3;

  const showCursor = (bool: boolean = true) => {
    if (cursorRef.value) cursorRef.value.style.display = bool ? 'block' : 'none';
    if (bool) {
      document.body.classList.add('hide-cursor');
    } else {
      document.body.classList.remove('hide-cursor');
    }
  };

  const throttledUpdateCursor = throttle(() => {
    console.log('throttledUpdateCursor');
    if (cursorRef.value) {
      cursorRef.value.style.transform = `translate(${lastX}px, ${lastY}px) scale(${currentScale})`;
    }
    isAnimating = false;
  }, 16); // 16ms 大约是 60fps

  const onMouseMove = () => {
    useEventListener({
      el: document,
      name: 'mousemove',
      isDebounce: false,
      listener: (e) => {
        lastX = e.clientX;
        lastY = e.clientY;

        if (!isAnimating) {
          isAnimating = true;
          requestAnimationFrame(throttledUpdateCursor);
        }
      },
    });
  };

  const bindEvents = () => {
    onMouseMove();
  };

  const init = () => {
    bindEvents();
    showCursor();
  };

  const reset = () => {
    showCursor(false);
  };

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    reset();
  });
</script>

<style lang="less">
  .custom-cursor {
    display: none; // 默认隐藏
    position: fixed;
    top: 0;
    left: 0;
    width: 32px;
    height: 32px;
    background: url('@/assets/images/cursor.png') no-repeat center 4px;
    background-size: contain;
    pointer-events: none; // 不阻挡鼠标事件
    z-index: 9999;
    transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94); // 平滑过渡
    will-change: transform; // 提前告诉浏览器这个属性会变化，优化性能
  }

  body.hide-cursor {
    cursor: none !important; // 隐藏系统鼠标
    * {
      cursor: none !important;
    }
  }
</style>
