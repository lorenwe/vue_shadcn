import { defineComponent, h } from 'vue';
import { addIcon, Icon, type IconifyIcon } from '@iconify/vue';

/**
 * 创建离线图标组件
 * @param icon 图标名称（建议与Iconify官方命名一致）
 * @param iconComponent 从@iconify/icons-xxx导入的图标对象
 * @returns Vue组件
 */
function createIconifyOfflineIcon(icon: string, iconComponent: IconifyIcon) {
  return defineComponent({
    name: `Icon-${icon}`,
    setup(props, { attrs }) {
      // 注册图标到离线存储
      addIcon(icon, iconComponent);
      // 渲染Icon组件，并将所有属性和侦听器传递下去
      return () => h(Icon, { icon, ...props, ...attrs });
    },
  });
}