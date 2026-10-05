import mongoose from 'mongoose';

const TestSubmissionSchema = new mongoose.Schema({
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
  score: { type: Number, default: null },
  total_marks: { type: Number, default: 0 },
  status: { type: String, enum: ['not_started', 'in_progress', 'submitted', 'graded'], default: 'not_started' },
  started_at: { type: Date, default: Date.now },
  submitted_at: { type: Date, default: null },
  violation_flags: { type: Number, default: 0 },
  violation_details: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

TestSubmissionSchema.index({ test_id: 1, student_id: 1 }, { unique: true });

TestSubmissionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export default mongoose.model('TestSubmission', TestSubmissionSchema);
