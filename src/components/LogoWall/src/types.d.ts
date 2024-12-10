// 曲面
// 曲面单个元素数据类型
export interface curvedSurfaceListItemType {
  index?: number;
  url: string;
  isBig?: boolean;
}
// 曲面：坐标类型
export interface curvedSurfaceCoordinateType {
  position: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
  deg: number;
}

// 鼠标事件类型
export interface mountedEventOptionType {
  /** 鼠标悬浮暂停 */
  enableMouseMove?: boolean;
  /** 鼠标拖拽移动 */
  enableMouseDrag?: boolean;
  /** 鼠标滚轮移动 */
  enableMouseWheel?: boolean;
  /** 鼠标点击 */
  enableMouseClick?: boolean;
}
