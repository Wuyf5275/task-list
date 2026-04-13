import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import { CheckCircle2, Circle, Clock, User, Trash2, Pencil, Check } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { Task, useTaskStore } from '../store/useTaskStore'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

interface TaskItemProps {
  task: Task
  index: number
  isReorderable?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, index, isReorderable }) => {
  const { toggleTask, deleteTask, updateTask } = useTaskStore()
  const [isEditing, setIsEditing] = useState(false)
  
  const [editTitle, setEditTitle] = useState(task.title)
  const [editNotes, setEditNotes] = useState(task.notes)
  const [editProgress, setEditProgress] = useState(task.progress)
  
  // Disable parent drag when hovering slider
  const [isHoveringSlider, setIsHoveringSlider] = useState(false)
  
  // Local state for smooth dragging without triggering disk writes
  const [localProgress, setLocalProgress] = useState(task.progress)
  useEffect(() => {
    setLocalProgress(task.progress)
  }, [task.progress])

  // Calculate dynamic colors for the progress jelly
  // From dull greyish-blue (0%) to intense fiery neon (100%)
  const sat = 20 + (localProgress / 100) * 80; // 20% -> 100%
  const light = 75 - (localProgress / 100) * 20; // 75% -> 55%
  const hue1 = 220 + (localProgress / 100) * 120; // Blue(220) to Pink(340)
  const hue2 = 240 + (localProgress / 100) * 135; // Purple(240) to Orange(375/15)
  
  const progressGradient = `linear-gradient(to right, hsl(${hue1}, ${sat}%, ${light}%), hsl(${hue2}, ${sat}%, ${light}%))`
  
  const shadowOpacity = 0.1 + (localProgress / 100) * 0.5;
  const shadowBlur = 4 + (localProgress / 100) * 16;
  const progressShadow = `0 0 ${shadowBlur}px hsla(${hue2}, 100%, 60%, ${shadowOpacity})`

  const isOverdue = dayjs().isAfter(dayjs(task.deadline)) && !task.isCompleted

  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (task.isCompleted) {
      setTimeLeft(dayjs(task.deadline).fromNow())
      return
    }

    const updateCountdown = () => {
      const now = dayjs()
      const target = dayjs(task.deadline)
      const diff = target.diff(now, 'second')

      if (diff <= 0) {
        setTimeLeft('已逾期')
      } else {
        const d = Math.floor(diff / (3600 * 24))
        const h = Math.floor((diff % (3600 * 24)) / 3600)
        const m = Math.floor((diff % 3600) / 60)
        const s = diff % 60
        
        if (d > 0) {
          setTimeLeft(`${d}天 ${h}时 ${m}分`)
        } else if (h > 0) {
          setTimeLeft(`${h}时 ${m}分 ${s}秒`)
        } else {
          setTimeLeft(`${m}分 ${s}秒`)
        }
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [task.deadline, task.isCompleted])

  const handleSave = () => {
    updateTask(task.id, {
      title: editTitle,
      notes: editNotes,
      progress: editProgress
    })
    setIsEditing(false)
  }
  
  const itemProps = isReorderable 
    ? { value: task, dragListener: !isEditing && !isHoveringSlider }
    : {}

  const ItemComponent = isReorderable ? Reorder.Item : (motion.div as any)

  return (
    <ItemComponent
      id={task.id}
      {...itemProps}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0, scale: 0.8, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 450, damping: 35, mass: 0.8 }}
      whileHover={{ scale: 1.02 }}
      whileDrag={isReorderable ? { scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", zIndex: 50, cursor: "grabbing" } : undefined}
      className={`relative group px-3 py-2.5 shrink-0 rounded-[18px] ${
        task.isCompleted 
          ? 'bg-white/60 border-white/40 backdrop-blur-xl border shadow-sm' 
          : `bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_4px_12px_rgba(0,0,0,0.05)] ${isReorderable ? 'cursor-grab active:cursor-grabbing' : ''}`
      } transition-colors duration-300 no-drag`}
    >
      <div className="flex items-start gap-2.5">
        <div className="flex items-center gap-2 mt-[2px]">
          <span className="text-[11px] font-bold text-[#1C1C1E]/20 drop-shadow-sm select-none w-4 text-center">
            {index.toString().padStart(2, '0')}
          </span>
          {!isEditing && (
            <button 
              onClick={() => toggleTask(task.id)}
              className="text-[#1C1C1E] transition-colors flex-shrink-0"
            >
              {task.isCompleted ? (
                 <CheckCircle2 className="w-5 h-5 text-[#34C759]" strokeWidth={2.5} />
              ) : (
                 <Circle className="w-5 h-5 opacity-20" strokeWidth={2} />
              )}
            </button>
          )}
        </div>
        
        <div className="flex-1 min-w-0 pt-0.5">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white/60 border-none rounded px-2 py-1 text-sm font-semibold text-gray-900 focus:ring-1 focus:ring-blue-400 outline-none"
                autoFocus
              />
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="备注（可选）"
                className="w-full bg-white/60 border-none rounded px-2 py-1 text-xs text-gray-700 focus:ring-1 focus:ring-blue-400 outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-500">进度 {editProgress}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="flex-1 accent-blue-500 h-1.5 bg-black/10 rounded-full appearance-none outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              <h3 className={`text-[15px] font-bold truncate leading-snug ${task.isCompleted ? 'line-through text-[#1C1C1E]/40' : 'text-[#1C1C1E]'}`}>
                {task.title}
              </h3>
              
              {task.notes && (
                <p className="text-[13px] text-[#1C1C1E]/60 mt-0.5 line-clamp-1">
                  {task.notes}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-[#1C1C1E]/50">
                <div className="flex items-center gap-1 bg-[#1C1C1E]/5 px-1.5 py-0.5 rounded-md border border-[#1C1C1E]/5">
                  <User className="w-3 h-3 opacity-60" strokeWidth={2.5} />
                  <span className="truncate max-w-[60px] leading-none">{task.assignee}</span>
                </div>
                
                <div className={`flex items-center gap-1 bg-[#1C1C1E]/5 px-1.5 py-0.5 rounded-md border border-[#1C1C1E]/5 ${isOverdue ? 'text-red-500 bg-red-500/10 border-red-500/20' : ''}`}>
                  <Clock className="w-3 h-3 opacity-60" strokeWidth={2.5} />
                  <span className="leading-none">{timeLeft}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-[-2px]">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="p-1.5 text-blue-500 hover:text-blue-600 transition-all rounded-full hover:bg-white/50"
            >
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-400 hover:text-blue-500 transition-all rounded-full hover:bg-white/50"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => deleteTask(task.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-all rounded-full hover:bg-white/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Progress Bar */}
      {!task.isCompleted && !isEditing && (
        <div 
          className="mt-1.5 group/slider relative h-5 w-full flex items-center cursor-pointer"
          onPointerEnter={() => setIsHoveringSlider(true)}
          onPointerLeave={() => setIsHoveringSlider(false)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Visual Track */}
          <div className="absolute w-full h-1.5 group-hover/slider:h-2.5 has-[:active]:h-4 transition-all duration-[400ms] ease-out bg-[#1C1C1E]/5 rounded-full overflow-hidden pointer-events-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
            <motion.div 
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${localProgress}%`,
                background: progressGradient,
                boxShadow: progressShadow
              }}
              transition={{ type: 'spring', stiffness: 1000, damping: 50, mass: 0.5 }}
            />
          </div>
          {/* Invisible Native Slider for Interaction */}
          <input
            type="range"
            min="0"
            max="100"
            value={localProgress}
            onChange={(e) => setLocalProgress(Number(e.target.value))}
            onPointerUp={() => updateTask(task.id, { progress: localProgress })}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>
      )}
    </ItemComponent>
  )
}
