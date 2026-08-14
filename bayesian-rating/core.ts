/**
 * 贝叶斯平均评分 — 核心算法
 *
 * 公式: score = (v/(v+m)) × R + (m/(v+m)) × C
 *
 * 参数说明:
 *   v = 该电影的评分数量（平台数）
 *   R = 该电影各平台评分的算术平均
 *   m = 先验权重（最少评分数量），越大则评分倾向于全局均值
 *   C = 全局先验均值（所有电影的平均评分）
 *
 * 设计思路:
 *   贝叶斯平均解决了「小样本偏差」问题。如果一部电影只有 1 个平台评分 10 分，
 *   简单平均就是 10 分，但这不公平——它没有足够的数据支撑。贝叶斯平均将评分
 *   "拉向"全局均值：当 v 很小时，C 的权重很大；当 v 很大时，R 占主导。
 */

export interface PlatformRating {
  platform: string
  score: number
}

export interface BayesianRatingResult {
  /** 贝叶斯平均评分（保留一位小数），若无评分则为 null */
  score: number | null
  /** 评分平台数量 */
  count: number
  /** 各平台算术平均（原始 R 值），保留一位小数 */
  average: number | null
}

export interface BayesianRatingOptions {
  /** 先验权重 m，默认 5 */
  priorWeight?: number
  /** 全局先验均值 C，默认 7.0 */
  priorMean?: number
}

/**
 * 计算单部电影的贝叶斯平均评分
 *
 * @param ratings - 各平台评分列表
 * @param options - 可选参数（m 和 C）
 * @returns 贝叶斯评分结果
 *
 * @example
 * calculateBayesianRating([{ platform: 'douban', score: 8.5 }])
 * // => { score: 7.3, count: 1, average: 8.5 }
 */
export function calculateBayesianRating(
  ratings: PlatformRating[],
  options: BayesianRatingOptions = {}
): BayesianRatingResult {
  const { priorWeight = 5, priorMean = 7.0 } = options
  const v = ratings.length

  if (v === 0) {
    return { score: null, count: 0, average: null }
  }

  const R = ratings.reduce((sum, r) => sum + r.score, 0) / v
  const score = (v / (v + priorWeight)) * R + (priorWeight / (v + priorWeight)) * priorMean

  return {
    score: Math.round(score * 10) / 10,
    count: v,
    average: Math.round(R * 10) / 10,
  }
}

/**
 * 批量计算多部电影的贝叶斯平均评分
 *
 * @param movies - 电影列表，每项含 ratings
 * @param options - 可选参数（m 和 C）
 * @returns 每部电影附带评分结果
 *
 * @example
 * const enriched = calculateBayesianRatingBatch(movies)
 * enriched[0].bayesianRating // 8.2
 */
export function calculateBayesianRatingBatch<T extends { platformRatings: PlatformRating[] }>(
  movies: T[],
  options?: BayesianRatingOptions
): (T & { bayesianRating: number | null; ratingCount: number })[] {
  return movies.map((movie) => {
    const result = calculateBayesianRating(movie.platformRatings, options)
    return { ...movie, bayesianRating: result.score, ratingCount: result.count }
  })
}
