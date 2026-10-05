import mongoose from 'mongoose';

const DoubtResponseSchema = new mongoose.Schema({
  doubt_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doubt', required: true },
  responder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responder_name: { type: String, required: true },
  response_text: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

DoubtResponseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('DoubtResponse', DoubtResponseSchema);
