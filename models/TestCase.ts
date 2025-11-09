import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITestCase extends Document {
  problemId: mongoose.Types.ObjectId
  input: string
  output: string
  isHidden: boolean
  points: number
  createdAt: Date
}

const TestCaseSchema = new Schema<ITestCase>(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: true,
    },
    points: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'testcases',
  }
)

TestCaseSchema.index({ problemId: 1 })

const TestCase: Model<ITestCase> = mongoose.models.TestCase || mongoose.model<ITestCase>('TestCase', TestCaseSchema)

export default TestCase

