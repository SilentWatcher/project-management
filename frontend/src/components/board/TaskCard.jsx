import { Draggable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const TaskCard = ({ task, index, onClick }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
          style={provided.draggableProps.style}
        >
          {/* Priority badge */}
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {isOverdue && (
              <span className="text-xs text-red-600 font-medium">Overdue</span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {/* Due date */}
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                </div>
              )}

              {/* Comments */}
              {task.comments?.length > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}
            </div>

            {/* Assignee */}
            {task.assignee ? (
              <div className="flex items-center">
                {task.assignee.avatar ? (
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="h-6 w-6 rounded-full"
                    title={task.assignee.name}
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center" title={task.assignee.name}>
                    <span className="text-xs font-medium text-primary-600">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
