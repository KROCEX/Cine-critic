import mongoose, { Schema, type Document, type Model } from 'mongoose'
import { calculateBayesianRating, type PlatformRating } from '@/bayesian-rating'

export type { PlatformRating } from '@/bayesian-rating'

export interface IMovie extends Document {
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string
  platformRatings: PlatformRating[]
  getBayesianRating(): number | null
}

const PlatformRatingSchema = new Schema<PlatformRating>(
  {
    platform: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
  },
  { _id: false }
)

const MovieSchema = new Schema<IMovie>(
  {
    tmdbId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
    releaseDate: { type: String, default: '' },
    platformRatings: { type: [PlatformRatingSchema], default: [] },
  },
  { timestamps: true }
)

MovieSchema.methods.getBayesianRating = function (): number | null {
  return calculateBayesianRating(this.platformRatings as PlatformRating[]).score
}

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema)

export default Movie
