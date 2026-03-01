import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal } from 'lucide-react';
import TaskCard from './TaskCard';

const Column = ({ column, onAddTask, onTaskClick }) => {
  return (
    <div className="flex flex-col w-80 min-w-[320px] max-w-[320px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{column.name}</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {column.tasks?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(column._id)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 bg-gray-100 rounded-lg p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''
            }`}
          >
            <div className="space-y-2">
              {column.tasks?.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onClick={onTaskClick}
                />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;
