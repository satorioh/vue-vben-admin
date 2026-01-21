<template>
  <div class="ranking-table-container">
    <el-table
      :data="tableData"
      style="width: 100%"
      :header-cell-style="headerStyle"
      :row-class-name="tableRowClassName"
    >
      <el-table-column label="排名" width="64" align="center">
        <template #default="scope">
          <div class="rank-badge">{{ scope.row.rank }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="name" label="姓名" width="54" align="center" />

      <el-table-column prop="orders" label="本月开单" sortable align="center">
        <template #default="scope">
          <span class="text-blue font-bold">{{ scope.row.orders }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="financing" label="本月融资" sortable align="center">
        <template #default="scope">
          <span class="text-purple font-bold">{{ scope.row.financing }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="visits" label="本月走访" sortable align="center">
        <template #default="scope">
          <span class="text-blue-purple font-bold">{{ scope.row.visits }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
  import { reactive } from 'vue';

  // 模拟数据，完全对应图片内容
  const tableData = reactive([
    { rank: 1, name: '张伟', orders: '22.600', financing: '186.5万', visits: '12次' },
    { rank: 2, name: '王杨', orders: '23.500', financing: '215.8万', visits: '12次' }, // 这一行需要高亮
    { rank: 3, name: '李娜', orders: '20.8', financing: '168.2万', visits: '10次' },
    { rank: 4, name: '刘芳', orders: '19.8', financing: '152.3万', visits: '10次' },
    { rank: 5, name: '陈明', orders: '18.5', financing: '142.6万', visits: '9次' },
    { rank: 6, name: '赵丽', orders: '17.2', financing: '135.8万', visits: '10次' },
    { rank: 7, name: '孙杰', orders: '16.8', financing: '128.9万', visits: '112.3万' },
    { rank: 8, name: '周敏', orders: '15.6', financing: '122.5万', visits: '105.8万' },
  ]);

  // 表头样式配置
  const headerStyle = {
    background: '#f8f9fb', // 浅灰背景
    color: '#606266',
    fontWeight: '600',
    height: '60px', // 增加表头高度
  };

  // 核心逻辑：给特定行添加类名
  // 这里我们判断如果排名是2，就添加 'highlight-row' 类
  const tableRowClassName = ({ row }) => {
    if (row.rank === 2) {
      return 'highlight-row';
    }
    return '';
  };
</script>

<style lang="scss" scoped>
  .ranking-table-container {
  }

  // 1. 排名徽章样式
  .rank-badge {
    display: inline-block;
    width: 32px;
    height: 32px;
    line-height: 32px;
    background-color: #f3f0ff; /* 浅紫色背景 */
    color: #8b5cf6; /* 深紫色文字 */
    border-radius: 6px;
    font-weight: bold;
    font-size: 16px;
    border: 1px solid #e9d5ff;
  }

  // 2. 文字颜色工具类
  .text-blue {
    color: #3b82f6;
    font-size: 16px;
  }
  .text-purple {
    color: #a855f7;
    font-size: 16px;
  }
  .text-blue-purple {
    color: #6366f1; // 介于蓝紫之间
    font-size: 16px;
  }
  .font-bold {
    font-weight: bold;
  }

  // 3. 高亮行样式 (Deep selector用于穿透Element Plus的默认样式)
  :deep(.el-table) {
    // 每一行的高度稍微加大
    .el-table__row {
      height: 70px;
    }

    // 定义高亮行的背景色
    .highlight-row {
      background-color: #f3f0ff !important; // 强制覆盖原背景

      // 鼠标悬停时保持颜色，避免变白
      &:hover > td.el-table__cell {
        background-color: #f3f0ff !important;
      }

      // 实现左侧那个紫色的竖条
      td:first-child {
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px; // 距离顶部距离
          bottom: 10px; // 距离底部距离
          width: 4px; // 竖条宽度
          background-color: #8b5cf6; // 竖条颜色
          border-radius: 0 4px 4px 0;
        }
      }
    }
  }
</style>
