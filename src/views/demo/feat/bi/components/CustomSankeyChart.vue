<template>
  <div class="sankey-image-demo">
    <h1>项目资金流向桑基图</h1>
    <p class="description">根据图片效果调整：节点16px、颜色匹配、标签上方居中、垂直自动对齐</p>
    <div class="sankey-container">
      <svg ref="svgRef" width="100%" height="600" @mouseleave="hideTooltip">
        <g v-for="(link, index) in sankeyLinks" :key="`link-${index}`">
          <path
            :d="link.path"
            :fill="link.color"
            :fill-opacity="0.6"
            @mouseenter="showLinkTooltip($event, link)"
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
          />
          <text
            :x="node.x + node.width / 2"
            :y="node.y - 25"
            text-anchor="middle"
            font-size="16"
            font-weight="bold"
            :fill="node.color"
          >
            {{ node.name }}
          </text>
          <text
            :x="node.x + node.width / 2"
            :y="node.y - 5"
            text-anchor="middle"
            font-size="16"
            fill="#666"
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
    name: 'SankeyImageDemoView',
    setup() {
      const svgRef = ref<SVGSVGElement | null>(null);
      const tooltipVisible = ref(false);
      const tooltipText = ref('');
      const tooltipX = ref(0);
      const tooltipY = ref(0);

      // 1. 定义数据 (颜色已根据图片调整)
      const rawData = reactive({
        nodes: [
          // 源节点 (左侧)
          { name: '企业项目', color: '#5B8FF9', value: 12 }, // 蓝色
          { name: '资金方项目', color: '#F6BD16', value: 10 }, // 黄色

          // 中间节点
          { name: '新建项目', color: '#00C7E6', value: 5 }, // 青色
          { name: '落地项目', color: '#006D75', value: 4 }, // 深青/墨绿

          // 目标节点 (右侧)
          { name: '个人客户', color: '#52C41A', value: 2 }, // 绿色
          { name: '公司客户', color: '#D9001B', value: 2 }, // 红色
        ],
        links: [
          { source: '企业项目', target: '新建项目', value: 12 },
          { source: '资金方项目', target: '新建项目', value: 4 }, // 修正：原图资金方流向新建项目，逻辑上可能汇聚
          // 注意：原代码逻辑是 flow 汇聚。
          // 根据图片流向：
          // 企业(12) -> 全部流出? 图片显示汇聚成一个大的青色流
          // 资金(10) -> 汇聚
          // 为了视觉还原，这里维持原数据逻辑，重点在于布局算法
          { source: '新建项目', target: '落地项目', value: 4 },
          { source: '落地项目', target: '个人客户', value: 2 },
          { source: '落地项目', target: '公司客户', value: 2 },
        ],
      });

      // 计算节点的位置和尺寸
      const sankeyNodes = computed<Node[]>(() => {
        // 2. 调整节点宽度为 16px
        const nodeWidth = 16;
        const nodeHeightRatio = 20; // 调整高度比例以适应屏幕
        const verticalPadding = 50; // 顶部留白增加，防止文字被遮挡
        const horizontalSections = 4;
        const sectionWidth = (svgRef.value?.clientWidth || 800) / horizontalSections;

        const levelMap: Record<string, string[]> = {
          '0': ['企业项目', '资金方项目'],
          '1': ['新建项目'],
          '2': ['落地项目'],
          '3': ['个人客户', '公司客户'],
        };

        // 3. 计算每一列的总高度，用于垂直居中对齐
        const levelHeights: Record<string, number> = {};
        const GAP = 80; // 节点之间的垂直间距

        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          const totalValue = nodeNames.reduce((sum, name) => {
            const n = rawData.nodes.find((x) => x.name === name);
            return sum + (n ? n.value : 0);
          }, 0);
          // 列高度 = (值的总和 * 比例) + (间隙数量 * 间隙高度)
          levelHeights[level] = totalValue * nodeHeightRatio + (nodeNames.length - 1) * GAP;
        });

        // 找出最高的列，作为基准
        const maxLevelHeight = Math.max(...Object.values(levelHeights));

        const nodes: Node[] = [];

        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          const x = sectionWidth * parseInt(level) + 50;

          // 4. 垂直居中计算的核心逻辑
          // 当前列的高度
          const currentLevelHeight = levelHeights[level];
          // 计算起始 Y 坐标：(最大高度 - 当前高度) / 2 + 基础内边距
          const yOffset = (maxLevelHeight - currentLevelHeight) / 2 + verticalPadding;

          let currentY = yOffset;

          nodeNames.forEach((nodeName) => {
            const nodeData = rawData.nodes.find((n) => n.name === nodeName);
            if (!nodeData) return;

            const height = nodeData.value * nodeHeightRatio;

            nodes.push({
              name: nodeName,
              x,
              y: currentY,
              width: nodeWidth,
              height,
              color: nodeData.color,
              value: nodeData.value,
            });

            currentY += height + GAP;
          });
        });

        return nodes;
      });

      // 计算连接线 (保持原逻辑，微调颜色获取)
      const sankeyLinks = computed<Link[]>(() => {
        const incomingLinks: Record<string, typeof rawData.links> = {};
        const outgoingLinks: Record<string, typeof rawData.links> = {};

        rawData.links.forEach((link) => {
          if (!incomingLinks[link.target]) incomingLinks[link.target] = [];
          if (!outgoingLinks[link.source]) outgoingLinks[link.source] = [];
          incomingLinks[link.target].push(link);
          outgoingLinks[link.source].push(link);
        });

        // 排序逻辑保持不变...
        // (为节省篇幅，省略排序代码，逻辑与原代码一致，主要是为了保证连线不交叉)
        Object.keys(incomingLinks).forEach((targetNodeName) => {
          const targetNode = sankeyNodes.value.find((n) => n.name === targetNodeName);
          if (targetNode) {
            incomingLinks[targetNodeName].sort((a, b) => {
              const aSourceNode = sankeyNodes.value.find((n) => n.name === a.source);
              const bSourceNode = sankeyNodes.value.find((n) => n.name === b.source);
              return (aSourceNode?.y || 0) - (bSourceNode?.y || 0);
            });
          }
        });

        Object.keys(outgoingLinks).forEach((sourceNodeName) => {
          const sourceNode = sankeyNodes.value.find((n) => n.name === sourceNodeName);
          if (sourceNode) {
            outgoingLinks[sourceNodeName].sort((a, b) => {
              const aTargetNode = sankeyNodes.value.find((n) => n.name === a.target);
              const bTargetNode = sankeyNodes.value.find((n) => n.name === b.target);
              return (aTargetNode?.y || 0) - (bTargetNode?.y || 0);
            });
          }
        });

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

          // 连线坐标计算逻辑 (保持原逻辑，只需确保引用了新的 sankeyNodes)
          const sourceTotalValue =
            outgoingLinks[link.source]?.reduce((sum, l) => sum + l.value, 0) || link.value;
          const targetTotalValue =
            incomingLinks[link.target]?.reduce((sum, l) => sum + l.value, 0) || link.value;

          // 简化计算：按顺序堆叠
          // 查找当前 link 在源节点输出中的位置索引和前置值
          let sourceValOffset = 0;
          const sourceLinks = outgoingLinks[link.source];
          for (let l of sourceLinks) {
            if (l.target === link.target && l.value === link.value) break; // 简单匹配
            sourceValOffset += l.value;
          }

          // 查找当前 link 在目标节点输入中的位置索引和前置值
          let targetValOffset = 0;
          const targetLinks = incomingLinks[link.target];
          for (let l of targetLinks) {
            if (l.source === link.source && l.value === link.value) break;
            targetValOffset += l.value;
          }

          // 计算高度比例
          const sourceRatio = sourceNode.height / sourceTotalValue;
          // 注意：这里用 sourceNode.height 代替 value 计算，确保填满节点高度
          // 但如果流出总值 < 节点值(通常桑基图流出=流入)，可能需要修正。这里简化处理。

          const targetRatio = targetNode.height / targetTotalValue;

          const linkHeightSource = link.value * sourceRatio;
          const linkHeightTarget = link.value * targetRatio;

          const sourceY = sourceNode.y + sourceValOffset * sourceRatio + linkHeightSource / 2;
          const targetY = targetNode.y + targetValOffset * targetRatio + linkHeightTarget / 2;

          const startX = sourceNode.x + sourceNode.width;
          const endX = targetNode.x;

          const curvature = 0.5;
          const xi = d3Interpolate(startX, endX, curvature);
          const xf = d3Interpolate(startX, endX, 1 - curvature);

          // 使用简单的贝塞尔曲线，带宽度
          // 为了绘制带状区域，需要计算顶部路径和底部路径

          const syTop = sourceY - linkHeightSource / 2;
          const syBottom = sourceY + linkHeightSource / 2;
          const tyTop = targetY - linkHeightTarget / 2;
          const tyBottom = targetY + linkHeightTarget / 2;

          const deltaX = endX - startX;

          // 调整控制点以获得更像图片的平滑流体感
          const path = `
          M ${startX} ${syTop}
          C ${startX + deltaX / 2} ${syTop}, ${startX + deltaX / 2} ${tyTop}, ${endX} ${tyTop}
          L ${endX} ${tyBottom}
          C ${startX + deltaX / 2} ${tyBottom}, ${startX + deltaX / 2} ${syBottom}, ${startX} ${syBottom}
          Z
        `;

          // 颜色策略：根据图片，连接线颜色通常跟随源节点，或者是渐变。
          // 这里为了匹配图片，我们使用源节点颜色，并降低透明度
          let linkColor = sourceNode.color;
          // 特殊处理：如果是"落地项目"发出的，根据图片看来，是分流成红绿
          // 为了美观，如果目标是 个人客户/公司客户，也可以尝试用目标颜色
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

      // 辅助函数：简单的线性插值
      const d3Interpolate = (a: number, b: number, t: number) => {
        return a + (b - a) * t;
      };

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
        return {
          left: `${tooltipX.value}px`,
          top: `${tooltipY.value}px`,
        };
      });

      onMounted(() => {
        // 这里的逻辑主要是为了触发 computed 的重新计算（如果依赖了 DOM 尺寸）
        // 实际 computed 依赖了响应式数据，会自动更新
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
  .sankey-image-demo {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
      Arial, sans-serif;
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
    border: 1px solid #eee;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
    width: 100%;
    max-width: 900px; /* 限制宽度以匹配图片比例 */
    overflow: hidden;
  }

  .tooltip {
    position: absolute;
    background-color: rgba(50, 50, 50, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    line-height: 1.5;
  }
</style>
