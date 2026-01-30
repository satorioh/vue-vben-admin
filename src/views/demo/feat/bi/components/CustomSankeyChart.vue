<template>
  <div class="sankey-image-demo">
    <h1>项目资金流向桑基图</h1>
    <p class="description">根据提供的图片实现项目资金流向可视化</p>
    <div class="sankey-container">
      <svg ref="svgRef" width="100%" height="600" @mouseleave="hideTooltip">
        <!-- 连接线 -->
        <g v-for="(link, index) in sankeyLinks" :key="`link-${index}`">
          <path
            :d="link.path"
            :fill="link.color"
            :opacity="0.5"
            @mouseenter="showLinkTooltip($event, link)"
          />
        </g>

        <!-- 节点 -->
        <g v-for="(node, index) in sankeyNodes" :key="`node-${index}`">
          <rect
            :x="node.x"
            :y="node.y"
            :width="node.width"
            :height="node.height"
            :fill="node.color"
            rx="4"
            ry="4"
            @mouseenter="showNodeTooltip($event, node)"
          />
          <text
            :x="node.x + node.width + 10"
            :y="node.y + node.height / 2"
            alignment-baseline="middle"
            font-size="14"
            fill="#333"
          >
            {{ node.name }}
          </text>
        </g>
      </svg>

      <!-- 工具提示 -->
      <div v-if="tooltipVisible" class="tooltip" :style="tooltipStyle">
        {{ tooltipText }}
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

      // 颜色转换辅助函数
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
      };

      const rgbToHex = (r: number, g: number, b: number) => {
        return (
          '#' +
          ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
            .toString(16)
            .slice(1)
        );
      };

      const rgbToHsl = (r: number, g: number, b: number) => {
        (r /= 255), (g /= 255), (b /= 255);
        const max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        let h = 0,
          s = 0,
          l = (max + min) / 2;

        if (max === min) {
          h = s = 0; // achromatic
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h *= 60;
        }

        return { h, s, l };
      };

      const hslToRgb = (h: number, s: number, l: number) => {
        let r: number, g: number, b: number;

        if (s === 0) {
          r = g = b = l; // achromatic
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
          };

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h / 360 + 1 / 3) * 255;
          g = hue2rgb(p, q, h / 360) * 255;
          b = hue2rgb(p, q, h / 360 - 1 / 3) * 255;
        }

        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      };

      // 定义数据
      const rawData = reactive({
        nodes: [
          // 源节点
          { name: '企业项目', color: '#3498db', value: 12 },
          { name: '资金方项目', color: '#2ecc71', value: 10 },

          // 中间节点
          { name: '新建项目', color: '#e74c3c', value: 5 },
          { name: '落地项目', color: '#9b59b6', value: 4 },

          // 目标节点
          { name: '个人客户', color: '#27ae60', value: 2 },
          { name: '公司客户', color: '#e74c3c', value: 2 },
        ],
        links: [
          // 企业项目流向
          { source: '企业项目', target: '新建项目', value: 12 },

          // 资金方项目流向
          { source: '资金方项目', target: '新建项目', value: 4 },

          // 新建项目流向
          { source: '新建项目', target: '落地项目', value: 4 },

          // 落地项目流向
          { source: '落地项目', target: '个人客户', value: 2 },
          { source: '落地项目', target: '公司客户', value: 2 },
        ],
      });

      // 计算节点的位置和尺寸
      const sankeyNodes = computed<Node[]>(() => {
        const nodeWidth = 20;
        const nodeHeightRatio = 30; // 每单位值的高度
        const verticalPadding = 20;
        const horizontalSections = 4; // 将宽度分为4个部分
        const sectionWidth = (svgRef.value?.clientWidth || 800) / horizontalSections;

        // 按层级分组节点
        const levelMap: Record<string, string[]> = {
          '0': ['企业项目', '资金方项目'],
          '1': ['新建项目'],
          '2': ['落地项目'],
          '3': ['个人客户', '公司客户'],
        };

        const nodes: Node[] = [];

        Object.entries(levelMap).forEach(([level, nodeNames]) => {
          const x = sectionWidth * parseInt(level) + 50;
          const totalValue = nodeNames.reduce((sum, nodeName) => {
            const nodeData = rawData.nodes.find((n) => n.name === nodeName);
            return sum + (nodeData ? nodeData.value : 0);
          }, 0);

          let currentY = verticalPadding;

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

            currentY += height + 10; // 10px 间距
          });
        });

        return nodes;
      });

      // 计算连接线
      const sankeyLinks = computed<Link[]>(() => {
        // 首先计算每个节点的所有流入和流出连接
        const incomingLinks: Record<string, typeof rawData.links> = {};
        const outgoingLinks: Record<string, typeof rawData.links> = {};

        rawData.links.forEach((link) => {
          if (!incomingLinks[link.target]) incomingLinks[link.target] = [];
          if (!outgoingLinks[link.source]) outgoingLinks[link.source] = [];

          incomingLinks[link.target].push(link);
          outgoingLinks[link.source].push(link);
        });

        // 对每个节点的流入和流出连接按垂直位置排序
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
          // 查找源节点和目标节点
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

          // 计算流入连接在目标节点上的起始位置
          const incomingIndex =
            incomingLinks[targetNode.name]?.findIndex(
              (l) => l.source === link.source && l.target === link.target,
            ) ?? 0;
          const totalIncoming = incomingLinks[targetNode.name]?.length ?? 1;

          // 计算源节点和目标节点的垂直比例
          const sourceTotalValue =
            outgoingLinks[link.source]?.reduce((sum, l) => sum + l.value, 0) || link.value;
          const sourceProportion = link.value / sourceTotalValue;

          const targetTotalValue =
            incomingLinks[link.target]?.reduce((sum, l) => sum + l.value, 0) || link.value;
          const targetProportion = link.value / targetTotalValue;

          // 初始化源节点的垂直位置
          let sourceStartY = sourceNode.y + (sourceNode.height * (1 - sourceProportion)) / 2;
          let sourceEndY =
            sourceNode.y + sourceNode.height - (sourceNode.height * (1 - sourceProportion)) / 2;

          // 如果源节点有多个流出连接，需要按比例分配垂直空间
          if (outgoingLinks[link.source] && outgoingLinks[link.source].length > 1) {
            // 计算每个流出连接在源节点上占据的垂直位置
            const sourceValueSum = outgoingLinks[link.source].reduce((sum, l) => sum + l.value, 0);
            let currentYPos = sourceNode.y;

            for (let i = 0; i < outgoingLinks[link.source].length; i++) {
              const currentLink = outgoingLinks[link.source][i];
              if (currentLink.source === link.source && currentLink.target === link.target) {
                // 计算该连接在源节点上的垂直位置
                const proportion = currentLink.value / sourceValueSum;
                sourceStartY = currentYPos;
                sourceEndY = currentYPos + sourceNode.height * proportion;
                break;
              } else {
                // 累加前面连接的高度
                const prevProportion = currentLink.value / sourceValueSum;
                currentYPos += sourceNode.height * prevProportion;
              }
            }
          }

          // 初始化目标节点的垂直位置
          let targetStartY = targetNode.y + (targetNode.height * (1 - targetProportion)) / 2;
          let targetEndY =
            targetNode.y + targetNode.height - (targetNode.height * (1 - targetProportion)) / 2;

          // 如果目标节点有多个流入连接，需要按比例分配垂直空间
          if (incomingLinks[link.target] && incomingLinks[link.target].length > 1) {
            // 计算每个流入连接在目标节点上占据的垂直位置
            const targetValueSum = incomingLinks[link.target].reduce((sum, l) => sum + l.value, 0);
            let currentYPos = targetNode.y;

            for (let i = 0; i < incomingLinks[link.target].length; i++) {
              const currentLink = incomingLinks[link.target][i];
              if (currentLink.source === link.source && currentLink.target === link.target) {
                // 计算该连接在目标节点上的垂直位置
                const proportion = currentLink.value / targetValueSum;
                targetStartY = currentYPos;
                targetEndY = currentYPos + targetNode.height * proportion;
                break;
              } else {
                // 累加前面连接的高度
                const prevProportion = currentLink.value / targetValueSum;
                currentYPos += targetNode.height * prevProportion;
              }
            }
          }

          // 计算贝塞尔曲线路径
          const startX = sourceNode.x + sourceNode.width;
          const startY = (sourceStartY + sourceEndY) / 2; // 中心点
          const endX = targetNode.x;
          const endY = (targetStartY + targetEndY) / 2; // 中心点

          // 控制点 - 创建平滑的曲线
          const controlX1 = startX + (endX - startX) * 0.3;
          const controlX2 = startX + (endX - startX) * 0.7;

          // 计算连接线的上下边界
          const sourceHalfHeight = (sourceEndY - sourceStartY) / 2;
          const targetHalfHeight = (targetEndY - targetStartY) / 2;

          // 创建一个封闭路径形成带状连接
          const path = `
          M${startX},${startY - sourceHalfHeight}
          C${controlX1},${startY - sourceHalfHeight} ${controlX2},${
            endY - targetHalfHeight
          } ${endX},${endY - targetHalfHeight}
          L${endX},${endY + targetHalfHeight}
          C${controlX2},${endY + targetHalfHeight} ${controlX1},${
            startY + sourceHalfHeight
          } ${startX},${startY + sourceHalfHeight}
          Z
        `;

          // 根据源节点颜色确定连线颜色，并为同一源节点的不同流出连接添加颜色变化
          const sourceNodeData = rawData.nodes.find((n) => n.name === link.source);

          // 对于从'落地项目'出发的连接线，使用目标节点的颜色
          let color;
          if (link.source === '落地项目') {
            const targetNodeData = rawData.nodes.find((n) => n.name === link.target);
            color = targetNodeData ? targetNodeData.color : '#ccc';
          } else {
            // 其他情况下继续使用源节点的颜色
            color = sourceNodeData ? sourceNodeData.color : '#ccc';
          }

          // 获取当前连接在其源节点的流出连接中的索引
          const sourceLinks = outgoingLinks[link.source] || [];
          const linkIndex = sourceLinks.findIndex(
            (l) => l.source === link.source && l.target === link.target,
          );

          // 为同一源节点的不同流出连接创建略有不同的颜色
          if (sourceLinks.length > 1 && linkIndex >= 0) {
            // 使用HSL颜色空间调整色调以创建不同但协调的颜色
            const baseRgb = hexToRgb(color);
            if (baseRgb) {
              // 根据连接索引轻微调整颜色
              const hueShift = (linkIndex * 30) % 360; // 色相偏移
              const saturationAdjust = 0.8 + linkIndex * 0.1; // 饱和度微调
              const lightnessAdjust = 0.7 + linkIndex * 0.05; // 亮度微调

              // 将RGB转换为HSL并调整
              const hsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
              const adjustedColor = hslToRgb(
                (hsl.h + hueShift) % 360,
                Math.min(hsl.s * saturationAdjust, 1),
                Math.min(hsl.l * lightnessAdjust, 1),
              );

              color = rgbToHex(adjustedColor.r, adjustedColor.g, adjustedColor.b);
            }
          }

          return {
            source: link.source,
            target: link.target,
            value: link.value,
            path,
            color,
          };
        });
      });

      // 显示节点工具提示
      const showNodeTooltip = (event: MouseEvent, node: Node) => {
        tooltipText.value = `${node.name}<br />值: ${node.value}`;
        tooltipX.value = event.offsetX + 10;
        tooltipY.value = event.offsetY - 10;
        tooltipVisible.value = true;
      };

      // 显示链接工具提示
      const showLinkTooltip = (event: MouseEvent, link: Link) => {
        tooltipText.value = `${link.source} → ${link.target}<br />流量: ${link.value}`;
        tooltipX.value = event.offsetX + 10;
        tooltipY.value = event.offsetY - 10;
        tooltipVisible.value = true;
      };

      // 隐藏工具提示
      const hideTooltip = () => {
        tooltipVisible.value = false;
      };

      // 计算工具提示样式
      const tooltipStyle = computed(() => {
        return {
          left: `${tooltipX.value}px`,
          top: `${tooltipY.value}px`,
        };
      });

      // 监听窗口大小变化
      onMounted(() => {
        const handleResize = () => {
          // 重新计算位置，触发响应式更新
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
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
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }

  h1 {
    text-align: center;
    margin-bottom: 10px;
    color: #2c3e50;
  }

  .description {
    text-align: center;
    color: #666;
    margin-bottom: 30px;
    font-size: 16px;
    line-height: 1.5;
  }

  .sankey-container {
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    width: 100%;
    max-width: 1000px;
  }

  .tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    pointer-events: none;
    z-index: 1000;
    min-width: 120px;
    text-align: center;
  }

  .tooltip::before {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
</style>
