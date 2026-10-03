import mongoose from 'mongoose';

const CalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  event_type: { type: String, enum: ['class', 'exam', 'holiday', 'event'], default: 'event' },
  course: { type: String, enum: ['BBA', 'BCA'], default: null },
  event_date: { type: String, required: true },
  end_date: { type: String, default: null },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

CalendarEventSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('CalendarEvent', CalendarEventSchema);
