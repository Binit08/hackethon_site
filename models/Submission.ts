import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId
  teamId?: mongoose.Types.ObjectId
  problemId: mongoose.Types.ObjectId
  code?: string
  language?: string
  status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR'
  verdict?: string
  score: number
  runtime?: number
  memory?: number
  error?: string
  submittedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    code: String,
    language: {
      type: String,
      default: 'javascript',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'],
      default: 'PENDING',
    },
    verdict: String,
    score: {
      type: Number,
      default: 0,
    },
    runtime: Number,
    memory: Number,
    error: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: 'submissions',
  }
)

SubmissionSchema.index({ userId: 1 })
SubmissionSchema.index({ teamId: 1 })
SubmissionSchema.index({ problemId: 1 })
SubmissionSchema.index({ status: 1 })
SubmissionSchema.index({ submittedAt: 1 })

const Submission: Model<ISubmission> = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)

export default Submission

