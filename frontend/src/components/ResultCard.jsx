import React from 'react'

export default function ResultCard({ children, className = '', interactive = false, aiGlow = false }) {
  let classes = `card ${className}`
  if (interactive) classes += ' interactive'
  if (aiGlow) classes += ' ai-glow'
  
  return (
    <div className={classes}>
      {children}
    </div>
  )
}
