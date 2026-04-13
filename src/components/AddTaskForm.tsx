import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import dayjs from 'dayjs'
import { useTaskStore } from '../store/useTaskStore'

export const AddTaskForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { addTask } = useTaskStore()
  
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [deadline, setDeadline] = useState(dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'))
  const [notes, setNotes] = useState('')
  const [progress, setProgress] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addTask({
      title,
      assignee: assignee || '未分配',
      deadline,
      notes,
      progress: Number(progress)
    })

    setIsOpen(false)
    setTitle('')
    setAssignee('')
    setNotes('')
    setProgress(0)
    setDeadline(dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'))
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="absolute bottom-6 right-5 z-50 w-12 h-12 bg-[#1C1C1E] backdrop-blur-xl text-white flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,255,255,0.3),0_12px_24px_rgba(0,0,0,0.4)] border border-white/20 blob-btn no-drag cursor-pointer hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 z-40 bg-black/10 backdrop-blur-[2px] no-drag rounded-[32px]"
            />
            <motion.form
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onSubmit={handleSubmit}
              className="absolute bottom-6 left-5 right-5 z-50 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-3xl p-4 rounded-[28px] border border-white/60 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),0_24px_48px_rgba(0,0,0,0.2)] overflow-hidden no-drag"
            >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[13px] font-extrabold text-gray-800">创建新任务</h4>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="任务标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/80 border-none rounded-lg px-2 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-gray-400"
                autoFocus
              />
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="负责人"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-1/2 bg-white/80 border-none rounded-lg px-2 py-1.5 text-[11px] focus:ring-1 focus:ring-blue-400 outline-none"
                />
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-1/2 bg-white/80 border-none rounded-lg px-2 py-1.5 text-[11px] focus:ring-1 focus:ring-blue-400 outline-none text-gray-700"
                />
              </div>

              <input
                type="text"
                placeholder="备注（可选）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white/80 border-none rounded-lg px-2 py-1.5 text-[11px] focus:ring-1 focus:ring-blue-400 outline-none"
              />

              <div className="flex items-center gap-2 px-1 py-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 w-12">进度 {progress}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="flex-1 accent-blue-500 h-1 bg-black/10 rounded-full appearance-none outline-none cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full py-1.5 mt-1 bg-gradient-to-r from-[#007AFF] to-[#5856D6] hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-[0_4px_14px_rgba(0,122,255,0.39)] transition-all transform active:scale-95"
              >
                添加
              </button>
            </div>
          </motion.form>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
