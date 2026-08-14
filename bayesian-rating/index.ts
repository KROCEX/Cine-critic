/**
 * 贝叶斯平均评分算法工具
 *
 * 导出所有公共类型和函数。
 * 项目中所有需要计算综合评分的地方，应统一从此模块导入。
 */

export {
  calculateBayesianRating,
  calculateBayesianRatingBatch,
  type PlatformRating,
  type BayesianRatingResult,
} from './core'
