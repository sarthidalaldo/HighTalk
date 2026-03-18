import { formatDuration, postedAgo, viewCount } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type VideoGridItemProps = {
  id: string
  title: string
  channel: {
    id: string
    name: string
    profileUrl: string
  }
  views: number
  duration: number
  postedAt: Date
  thumbnailUrl: string
  videoUrl: string
  category?: string
}

export function VideoGridItem({
  id,
  title,
  channel,
  views,
  duration,
  postedAt,
  thumbnailUrl,
  videoUrl
}: VideoGridItemProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (videoRef.current === null) {
      return
    }

    if (isVideoPlaying) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }, [isVideoPlaying])

  return (
    <div
      className='flex flex-col gap-2'
      onMouseEnter={() => setIsVideoPlaying(true)}
      onMouseLeave={() => setIsVideoPlaying(false)}
    >
      <Link href={`/watch?v=${id}`} className='relative aspect-video'>
        <Image
          src={thumbnailUrl}
          alt={title}
          className={`block h-full w-full object-cover transition-[border-radius] duration-200 ${isVideoPlaying ? 'rounded-none' : 'rounded-sm'}`}
          width={226}
          height={128}
          unoptimized
        />
        <div className='bg-secondary-foreground text-secondary absolute right-2 bottom-2 rounded px-1 text-sm'>
          {formatDuration(duration)}
        </div>
        <video
          src={videoUrl}
          ref={videoRef}
          muted
          playsInline
          className={`absolute inset-0 block h-full object-cover transition-opacity duration-200 ${isVideoPlaying ? 'opacity-100 delay-200' : 'opacity-0'}`}
        />
      </Link>
      <div className='flex gap-2'>
        <Link href={`/@${channel.id}`} className='shrink-0'>
          <Image src={channel.profileUrl} alt={channel.name} width={32} height={32} className='h-8 w-8 rounded-full' unoptimized />
        </Link>
        <div className='flex flex-col'>
          <Link href={`/watch?v=${id}`} className='text-sm/tight font-bold'>
            {title}
          </Link>
          <Link href={`/@${channel.id}`} className='text-secondary-foreground text-xs'>
            {channel.name}
          </Link>
          <div className='text-secondary-foreground text-xs'>
            {viewCount(views)} Views &bull; {postedAgo(postedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
