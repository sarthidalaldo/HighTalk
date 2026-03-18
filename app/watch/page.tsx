'use client'

import { PageHeader } from '@/components/page-header'
import { VideoGridItem } from '@/components/video-grid-item'
import { videos } from '@/data/videos'
import { formatDuration, postedAgo, viewCount } from '@/lib/utils'
import { BadgeCheck, Bell, Share2, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'

function WatchPageInner() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get('v')
  const video = videos.find((v) => v.id === videoId) ?? videos[0]
  const related = videos.filter((v) => v.id !== video.id).slice(0, 8)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([
    { id: '1', author: 'MindfulReader', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop', body: 'This completely reframed how I think about focus. Incredible conversation.', postedAt: new Date('2024-03-13') },
    { id: '2', author: 'DeepThinker42', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop', body: 'The section on altered perception was genuinely groundbreaking. More of this please.', postedAt: new Date('2024-03-14') },
    { id: '3', author: 'PhiloFan', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop', body: 'Came for the philosophy, stayed for the whole thing. HighTalk is the only platform doing this.', postedAt: new Date('2024-03-15') }
  ])

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    setComments((prev) => [
      { id: String(Date.now()), author: 'You', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop', body: comment.trim(), postedAt: new Date() },
      ...prev
    ])
    setComment('')
  }

  return (
    <div className='flex max-h-screen flex-col'>
      <PageHeader />
      <div className='flex flex-col gap-6 overflow-auto px-4 pb-8 lg:flex-row lg:px-8'>
        <div className='flex flex-col gap-4 lg:min-w-0 lg:flex-1'>
          <div className='relative aspect-video w-full overflow-hidden rounded-xl bg-black'>
            <video
              ref={videoRef}
              src={video.videoUrl}
              controls
              autoPlay
              className='h-full w-full object-contain'
            />
          </div>

          <div>
            <h1 className='text-lg font-semibold leading-snug'>{video.title}</h1>
            <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
              <span>{viewCount(video.views)} views</span>
              <span>&bull;</span>
              <span>{postedAgo(video.postedAt)}</span>
              <span>&bull;</span>
              <span>{formatDuration(video.duration)}</span>
              {video.category && (
                <>
                  <span>&bull;</span>
                  <span className='rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs font-medium'>{video.category}</span>
                </>
              )}
            </div>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 border-y border-border py-3'>
            <div className='flex items-center gap-3'>
              <Link href={`/channel/${video.channel.id}`}>
                <Image
                  src={video.channel.profileUrl}
                  alt={video.channel.name}
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-full'
                  unoptimized
                />
              </Link>
              <div>
                <div className='flex items-center gap-1 text-sm font-semibold'>
                  {video.channel.name}
                  <BadgeCheck className='h-4 w-4 text-primary' />
                </div>
                <div className='text-xs text-muted-foreground'>Creator on HighTalk</div>
              </div>
              <button className='ml-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-80'>
                Follow
              </button>
              <button className='rounded-full border border-border px-3 py-1.5'>
                <Bell className='h-4 w-4' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setLiked((l) => !l)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${liked ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-secondary'}`}
              >
                <ThumbsUp className='h-4 w-4' />
                {liked ? 'Liked' : 'Like'}
              </button>
              <button className='flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium hover:bg-secondary'>
                <Share2 className='h-4 w-4' />
                Share
              </button>
            </div>
          </div>

          <div className='rounded-xl bg-secondary/50 p-4'>
            <p className='text-sm font-medium mb-1'>About this discussion</p>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              An in-depth exploration hosted on HighTalk — where creators share elevated content spanning philosophy, science, the creative arts, and meaningful conversation. This video was carefully reviewed to meet our community standards for thoughtful discourse.
            </p>
          </div>

          <div className='flex flex-col gap-4'>
            <h2 className='text-base font-semibold'>{comments.length} Comments</h2>
            <form onSubmit={handleSubmitComment} className='flex gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary'>
                You
              </div>
              <div className='flex flex-1 flex-col gap-2'>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder='Add a comment...'
                  className='w-full border-b border-border bg-transparent pb-1 text-sm outline-none placeholder:text-muted-foreground focus:border-primary'
                />
                {comment.trim() && (
                  <div className='flex justify-end gap-2'>
                    <button type='button' onClick={() => setComment('')} className='rounded-full px-4 py-1.5 text-sm hover:bg-secondary'>
                      Cancel
                    </button>
                    <button type='submit' className='rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90'>
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </form>
            <div className='flex flex-col gap-5'>
              {comments.map((c) => (
                <div key={c.id} className='flex gap-3'>
                  <Image src={c.avatar} alt={c.author} width={36} height={36} className='h-9 w-9 shrink-0 rounded-full' unoptimized />
                  <div>
                    <div className='flex items-center gap-2 text-sm'>
                      <span className='font-semibold'>{c.author}</span>
                      <span className='text-xs text-muted-foreground'>{postedAgo(c.postedAt)}</span>
                    </div>
                    <p className='mt-0.5 text-sm text-foreground/90'>{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-3 lg:w-80 lg:shrink-0'>
          <h2 className='text-sm font-semibold text-muted-foreground'>Up Next</h2>
          {related.map((v) => (
            <Link key={v.id} href={`/watch?v=${v.id}`} className='flex gap-2 group'>
              <div className='relative aspect-video w-40 shrink-0 overflow-hidden rounded-md'>
                <Image src={v.thumbnailUrl} alt={v.title} fill className='object-cover transition-transform duration-200 group-hover:scale-105' unoptimized />
                <div className='absolute right-1 bottom-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white'>{formatDuration(v.duration)}</div>
              </div>
              <div className='flex flex-col gap-0.5 min-w-0'>
                <p className='text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors'>{v.title}</p>
                <p className='text-xs text-muted-foreground'>{v.channel.name}</p>
                <p className='text-xs text-muted-foreground'>{viewCount(v.views)} views</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WatchPage() {
  return (
    <Suspense>
      <WatchPageInner />
    </Suspense>
  )
}
