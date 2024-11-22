<template>
  <PageWrapper title="logo墙示例" content="点击进入全屏展示">
    <div class="preview">
      <Image :src="previewImage" :preview="false" class="preview-image" />
      <Icon
        icon="zondicons:play-outline"
        :size="50"
        color="#fff"
        class="play-icon"
        @click="handlePlayClick"
      />
      <div
        ref="domRef"
        class="wall-wrap items-center justify-center w-1/2 h-64 mx-auto mt-10 bg-white rounded-md"
        :style="{ display: isDomFullscreen ? 'flex' : 'none' }"
      >
        <LogoWall />
      </div>
    </div>
  </PageWrapper>
</template>
<script setup lang="ts">
  import { PageWrapper } from '@/components/Page';
  import { Image } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { useFullscreen } from '@vueuse/core';
  import previewImage from '@/assets/images/logo_wall_preview.png';
  import { LogoWall } from '@/components/LogoWall';
  import { ref } from 'vue';
  import type { Nullable } from '@vben/types';

  const domRef = ref<Nullable<HTMLElement>>(null);
  const { toggle: toggleDom, isFullscreen: isDomFullscreen } = useFullscreen(domRef);

  const handlePlayClick = () => {
    toggleDom();
  };
</script>

<style scoped lang="less">
  .preview {
    position: relative;
    display: flex;
    justify-content: center;
    :deep(.preview-image) {
      background: rgba(1, 1, 1, 0.5);
    }
    .play-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
    }
    .wall-wrap {
      position: absolute;
    }
  }
</style>
