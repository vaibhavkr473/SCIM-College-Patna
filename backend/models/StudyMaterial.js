import mongoose from 'mongoose';

const StudyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['pdf', 'image', 'video', 'link', 'text'], required: true },
  course: { type: String, enum: ['BBA', 'BCA'], required: true },
  semester: { type: Number, min: 1, max: 6, required: true },
  url: { type: String, default: null },
  file_path: { type: String, default: null },
  text_content: { type: String, default: null },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

StudyMaterialSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('StudyMaterial', StudyMaterialSchema);
