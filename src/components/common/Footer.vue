<template>
<!-- Footer Section -->
<footer class="f1-primary text-white py-8 px-4 sm:px-6 lg:px-8 mt-3">
  <div class="max-w-7xl mx-auto">
    <!-- Main Footer Content -->
    <div class="grid grid-cols-1 sm:grid-cols-6 gap-8 mb-8">
      <!-- Brand Section -->
      <div class="col-span-1 md:col-span-2">
        <div class="flex items-center space-x-2 mb-4">
          <img
            src="/f1.png" 
            class="h-8 w-auto"
            alt="F1Stats.live Logo"
          />
          <h3 class="text-xl font-bold">F1Stats.live</h3>
        </div>
        <p class="text-gray-300 text-sm leading-relaxed max-w-md">
          Your comprehensive source for Formula 1 race analysis, telemetry data, and real-time insights. 
          Experience the thrill of F1 with detailed statistics and performance analytics.
        </p>
        <!-- Social Media Sharing Links -->
        <div class="space-y-4">
          <h4 class="text-sm font-semibold text-gray-200">Follow & Share</h4>
          <div class="flex flex-wrap gap-3">
            <!-- Facebook -->
            <a 
              :href="getShareUrl('facebook')" 
              target="_blank" 
              rel="noopener noreferrer"
              class=""
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <!-- Twitter/X -->
            <a 
              :href="getShareUrl('twitter')" 
              target="_blank" 
              rel="noopener noreferrer"
              class=""
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            <!-- Instagram -->
            <a 
              :href="getShareUrl('instagram')" 
              target="_blank" 
              rel="noopener noreferrer"
              class=""
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <!-- LinkedIn -->
            <a 
              :href="getShareUrl('linkedin')" 
              target="_blank" 
              rel="noopener noreferrer"
              class=""
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>


            <!-- WhatsApp -->
            <a 
              :href="getShareUrl('whatsapp')" 
              target="_blank" 
              rel="noopener noreferrer"
              class=""
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
            </a>

            <!-- Reddit -->
            <a 
              :href="getShareUrl('reddit')" 
              target="_blank" 
              rel="noopener noreferrer"
              class=""
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="hidden sm:block col-span-1">
        <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="https://www.formula1.com/en/racing/2025" target="_blank" class="text-gray-300 hover:text-white transition-colors">Race Calendar</a></li>
          <li><a href="https://www.formula1.com/en/results/2025/drivers" class="text-gray-300 hover:text-white transition-colors" target="_blank">Driver Standings</a></li>
          <li><a href="https://www.formula1.com/en/results/2025/team" target="_blank" class="text-gray-300 hover:text-white transition-colors">Team Standings</a></li>
          <li><a href="https://www.formula1.com/en/drivers" target="_blank" class="text-gray-300 hover:text-white transition-colors">Drivers</a></li>
          <li><a href="https://www.formula1.com/en/teams" target="_blank" class="text-gray-300 hover:text-white transition-colors">Teams</a></li>
          <li><a href="https://www.formula1.com/en/latest" target="_blank" class="text-gray-300 hover:text-white transition-colors">News</a></li>
        </ul>
      </div>

      <!-- Analytics -->
      <div class="hidden sm:block col-span-1">
        <h4 class="text-lg font-semibold mb-4">Analytics</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="/pre-race" class="text-gray-300 hover:text-white transition-colors">Pre Race Analysis</a></li>
          <li><a href="/post-race" class="text-gray-300 hover:text-white transition-colors">Post Race Analysis</a></li>
          <li><a href="/post-race" class="text-gray-300 hover:text-white transition-colors">Telemetry Data</a></li>
          <li><a href="/post-race" class="text-gray-300 hover:text-white transition-colors">Performance Stats</a></li>
          <li><a href="/post-race" class="text-gray-300 hover:text-white transition-colors">Lap Analysis</a></li>
          <li><a href="/pre-race" class="text-gray-300 hover:text-white transition-colors">Weather Reports</a></li>
        </ul>
      </div>
      <div class="col-span-1">
        <h4 class="text-lg font-semibold mb-4">Resources Used</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="https://openf1.org/" class="text-gray-300 hover:text-white transition-colors" target="_blank">Open F1</a></li>
          <li><a href="https://api.jolpi.ca/ergast/" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors"> jolpi.ca(ergast) </a></li>
          <li><a href="https://f1api.dev/" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors"> F1 API </a></li>
        </ul>
      </div>
      <div class="col-span-1">
        <h4 class="text-lg font-semibold mb-4">Connect</h4>
        <ul class="space-y-2 text-sm">
          <li><a href="mailto:siddheshd11@gmail.com" class="text-gray-300 hover:text-white transition-colors">Email Me</a></li>
          <li><a href="https://buymeacoffee.com/siddheshd17" target="_blank" rel="noopener noreferrer" class="text-gray-300 hover:text-white transition-colors"> ☕ Buy me a coffee </a></li>
        </ul>


      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="mb-15 sm:mb-2">
      

      <!-- Tech Stack Info (Optional) -->
      <div class="text-center mt-4 pt-4 border-t border-gray-800">
        <p class="text-xs text-gray-200">
          Not affiliated with Formula 1 or FIA. Data for educational purposes only.
        </p>
        <p class="text-xs text-gray-200">
          &copy; {{ new Date().getFullYear() }} F1 Analytics. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
</template>
<script>
export default{
  name: 'Footer',
  methods: {
    getShareUrl(platform) {
      const currentUrl = encodeURIComponent(window.location.href)
      const title = encodeURIComponent('F1 Analytics - Formula 1 Race Data & Insights')
      const description = encodeURIComponent('Comprehensive Formula 1 race analysis, telemetry data, and real-time insights')
      
      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${currentUrl}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
        instagram: 'https://www.instagram.com/', // Instagram doesn't support direct URL sharing
        tiktok: 'https://www.tiktok.com/', // TikTok doesn't support direct URL sharing
        youtube: 'https://www.youtube.com/', // YouTube doesn't support direct URL sharing
        whatsapp: `https://wa.me/?text=${title}%20${currentUrl}`,
        reddit: `https://reddit.com/submit?url=${currentUrl}&title=${title}`,
        telegram: `https://t.me/share/url?url=${currentUrl}&text=${title}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${currentUrl}&description=${description}`
      }
      
      return shareUrls[platform] || '#'
    }
  }
};
</script>