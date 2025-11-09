import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProblem extends Document {
  title: string
  description: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  type: 'CODING' | 'MCQ'
  points: number
  timeLimit: number
  memoryLimit: number
  constraints?: string
  sampleInput?: string
  sampleOutput?: string
  correctAnswer?: string
  isActive: boolean
  round: number
  createdAt: Date
  updatedAt: Date
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    type: {
      type: String,
      enum: ['CODING', 'MCQ'],
      default: 'CODING',
    },
    points: {
      type: Number,
      default: 100,
    },
    timeLimit: {
      type: Number,
      default: 5,
    },
    memoryLimit: {
      type: Number,
      default: 256,
    },
    constraints: String,
    sampleInput: String,
    sampleOutput: String,
    correctAnswer: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    round: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: 'problems',
  }
)

ProblemSchema.index({ type: 1 })
ProblemSchema.index({ isActive: 1 })
ProblemSchema.index({ round: 1 })

const Problem: Model<IProblem> = mongoose.models.Problem || mongoose.model<IProblem>('Problem', ProblemSchema)

export default Problem

