import mongoose from 'mongoose';

const DoubtSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student_name: { type: String, required: true },
  course: { type: String, enum: ['BBA', 'BCA'], default: null },
  semester: { type: Number, default: null },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  is_answered: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

DoubtSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('Doubt', DoubtSchema);
