<template>
  <div class="logo-wall">
    <div class="content">
      <div class="image-wrap">
        <div class="row" v-for="(row, index) in imageList" :key="index">
          <Image
            v-for="item in row"
            :key="item"
            :src="item"
            :width="400"
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
            :width="400"
            :height="300"
            :preview="false"
          />
        </div>
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

  defineOptions({ name: 'LogoWall' });

  const imageList = [
    [logo1, logo2, logo3, logo4, logo5],
    [logo6, logo7, logo8, logo9, logo10],
    [logo11, logo12, logo13, logo14, logo15],
  ];
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
  .logo-wall {
    overflow: hidden;
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
        .row {
          display: flex;
        }
      }
    }
  }
</style>
