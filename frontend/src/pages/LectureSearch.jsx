import { useState } from 'react'
import { Search as SearchIcon, PlayCircle, Clock, Upload, FileVideo, X } from 'lucide-react'
import { searchLecture, uploadLecture } from '../services/api'
import './LectureSearch.css'

export default function LectureSearch() {
  // ── Search state (unchanged) ──
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All Subjects')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  // ── Upload state (new) ──
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [activeTab, setActiveTab] = useState('search') // 'search' | 'upload'

  const filters = ['All Subjects', 'Physics', 'Chemistry', 'Mathematics', 'Biology']

  // ── Search handler (unchanged) ──
  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setResults([])
    setError('')
    try {
      const data = await searchLecture(query)
      setResults(data)
    } catch (err) {
      setError(err.message || 'Search failed.')
    }
    setLoading(false)
  }

  // ── Upload handler (new) ──
  const handleUpload = async () => {
    if (!uploadFile) return
    setUploading(true)
    setUploadResult(null)
    setUploadError('')
    try {
      const data = await uploadLecture(uploadFile)
      setUploadResult(data)
    } catch (err) {
      setUploadError(err.message || 'Upload failed.')
    }
    setUploading(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadFile(file)
      setUploadResult(null)
      setUploadError('')
    }
  }

  const clearUpload = () => {
    setUploadFile(null)
    setUploadResult(null)
    setUploadError('')
  }

  return (
    <div className="lecture-search-page">
      <div className="header-section text-center">
        <h1 className="page-title">AI Lecture <span className="text-gradient-orange">Analyzer</span></h1>
        <p className="hero-subtext">Search lectures or upload a video to get AI transcript & topics.</p>
      </div>

      {/* ── Tab Switch ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            padding: '10px 28px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'search' ? '#6c47ff' : '#f0f0f0',
            color: activeTab === 'search' ? '#fff' : '#555',
            transition: 'all 0.2s'
          }}
        >
          🔍 Search Lectures
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 28px',
            borderRadius: '999px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            background: activeTab === 'upload' ? '#6c47ff' : '#f0f0f0',
            color: activeTab === 'upload' ? '#fff' : '#555',
            transition: 'all 0.2s'
          }}
        >
          📹 Upload Video
        </button>
      </div>

      {/* ══════════════════════════════════
          SEARCH TAB (existing, unchanged)
      ══════════════════════════════════ */}
      {activeTab === 'search' && (
        <>
          <div className="search-container">
            <div className="search-bar-wrapper">
              <SearchIcon className="search-icon" size={24} />
              <input
                type="text"
                className="search-input"
                placeholder="Search any concept, formula, or topic... e.g. 'electromagnetic induction'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="btn-primary search-btn"
                onClick={handleSearch}
                disabled={loading || !query.trim()}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="filter-chips">
              {filters.map(f => (
                <button
                  key={f}
                  className={`tag-pill ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="results-grid mt-40">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card result-card skeleton-card">
                  <div className="skeleton-thumb shimmer"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line shimmer w-full h-8"></div>
                    <div className="skeleton-line shimmer w-1/3 h-6"></div>
                    <div className="skeleton-line shimmer w-full h-12 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && searched && results.length > 0 && (
            <div className="results-section fade-in">
              <div className="results-amount text-secondary">
                Showing {results.length} results for <span className="text-gradient">'{query}'</span>
              </div>
              <div className="results-grid">
                {results.map(result => (
                  <div key={result.id} className="card result-card interactive ai-glow">
                    <div className="result-thumb-wrapper">
                      {result.thumb ? (
                        <img src={result.thumb} alt={result.title} className="result-thumb" />
                      ) : (
                        <div className="result-thumb"></div>
                      )}
                      <div className="play-overlay">
                        <PlayCircle size={48} color="#fff" />
                      </div>
                      <div className="timestamp-badge">
                        <Clock size={12} /> {result.timestamp}
                      </div>
                    </div>
                    <div className="result-content">
                      <div className="result-header">
                        <span className="tag-pill result-subject">{result.subject}</span>
                        <h3 className="result-title">{result.title}</h3>
                      </div>
                      <div className="result-summary">
                        <span className="label-text" style={{ margin: '0', fontSize: '10px' }}>AI Summary</span>
                        <p>{result.summary}</p>
                      </div>
                      <button className="btn-outline watch-clip-btn">
                        ▶ Jump to {result.timestamp}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && searched && !error && results.length === 0 && (
            <div className="card mt-4 text-secondary">No matching lectures found.</div>
          )}
          {error && <div className="card mt-4 text-secondary">{error}</div>}
        </>
      )}

      {/* ══════════════════════════════════
          UPLOAD TAB (new)
      ══════════════════════════════════ */}
      {activeTab === 'upload' && (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Upload Box */}
          <div style={{
            border: '2px dashed #6c47ff',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            background: '#faf9ff',
            marginBottom: '24px'
          }}>
            <FileVideo size={48} color="#6c47ff" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
              Upload your lecture video
            </p>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
              Supports MP4, MKV, MOV, WEBM • Max recommended: 100MB
            </p>

            {!uploadFile ? (
              <label style={{
                display: 'inline-block',
                padding: '12px 28px',
                background: '#6c47ff',
                color: '#fff',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                <Upload size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Choose Video File
                <input
                  type="file"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                background: '#ede9ff',
                padding: '12px 20px',
                borderRadius: '12px'
              }}>
                <FileVideo size={20} color="#6c47ff" />
                <span style={{ fontWeight: '600', color: '#6c47ff' }}>{uploadFile.name}</span>
                <button onClick={clearUpload} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} color="#999" />
                </button>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {uploadFile && !uploadResult && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '14px',
                background: uploading ? '#aaa' : '#6c47ff',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                marginBottom: '24px'
              }}
            >
              {uploading ? '⏳ Analyzing... (this may take 1-2 mins)' : '🚀 Analyze Lecture'}
            </button>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div style={{
              background: '#fff0f0',
              border: '1px solid #ffcccc',
              borderRadius: '12px',
              padding: '16px',
              color: '#cc0000',
              marginBottom: '24px'
            }}>
              ❌ {uploadError}
            </div>
          )}

          {/* Results */}
          {uploadResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Transcript */}
              <div style={{
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px' }}>
                  📝 Full Transcript
                </h3>
                <p style={{
                  color: '#444',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: '#f8f8f8',
                  padding: '16px',
                  borderRadius: '10px'
                }}>
                  {uploadResult.transcript}
                </p>
              </div>

              {/* Topics + Timestamps */}
              <div style={{
                background: '#fff',
                border: '1px solid #e8e8e8',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                  ⏱️ Topics & Timestamps
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {uploadResult.topics.map((topic, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      padding: '14px',
                      background: '#faf9ff',
                      borderRadius: '12px',
                      border: '1px solid #ede9ff'
                    }}>
                      <div style={{
                        minWidth: '80px',
                        background: '#6c47ff',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {topic.start}<br />↓<br />{topic.end}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                          {topic.title}
                        </p>
                        <p style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>
                          {topic.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyze Another */}
              <button
                onClick={clearUpload}
                style={{
                  padding: '12px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#555'
                }}
              >
                + Analyze Another Video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}