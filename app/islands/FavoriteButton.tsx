import { useEffect, useRef, useState } from 'hono/jsx'

// 1人(=1ブラウザ)あたりの拍手上限
const LIMIT = 50
// 連打をまとめてサーバーへ送るまでの待ち時間(ms)
const DEBOUNCE = 800

type Props = {
  slug: string
}

// note風の拍手ボタン。何度でも押せてカウントが増えるが、
// 1ブラウザあたり最大LIMIT回まで(localStorageで管理するソフト制御)。
export default function FavoriteButton({ slug }: Props) {
  // サーバー上の総数。未取得の間はnull
  const [count, setCount] = useState<number | null>(null)
  // このブラウザでの拍手済み回数(0..LIMIT)
  const [myClaps, setMyClaps] = useState(0)

  // 連打中のロジック用にrefで最新値を保持(stale closure回避)
  const myClapsRef = useRef(0)
  const pendingRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 保留中の加算分をまとめてPOST
  const flush = () => {
    const amount = pendingRef.current
    if (amount <= 0) return
    pendingRef.current = 0
    fetch(`/api/likes/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { count?: number }) => {
        if (typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {
        // 失敗したら次回送信に再キュー(楽観的に増やした表示はそのまま)
        pendingRef.current += amount
      })
  }

  // マウント時: 総数取得とローカルの拍手済み回数の復元
  useEffect(() => {
    let active = true
    fetch(`/api/likes/${slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { count?: number }) => {
        if (active && typeof data.count === 'number') setCount(data.count)
      })
      .catch(() => {
        if (active) setCount(0)
      })

    const stored = Number.parseInt(
      localStorage.getItem(`claps:${slug}`) ?? '0',
      10
    )
    const restored = Number.isFinite(stored)
      ? Math.min(Math.max(stored, 0), LIMIT)
      : 0
    myClapsRef.current = restored
    setMyClaps(restored)

    return () => {
      active = false
    }
  }, [slug])

  // 離脱時に保留分を取りこぼさないようsendBeaconで送る
  useEffect(() => {
    const onHide = () => {
      const amount = pendingRef.current
      if (amount > 0 && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify({ amount })], {
          type: 'application/json',
        })
        navigator.sendBeacon(`/api/likes/${slug}`, blob)
        pendingRef.current = 0
      }
    }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [slug])

  const reachedLimit = myClaps >= LIMIT

  const handleClick = () => {
    if (myClapsRef.current >= LIMIT) return
    myClapsRef.current += 1
    setMyClaps(myClapsRef.current)
    localStorage.setItem(`claps:${slug}`, String(myClapsRef.current))
    // 楽観的に総数を増やす
    setCount((c) => (c ?? 0) + 1)

    pendingRef.current += 1
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, DEBOUNCE)
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={reachedLimit}
      aria-label='この記事に拍手する'
      title={reachedLimit ? 'ありがとうございます！' : 'この記事に拍手する'}
      class='btn btn-outline gap-2'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        class='w-5 h-5'
        fill={myClaps > 0 ? 'currentColor' : 'none'}
        stroke='currentColor'
        stroke-width='2'
        stroke-linecap='round'
        stroke-linejoin='round'
        aria-hidden='true'
      >
        <title>拍手</title>
        <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
      </svg>
      <span class='text-base tabular-nums'>{count ?? '–'}</span>
    </button>
  )
}
