<template>
  <div class="sankey-complete-demo">
    <h1>项目资金流向桑基图</h1>
    <p class="description">
      特性：节点16px | 颜色还原 | 标签位于上方 | 垂直自动居中 | 0值节点最小高度
    </p>
    <div class="sankey-container">
      <svg ref="svgRef" width="100%" height="600" @mouseleave="hideTooltip">
        <g v-for="(link, index) in sankeyLinks" :key="`link-${index}`">
          <path
            :d="link.path"
            :fill="link.color"
            :fill-opacity="0.6"
            @mouseenter="showLinkTooltip($event, link)"
            style="transition: fill-opacity 0.3s"
            class="sankey-link"
          />
        </g>

        <g v-for="(node, index) in sankeyNodes" :key="`node-${index}`">
          <rect
            :x="node.x"
            :y="node.y"
            :width="node.width"
            :height="node.height"
            :fill="node.color"
            rx="2"
            ry="2"
            @mouseenter="showNodeTooltip($event, node)"
            class="sankey-node"
          />

          <text
            :x="node.x + node.width / 2"
            :y="node.y - 24"
            text-anchor="middle"
            font-size="16"
            font-weight="bold"
            :fill="node.color"
            style="pointer-events: none"
          >
            {{ node.name }}
          </text>
          <text
            :x="node.x + node.width / 2"
            :y="node.y - 6"
            text-anchor="middle"
            font-size="14"
            fill="#999"
            style="pointer-events: none"
          >
            {{ node.value }}
          </text>
        </g>
      </svg>

      <div v-if="tooltipVisible" class="tooltip" :style="tooltipStyle">
        <span v-html="tooltipText"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, reactive, computed } from 'vue';

  interface Node {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    value: number;
  }

  interface Link {
    source: string;
    target: string;
    value: number;
    path: string;
    color: string;
  }

  export default defineComponent({
    name: 'SankeyCompleteView',
    setup() {
      const svgRef = ref<SVGSVGElement | null>(null);
      const tooltipVisible = ref(false);
      const tooltipText = ref('');
      const tooltipX = ref(0);
      const tooltipY = ref(0);

      // --- 配置项 ---
      const CONFIG = {
        NODE_WIDTH: 16, // 节点宽度
        MIN_NODE_HEIGHT: 1, // 0值或极小值节点的最小高度
        NODE_HEIGHT_RATIO: 20, // 数值转高度的比例 (1数值 = 20px)
        GAP: 80, // 节点之间的垂直间距
        VERTICAL_PADDING: 60, // 顶部留白（给文字留空间）
      };

      // --- 数据源 (颜色已匹配图片) ---
      const rawData = reactive({
        nodes: [
          // 第一层
          { name: '企业项目', color: '#5B8FF9', value: 2 }, // 蓝
          { name: '资金方项目', color: '#F6BD16', value: 3 }, // 黄

          // 第二层
          { name: '新建项目', color: '#00C7E6', value: 5 }, // 青

          // 第三层
          { name: '落地项目', color: '#006D75', value: 0 }, // 深青/墨绿

          // 第四层
          { name: '个人客户', color: '#52C41A', value: 0 }, // 绿
          { name: '公司客户', color: '#D9001B', value: 0 }, // 红
        ],
        links: [
          { source: '企业项目', target: '新建项目', value: 2 },
          { source: '资金方项目', target: '新建项目', value: 3 },
          { source: '新建项目', target: '落地项目', value: 0 },
          { source: '落地项目', target: '个人客户', value: 0 },
          { source: '落地项目', target: '公司客户', value: 0 },
        ],
      });

      // --- 核心计算：节点位置 ---
      const sankeyNodes = computed<Node[]>(() => {
        const horizontalSections = 4; // 分为4列
        // 默认宽度800，如果svgRef未加载
        const sectionWidth = (svgRef.value?.clientWidth || 900) / horizontalSections;

        const levelMap: Record<string, string[]> = {
          '0': ['企业项目', '资金方项目'],
          '1': ['新建项目'],
          '2': ['落地项目'],
          '3': ['个人客户', '公司客户'],
        };

        // 1. 计算每一列的实际渲染高度
        const levelHeights: Record<string, number> = {};

        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          const columnHeight = nodeNames.reduce((sum, name) => {
            const n = rawData.nodes.find((x) => x.name === name);
            const val = n ? n.value : 0;
            // 【核心逻辑】应用最小高度限制
            const h = Math.max(val * CONFIG.NODE_HEIGHT_RATIO, CONFIG.MIN_NODE_HEIGHT);
            return sum + h;
          }, 0);

          // 列总高度 = 节点总高 + 间隙总高
          levelHeights[level] = columnHeight + (nodeNames.length - 1) * CONFIG.GAP;
        });

        // 找出最高的列，用于基准对齐
        const maxLevelHeight = Math.max(...Object.values(levelHeights));
        const nodes: Node[] = [];

        // 2. 生成节点坐标
        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          // x坐标：按列分布，加一点左边距
          const x = sectionWidth * parseInt(level) + 50;

          // y坐标：垂直居中算法
          const currentLevelHeight = levelHeights[level];
          const yOffset = (maxLevelHeight - currentLevelHeight) / 2 + CONFIG.VERTICAL_PADDING;

          let currentY = yOffset;

          nodeNames.forEach((nodeName) => {
            const nodeData = rawData.nodes.find((n) => n.name === nodeName);
            if (!nodeData) return;

            // 计算高度，确保不小于最小值
            const rawHeight = nodeData.value * CONFIG.NODE_HEIGHT_RATIO;
            const height = Math.max(rawHeight, CONFIG.MIN_NODE_HEIGHT);

            nodes.push({
              name: nodeName,
              x,
              y: currentY,
              width: CONFIG.NODE_WIDTH,
              height,
              color: nodeData.color,
              value: nodeData.value,
            });

            // 累加高度用于下一个节点
            currentY += height + CONFIG.GAP;
          });
        });

        return nodes;
      });

      // --- 核心计算：连线路径 ---
      const sankeyLinks = computed<Link[]>(() => {
        // 预处理：按节点分组连接
        const incomingLinks: Record<string, typeof rawData.links> = {};
        const outgoingLinks: Record<string, typeof rawData.links> = {};

        rawData.links.forEach((link) => {
          if (!incomingLinks[link.target]) incomingLinks[link.target] = [];
          if (!outgoingLinks[link.source]) outgoingLinks[link.source] = [];
          incomingLinks[link.target].push(link);
          outgoingLinks[link.source].push(link);
        });

        // 简单的排序逻辑，保证连线顺畅（这里假设数据顺序已经较好）
        // ...（实际项目中可添加根据y坐标排序的逻辑）

        return rawData.links.map((link) => {
          const sourceNode = sankeyNodes.value.find((n) => n.name === link.source);
          const targetNode = sankeyNodes.value.find((n) => n.name === link.target);

          if (!sourceNode || !targetNode) {
            return {
              source: link.source,
              target: link.target,
              value: link.value,
              path: '',
              color: '#ccc',
            };
          }

          // 计算总流量用于比例分配
          const sourceTotalValue =
            outgoingLinks[link.source]?.reduce((sum, l) => sum + l.value, 0) || link.value;
          const targetTotalValue =
            incomingLinks[link.target]?.reduce((sum, l) => sum + l.value, 0) || link.value;

          // 计算当前连接之前的累积值（offset）
          let sourceValOffset = 0;
          for (let l of outgoingLinks[link.source]) {
            if (l.target === link.target && l.value === link.value) break;
            sourceValOffset += l.value;
          }

          let targetValOffset = 0;
          for (let l of incomingLinks[link.target]) {
            if (l.source === link.source && l.value === link.value) break;
            targetValOffset += l.value;
          }

          // 【安全除法】防止 value=0 导致 NaN
          const sourceRatio = sourceTotalValue > 0 ? sourceNode.height / sourceTotalValue : 0;
          const targetRatio = targetTotalValue > 0 ? targetNode.height / targetTotalValue : 0;

          // 计算连线在节点上的高度
          const linkHeightSource = link.value * sourceRatio;
          const linkHeightTarget = link.value * targetRatio;

          // 计算连线中心点Y坐标
          const sourceY = sourceNode.y + sourceValOffset * sourceRatio + linkHeightSource / 2;
          const targetY = targetNode.y + targetValOffset * targetRatio + linkHeightTarget / 2;

          const startX = sourceNode.x + sourceNode.width;
          const endX = targetNode.x;

          // 贝塞尔曲线控制点
          const deltaX = endX - startX;
          const syTop = sourceY - linkHeightSource / 2;
          const syBottom = sourceY + linkHeightSource / 2;
          const tyTop = targetY - linkHeightTarget / 2;
          const tyBottom = targetY + linkHeightTarget / 2;

          const path = `
          M ${startX} ${syTop}
          C ${startX + deltaX * 0.5} ${syTop}, ${startX + deltaX * 0.5} ${tyTop}, ${endX} ${tyTop}
          L ${endX} ${tyBottom}
          C ${startX + deltaX * 0.5} ${tyBottom}, ${startX + deltaX * 0.5} ${syBottom}, ${startX} ${syBottom}
          Z
        `;

          // 颜色策略：默认跟随源节点，"落地项目"特殊处理跟随目标节点
          let linkColor = sourceNode.color;
          if (link.source === '落地项目') {
            const tNode = sankeyNodes.value.find((n) => n.name === link.target);
            if (tNode) linkColor = tNode.color;
          }

          return {
            source: link.source,
            target: link.target,
            value: link.value,
            path,
            color: linkColor,
          };
        });
      });

      // --- 交互与工具 ---
      const showNodeTooltip = (event: MouseEvent, node: Node) => {
        tooltipText.value = `<strong>${node.name}</strong><br />值: ${node.value}`;
        updateTooltipPos(event);
        tooltipVisible.value = true;
      };

      const showLinkTooltip = (event: MouseEvent, link: Link) => {
        tooltipText.value = `${link.source} → ${link.target}<br />流量: ${link.value}`;
        updateTooltipPos(event);
        tooltipVisible.value = true;
      };

      const updateTooltipPos = (event: MouseEvent) => {
        tooltipX.value = event.offsetX + 15;
        tooltipY.value = event.offsetY + 15;
      };

      const hideTooltip = () => {
        tooltipVisible.value = false;
      };

      const tooltipStyle = computed(() => {
        return { left: `${tooltipX.value}px`, top: `${tooltipY.value}px` };
      });

      onMounted(() => {
        // 触发响应式更新
      });

      return {
        svgRef,
        sankeyNodes,
        sankeyLinks,
        tooltipVisible,
        tooltipText,
        tooltipStyle,
        showNodeTooltip,
        showLinkTooltip,
        hideTooltip,
      };
    },
  });
</script>

<style scoped>
  .sankey-complete-demo {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background-color: #f9f9f9;
    min-height: 100vh;
  }

  h1 {
    color: #333;
    margin-bottom: 5px;
  }

  .description {
    color: #666;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .sankey-container {
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
    width: 100%;
    max-width: 900px; /* 匹配设计稿宽度 */
    overflow: hidden;
  }

  .sankey-node {
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .sankey-node:hover {
    opacity: 0.8;
  }

  .sankey-link:hover {
    fill-opacity: 0.8 !important; /* hover高亮 */
  }

  .tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    line-height: 1.5;
    transition:
      top 0.1s,
      left 0.1s;
  }
</style>
