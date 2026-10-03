import mongoose from 'mongoose';

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  course: { type: String, enum: ['BBA', 'BCA'], required: true },
  semester: { type: Number, min: 1, max: 6, required: true },
  duration_minutes: { type: Number, required: true, default: 60 },
  questions: { type: [mongoose.Schema.Types.Mixed], default: [] },
  is_active: { type: Boolean, default: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

TestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('Test', TestSchema);
