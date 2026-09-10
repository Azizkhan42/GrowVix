import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { 
    type: String, 
    enum: ['free', 'pro', 'agency'], 
    default: 'free' 
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
