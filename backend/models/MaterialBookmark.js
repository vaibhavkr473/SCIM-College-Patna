import mongoose from 'mongoose';

const MaterialBookmarkSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  material_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyMaterial', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

MaterialBookmarkSchema.index({ student_id: 1, material_id: 1 }, { unique: true });

MaterialBookmarkSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('MaterialBookmark', MaterialBookmarkSchema);
