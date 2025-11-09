import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMCQAnswer extends Document {
  userId: mongoose.Types.ObjectId
  problemId: mongoose.Types.ObjectId
  optionId: mongoose.Types.ObjectId
  isCorrect: boolean
  score: number
  submittedAt: Date
}

const MCQAnswerSchema = new Schema<IMCQAnswer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    optionId: {
      type: Schema.Types.ObjectId,
      ref: 'MCQOption',
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'mcqanswers',
  }
)

MCQAnswerSchema.index({ userId: 1 })
MCQAnswerSchema.index({ problemId: 1 })
MCQAnswerSchema.index({ userId: 1, problemId: 1 }, { unique: true })

const MCQAnswer: Model<IMCQAnswer> = mongoose.models.MCQAnswer || mongoose.model<IMCQAnswer>('MCQAnswer', MCQAnswerSchema)

export default MCQAnswer

