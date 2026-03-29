import React from 'react'

export default function InputBox({ value, onChange, placeholder, onKeyDown, icon: Icon, type = 'text' }) {
  return (
    <div className="search-bar-wrapper">
      {Icon && <Icon className="search-icon" size={24} />}
      <input 
        type={type}
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
