import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITeam extends Document {
  name: string
  leaderId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TeamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, 'Team name must be at least 3 characters'],
      maxlength: [30, 'Team name must be at most 30 characters'],
      validate: {
        validator: function (v: string) {
          if (!v) return false
          // Collapse multiple spaces for validation purposes
          const normalized = v.replace(/\s+/g, ' ').trim()
          // Start with a letter, allow letters, numbers, spaces and hyphens, end with letter/number
          const re = /^[A-Za-z][A-Za-z0-9\- ]{1,28}[A-Za-z0-9]$/
          return re.test(normalized)
        },
        message:
          'Team name must be 3-30 chars, start with a letter, and contain only letters, numbers, spaces, or hyphens',
      },
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    collection: 'teams',
  }
)

// Normalize spacing before save (trim and collapse multiple spaces)
TeamSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    // @ts-ignore
    this.name = this.name.replace(/\s+/g, ' ').trim()
  }
  next()
})

TeamSchema.index({ leaderId: 1 })

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema)

export default Team

