/** 排序更新提交参数 */
export interface SortUpdatePayload {
  id: string | number
  sort: number
}

/** 各页面传入自己的排序接口 */
export type SortUpdateFn = (payload: SortUpdatePayload) => Promise<void>
