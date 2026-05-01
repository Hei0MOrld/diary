'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function DiaryPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('diary')
      .select('*')
      .order('date', { ascending: false })
      .order('seq', { ascending: true })

    if (!error) setEntries(data)
    setLoading(false)
  }

  // 日付ごとにグループ化
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.date
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {})

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
        <div>
          <Link href="https://Hei0MOrld.github.io/mypage" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '0.5rem', display: 'block' }}>
            ← KO Portfolio
          </Link>
          <h1 style={{ fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase' }}>
            DIARY
          </h1>
        </div>
        <Link href="/post" style={{
          padding: '0.7rem 1.5rem',
          background: 'var(--y)',
          color: '#0a0a0a',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          + 投稿
        </Link>
      </div>

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: '0.85rem', letterSpacing: '2px' }}>
          Loading...
        </p>
      )}

      {!loading && entries.length === 0 && (
        <p style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', fontSize: '0.85rem', letterSpacing: '2px' }}>
          まだ日記がありません
        </p>
      )}

      {/* 日付ごとに表示 */}
      {Object.entries(grouped).map(([date, photos]) => (
        <div key={date} style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontSize: '0.7rem',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'var(--y)',
            marginBottom: '1rem',
            fontFamily: 'monospace',
          }}>
            {formatDate(date)}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5px',
            background: 'rgba(255,255,255,0.05)',
          }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', background: 'var(--card)', overflow: 'hidden' }}>
                <img
                  src={photo.image_url}
                  alt={`${formatDate(photo.date)} ${photo.seq}枚目`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '0.6rem 0.8rem',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  fontSize: '0.65rem',
                  letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'monospace',
                }}>
                  {photo.seq}枚目
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
