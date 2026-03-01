import mongoose from 'mongoose';

const columnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Column name is required'],
    trim: true,
    maxlength: [50, 'Column name cannot exceed 50 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

columnSchema.index({ board: 1 });
columnSchema.index({ project: 1 });

const Column = mongoose.model('Column', columnSchema);
export default Column;
