<template>
  <div>
   
  </div>
</template>

<script>
import { useHead } from '@unhead/vue'

export default {
  name: 'StructuredData',
  
  props: {
    breadcrumbs: {
      type: Array,
      default: () => []
    },
    pageType: {
      type: String,
      default: 'WebPage'
    },
    structuredData: {
      type: Object,
      default: () => ({})
    }
  },
  
  setup(props) {
    const base_url = typeof window !== 'undefined' ? window.location.origin : 'https://f1stats.live'
    
    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "F1Stats.live",
      "description": "Premier destination for Formula 1 race analytics, telemetry data, and real-time insights",
      "url": base_url,
      "logo": `${base_url}/f1-analytics-og.jpg`,
      
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "siddheshd11@gmail.com"
      }
    }

    // WebSite Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "F1Stats.live",
      "description": "Comprehensive Formula 1 race analytics and telemetry data platform",
      "url": base_url,
      
    }

    // Breadcrumb Schema
    const breadcrumbSchema = props.breadcrumbs.length > 0 ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": props.breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': `${base_url}${crumb.path}`
      }))
    } : null

    // ✅ Use useHead to add structured data scripts
    const scripts = [
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationSchema)
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(websiteSchema)
      }
    ]

    // Add breadcrumb schema if exists
    if (breadcrumbSchema) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(breadcrumbSchema)
      })
    }

    // Add custom structured data if provided
    if (Object.keys(props.structuredData).length > 0) {
      scripts.push({
        type: 'application/ld+json',
        children: JSON.stringify(props.structuredData)
      })
    }

    useHead({
      script: scripts
    })
    
    return {}
  }
}
</script>
