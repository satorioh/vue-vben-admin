<template>
  <div class="feedback-wrapper">
    <el-popconfirm
      width="200"
      :title="`确认要给 ${employeeName} 的【${type}】点赞吗？`"
      confirm-button-text="确认"
      cancel-button-text="取消"
      @confirm="handleAction('like')"
    >
      <template #reference>
        <div class="icon-btn like-btn">
          <img :src="Zan" alt="like" width="16" />
        </div>
      </template>
    </el-popconfirm>

    <el-popconfirm
      width="200"
      :title="`确认要给 ${employeeName} 的【${type}】点踩吗？`"
      confirm-button-text="确认"
      cancel-button-text="取消"
      @confirm="handleAction('dislike')"
    >
      <template #reference>
        <div class="icon-btn dislike-btn">
          <img :src="Cai" alt="dislike" width="16" />
        </div>
      </template>
    </el-popconfirm>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import Zan from '@/assets/images/bi/zan.png';
  import Cai from '@/assets/images/bi/cai.png';
  import { ElMessage } from 'element-plus';

  // 1. 定义 Props
  const props = defineProps({
    // 员工姓名
    employeeName: {
      type: String,
      required: true,
      default: '员工',
    },
    // 点赞类型（如：融资规模、走访热力图）
    type: {
      type: String,
      required: true,
      default: '通用',
    },
  });

  // 定义事件
  const emit = defineEmits(['submit-feedback']);

  // 当前状态：'none' | 'like' | 'dislike'
  const currentStatus = ref('none');

  // 处理点击确认后的逻辑
  const handleAction = (action) => {
    // 更新本地状态（可选，看业务是否需要互斥）
    currentStatus.value = action;

    // 模拟提示
    const actionText = action === 'like' ? '点赞' : '点踩';
    ElMessage.success(`已确认对 ${props.employeeName} 的 ${props.type} 进行${actionText}`);

    // 向父组件发送数据，包含 姓名、类型、操作行为
    emit('submit-feedback', {
      name: props.employeeName,
      businessType: props.type,
      action: action,
    });
  };
</script>

<style scoped>
  .feedback-wrapper {
    display: flex;
    align-items: center;
    gap: 10px; /* 图标之间的间距 */
  }

  .icon-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
    //transition: all 0.3s;
    color: #409eff; /* Element Plus 标准蓝 */
  }

  /* 鼠标悬停效果 */
  .icon-btn:hover {
    background-color: #ecf5ff;
  }

  /* 针对图标大小的微调 */
  :deep(.el-icon) {
    font-size: 32px; /* 根据图片调整图标大小 */
    stroke-width: 2px; /* 如果是 SVG 图标，增加线条粗细 */
  }
</style>
