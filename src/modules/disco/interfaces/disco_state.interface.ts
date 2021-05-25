export enum DiscoState {
  // 未开启
  NONE = -1,
  // 创建中
  CREATING = 0,
  // 等待开启（创建成功）
  CREATED = 1,
  // 创建失败
  CREATE_FAILED = 2,
  /**
   * @deprecated 开启中（实际没有使用）
   */
  ENABLING = 3,
  // 等待募资开始（数据库为4，时间未开始）
  ENABLED = 4,
  // 募资成功
  FUNDRAISING_SUCCESS = 5,
  // 募资失败
  FUNDRAISING_FAIED = 6,
  // 募资结束
  FUNDRAISING_FINISHED = 8,
}
