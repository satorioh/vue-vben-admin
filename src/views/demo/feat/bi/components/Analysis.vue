<template>
  <div class="ai-analysis-container">
    <div class="ai-card">
      <div class="card-header">
        <span class="icon-sparkle">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
              fill="url(#grad1)"
            />
            <path
              d="M19 18L20.2 20.8L23 22L20.2 23.2L19 26L17.8 23.2L15 22L17.8 20.8L19 18Z"
              fill="url(#grad1)"
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #60a5fa; stop-opacity: 1" />
                <stop offset="100%" style="stop-color: #a855f7; stop-opacity: 1" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span class="title-text">AI分析</span>
      </div>

      <div class="card-content">
        {{ displayedText }}<span v-if="isTyping" class="cursor">|</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  // 完整的文案内容
  const fullText = `本季度超额完成目标（115%），新客户开拓表现突出，客户反馈良好。团队协作主动，跨部门支持获得认可。需注意销售过程记录的系统性，加强复杂项目中的策略灵活性，并建议深化行业竞品学习。望下阶段聚焦存量客户复购率提升，持续发挥攻坚优势，再创佳绩。感谢大家的辛勤付出！ 让我们携手共进，迎接更大的挑战与机遇！`;

  // 响应式状态
  const displayedText = ref('');
  const isTyping = ref(true);

  // 打字机逻辑
  const startTypewriter = () => {
    let index = 0;
    const speed = 40; // 打字速度，越小越快 (毫秒)

    const timer = setInterval(() => {
      // 每次追加一个字符
      if (index < fullText.length) {
        displayedText.value += fullText[index];
        index++;
      } else {
        // 打字结束
        clearInterval(timer);
        isTyping.value = false;
      }
    }, speed);
  };

  onMounted(() => {
    startTypewriter();
  });
</script>

<style scoped>
  /* 容器布局 */
  .ai-analysis-container {
    background-color: #fff;
  }

  /* 核心卡片样式：实现渐变边框的关键 */
  .ai-card {
    position: relative;
    width: 100%;
    padding: 20px 24px;
    border-radius: 12px; /* 圆角 */
    box-sizing: border-box;

    /* * 渐变边框黑科技：
   * 1. 第一层背景是纯白色 (padding-box)
   * 2. 第二层背景是渐变色 (border-box)
   * 3. 设置边框为透明，透出底部的渐变色
   */
    border: 1px solid transparent;
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    background-image:
      linear-gradient(to right, #ffffff, #ffffff),
      /* 内部背景色 */ linear-gradient(90deg, #7dd3fc 0%, #c084fc 100%); /* 边框渐变色：蓝 -> 紫 */

    /* 可选：加一点非常淡的阴影增加立体感 */
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.05);
  }

  /* 头部样式 */
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 8px;
  }

  /* AI分析 标题渐变色 */
  .title-text {
    font-weight: 600;
    font-size: 16px;
    background: linear-gradient(90deg, #60a5fa 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent; /* 让文字透明，透出背景渐变 */
  }

  /* 图标容器微调 */
  .icon-sparkle {
    display: flex;
    align-items: center;
  }

  /* 内容文字样式 */
  .card-content {
    font-size: 14px;
    line-height: 1.8; /* 增加行高，提升可读性 */
    color: #1f2937; /* 深灰黑色 */
    text-align: justify; /* 两端对齐更像文档 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      sans-serif;
  }

  /* 光标闪烁动画 */
  .cursor {
    display: inline-block;
    color: #a855f7;
    font-weight: bold;
    animation: blink 0.8s infinite;
    margin-left: 2px;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
</style>
