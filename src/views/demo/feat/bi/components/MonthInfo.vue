<template>
  <div class="card-container">
    <el-card class="custom-card" :body-style="{ padding: '0px' }">
      <div class="header-title">
        <h2>本月 新增信息</h2>
      </div>

      <div class="tabs-container">
        <div
          class="tab-item"
          :class="{ active: currentTab === 'company' }"
          @click="switchTab('company')"
        >
          <div class="tab-label">核心企业</div>
          <div class="tab-number">
            <CountTo :end-val="companyCount" :duration="1500" />
          </div>
        </div>

        <div
          class="tab-item"
          :class="{ active: currentTab === 'project' }"
          @click="switchTab('project')"
        >
          <div class="tab-label">项目数</div>
          <div class="tab-number">
            <CountTo :end-val="projectCount" :duration="1500" />
          </div>
        </div>
      </div>

      <div class="content-area">
        <el-scrollbar height="320px">
          <transition-group name="list-anim" tag="div" class="list-wrapper">
            <template v-if="currentTab === 'company'">
              <div
                v-for="(item, index) in companyList"
                :key="'comp-' + item.id"
                class="list-item company-item"
                :style="{ transitionDelay: `${index * 0.05}s` }"
              >
                {{ item.name }}
              </div>
            </template>

            <template v-if="currentTab === 'project'">
              <div
                v-for="(item, index) in projectList"
                :key="'proj-' + item.id"
                class="list-item project-item"
                :style="{ transitionDelay: `${index * 0.05}s` }"
              >
                <div class="proj-col">
                  <span class="label">资金方</span>
                  <span class="value">{{ item.funder }}</span>
                </div>
                <div class="proj-col">
                  <span class="label">核心企业</span>
                  <span class="value">{{ item.coreCompany }}</span>
                </div>
                <div class="proj-col">
                  <span class="label">预计合作金额</span>
                  <span class="value num-font">{{ item.amount }}</span>
                </div>
              </div>
            </template>
          </transition-group>
        </el-scrollbar>
      </div>
    </el-card>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  // --- 数据模拟 ---
  const currentTab = ref('company'); // 'company' | 'project'

  const companyList = ref([
    { id: 1, name: '华夏智能科技有限公司' },
    { id: 2, name: '九识（苏州）智能科技有限公司' },
    { id: 3, name: '江苏国富氢能技术装备股份有限公司' },
    { id: 4, name: '江苏康隆环境建设工程有限公司' },
    { id: 5, name: '苏州未来电器股份有限公司' },
    { id: 6, name: '江苏新能能源科技集团' },
    { id: 7, name: '苏州高新园区开发有限公司' },
    { id: 8, name: '博众精工科技股份有限公司' },
    { id: 9, name: '江苏恒力化纤股份有限公司' },
    { id: 10, name: '盛虹控股集团有限公司' },
  ]);

  const projectList = ref([
    { id: 1, funder: '江苏银行', coreCompany: '苏宁控股集团', amount: '300,000,000' },
    { id: 2, funder: '南京银行', coreCompany: '苏宁控股集团', amount: '150,000,000' },
    { id: 3, funder: '中国银行', coreCompany: '苏宁控股集团', amount: '500,000,000' },
    { id: 4, funder: '建设银行', coreCompany: '徐工集团', amount: '220,000,000' },
    { id: 5, funder: '工商银行', coreCompany: '徐工集团', amount: '180,000,000' },
    { id: 6, funder: '交通银行', coreCompany: '亨通集团', amount: '400,000,000' },
  ]);

  // 计算 Tab 上的数字
  const companyCount = computed(() => companyList.value.length);
  const projectCount = computed(() => projectList.value.length);

  // 切换 Tab 方法
  const switchTab = (tab) => {
    currentTab.value = tab;
  };

  // --- 内置微组件：数字滚动 (CountTo) ---
  // 在真实项目中，这通常是一个单独的 .vue 文件，这里为了方便展示写在同一个文件里
  import { onMounted, watch } from 'vue';

  const CountTo = {
    props: {
      endVal: { type: Number, required: true },
      duration: { type: Number, default: 2000 },
    },
    setup(props) {
      const displayValue = ref(0);

      const animate = () => {
        const start = 0;
        const end = props.endVal;
        const startTime = performance.now();

        const update = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / props.duration, 1);

          // easeOutQuart 缓动函数
          const ease = 1 - Math.pow(1 - progress, 4);

          displayValue.value = Math.floor(start + (end - start) * ease);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            displayValue.value = end;
          }
        };
        requestAnimationFrame(update);
      };

      onMounted(() => animate());
      // 如果数字会变化，可以监听 props.endVal 重新执行 animate

      return () => displayValue.value; // 渲染函数直接返回数字
    },
  };
