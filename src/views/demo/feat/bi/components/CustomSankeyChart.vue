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
          font-size="12"
          font-weight="400"
          :fill="node.color"
          style="pointer-events: none"
        >
          {{ node.name }}
        </text>
        <text
          :x="node.x + node.width / 2"
          :y="node.y - 6"
          text-anchor="middle"
          font-size="12"
          :fill="node.color"
          style="pointer-events: none"
        >
          {{ node.value }}
        </text>
      </g>
    </svg>

    <div v-if="tooltipVisible" class="tooltip" :style="tooltipStyle">
      <span v-html="tooltipText"></span>
    </div>

    <!--    <div style="position: absolute; bottom: 10px; right: 10px; z-index: 100">-->
    <!--      <button @click="toggleInteraction" style="cursor: pointer; padding: 4px 8px">-->
    <!--        交互: {{ config.INTERACTIVE ? 'ON' : 'OFF' }}-->
    <!--      </button>-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref, reactive, computed } from 'vue';

  // --- 类型定义 ---
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

  // --- 状态 ---
  const svgRef = ref<SVGSVGElement | null>(null);
  const tooltipVisible = ref(false);
  const tooltipText = ref('');
  const tooltipX = ref(0);
  const tooltipY = ref(0);
  // 【修改】同时记录水平和垂直方向的边界状态
  const isNearRightEdge = ref(false);
  const isNearBottomEdge = ref(false);

  // --- 配置项 ---
  const config = reactive({
    NODE_WIDTH: 16,
    MIN_NODE_HEIGHT: 2, // 最小节点高度，防止数值为0时看不见
    NODE_MIN_VALUE: 0.1,
    NODE_OFFSET_X: 40,
    NODE_OFFSET_Y: 10, // 上下边距
    PADDING_Y: 50, // 上下边距
    GAP: 60, // 节点之间的垂直间距
    // 【关键新增】图表内容区域的最大高度限制 (像素)
    // 所有的计算都会基于这个高度进行自动压缩
    MAX_CHART_HEIGHT: 200,
    INTERACTIVE: true, // 默认开启交互
  });

  // --- 原始数据 ---
  const rawData = ref({
    nodes: [] as any[],
    links: [] as any[],
  });

  // 获取显示的文本值
  const getDisplayVal = (type: 'node' | 'link', srcName: string, tgtName?: string) => {
    if (type === 'node') {
      return rawData.value.nodes.find((n) => n.name === srcName)?.display;
    } else {
      return rawData.value.links.find((l) => l.source === srcName && l.target === tgtName)?.display;
    }
  };

  // --- 核心计算 1：节点位置 (自动缩放版) ---
  const sankeyNodes = computed<Node[]>(() => {
    const horizontalSections = 4;
    const sectionWidth = (svgRef.value?.clientWidth || 900) / horizontalSections;

    // 定义层级结构
    const levelMap: Record<string, string[]> = {
      '0': ['企业项目', '资金方项目'],
      '1': ['新建项目'],
      '2': ['落地项目'],
      '3': ['个人客户', '公司客户'],
    };

    // ==========================================
    // 步骤 A: 动态计算最佳的高度比例系数 (Dynamic Ratio)
    // ==========================================

    // 可用于绘制节点的总高度 (总高度 - 上下Padding)
    const availableHeight = config.MAX_CHART_HEIGHT - config.PADDING_Y * 2;

    let minRatio = Infinity; // 我们需要找到最"拥挤"的一列，以它为基准

    Object.values(levelMap).forEach((nodeNames) => {
      // 1. 算出该列所有节点的“数值”总和
      const totalValueInLevel = nodeNames.reduce((sum, name) => {
        const n = rawData.value.nodes.find((x) => x.name === name);
        return sum + (n ? Number(n.value) : 0);
      }, 0);

      // 2. 算出该列间隙占用的总高度 (n个节点有 n-1 个间隙)
      const totalGapsHeight = Math.max(0, nodeNames.length - 1) * config.GAP;

      // 3. 算出留给节点数据的净高度
      const netHeightForNodes = availableHeight - totalGapsHeight;

      // 4. 计算该列的比例: (净高度 / 总数值) = 每 1 数值代表多少像素
      let ratio = 0;
      if (netHeightForNodes > 0 && totalValueInLevel > 0) {
        ratio = netHeightForNodes / totalValueInLevel;
      } else if (totalValueInLevel === 0) {
        ratio = 1; // 如果数值全是0，给个默认比例
      }

      // 5. 取全局最小比例（木桶效应：必须迁就数值最大/最拥挤的那一列）
      if (ratio < minRatio && ratio > 0) {
        minRatio = ratio;
      }
    });

    // 防止数据异常导致 ratio 为 Infinity
    const DYNAMIC_RATIO = minRatio === Infinity ? 1 : minRatio;

    // ==========================================
    // 步骤 B: 使用动态比例生成节点坐标
    // ==========================================

    const levelHeights: Record<string, number> = {};

    // B1. 计算每一列在当前比例下的实际像素高度
    Object.entries(levelMap).forEach(([level, nodeNames]) => {
      const columnHeight = nodeNames.reduce((sum, name) => {
        const n = rawData.value.nodes.find((x) => x.name === name);
        const val = n ? Number(n.value) : 0;
        // 使用 DYNAMIC_RATIO 计算高度
        const h = Math.max(val * DYNAMIC_RATIO, config.MIN_NODE_HEIGHT);
        return sum + h;
      }, 0);
      levelHeights[level] = columnHeight + (nodeNames.length - 1) * config.GAP;
    });

    const maxLevelHeight = Math.max(...Object.values(levelHeights));
    const nodes: Node[] = [];

    // B2. 生成节点对象
    Object.entries(levelMap).forEach(([level, nodeNames]) => {
      const x = sectionWidth * parseInt(level) + config.NODE_OFFSET_X;
      const currentLevelHeight = levelHeights[level];

      // 垂直居中计算
      // 这里的 maxLevelHeight 理论上接近 availableHeight，但也可能因为某列很空而很小
      // 使用 config.MAX_CHART_HEIGHT 进行绝对居中可能更好，这里沿用相对居中
      const contentCenterY = config.MAX_CHART_HEIGHT / 2;
      const startY = contentCenterY - currentLevelHeight / 2 + config.NODE_OFFSET_Y;

      let currentY = startY;

      nodeNames.forEach((nodeName) => {
        const nodeGeoData = rawData.value.nodes.find((n) => n.name === nodeName);
        if (!nodeGeoData) return;

        const rawHeight = Number(nodeGeoData.value) * DYNAMIC_RATIO;
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

  // --- 核心计算 2：连线路径 ---
  const sankeyLinks = computed<Link[]>(() => {
    const incomingLinks: Record<string, typeof rawData.value.links> = {};
    const outgoingLinks: Record<string, typeof rawData.value.links> = {};

    rawData.value.links.forEach((link) => {
      if (!incomingLinks[link.target]) incomingLinks[link.target] = [];
      if (!outgoingLinks[link.source]) outgoingLinks[link.source] = [];
      incomingLinks[link.target].push(link);
      outgoingLinks[link.source].push(link);
    });

    return rawData.value.links.map((link) => {
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
      // 特殊逻辑：落地项目的连线颜色跟随目标
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

  // --- 数据设置 ---
  const setData = () => {
    // 模拟较大数值来测试缩放功能
    const data = {
      enterpriseProjects: 10,
      fundingProjects: 10,
      newProjects: 20,
      landedProjects: 0,
      individualClients: 0,
      companyClients: 0,
    };

    // 填充默认值防止 undefined
    const enterpriseProjects = data.enterpriseProjects || config.NODE_MIN_VALUE;
    const enterpriseProjectsDisplay = data.enterpriseProjects;
    const fundingProjects = data.fundingProjects || config.NODE_MIN_VALUE;
    const fundingProjectsDisplay = data.fundingProjects;
    const newProjects = data.newProjects || config.NODE_MIN_VALUE;
    const newProjectsDisplay = data.newProjects;
    const landedProjects = data.landedProjects || config.NODE_MIN_VALUE;
    const landedProjectsDisplay = data.landedProjects;
    const individualClients = data.individualClients || config.NODE_MIN_VALUE;
    const individualClientsDisplay = data.individualClients;
    const companyClients = data.companyClients || config.NODE_MIN_VALUE;
    const companyClientsDisplay = data.companyClients;

    rawData.value = {
      nodes: [
        {
          name: '企业项目',
          color: '#5680F5',
          value: enterpriseProjects,
          display: enterpriseProjectsDisplay,
        },
        {
          name: '资金方项目',
          color: '#F2BE05',
          value: fundingProjects,
          display: fundingProjectsDisplay,
        },
        {
          name: '新建项目',
          color: '#15C0E6',
          value: newProjects,
          display: newProjectsDisplay,
        },
        {
          name: '落地项目',
          color: '#007D99',
          value: landedProjects,
          display: landedProjectsDisplay,
        },
        {
          name: '个人客户',
          color: '#31A12B',
          value: individualClients,
          display: individualClientsDisplay,
        },
        {
          name: '公司客户',
          color: '#C70612',
          value: companyClients,
          display: companyClientsDisplay,
        },
      ],
      links: [
        {
          source: '企业项目',
          target: '新建项目',
          value: enterpriseProjects,
          display: enterpriseProjectsDisplay,
        },
        {
          source: '资金方项目',
          target: '新建项目',
          value: fundingProjects,
          display: fundingProjectsDisplay,
        },
        {
          source: '新建项目',
          target: '落地项目',
          value: landedProjects,
          display: landedProjectsDisplay,
        },
        {
          source: '落地项目',
          target: '个人客户',
          value: individualClients,
          display: individualClientsDisplay,
        },
        {
          source: '落地项目',
          target: '公司客户',
          value: companyClients,
          display: companyClientsDisplay,
        },
      ],
    };
  };

  // --- 交互处理 ---
  const toggleInteraction = () => {
    config.INTERACTIVE = !config.INTERACTIVE;
    if (!config.INTERACTIVE) {
      hideTooltip();
    }
  };

  const handleNodeHover = (event: MouseEvent, node: Node) => {
    if (!config.INTERACTIVE) return;
    tooltipText.value = `<strong>${node.name}</strong><br />当前值: ${node.value}`;
    updateTooltipPos(event);
    tooltipVisible.value = true;
  };

  const handleLinkHover = (event: MouseEvent, link: Link) => {
    if (!config.INTERACTIVE) return;
    tooltipText.value = `${link.source} → ${link.target}<br />流量: ${link.value}`;
    updateTooltipPos(event);
    tooltipVisible.value = true;
  };

  const updateTooltipPos = (event: MouseEvent) => {
    if (!svgRef.value) return;

    const containerRect = svgRef.value.getBoundingClientRect();

    // 计算鼠标相对于容器的坐标
    const relativeX = event.clientX - containerRect.left;
    const relativeY = event.clientY - containerRect.top;

    // 1. 水平方向判断 (阈值设为 60% 左右)
    if (relativeX > containerRect.width * 0.6) {
      isNearRightEdge.value = true;
      // 靠右：基准点设在鼠标左侧一点
      tooltipX.value = relativeX - 10;
    } else {
      isNearRightEdge.value = false;
      // 靠左：基准点设在鼠标右侧一点
      tooltipX.value = relativeX + 10;
    }

    // 2. 垂直方向判断 (阈值设为 60% 左右)
    if (relativeY > containerRect.height * 0.6) {
      isNearBottomEdge.value = true;
      // 靠下：基准点设在鼠标上方一点
      tooltipY.value = relativeY - 10;
    } else {
      isNearBottomEdge.value = false;
      // 靠上：基准点设在鼠标下方一点
      tooltipY.value = relativeY + 10;
    }
  };

  const hideTooltip = () => {
    tooltipVisible.value = false;
  };

  const tooltipStyle = computed(() => {
    // 定义 X 和 Y 轴的偏移
    // 如果靠右，X轴平移 -100% (自身宽度)
    const translateX = isNearRightEdge.value ? '-100%' : '0';
    // 如果靠下，Y轴平移 -100% (自身高度)
    const translateY = isNearBottomEdge.value ? '-100%' : '0';

    return {
      left: `${tooltipX.value}px`,
      top: `${tooltipY.value}px`,
      // 使用复合 transform 自动处理四个方向
      transform: `translate(${translateX}, ${translateY})`,
    };
  });

  onMounted(() => {
    setData();
  });
</script>

<style lang="scss" scoped>
  .sankey-container {
    background: #fff;
    position: relative;
    width: 100%;
    max-width: 900px;
    /* 这里设置高度对应 config.MAX_CHART_HEIGHT
     确保容器有足够的物理空间显示 SVG
  */
    height: 200px;
    overflow: hidden;
    margin: 0 auto;
  }

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
    pointer-events: none;
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
