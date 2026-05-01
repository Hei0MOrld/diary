'use client'
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

const PASSWORD = 'kohko2026' // ← 後で変えてね

export default function PostPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef()
  const router = useRouter()

  function checkPassword() {
    if (pw === PASSWORD) {
      setAuthed(true)
    } else {
      setPwError(true)
      setTimeout(() => setPwError(false), 1000)
    }
  }

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function upload() {
    if (!file) return
    setUploading(true)

    try {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD

      // 今日の枚数を取得
      const { data: existing } = await supabase
        .from('diary')
        .select('seq')
        .eq('date', dateStr)
        .order('seq', { ascending: false })
        .limit(1)

      const seq = existing && existing.length > 0 ? existing[0].seq + 1 : 1

      // 画像をStorageにアップロード
      const ext = file.name.split('.').pop()
      const filename = `${dateStr}-${seq}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('diary')
        .upload(filename, file, { upsert: true })

      if (uploadError) throw uploadError

      // 公開URLを取得
      const { data: urlData } = supabase.storage
        .from('diary')
        .getPublicUrl(filename)

      // DBに保存
      const { error: dbError } = await supabase
        .from('diary')
        .insert({ date: dateStr, seq, image_url: urlData.publicUrl })

      if (dbError) throw dbError

      setDone(true)
      setTimeout(() => router.push('/diary'), 1500)

    } catch (e) {
      alert('エラー: ' + e.message)
      setUploading(false)
    }
  }

  // パスワード画面
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem' }}>
        <h1 style={{ fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase' }}>POST</h1>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkPassword()}
          placeholder="パスワード"
          style={{
            background: 'var(--card)',
            border: `1.5px solid ${pwError ? '#FF3D9A' : 'rgba(255,255,255,0.15)'}`,
            color: 'var(--fg)',
            padding: '0.8rem 1.2rem',
            fontSize: '1rem',
            width: '240px',
            outline: 'none',
            fontFamily: 'monospace',
            transition: 'border-color 0.2s',
          }}
        />
        <button
          onClick={checkPassword}
          style={{ padding: '0.7rem 2rem', background: 'var(--y)', color: '#0a0a0a', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '2px', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'monospace' }}
        >
          Enter
        </button>
      </div>
    )
  }

  // 投稿画面
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: '4px', textTransform: 'uppercase' }}>
        {done ? '✓ 投稿完了！' : '写真を撮る'}
      </h1>

      {!done && (
        <>
          {/* 写真撮影ボタン */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            style={{ display: 'none' }}
          />

          {preview ? (
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '2px', display: 'block' }} />
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current.click()}
              style={{
                width: '200px', height: '200px',
                background: 'var(--card)',
                border: '1.5px dashed rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '3rem',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              📷
            </button>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            {preview && (
              <button
                onClick={upload}
                disabled={uploading}
                style={{
                  padding: '0.8rem 2.5rem',
                  background: uploading ? 'rgba(255,229,0,0.4)' : 'var(--y)',
                  color: '#0a0a0a',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '2px',
                  border: 'none',
                  cursor: uploading ? 'wait' : 'pointer',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              >
                {uploading ? '投稿中...' : '投稿する'}
              </button>
            )}
            <button
              onClick={() => router.push('/diary')}
              style={{ padding: '0.8rem 1.5rem', background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace' }}
            >
              戻る
            </button>
          </div>
        </>
      )}
    </div>
  )
}
