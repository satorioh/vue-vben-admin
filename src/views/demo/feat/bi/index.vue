<template>
  <div class="main-page">
    <h1>主页面内容</h1>
    <p>这里是原本的页面...</p>

    <el-button type="primary" class="detail-btn" @click="showDetail(true)"> 详情 </el-button>

    <Transition name="expand-from-tr">
      <div v-if="visible" class="full-screen-overlay">
        <div class="header">
          <div class="header-left">
            <img :src="lineArrow" alt="arrow" width="20px" />
            <span>员工情况</span>
          </div>
          <el-button type="primary" link @click="showDetail(false)">收起</el-button>
        </div>

        <div class="body">
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
    </Transition>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  // 模拟的组件和图片引入，实际使用时请确保路径正确
  import lineArrow from '@/assets/images/bi/line_arrow.png';
  import EmployeeTable from '@/views/demo/feat/bi/components/EmployeeTable.vue';
  import Analysis from '@/views/demo/feat/bi/components/Analysis.vue';
  import VisitHotMap from '@/views/demo/feat/bi/components/VisitHotMap.vue';
  import MonthInfo from '@/views/demo/feat/bi/components/MonthInfo.vue';
  import FinanceChart from '@/views/demo/feat/bi/components/FinanceChart.vue';
  import EmployeePieChart from '@/views/demo/feat/bi/components/EmployeePieChart.vue';
  import ProjectSankey from '@/views/demo/feat/bi/components/ProjectSankeyChart.vue';
  import FeedBack from '@/views/demo/feat/bi/components/FeedBack.vue';

  // 控制新页面显示的变量
  const visible = ref(false);

  const showDetail = (bool: boolean) => {
    visible.value = bool;
  };
</script>

<style lang="scss" scoped>
  /* 主页面样式模拟 */
  .main-page {
    /* 确保父容器是 relative，这样内部的 absolute 子元素才会相对于它定位 */
    position: relative;
    height: 100vh;
    background-color: #f0f2f5;
    padding: 20px;
    /* 添加 overflow: hidden 以防止动画过程中内容溢出边界 */
    overflow: hidden;
  }

  /* 1. 右上角按钮定位 */
  .detail-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
  }

  /* 2. 覆盖层样式调整 */
  .full-screen-overlay {
    /* 【改动点 3】: 从 fixed 改为 absolute */
    position: absolute;
    top: 0;
    left: 0;
    /* 【改动点 4】: 宽高改为 100%，填满父容器 (.main-page) */
    width: 100%;
    height: 100%;
    background-color: white;
    /* z-index 确保盖住原本的内容和按钮 */
    z-index: 100;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: auto;
  }

  /* 内容区域简单排版 (保持不变) */
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
    /* 为了演示效果，给 body 里的内容加一个缩放，防止在小屏幕下撑破布局 */
    transform: scale(1);
    transform-origin: top left;

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
      font-family: 'Alibaba PuHuiTi 3.0';
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px; /* 125% */
    }

    .area-title-gray {
      color: #8c8c8c;
      font-family: 'Alibaba PuHuiTi 3.0';
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px; /* 166.667% */
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
      border: 1px solid var(linear-gradient(145deg, #53eafd 0%, #ad46ff 97.7%), #53eafd);
      background: linear-gradient(
        120deg,
        rgba(239, 253, 255, 0.2) 18.47%,
        rgba(242, 226, 255, 0.2) 81.53%
      );
    }
  }

  /* --- 【改动点 5】: 核心动效调整 --- */

  /* 新的动画名称: expand-from-tr (从右上角展开)
*/
  .expand-from-tr-enter-active,
  .expand-from-tr-leave-active {
    /* 稍微增加了一点时间，让大范围的移动看起来更舒适 */
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
    /* 【关键】：设置变换原点为右上角 */
    transform-origin: top right;
  }

  /* 进入前和离开后的状态 */
  .expand-from-tr-enter-from,
  .expand-from-tr-leave-to {
    opacity: 0;
    /* 【关键】：从完全缩小 (scale(0)) 开始 */
    transform: scale(0);
  }

  /* 进入后和离开前的状态 (保持常态) */
  .expand-from-tr-enter-to,
  .expand-from-tr-leave-from {
    opacity: 1;
    /* 恢复到正常大小 */
    transform: scale(1);
  }
</style>
