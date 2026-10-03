import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'co_member', 'student'], default: 'student' },
  course: { type: String, enum: ['BBA', 'BCA'], default: null },
  semester: { type: Number, min: 1, max: 6, default: 1 },
  phone: { type: String, default: null },
  permissions: { type: [String], default: [] },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  delete obj.password;
  return obj;
};

export default mongoose.model('User', UserSchema);
