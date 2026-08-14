import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose'

export interface IPlaylist extends Document {
  userId: Types.ObjectId
  title: string
  description: string
  tags: string[]
  isPublic: boolean
  movies: number[]
  likes: number
  createdAt: Date
  updatedAt: Date
}

const PlaylistSchema = new Schema<IPlaylist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    movies: {
      type: [Number],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

const Playlist: Model<IPlaylist> =
  mongoose.models.Playlist || mongoose.model<IPlaylist>('Playlist', PlaylistSchema)

export default Playlist
