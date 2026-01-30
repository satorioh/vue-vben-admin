<template>
  <div class="sankey-complete-demo">
    <h1>项目资金流向桑基图</h1>
    <p class="description"> 特性：数据分离模式 | 图形由几何数据驱动 | 文案由展示数据驱动 </p>
    <div class="sankey-container">
      <svg ref="svgRef" width="100%" height="600" @mouseleave="hideTooltip">
        <g v-for="(link, index) in sankeyLinks" :key="`link-${index}`">
          <path
            :d="link.path"
            :fill="link.color"
            :fill-opacity="0.4"
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
    value: string | number; // 修改：支持字符串显示
  }

  interface Link {
    source: string;
    target: string;
    value: string | number; // 修改：支持字符串显示
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
        NODE_WIDTH: 16,
        MIN_NODE_HEIGHT: 1, // 即使几何数据很小，也保留1px
        NODE_HEIGHT_RATIO: 20, // 几何缩放比例
        GAP: 80,
        VERTICAL_PADDING: 60,
      };

      // --- 1. 几何数据 (Raw Data) ---
      // 作用：仅用于计算图形的高度、粗细、位置。
      // 技巧：这里的数据都是非0的，为了让图形好看，即使业务上是0，这里也给 1 或 2 占位
      const rawData = reactive({
        nodes: [
          { name: '企业项目', color: '#5B8FF9', value: 2 },
          { name: '资金方项目', color: '#F6BD16', value: 3 },
          { name: '新建项目', color: '#00C7E6', value: 5 },
          // 真实业务是0，但为了画出节点，这里给 2
          { name: '落地项目', color: '#006D75', value: 2 },
          // 真实业务是0，但为了画出节点，这里给 1
          { name: '个人客户', color: '#52C41A', value: 1 },
          { name: '公司客户', color: '#D9001B', value: 1 },
        ],
        links: [
          { source: '企业项目', target: '新建项目', value: 2 },
          { source: '资金方项目', target: '新建项目', value: 3 },
          { source: '新建项目', target: '落地项目', value: 5 }, // 即使全部流失，也画一条线表示关系
          { source: '落地项目', target: '个人客户', value: 1 }, // 虚构流量，为了画线
          { source: '落地项目', target: '公司客户', value: 1 }, // 虚构流量，为了画线
        ],
      });

      // --- 2. 展示数据 (Label Data) ---
      // 作用：用于界面显示的真实文案
      const labelData = reactive({
        nodes: [
          { name: '企业项目', display: '2个' },
          { name: '资金方项目', display: '3个' },
          { name: '新建项目', display: '5个' },
          { name: '落地项目', display: '0个' }, // 真实数据
          { name: '个人客户', display: '暂无' },
          { name: '公司客户', display: '暂无' },
        ],
        links: [
          { source: '企业项目', target: '新建项目', display: '2个项目' },
          { source: '资金方项目', target: '新建项目', display: '3个项目' },
          { source: '新建项目', target: '落地项目', display: '转化率 0%' },
          { source: '落地项目', target: '个人客户', display: '0' },
          { source: '落地项目', target: '公司客户', display: '0' },
        ],
      });

      // 辅助函数：查找展示数据
      const getDisplayVal = (type: 'node' | 'link', srcName: string, tgtName?: string) => {
        if (type === 'node') {
          return labelData.nodes.find((n) => n.name === srcName)?.display || '';
        } else {
          return (
            labelData.links.find((l) => l.source === srcName && l.target === tgtName)?.display || ''
          );
        }
      };

      // --- 核心计算：节点位置 ---
      const sankeyNodes = computed<Node[]>(() => {
        const horizontalSections = 4;
        const sectionWidth = (svgRef.value?.clientWidth || 900) / horizontalSections;

        const levelMap: Record<string, string[]> = {
          '0': ['企业项目', '资金方项目'],
          '1': ['新建项目'],
          '2': ['落地项目'],
          '3': ['个人客户', '公司客户'],
        };

        const levelHeights: Record<string, number> = {};

        // 1. 计算高度 (使用 rawData)
        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          const columnHeight = nodeNames.reduce((sum, name) => {
            const n = rawData.nodes.find((x) => x.name === name);
            const val = n ? n.value : 0;
            const h = Math.max(val * CONFIG.NODE_HEIGHT_RATIO, CONFIG.MIN_NODE_HEIGHT);
            return sum + h;
          }, 0);
          levelHeights[level] = columnHeight + (nodeNames.length - 1) * CONFIG.GAP;
        });

        const maxLevelHeight = Math.max(...Object.values(levelHeights));
        const nodes: Node[] = [];

        // 2. 生成节点 (混合 geometry 和 labelData)
        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          const x = sectionWidth * parseInt(level) + 50;
          const currentLevelHeight = levelHeights[level];
          const yOffset = (maxLevelHeight - currentLevelHeight) / 2 + CONFIG.VERTICAL_PADDING;
          let currentY = yOffset;

          nodeNames.forEach((nodeName) => {
            const nodeGeoData = rawData.nodes.find((n) => n.name === nodeName);
            if (!nodeGeoData) return;

            // 几何高度计算
            const rawHeight = nodeGeoData.value * CONFIG.NODE_HEIGHT_RATIO;
            const height = Math.max(rawHeight, CONFIG.MIN_NODE_HEIGHT);

            nodes.push({
              name: nodeName,
              x,
              y: currentY,
              width: CONFIG.NODE_WIDTH,
              height,
              color: nodeGeoData.color,
              // 【关键】这里使用 labelData 的值
              value: getDisplayVal('node', nodeName),
            });

            currentY += height + CONFIG.GAP;
          });
        });

        return nodes;
      });

      // --- 核心计算：连线路径 ---
      const sankeyLinks = computed<Link[]>(() => {
        // 预处理 (使用 rawData)
        const incomingLinks: Record<string, typeof rawData.links> = {};
        const outgoingLinks: Record<string, typeof rawData.links> = {};

        rawData.links.forEach((link) => {
          if (!incomingLinks[link.target]) incomingLinks[link.target] = [];
          if (!outgoingLinks[link.source]) outgoingLinks[link.source] = [];
          incomingLinks[link.target].push(link);
          outgoingLinks[link.source].push(link);
        });

        return rawData.links.map((link) => {
          const sourceNode = sankeyNodes.value.find((n) => n.name === link.source);
          const targetNode = sankeyNodes.value.find((n) => n.name === link.target);

          if (!sourceNode || !targetNode) {
            return {
              source: link.source,
              target: link.target,
              value: 0,
              path: '',
              color: '#ccc',
            };
          }

          // --- 几何计算 (全部基于 rawData 的 value) ---
          const sourceTotalValue =
            outgoingLinks[link.source]?.reduce((sum, l) => sum + l.value, 0) || link.value;
          const targetTotalValue =
            incomingLinks[link.target]?.reduce((sum, l) => sum + l.value, 0) || link.value;

          // 计算 offset
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

          // 比例计算
          const sourceRatio = sourceTotalValue > 0 ? sourceNode.height / sourceTotalValue : 0;
          const targetRatio = targetTotalValue > 0 ? targetNode.height / targetTotalValue : 0;

          // 连线高度 (几何厚度)
          const linkHeightSource = link.value * sourceRatio;
          const linkHeightTarget = link.value * targetRatio;

          // 连线中心点
          const sourceY = sourceNode.y + sourceValOffset * sourceRatio + linkHeightSource / 2;
          const targetY = targetNode.y + targetValOffset * targetRatio + linkHeightTarget / 2;

          // 路径贝塞尔曲线
          const startX = sourceNode.x + sourceNode.width;
          const endX = targetNode.x;
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

          // 颜色处理
          let linkColor = sourceNode.color;
          if (link.source === '落地项目') {
            const tNode = sankeyNodes.value.find((n) => n.name === link.target);
            if (tNode) linkColor = tNode.color;
          }

          return {
            source: link.source,
            target: link.target,
            // 【关键】这里使用 labelData 的值
            value: getDisplayVal('link', link.source, link.target),
            path,
            color: linkColor,
          };
        });
      });

      // --- 交互与工具 ---
      const showNodeTooltip = (event: MouseEvent, node: Node) => {
        tooltipText.value = `<strong>${node.name}</strong><br />当前值: ${node.value}`;
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
        // 触发一次响应式
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
    max-width: 900px;
    overflow: hidden;
  }

  .sankey-node {
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .sankey-node:hover {
    opacity: 0.8;
  }

  .sankey-link {
    cursor: pointer;
    /* 默认透明度在template中设置了 */
  }
  .sankey-link:hover {
    fill-opacity: 0.8 !important;
  }

  .tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 13px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    line-height: 1.6;
    transition:
      top 0.1s,
      left 0.1s;
    white-space: nowrap;
  }
</style>
