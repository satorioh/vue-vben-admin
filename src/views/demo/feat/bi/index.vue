<template>
  <div class="main-page">
    <h1>主页面内容</h1>
    <p>这里是原本的页面...</p>

    <el-button type="primary" class="detail-btn" @click="showDetail(true)"> 详情 </el-button>

    <Teleport to="body">
      <Transition name="fade-scale">
        <div v-if="visible" class="full-screen-overlay">
          <div class="nav">导航栏区域</div>
          <div class="header">
            <div class="header-left">
              <img :src="lineArrow" alt="arrow" width="20px" />
              <span>员工情况</span>
            </div>
            <el-button type="primary" link @click="showDetail(false)">收起</el-button>
          </div>

          <div class="body">
            <div class="left-one">表格</div>
            <div class="main-container">融资规模</div>
            <div class="right-top">本月 新增信息</div>
            <div class="right-bottom">走访热力图</div>
            <div class="bottom-container">AI分析</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import lineArrow from '@/assets/images/bi/line_arrow.png';

  // 控制新页面显示的变量
  const visible = ref(false);

  const showDetail = (bool: boolean) => {
    visible.value = bool;
  };
</script>

<style lang="scss" scoped>
  /* 主页面样式模拟 */
  .main-page {
    position: relative;
    height: 100vh;
    background-color: #f0f2f5;
    padding: 20px;
  }

  /* 1. 右上角按钮定位 */
  .detail-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }

  /* 2. 全屏覆盖层样式 */
  .full-screen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: white; /* 或者 #fff */
    z-index: 2000; /* 确保在最上层，Element Plus 默认遮罩是 2000 左右 */
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: auto;
  }

  .nav {
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* 内容区域简单排版 */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    padding: 12px 16px;
    border-bottom: 0.571px solid #f3f4f6;
    background: linear-gradient(90deg, #f5f3ff 0%, #fefeff 100%);
    .header-left {
      display: flex;
      align-items: center;
      color: #1e2939;
      font-family: 'Alibaba PuHuiTi 3.0';
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: 27px; /* 150% */
      img {
        margin-right: 8px;
      }
    }
  }

  .body {
    position: relative;
    flex: 1;

    .left-one {
      position: absolute;
      top: 0;
      left: 0;
      width: 413px;
      height: 720px;
      border-radius: 16px;
      border: 1px solid #e1e1e1;
      background: #fff;
    }

    .main-container {
      position: absolute;
      top: 14px;
      left: 434px;
      width: 588px;
      height: 572px;
      border-radius: 16px;
      border: 1px solid #e1e1e1;
      background: #fff;
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
    }

    .bottom-container {
      position: absolute;
      top: 604px;
      right: 20px;
      width: 989px;
      height: 137px;
      border-radius: 16px;
      border: 1px solid #e1e1e1;
      background: #fff;
    }
  }

  /* --- 3. 核心动效：淡入并逐渐变大 (Fade + Scale) --- */

  /* 进入和离开的过渡时间与缓动曲线 */
  .fade-scale-enter-active,
  .fade-scale-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* 使用贝塞尔曲线让放大更自然 */
  }

  /* 进入前的状态 (透明，且稍微缩小) */
  .fade-scale-enter-from {
    opacity: 0;
    transform: scale(0.9); /* 从 90% 大小开始变大 */
  }

  /* 离开后的状态 (同上) */
  .fade-scale-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }

  /* 进入完成/离开前的状态 (不透明，正常大小) */
  .fade-scale-enter-to,
  .fade-scale-leave-from {
    opacity: 1;
    transform: scale(1);
  }
</style>
