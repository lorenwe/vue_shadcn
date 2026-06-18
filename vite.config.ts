import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Layouts from 'vite-plugin-vue-layouts'
import AutoImport from 'unplugin-auto-import/vite'
import Component from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    tailwindcss(), 
    Layouts({
      defaultLayout: 'default',
    }),
    Icons({
      autoInstall: false, // 关闭自动下载，手动安装图标集
      compiler: 'vue3',
    }),
    AutoImport({
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
      ],
      imports: [
        'vue',  // 自动导入 vue 内置 API：ref、reactive、computed、onMounted 等
        // VueRouterAutoImports, // // vue-router 专属预设：自动导入 useRouter / useRoute / useLinkProps 等路由组合式API
      ],
      // 自动扫描这些目录下的 TS 文件，全局导入内部导出内容
      dirs: [
        'src/composables/**/*.ts',
        'src/constants/**/*.ts',
        'src/stores/**/*.ts',
      ],
      // 4. defaultExportByFilename: true
      // 规则：文件默认导出，直接用「文件名」当作全局变量名使用
      // 例：src/composables/useToken.ts 默认导出 → 代码里直接 useToken()，无需 import
      defaultExportByFilename: true,
      // 生成 TS 类型声明文件，解决代码提示、类型报错
      dts: 'src/types/auto-import.d.ts',
    }),
    Component({
      dirs: [
        'src/components',
      ],
      // 合并同名前缀组件，简化命名，多用于分类组件
      collapseSamePrefixes: true,
      // 文件夹作为命名空间，区分不同目录下同名组件
      // 例：src/components/Button/Base.vue → 标签使用 <ButtonBase />
      directoryAsNamespace: true,
      // 组件类型声明文件
      dts: 'src/types/auto-import-components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 开发环境服务器配置
  server: {
    // 是否监听所有地址
    host: true,
    // 端口号
    port: 3333,
    // 端口被占用时，是否直接退出
    strictPort: false,
    // 是否自动打开浏览器
    open: true,
    // 反向代理
    proxy: {
      "/api": {
        target: "https://m1.apifoxmock.com/m1/8358408-8123909-default/",
        // 是否为 WebSocket
        ws: false,
        // 是否允许跨域
        changeOrigin: true
      }
    },
    // 是否允许跨域
    cors: true,
  },
})
