import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  password: string
  role: 'PARTICIPANT' | 'ADMIN' | 'JUDGE'
  emailVerified?: Date
  image?: string
  teamId?: mongoose.Types.ObjectId
  faceDescriptor?: number[] // 128-dimensional vector for face recognition
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
    faceDescriptor: {
      type: [Number],
      default: undefined,
      validate: {
        validator: function(v: number[]) {
          // If present, must be exactly 128 numbers
          return !v || (Array.isArray(v) && v.length === 128 && v.every(n => typeof n === 'number'))
        },
        message: 'Face descriptor must be an array of exactly 128 numbers'
      }
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
)

// Index for teamId lookups (email is already indexed via unique: true)
UserSchema.index({ teamId: 1 })

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

