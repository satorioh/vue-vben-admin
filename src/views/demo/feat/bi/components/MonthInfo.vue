<template>
  <div class="card-container">
    <el-card
      class="custom-card"
      :body-style="{ padding: '0px', height: '100%', display: 'flex', flexDirection: 'column' }"
    >
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
            <CountTo :end-val="companyCount" :duration="1000" />
          </div>
        </div>

        <div
          class="tab-item supplier-tab"
          :class="{ active: currentTab === 'supplier' }"
          @click="switchTab('supplier')"
        >
          <div class="tab-label">供应商</div>
          <div class="tab-number supplier-number">
            <CountTo :end-val="supplierCount" :duration="1000" />
          </div>
        </div>

        <div
          class="tab-item"
          :class="{ active: currentTab === 'project' }"
          @click="switchTab('project')"
        >
          <div class="tab-label">项目数</div>
          <div class="tab-number project-number">
            <CountTo :end-val="projectCount" :duration="1000" />
          </div>
        </div>
      </div>

      <div class="content-area">
        <el-scrollbar class="no-scrollbar">
          <transition-group name="list-anim" tag="div" class="list-wrapper">
            <template v-if="currentTab === 'company'">
              <div
                v-for="(item, index) in companyList"
                :key="'comp-' + item.id"
                class="li-item company-item"
                :style="{ transitionDelay: `${index * 0.05}s` }"
              >
                {{ item.name }}
              </div>
            </template>

            <template v-if="currentTab === 'supplier'">
              <div
                v-for="(item, index) in supplierList"
                :key="'supp-' + item.id"
                class="li-item supplier-item"
                :style="{ transitionDelay: `${index * 0.05}s` }"
              >
                {{ item.name }}
              </div>
            </template>

            <template v-if="currentTab === 'project'">
              <div
                v-for="(item, index) in projectList"
                :key="'proj-' + item.id"
                class="li-item project-item"
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
  import { ref, computed, onMounted } from 'vue';

  // --- 数据模拟 ---
  const currentTab = ref('company'); // 'company' | 'supplier' | 'project'

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

  // 新增：供应商数据
  const supplierList = ref([
    { id: 1, name: '苏州精密机械部件厂' },
    { id: 2, name: '江苏宏达电子元器件有限公司' },
    { id: 3, name: '常州新材料供应中心' },
    { id: 4, name: '无锡自动化设备配套厂' },
    { id: 5, name: '昆山物流运输服务有限公司' },
    { id: 6, name: '南京环保包装材料厂' },
    { id: 7, name: '苏州工业园区建材配送' },
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
  const supplierCount = computed(() => supplierList.value.length); // 新增
  const projectCount = computed(() => projectList.value.length);

  // 切换 Tab 方法
  const switchTab = (tab) => {
    currentTab.value = tab;
  };

  // --- 内置微组件：数字滚动 (CountTo) ---
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
      // 简单起见，这里没做 watch 监听 endVal 变化
      return () => displayValue.value;
    },
  };
</script>

<style scoped lang="scss">
  /* 容器样式 */
  .card-container {
    width: 100%;
    height: 100%;
    max-width: 500px;
    overflow: hidden;
    border-radius: 16px;
  }

  .custom-card {
    height: 100%;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    border: none;
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
    position: relative;

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
    color: #606266;

    .tab-label {
      font-size: 16px;
      margin-bottom: 5px;
    }

    .tab-number {
      font-size: 32px;
      font-weight: bold;
      font-family: 'Arial', sans-serif;
    }

    /* 选中状态 */
    &.active {
      color: #000;

      /* 默认紫色 (核心企业) */
      .tab-number {
        color: #a855f7;
      }

      /* 顶部横条默认颜色 (核心企业) */
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

      /* --- 新增：供应商 Tab 选中样式 --- */
      &.supplier-tab {
        .tab-number.supplier-number {
          color: #4799ff; /* 蓝色高亮 */
        }
        /* 供应商顶部横条改为蓝色渐变以匹配文字 */
        &::before {
          background: linear-gradient(90deg, #7bb7ff, #4799ff);
        }
      }

      /* 项目 Tab 选中样式 */
      .tab-number.project-number {
        color: #7075ff; /* 原有的蓝色/紫色 */
      }
    }
  }

  /* 内容区域 */
  .content-area {
    padding: 10px 20px 20px;
    background-color: #fff;
    flex: 1;
    overflow: hidden;
  }

  .content-area :deep(.no-scrollbar) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .content-area :deep(.no-scrollbar .el-scrollbar__bar) {
    display: none !important;
  }
  .content-area :deep(.no-scrollbar .el-scrollbar__wrap) {
    scrollbar-width: none;
  }
  .content-area :deep(.no-scrollbar .el-scrollbar__wrap::-webkit-scrollbar) {
    width: 0;
    height: 0;
  }

  .list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding-right: 10px;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  /* 通用列表项样式 */
  .li-item {
    border-radius: 10px;
    padding: 6px 10px;
    color: #1e2939;
    font-family: 'Alibaba PuHuiTi 3.0';
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
  }

  /* 核心企业背景 */
  .company-item {
    background: linear-gradient(90deg, #f4eaff 0%, #fff 100%);
  }

  /* --- 新增：供应商背景 (浅蓝渐变) --- */
  .supplier-item {
    background: linear-gradient(90deg, #e6f1ff 0%, #fff 100%);
  }

  /* 项目背景 */
  .project-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(90deg, #eaeaff 0%, #fff 100%);

    .proj-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
      &:first-child {
        flex: 0.8;
      }
      &:nth-child(2) {
        flex: 1.2;
      }
      &:last-child {
        flex: 1.2;
        text-align: right;
      }

      .label {
        font-size: 12px;
        color: #8c8c8c;
      }
      .value {
        font-size: 14px;
        color: #000;
        font-weight: 500;
      }
    }
  }

  /* 动效 */
  .list-anim-enter-active {
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  .list-anim-leave-active {
    display: none;
  }
  .list-anim-enter-from {
    opacity: 0;
    transform: translateX(50px);
  }
  .list-anim-enter-to {
    opacity: 1;
    transform: translateX(0);
  }
</style>
