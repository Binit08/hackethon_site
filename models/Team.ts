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

TeamSchema.index({ leaderId: 1 })

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema)

export default Team

