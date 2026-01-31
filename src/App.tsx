import React, { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  createdAt: Date
}

interface Column {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  color: string
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', status: 'todo', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: 'bg-blue-50' },
  { id: 'done', title: 'Done', status: 'done', color: 'bg-green-50' }
]

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '' })

  useEffect(() => {
    const savedTasks = localStorage.getItem('kanban-tasks')
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      setTasks(parsedTasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt)
      })))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        status: 'todo',
        createdAt: new Date()
      }
      setTasks([...tasks, task])
      setNewTask({ title: '', description: '' })
      setIsAddingTask(false)
    }
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => {
    e.preventDefault()
    if (draggedTask) {
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status }
          : task
      ))
      setDraggedTask(null)
    }
  }

  const getTasksByStatus = (status: 'todo' | 'in-progress' | 'done') => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">My Kanban Board</h1>
          <button
            onClick={() => setIsAddingTask(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <textarea
              placeholder="Task description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddingTask(false)
                  setNewTask({ title: '', description: '' })
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col">
              {/* Column Header */}
              <div className={`${column.color} rounded-t-lg px-4 py-3 border-b border-gray-200`}>
                <h2 className="font-medium text-gray-900 flex items-center justify-between">
                  {column.title}
                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                    {getTasksByStatus(column.status).length}
                  </span>
                </h2>
              </div>

              {/* Tasks Container */}
              <div
                className="bg-white rounded-b-lg min-h-[400px] p-4 space-y-3 border-l border-r border-b border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {getTasksByStatus(column.status).map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">
                        {task.title}
                      </h3>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all text-xs"
                      >
                        ×
                      </button>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    <div className="text-xs text-gray-400">
                      {task.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}

                {getTasksByStatus(column.status).length === 0 && (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="text-center text-sm text-gray-600">
          Total tasks: {tasks.length} • 
          Completed: {getTasksByStatus('done').length} • 
          In progress: {getTasksByStatus('in-progress').length} • 
          To do: {getTasksByStatus('todo').length}
        </div>
      </div>
    </div>
  )
}

export default App