</script>

<style scoped lang="scss">
  /* 容器样式 */
  .card-container {
    width: 100%;
    max-width: 500px; /* 限制宽度以模拟移动端或小卡片效果 */
  }

  .custom-card {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  .header-title {
    padding: 20px 20px 10px;
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
    }
  }

  /* Tab 样式 */
  .tabs-container {
    display: flex;
    justify-content: space-around;
    padding-bottom: 10px;
    position: relative;

    /* 底部淡淡的分隔线 */
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background-color: #f0f0f0;
      z-index: 0;
    }
  }

  .tab-item {
    flex: 1;
    text-align: center;
    cursor: pointer;
    padding: 15px 0;
    position: relative;
    transition: all 0.3s;

    /* 未选中状态文字颜色 */
    color: #606266;

    .tab-label {
      font-size: 16px;
      margin-bottom: 5px;
    }

    .tab-number {
      font-size: 32px; /* 大数字 */
      font-weight: bold;
      font-family: 'Arial', sans-serif;
    }

    /* 选中状态 */
    &.active {
      color: #000;

      .tab-number {
        color: #a855f7; /* 紫色高亮 */
      }

      /* 顶部紫色横条 */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 20%;
        right: 20%;
        height: 4px;
        background: linear-gradient(90deg, #c084fc, #a855f7);
        border-radius: 0 0 4px 4px;
      }
    }
  }

  /* 内容区域 */
  .content-area {
    padding: 10px 20px 20px;
    background-color: #fff;
  }

  .list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px; /* 列表项间距 */
    padding-right: 10px; /* 留出滚动条位置 */
    overflow-x: hidden; /* 防止动画产生的横向滚动条 */
  }

  /* 通用列表项样式 */
  .list-item {
    background-color: #f3f0ff; /* 浅紫色背景 */
    border-radius: 8px;
    padding: 16px;
    font-size: 15px;
    color: #333;
    font-weight: 500;
  }

  /* 项目卡片特殊布局 */
  .project-item {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .proj-col {
      display: flex;
      flex-direction: column;
      gap: 4px;

      &:first-child {
        flex: 0.8;
      } /* 资金方 */
      &:nth-child(2) {
        flex: 1.2;
      } /* 核心企业 */
      &:last-child {
        flex: 1.2;
        text-align: right;
      } /* 金额 */

      .label {
        font-size: 12px;
        color: #8c8c8c;
      }
      .value {
        font-size: 14px;
        color: #000;
        font-weight: 600;
      }
      .num-font {
        font-family: 'Arial', sans-serif;
      }
    }
  }

  /* --- Vue TransitionGroup 动效 (从右侧快速进入) --- */
  .list-anim-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .list-anim-leave-active {
    /* 离开时设为绝对定位，避免布局跳动，或者直接隐藏 */
    display: none;
  }

  .list-anim-enter-from {
    opacity: 0;
    transform: translateX(50px); /* 从右偏移50px进入 */
  }
  .list-anim-enter-to {
    opacity: 1;
    transform: translateX(0);
  }
</style>
