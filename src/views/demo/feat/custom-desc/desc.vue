<template>
  <div class="finance-detail-container">
    <el-descriptions border :column="1" label-width="140px" class="finance-desc">
      <el-descriptions-item label="申请融资金额"> 3,600,000.00 元 </el-descriptions-item>

      <el-descriptions-item label="利息" class-name="reset-padding">
        <div class="split-content">
          <div class="inner-cell">91505.56元</div>
          <div class="inner-cell">利率：1%</div>
          <div class="inner-cell">收取方：渤海银行</div>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="保理服务费" class-name="reset-padding">
        <div class="split-content">
          <div class="inner-cell">91505.56元</div>
          <div class="inner-cell">费率：1%</div>
          <div class="inner-cell">收取方：渤海银行</div>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="平台服务费" class-name="reset-padding">
        <div class="split-content">
          <div class="inner-cell">91505.56元</div>
          <div class="inner-cell">费率：2.7%</div>
          <div class="inner-cell">收取方：苏州国发供应链金融服务平台</div>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="担保费" class-name="reset-padding">
        <div class="split-content">
          <div class="inner-cell">91505.56元</div>
          <div class="inner-cell">费率：2.7%</div>
          <div class="inner-cell">收取方：苏州苏园担保</div>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup>
  // 如果是静态展示，无需写额外的 js 逻辑
</script>

<style scoped>
  /* 1. 强制去除包含多列内容的 td 的默认 padding */
  :deep(.finance-desc .reset-padding) {
    padding: 0 !important;
  }

  /* 2. 内部 Flex 布局，撑满高度 */
  .split-content {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: stretch; /* 确保左右文字高度不一致时，边框能拉伸到底 */
  }

  /* 3. 模拟三个独立单元格 */
  .inner-cell {
    flex: 1; /* 平分剩余宽度，如果需要指定某列更宽，可以修改 flex 比例 */
    padding: 12px 15px; /* 还原 el-descriptions 默认的内边距 */
    border-right: 1px solid var(--el-border-color-lighter); /* 完美融入 Element Plus 的边框颜色 */
    display: flex;
    align-items: center;
    color: var(--el-text-color-regular);
  }

  /* 4. 最后一列去掉右边框，避免和外边框重叠 */
  .inner-cell:last-child {
    border-right: none;
  }

  /* （可选）让标签文字颜色变淡，更符合你图片里的视觉效果 */
  :deep(.finance-desc .el-descriptions__label) {
    color: #606266;
  }
</style>
