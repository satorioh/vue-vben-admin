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
      <LogoWall
        v-show="isDomFullscreen"
        ref="domRef"
        :isShow="isDomFullscreen"
        :image-pool="imagePool"
        :mounted-event-option="mountedEventOption"
      />
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

  defineOptions({ name: 'LogoWallDemo' });

  const domRef = ref<Nullable<HTMLElement>>(null);
  const { toggle: toggleDom, isFullscreen: isDomFullscreen } = useFullscreen(domRef);

  const imagePool = [
    { url: 'src/assets/images/logo/1.jpg' },
    { url: 'src/assets/images/logo/2.jpeg' },
    { url: 'src/assets/images/logo/3.jpg' },
    { url: 'src/assets/images/logo/4.png' },
    { url: 'src/assets/images/logo/5.jpg' },
    { url: 'src/assets/images/logo/6.png' },
    { url: 'src/assets/images/logo/7.jpg' },
    { url: 'src/assets/images/logo/8.png' },
    { url: 'src/assets/images/logo/9.png' },
    { url: 'src/assets/images/logo/10.png' },
    { url: 'src/assets/images/logo/11.png' },
    { url: 'src/assets/images/logo/12.png' },
    { url: 'src/assets/images/logo/13.png' },
    { url: 'src/assets/images/logo/14.png' },
    { url: 'src/assets/images/logo/15.png' },
  ];

  const mountedEventOption = {
    enableMouseMove: false,
    // enableMouseDrag: true,
    // enableMouseWheel: false,
  };

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
  }
</style>
