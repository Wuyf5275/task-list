import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { CheckSquare, CalendarDays } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
import { useTaskStore } from './store/useTaskStore'
import { TaskItem } from './components/TaskItem'
import { AddTaskForm } from './components/AddTaskForm'
import { DynamicIsland } from './components/DynamicIsland'

function App() {
  const { tasks, reorderTasks } = useTaskStore()

  const incompleteTasks = tasks.filter(t => !t.isCompleted)
  const completedTasks = tasks.filter(t => t.isCompleted)

  const totalTasks = tasks.length
  const completedCount = completedTasks.length

  const topTask = incompleteTasks.length > 0 ? incompleteTasks[0] : null

  return (
    <div className="relative h-full w-full flex flex-col bg-white/30 backdrop-blur-3xl rounded-[32px] border border-white/50 shadow-[0_24px_48px_rgba(0,0,0,0.2)] overflow-hidden">
      {/* Colorful mesh gradient blobs - Opacity reduced for clarity */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px] z-0">
        <div className="absolute top-[-10%] left-[-10%] w-56 h-56 bg-cyan-400 rounded-full blur-[80px] opacity-30"></div>
        <div className="absolute top-[30%] right-[-20%] w-60 h-60 bg-blue-500 rounded-full blur-[90px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-64 h-64 bg-fuchsia-400 rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-48 h-48 bg-indigo-400 rounded-full blur-[80px] opacity-30"></div>
      </div>
      
      {/* Top Ambient White Glare for Text Legibility (Apple Lock Screen Trick) */}
      <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-white/90 via-white/50 to-transparent z-0 pointer-events-none"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Draggable */}
        <header className="relative drag-region flex flex-col pt-[36px] pb-3 px-5 gap-3">
          {/* Dynamic Island Overlay punches a hole in the drag region */}
          <DynamicIsland topTask={topTask} />
          
          <div className="flex flex-col items-start px-2 mt-1 mb-2 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-[24px] h-[24px] rounded-[6px] bg-blue-500/10 text-blue-600">
                <CalendarDays className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <span className="text-[14px] font-bold text-black/80 tracking-widest uppercase">
                {dayjs().format('MM月DD日')}
                <span className="font-semibold text-black/40 ml-2">{dayjs().format('dddd')}</span>
              </span>
            </div>
            
            <h1 className="text-[36px] font-black tracking-tight text-black leading-none drop-shadow-sm">
              今日事今日毕<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[14px] font-semibold text-black/40 tracking-wide mt-2">
              Stay focused and productive
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-2xl backdrop-saturate-200 rounded-[18px] py-2.5 px-4 shadow-[0_8px_16px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/80 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-gray-600">总进度</span>
              <span className="text-xs font-extrabold text-blue-600">{completedCount}/{totalTasks} 已完成</span>
            </div>
            
            {/* White Card Progress Bar */}
            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-blue-500 rounded-full"
                 initial={{ width: 0 }}
                 animate={{ width: `${totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100}%` }}
                 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
               />
            </div>
          </div>
        </header>

      {/* Add Task Area */}
      <AddTaskForm />

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 pb-[84px] no-drag">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
            <CheckSquare className="w-12 h-12 mb-2" />
            <p className="text-sm font-medium">暂无任务</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pb-6">
            <Reorder.Group 
              axis="y" 
              values={incompleteTasks} 
              onReorder={reorderTasks} 
              className="flex flex-col gap-2.5"
            >
              <AnimatePresence>
                {incompleteTasks.map((task, index) => (
                  <TaskItem key={task.id} task={task} index={index + 1} isReorderable />
                ))}
              </AnimatePresence>
            </Reorder.Group>

            {completedTasks.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-1 border-t border-white/20">
                <AnimatePresence>
                  {completedTasks.map((task, index) => (
                    <TaskItem key={task.id} task={task} index={incompleteTasks.length + index + 1} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

export default App
