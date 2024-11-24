<template>
  <div
    class="logo-wall-container items-center justify-center mx-auto bg-white rounded-md"
    ref="boardRef"
    :style="containerStyle"
  >
    <div class="content-wrap">
      <div class="mask-before">
        <div class="mask-before-line"></div>
      </div>
      <div class="logo-wall">
        <div class="content">
          <div class="image-wrap">
            <div class="row" v-for="(row, index) in imageList" :key="index">
              <Image
                v-for="item in row"
                :key="item"
                :src="item"
                :width="768"
                :height="300"
                :preview="false"
              />
            </div>
          </div>
          <div class="image-wrap">
            <div class="row" v-for="(row, index) in imageList" :key="'copy-row' + index">
              <Image
                v-for="item in row"
                :key="'copy-image' + item"
                :src="item"
                :width="768"
                :height="300"
                :preview="false"
                :autoFit="true"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="mask-after">
        <div class="mask-after-line"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Image } from 'ant-design-vue';
  import logo1 from '@/assets/images/logo/1.jpg';
  import logo2 from '@/assets/images/logo/2.jpeg';
  import logo3 from '@/assets/images/logo/3.jpg';
  import logo4 from '@/assets/images/logo/4.png';
  import logo5 from '@/assets/images/logo/5.jpg';
  import logo6 from '@/assets/images/logo/6.png';
  import logo7 from '@/assets/images/logo/7.jpg';
  import logo8 from '@/assets/images/logo/8.png';
  import logo9 from '@/assets/images/logo/9.png';
  import logo10 from '@/assets/images/logo/10.png';
  import logo11 from '@/assets/images/logo/11.png';
  import logo12 from '@/assets/images/logo/12.png';
  import logo13 from '@/assets/images/logo/13.png';
  import logo14 from '@/assets/images/logo/14.png';
  import logo15 from '@/assets/images/logo/15.png';
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

  defineOptions({ name: 'LogoWall' });

  const imageList = [
    [logo1, logo2, logo3, logo4, logo5],
    [logo6, logo7, logo8, logo9, logo10],
    [logo11, logo12, logo13, logo14, logo15],
  ];

  const windowWidth = ref(window.innerWidth);
  const windowHeight = ref(window.innerHeight);
  const _width = ref(3840);
  const _height = ref(1080);

  const boardRef = ref<any>(null);
  const updateSize = () => {
    if (boardRef.value) {
      console.log('set boardRef', window.innerWidth);
      windowWidth.value = window.innerWidth;
      windowHeight.value = window.innerHeight;
    }
  };

  //底层容器尺寸，适应屏幕
  const containerStyle = computed(() => {
    let scale: number = 1;
    if (windowWidth.value / windowHeight.value > _width.value / _height.value) {
      scale = windowHeight.value / _height.value;
    } else {
      scale = windowWidth.value / _width.value;
    }
    console.log('scale', scale);
    return {
      width: `${_width.value}px`,
      height: `${_height.value}px`,
      transform: `scale(${scale})`,
      color: '#ffffff',
    };
  });

  onMounted(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateSize);
  });
</script>

<style scoped lang="less">
  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  .content-wrap {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    overflow: hidden;
    --v-offset: 100px;
    --curve-height: 300px;
    .mask-before,
    .mask-before-line,
    .mask-after,
    .mask-after-line {
      position: absolute;
      background: #6d9ec4;
      width: calc(100% + 2 * var(--v-offset));
      height: var(--curve-height);
      border-radius: 50%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1;
    }
    .mask-before {
      top: calc(-0.6 * var(--curve-height));
    }
    .mask-before-line {
      margin-top: -40px;
      border-bottom: 4px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 10px 5px #ccc;
    }
    .mask-after {
      bottom: calc(-0.6 * var(--curve-height));
    }
    .mask-after-line {
      margin-top: 40px;
      border-top: 4px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 10px 5px #ccc;
    }
  }
  .logo-wall {
    .content {
      display: flex;
      width: 200%;
      animation: scroll 15s linear infinite;
      //&:hover {
      //  animation-play-state: paused;
      //}
      .image-wrap {
        width: 50%;
        display: flex;
        flex-direction: column;
        background: #6d9ec4;
        .row {
          display: flex;
          :deep(img) {
            border-right: 1px solid #949393;
            border-bottom: 1px solid #949393;
          }
          &:last-child {
            :deep(img) {
              margin-bottom: 0;
            }
          }
        }
      }
    }
  }
</style>
