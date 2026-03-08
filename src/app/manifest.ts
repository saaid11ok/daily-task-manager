import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskFlow Daily Ritual',
    short_name: 'TaskFlow',
    description: 'Stay Focused, Get Done with AI-powered task tracking.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: 'https://picsum.photos/seed/taskflow/192/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://picsum.photos/seed/taskflow/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
