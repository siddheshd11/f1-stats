<template>
  <div id="app">
    <!-- Preload critical resources -->
    <link rel="preload" href="style.css" as="style">
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="https://api.openf1.org">
    <link rel="dns-prefetch" href="https://api.jolpi.ca">
    <link rel="dns-prefetch" href="https://f1api.dev">
    
    <!-- Your app content -->
    <router-view />
    
    <!-- Structured Data -->
    <StructuredData :breadcrumbs="breadcrumbs" />
  </div>
</template>

<script>
import StructuredData from '@/components/common/StructuredData.vue'
export default {
  name:'App',
  components:{StructuredData},
  data() {
    return {
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'PreRace', path: '/pre-race' },
        { name: 'PostRace', path: '/post-race' }
      ]
    }
  }
}
</script>
