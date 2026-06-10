import { useColorMode } from '@vueuse/core'
import { setCssVar } from '@/utils/css'

// 主题类型
export type ColorMode = 'light' | 'dark' | 'auto'

// 初始化 colorMode 实例（全局单例）
const colorMode = useColorMode()

/**
 * 带圆形扩散动画切换主题
 * @param e 鼠标点击事件
 * @param targetMode 目标主题
 */
export const setColorMode = (e: MouseEvent, targetMode: ColorMode) => {
  const { clientX, clientY } = e
  const maxRadius = Math.hypot(
    Math.max(clientX, window.innerWidth - clientX),
    Math.max(clientY, window.innerHeight - clientY)
  )

  setCssVar("--view-transition-x", `${clientX}px`)
  setCssVar("--view-transition-y", `${clientY}px`)
  setCssVar("--view-transition-r", `${maxRadius}px`)

  const handler = () => {
    colorMode.value = targetMode
  }

  document.startViewTransition 
    ? document.startViewTransition(handler) 
    : handler()
}

// 导出 mode，供组件读取当前主题
export { colorMode }