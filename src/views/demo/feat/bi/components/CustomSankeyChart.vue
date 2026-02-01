<template>
  <div class="sankey-container" :class="{ 'interactive-disabled': !config.INTERACTIVE }">
    <svg ref="svgRef" width="100%" height="100%" @mouseleave="hideTooltip">
      <g v-for="(link, index) in sankeyLinks" :key="`link-${index}`">
        <path
          :d="link.path"
          :fill="link.color"
          :fill-opacity="0.4"
          @mouseenter="handleLinkHover($event, link)"
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
          @mouseenter="handleNodeHover($event, node)"
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
</template>

<script lang="ts" setup>
  import { onMounted, ref, reactive, computed } from 'vue';

  interface Node {
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    value: string | number;
  }

  interface Link {
    source: string;
    target: string;
    value: string | number;
    path: string;
    color: string;
  }

  const svgRef = ref<SVGSVGElement | null>(null);
  const tooltipVisible = ref(false);
  const tooltipText = ref('');
  const tooltipX = ref(0);
  const tooltipY = ref(0);

  // --- 配置项 ---
  const config = reactive({
    NODE_WIDTH: 16,
    MIN_NODE_HEIGHT: 1,
    NODE_HEIGHT_RATIO: 8,
    NODE_MIN_VALUE: 0.1,
    GAP: 60,
    VERTICAL_PADDING: 60,
    // 【新增】交互总开关
    INTERACTIVE: false,
  });

  // --- 1. 几何数据 (Raw Data) ---
  const rawData = reactive({
    nodes: [
      { name: '企业项目', color: '#5B8FF9', value: 2 },
      { name: '资金方项目', color: '#F6BD16', value: 3 },
      { name: '新建项目', color: '#00C7E6', value: 5 },
      { name: '落地项目', color: '#006D75', value: 0.1 },
      { name: '个人客户', color: '#52C41A', value: 0.1 },
      { name: '公司客户', color: '#D9001B', value: 0.1 },
    ],
    links: [
      { source: '企业项目', target: '新建项目', value: 2 },
      { source: '资金方项目', target: '新建项目', value: 3 },
      { source: '新建项目', target: '落地项目', value: 0.1 },
      { source: '落地项目', target: '个人客户', value: 0.1 },
      { source: '落地项目', target: '公司客户', value: 0.1 },
    ],
  });

  // --- 2. 展示数据 (Label Data) ---
  const labelData = reactive({
    nodes: [
      { name: '企业项目', display: '2个' },
      { name: '资金方项目', display: '3个' },
      { name: '新建项目', display: '5个' },
      { name: '落地项目', display: '0个' },
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

    Object.entries(levelMap).forEach(([level, nodeNames]) => {
      const columnHeight = nodeNames.reduce((sum, name) => {
        const n = rawData.nodes.find((x) => x.name === name);
        const val = n ? n.value : 0;
        const h = Math.max(val * config.NODE_HEIGHT_RATIO, config.MIN_NODE_HEIGHT);
        return sum + h;
      }, 0);
      levelHeights[level] = columnHeight + (nodeNames.length - 1) * config.GAP;
    });

    const maxLevelHeight = Math.max(...Object.values(levelHeights));
    const nodes: Node[] = [];

    Object.entries(levelMap).forEach(([level, nodeNames]) => {
      const x = sectionWidth * parseInt(level) + 50;
      const currentLevelHeight = levelHeights[level];
      const yOffset = (maxLevelHeight - currentLevelHeight) / 2 + config.VERTICAL_PADDING;
      let currentY = yOffset;

      nodeNames.forEach((nodeName) => {
        const nodeGeoData = rawData.nodes.find((n) => n.name === nodeName);
        if (!nodeGeoData) return;

        const rawHeight = nodeGeoData.value * config.NODE_HEIGHT_RATIO;
        const height = Math.max(rawHeight, config.MIN_NODE_HEIGHT);

        nodes.push({
          name: nodeName,
          x,
          y: currentY,
          width: config.NODE_WIDTH,
          height,
          color: nodeGeoData.color,
          value: getDisplayVal('node', nodeName),
        });

        currentY += height + config.GAP;
      });
    });

    return nodes;
  });

  // --- 核心计算：连线路径 ---
  const sankeyLinks = computed<Link[]>(() => {
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

      const sourceTotalValue =
        outgoingLinks[link.source]?.reduce((sum, l) => sum + l.value, 0) || link.value;
      const targetTotalValue =
        incomingLinks[link.target]?.reduce((sum, l) => sum + l.value, 0) || link.value;

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

      const sourceRatio = sourceTotalValue > 0 ? sourceNode.height / sourceTotalValue : 0;
      const targetRatio = targetTotalValue > 0 ? targetNode.height / targetTotalValue : 0;

      const linkHeightSource = link.value * sourceRatio;
      const linkHeightTarget = link.value * targetRatio;

      const sourceY = sourceNode.y + sourceValOffset * sourceRatio + linkHeightSource / 2;
      const targetY = targetNode.y + targetValOffset * targetRatio + linkHeightTarget / 2;

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

      let linkColor = sourceNode.color;
      if (link.source === '落地项目') {
        const tNode = sankeyNodes.value.find((n) => n.name === link.target);
        if (tNode) linkColor = tNode.color;
      }

      return {
        source: link.source,
        target: link.target,
        value: getDisplayVal('link', link.source, link.target),
        path,
        color: linkColor,
      };
    });
  });

  // --- 交互控制 ---

  // 切换开关
  const toggleInteraction = () => {
    config.INTERACTIVE = !config.INTERACTIVE;
    if (!config.INTERACTIVE) {
      hideTooltip();
    }
  };

  const handleNodeHover = (event: MouseEvent, node: Node) => {
    if (!config.INTERACTIVE) return; // 逻辑层拦截
    tooltipText.value = `<strong>${node.name}</strong><br />当前值: ${node.value}`;
    updateTooltipPos(event);
    tooltipVisible.value = true;
  };

  const handleLinkHover = (event: MouseEvent, link: Link) => {
    if (!config.INTERACTIVE) return; // 逻辑层拦截
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
    // Init
  });
</script>

<style lang="scss" scoped>
  .sankey-container {
    background: #fff;
    position: relative;
    width: 100%;
    max-width: 900px;
    overflow: hidden;
    flex: 1;
  }

  /* --- 关键 CSS 修改 --- */

  /* 1. 默认状态：有鼠标手势 */
  .sankey-node {
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .sankey-link {
    cursor: pointer;
    /* transition 在行内样式里定义了 */
  }

  /* 2. 默认状态：Hover效果生效 */
  .sankey-container:not(.interactive-disabled) .sankey-node:hover {
    opacity: 0.8;
  }
  .sankey-container:not(.interactive-disabled) .sankey-link:hover {
    fill-opacity: 0.8 !important;
  }

  /* 3. 禁用状态：禁用所有鼠标事件 */
  .interactive-disabled svg {
    pointer-events: none; /* 穿透点击，不触发任何鼠标事件 */
  }

  /* --- 结束关键 CSS 修改 --- */

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
