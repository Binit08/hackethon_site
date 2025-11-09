import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  password: string
  role: 'PARTICIPANT' | 'ADMIN' | 'JUDGE'
  emailVerified?: Date
  image?: string
  teamId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['PARTICIPANT', 'ADMIN', 'JUDGE'],
      default: 'PARTICIPANT',
    },
    emailVerified: Date,
    image: String,
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

UserSchema.index({ email: 1 })
UserSchema.index({ teamId: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

