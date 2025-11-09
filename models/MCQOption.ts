import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMCQOption extends Document {
  problemId: mongoose.Types.ObjectId
  option: string
  isCorrect: boolean
  createdAt: Date
}

const MCQOptionSchema = new Schema<IMCQOption>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    option: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'mcqoptions',
  }
)

MCQOptionSchema.index({ problemId: 1 })

const MCQOption: Model<IMCQOption> = mongoose.models.MCQOption || mongoose.model<IMCQOption>('MCQOption', MCQOptionSchema)

export default MCQOption

