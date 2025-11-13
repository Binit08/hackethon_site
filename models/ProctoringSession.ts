import mongoose from "mongoose"

const proctoringSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "SUSPENDED", "TERMINATED"],
      default: "ACTIVE",
    },
    totalViolations: {
      type: Number,
      default: 0,
    },
    highSeverityCount: {
      type: Number,
      default: 0,
    },
    mediumSeverityCount: {
      type: Number,
      default: 0,
    },
    lowSeverityCount: {
      type: Number,
      default: 0,
    },
    examType: {
      type: String,
      enum: ["CODING", "MCQ", "MIXED"],
      default: "CODING",
    },
    suspicionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.ProctoringSession ||
  mongoose.model("ProctoringSession", proctoringSessionSchema)
