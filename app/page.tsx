'use client'

import { CategoryPills } from '@/components/category-pills'
import { PageHeader } from '@/components/page-header'
import { Sidebar } from '@/components/sidebar'
import { VideoGridItem } from '@/components/video-grid-item'
import { categories } from '@/data/categories'
import { videos } from '@/data/videos'
import { useState } from 'react'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  const filteredVideos =
    selectedCategory === 'All'
      ? videos
      : videos.filter((v) => v.category === selectedCategory)

  return (
    <div className='flex max-h-screen flex-col'>
      <PageHeader />
      <div className='grid grid-flow-col overflow-auto'>
        <Sidebar />
        <div className='overflow-x-hidden px-2 pb-4'>
          <div className='bg-background sticky top-0 z-10 pb-4'>
            <CategoryPills categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          </div>
          {selectedCategory === 'All' && (
            <div className='mb-6 rounded-xl bg-primary/10 border border-primary/20 px-6 py-5'>
              <h1 className='text-xl font-semibold text-primary mb-1'>Welcome to HighTalk</h1>
              <p className='text-sm text-muted-foreground max-w-2xl'>
                Elevated discussion for curious minds. Explore philosophy, science, creativity, and deep conversations — content that challenges, inspires, and elevates.
              </p>
            </div>
          )}
          {filteredVideos.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {filteredVideos.map((video) => (
                <VideoGridItem key={video.id} {...video} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-24 text-center'>
              <p className='text-lg font-medium text-muted-foreground'>No content in this category yet.</p>
              <p className='mt-1 text-sm text-muted-foreground'>Check back soon — creators are uploading daily.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
