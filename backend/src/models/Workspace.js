import mongoose from 'mongoose';

const workspaceMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
    maxlength: [100, 'Workspace name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [workspaceMemberSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ 'members.user': 1 });

// Method to check if user is member
workspaceSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to get user role
workspaceSchema.methods.getUserRole = function(userId) {
  if (this.owner.toString() === userId.toString()) return 'admin';
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
