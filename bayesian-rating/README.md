# 贝叶斯平均评分算法

## 算法公式

```
score = (v / (v + m)) × R  +  (m / (v + m)) × C
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| v | 评分平台数量 | 自动计算 |
| R | 各平台评分的算术平均 | 自动计算 |
| m | 先验权重（最小评分数量） | 5 |
| C | 全局先验均值 | 7.0 |

## 设计原理

贝叶斯平均解决了「小样本偏差」问题：

- 电影 A：10 个平台评分，均分 9.0 → 接近 9.0
- 电影 B：1 个平台评分 10 分 → 被拉向 7.0，约 7.5 分

当评分数据足够多时，贝叶斯评分趋近于简单平均；
当评分数据很少时，评分向全局均值回归，避免极端值。

## 使用方式

```ts
import { calculateBayesianRating } from '@/bayesian-rating'

const result = calculateBayesianRating([
  { platform: 'douban', score: 8.5 },
  { platform: 'imdb', score: 7.8 },
])

console.log(result.score)   // 7.3
console.log(result.count)   // 2
console.log(result.average) // 8.2
```

### 自定义先验参数

```ts
const result = calculateBayesianRating(ratings, {
  priorWeight: 10,  // m = 10，更强的先验
  priorMean: 6.5,   // C = 6.5，更低的全局基准
})
```

### 批量计算

```ts
import { calculateBayesianRatingBatch } from '@/bayesian-rating'

const enriched = calculateBayesianRatingBatch(movies)
// 每部电影自动附带 bayesianRating 和 ratingCount
```

## 调优

要优化评分效果，调整两个全局参数：

- **m 越大** → 对小样本电影的惩罚越重，新电影更难获得高分
- **C 越大** → 所有电影的评分都偏高，适合"慷慨"的评分体系
