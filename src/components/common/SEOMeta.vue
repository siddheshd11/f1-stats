<template>
  <div>
    <!-- This component handles all SEO meta tags -->
  </div>
</template>

<script>
import { useHead } from '@unhead/vue' // or @vueuse/head

export default {
  name: 'SEOMeta',
  
  props: {
    title: {
      type: String,
      default: 'F1Stats.live - F1 Data & Telemetry Insights, Pre and Post Race Analysis'
    },
    description: {
      type: String,
      default: 'Comprehensive Formula 1 race analytics, live telemetry data, driver and teams statistics, and Grand Prix insights. Your ultimate F1 data destination.'
    },
    keywords: {
      type: String,
      default: 'F1stats.live, f1stats.live, f1 stats, f1stats, Formula 1, F1, racing analytics, telemetry data, F1 stats, Grand Prix, race results, driver standings, team rankings, F1 insights'
    },
    image: {
      type: String,
      default: '/f1-analytics-og.jpg'
    },
    url: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'website'
    },
    structured_data: {
      type: Object,
      default: () => ({})
    }
  },
  
  setup(props) {
    const currentUrl = props.url || (typeof window !== 'undefined' ? window.location.href : '')
    
    useHead({
      title: props.title,
      meta: [
        // Basic SEO
        { name: 'description', content: props.description },
        { name: 'keywords', content: props.keywords },
        { name: 'author', content: 'Siddhesh Dhamorikar' },
        { name: 'email', content: 'siddheshd11@gmail.com' },
        { name: 'robots', content: 'index, follow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        
        // Open Graph / Facebook
        { property: 'og:type', content: props.type },
        { property: 'og:title', content: props.title },
        { property: 'og:description', content: props.description },
        { property: 'og:image', content: props.image },
        { property: 'og:url', content: currentUrl },
        { property: 'og:site_name', content: 'f1stats.live' },
        
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: 'f1stats.live' },
        { name: 'twitter:creator', content: 'siddheshd11@gmail.com' },
        { name: 'twitter:title', content: props.title },
        { name: 'twitter:description', content: props.description },
        { name: 'twitter:image', content: props.image },
        
        // Additional SEO
        { name: 'theme-color', content: '#e10600' }, // F1 red
        { name: 'msapplication-TileColor', content: '#e10600' },
        { name: 'apple-mobile-web-app-title', content: 'F1Stats.live' },
        { name: 'application-name', content: 'F1stats.live' },
      ],
      
      link: [
        { rel: 'canonical', href: currentUrl },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
      ],
      
      script: [
        // Structured Data
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'F1stats.live',
            'description': props.description,
            'url': currentUrl,
            'potentialAction': {
              '@type': 'SearchAction',
              'target': `${currentUrl}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            },
            ...props.structured_data
          })
        }
      ]
    })
    
    return {}
  }
}
</script>
