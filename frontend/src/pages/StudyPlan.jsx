import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Target, Sparkles, CheckSquare, Square } from 'lucide-react'
import { getStudyPlan } from '../services/api'
import './StudyPlan.css'

const STORAGE_KEY = 'pw_weekly_timetable_v1'

export default function StudyPlan() {
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [addingRecommendation, setAddingRecommendation] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [weekPlans, setWeekPlans] = useState({
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  })
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    time: '',
    task: '',
    subject: 'General',
  })

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayByIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = dayByIndex[new Date().getDay()]

  const normalizeTaskTime = (timeValue, index) => {
    if (
      typeof timeValue === 'string' &&
      timeValue.trim() &&
      !timeValue.toLowerCase().startsWith('day ')
    ) {
      return timeValue
    }
    return buildDefaultTimeSlot(index)
  }

  const buildDefaultTimeSlot = (index) => {
    const slots = [
      '06:00 AM - 07:30 AM',
      '08:00 AM - 09:30 AM',
      '10:00 AM - 11:30 AM',
      '02:00 PM - 03:30 PM',
      '05:00 PM - 06:30 PM',
      '07:30 PM - 09:00 PM',
    ]
    return slots[index % slots.length]
  }

  const saveWeekPlansToStorage = (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }

  useEffect(() => {
    setSelectedDay(today)
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setWeekPlans(prev => ({ ...prev, ...parsed }))
      } catch {
        // Ignore corrupted local data and continue.
      }
    }

    getStudyPlan()
      .then(data => {
        const normalized = (data.dailyPlan || []).map((task, index) => ({
          ...task,
          id: typeof task.id === 'number' ? task.id : index + 1,
          time: normalizeTaskTime(task.time, index),
          completed: Boolean(task.completed),
        }))
        setPlan(data)
        setWeekPlans(prev => {
          const next = { ...prev }
          if (!next[today] || next[today].length === 0) next[today] = normalized
          return next
        })
      })
      .catch(err => setError(err.message || 'Failed to load study plan.'))
  }, [])

  useEffect(() => {
    saveWeekPlansToStorage(weekPlans)
  }, [weekPlans])

  const toggleTask = (id) => {
    setWeekPlans(prev => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }))
  }

  const resetForm = () => {
    setForm({ time: '', task: '', subject: 'General' })
    setEditingId(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.time.trim() || !form.task.trim() || !form.subject.trim()) return

    setWeekPlans(prev => {
      const existing = prev[selectedDay] || []
      if (editingId !== null) {
        return {
          ...prev,
          [selectedDay]: existing.map(item =>
            item.id === editingId ? { ...item, ...form } : item
          ),
        }
      }

      const nextId = existing.length ? Math.max(...existing.map(t => t.id)) + 1 : 1
      return {
        ...prev,
        [selectedDay]: [...existing, { id: nextId, ...form, completed: false }],
      }
    })

    resetForm()
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setForm({
      time: task.time || '',
      task: task.task || '',
      subject: task.subject || 'General',
    })
  }

  const removeTask = (id) => {
    setWeekPlans(prev => ({
      ...prev,
      [selectedDay]: (prev[selectedDay] || []).filter(task => task.id !== id),
    }))
    if (editingId === id) resetForm()
  }

  const generateTimetable = async (e) => {
    e.preventDefault()
    if (!aiPrompt.trim()) return

    setGenerating(true)
    setError('')
    try {
      const data = await getStudyPlan(`Create a full-day timetable for: ${aiPrompt}`)
      setPlan(prev => ({
        ...prev,
        ...data,
      }))
      const generatedTasks = (data.dailyPlan || []).map((task, index) => ({
        ...task,
        id: typeof task.id === 'number' ? task.id : index + 1,
        time: normalizeTaskTime(task.time, index),
        completed: Boolean(task.completed),
      }))
      setWeekPlans(prev => ({ ...prev, [selectedDay]: generatedTasks }))
      setSavedMessage('')
    } catch (err) {
      setError(err.message || 'Failed to generate timetable.')
    } finally {
      setGenerating(false)
    }
  }

  const saveCurrentDay = () => {
    saveWeekPlansToStorage(weekPlans)
    setSavedMessage(`Saved ${selectedDay} timetable`)
    setTimeout(() => setSavedMessage(''), 1800)
  }

  const addRecommendationToPlan = async () => {
    setAddingRecommendation(true)
    setError('')
    try {
      const weakTopic = plan.weakTopics?.[0] || 'your weakest topic'
      const focusTopic = plan.focusTopics?.[0] || weakTopic
      const response = await getStudyPlan(
        `Create one focused ${selectedDay} study block on ${focusTopic}. `
        + 'Return a practical task for 60-90 minutes.'
      )

      const firstTask = response?.dailyPlan?.[0]
      const existing = weekPlans[selectedDay] || []
      const nextId = existing.length ? Math.max(...existing.map(t => t.id)) + 1 : 1
      const recommendationTask = {
        id: nextId,
        time: buildDefaultTimeSlot(existing.length),
        task: firstTask?.task || `Focused revision and practice for ${focusTopic}`,
        subject: firstTask?.subject || 'General',
        completed: false,
      }

      setWeekPlans(prev => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), recommendationTask],
      }))
      setSavedMessage(`Added AI recommendation to ${selectedDay}`)
      setTimeout(() => setSavedMessage(''), 1800)
    } catch (err) {
      setError(err.message || 'Failed to add recommendation.')
    } finally {
      setAddingRecommendation(false)
    }
  }

  // Determine border color based on subject
  const getSubjectColor = (subject) => {
    switch(subject) {
      case 'Physics': return '#3B82F6' // Blue
      case 'Chemistry': return '#F97316' // Orange
      case 'Mathematics': return '#8B5CF6' // Purple
      default: return 'var(--text-main)'
    }
  }

  if (error) return <div className="loading-state text-center mt-40">{error}</div>
  if (!plan) return <div className="loading-state text-center mt-40">Loading your AI Study Plan...</div>

  const currentTasks = weekPlans[selectedDay] || []
  const totalTasks = Object.values(weekPlans).reduce((acc, tasks) => acc + tasks.length, 0)
  const completedTasks = Object.values(weekPlans).reduce(
    (acc, tasks) => acc + tasks.filter(task => task.completed).length,
    0
  )
  const weekProgress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="study-plan-page">
      <div className="header-section text-center">
        <h1 className="page-title text-gradient">Your Personalized <span className="text-gradient-orange">Study Plan</span></h1>
        <p className="hero-subtext">AI-generated based on your performance</p>
      </div>

      <div className="insights-row">
        <div className="insight-pill danger">
          <AlertTriangle size={16} /> Weak: {plan.weakTopics?.[0] || 'Not available'}
        </div>
        <div className="insight-pill success">
          <CheckCircle size={16} /> Strong: {plan.strongTopics?.[0] || 'Not available'}
        </div>
        <div className="insight-pill focus">
          <Target size={16} /> Focus: {plan.focusTopics?.[0] || 'Not available'}
        </div>
      </div>

      <div className="plan-container">
        <div className="main-plan-column">
          <div className="card calendar-strip">
            {days.map(day => (
              <div
                key={day}
                className={`calendar-day ${day === selectedDay ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDay(day)
                  resetForm()
                }}
              >
                <span className="day-name">{day}</span>
                <span className="day-date">{day === today ? 'Today' : ''}</span>
              </div>
            ))}
          </div>

          <div className="card daily-tasks-card fade-in">
            <h3 className="section-title mb-4">{selectedDay}'s Agenda</h3>

            <form className="ai-timetable-form" onSubmit={generateTimetable}>
              <input
                className="task-input"
                placeholder="Ask AI to generate timetable (e.g. 'Physical chemistry for NEET, 6 hours')"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <button type="submit" className="btn-primary btn-small" disabled={generating || !aiPrompt.trim()}>
                {generating ? 'Generating...' : 'Generate Timetable'}
              </button>
            </form>
            <div className="task-editor-actions" style={{ marginBottom: '12px' }}>
              <button type="button" className="btn-outline btn-small" onClick={saveCurrentDay}>
                Save {selectedDay}
              </button>
              {savedMessage && <span className="label-text">{savedMessage}</span>}
            </div>

            {editingId !== null && (
              <form className="task-editor" onSubmit={handleSubmit}>
                <input
                  className="task-input"
                  placeholder="Time (e.g. 6:00 AM - 7:00 AM)"
                  value={form.time}
                  onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                />
                <input
                  className="task-input"
                  placeholder="Task (e.g. Revise Chemical Kinetics)"
                  value={form.task}
                  onChange={(e) => setForm(prev => ({ ...prev, task: e.target.value }))}
                />
                <input
                  className="task-input"
                  placeholder="Subject (Physics/Chemistry/Math/Biology)"
                  value={form.subject}
                  onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                />
                <div className="task-editor-actions">
                  <button type="submit" className="btn-primary btn-small">Save Task</button>
                  <button type="button" className="btn-outline btn-small" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            )}
            
            <div className="task-list">
              {currentTasks.map(task => (
                <div 
                  key={task.id} 
                  className={`task-item interactive ${task.completed ? 'completed' : ''}`}
                  style={{ borderLeftColor: getSubjectColor(task.subject) }}
                >
                  <div className="task-info">
                    <span className="task-time">{task.time}</span>
                    <h4 className="task-desc">{task.task}</h4>
                    <span className="task-subject" style={{ color: getSubjectColor(task.subject) }}>{task.subject}</span>
                  </div>
                  <div className="task-actions">
                    <button
                      className="btn-outline btn-small"
                      type="button"
                      onClick={() => startEdit(task)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-outline btn-small"
                      type="button"
                      onClick={() => removeTask(task.id)}
                    >
                      Remove
                    </button>
                    <button className="check-btn" type="button" onClick={() => toggleTask(task.id)}>
                      {task.completed ? <CheckSquare size={24} color="var(--pw-primary)" /> : <Square size={24} color="var(--border-color)" />}
                    </button>
                  </div>
                </div>
              ))}
              {currentTasks.length === 0 && (
                <div className="card text-secondary">No tasks for {selectedDay}. Generate a timetable above.</div>
              )}
            </div>

            <div className="progress-section mt-8">
              <div className="flex-between">
                <span className="label-text">Week Completion</span>
                <span className="text-gradient-orange" style={{ fontWeight: 'bold' }}>{weekProgress}%</span>
              </div>
              <div className="progress-bar-bg mt-2">
                <div className="progress-bar-fill" style={{ width: `${weekProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-column">
          <div className="card ai-glow recommendation-card">
            <div className="card-header">
              <Sparkles size={20} color="var(--pw-primary)" />
              <h3>AI Recommendation</h3>
            </div>
            <p className="recommendation-text">
              Prioritize {plan.weakTopics?.[0] || 'your weakest topic'} today and keep one focused revision block to improve consistency.
            </p>
            <button
              className="btn-primary w-full mt-4"
              type="button"
              onClick={addRecommendationToPlan}
              disabled={addingRecommendation}
            >
              {addingRecommendation ? `Adding to ${selectedDay}...` : `Add to ${selectedDay}'s Plan`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
