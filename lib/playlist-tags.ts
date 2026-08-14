/**
 * 片单标签预设选项（允许用户自由输入，这里提供推荐维度）
 */

export const TAG_PRESETS = {
  类型: ['惊悚', '恐怖', '剧情', '悬疑', '喜剧', '科幻', '奇幻', '犯罪', '爱情', '动画', '纪录片'],
  年代: ['60s', '70s', '80s', '90s', '00s', '10s', '20s'],
  其他: ['经典', '冷门', '获奖', '导演剪辑版', '爽片', '治愈', '致郁'],
} as const

/** 扁平化所有预设标签 */
export const ALL_TAG_PRESETS: string[] = Object.values(TAG_PRESETS).flat()
