import mongoose from "mongoose"

const proctoringViolationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    violationType: {
      type: String,
      enum: [
        "MULTIPLE_FACES",
        "NO_FACE",
        "LOOKING_AWAY",
        "TAB_SWITCH",
        "CAMERA_BLOCKED",
        "WINDOW_BLUR",
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },
    details: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    screenshotUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
proctoringViolationSchema.index({ userId: 1, sessionId: 1, timestamp: -1 })

export default mongoose.models.ProctoringViolation ||
  mongoose.model("ProctoringViolation", proctoringViolationSchema)
