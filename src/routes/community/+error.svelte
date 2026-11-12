<script>
 import { page } from '$app/state';
 import * as Card from '$lib/components/ui/card';
 import { Button } from '$lib/components/ui/button';
</script>
<div class="app-shell py-10">
 <Card.Root class="community-card community-empty">
  <h1 class="text-xl font-semibold">{page.status === 404 ? 'Community page not found' : 'Community is temporarily unavailable'}</h1>
  <p class="community-support">{page.status === 404 ? 'This page may have moved or is no longer available.' : 'We couldn’t load community content. Please try again.'}</p>
  <div class="flex flex-wrap gap-3">
   <a href={page.url.pathname} data-sveltekit-reload class="community-directory-link">Reload community</a>
   <Button href="/" variant="ghost">Back to home</Button>
  </div>
 </Card.Root>
</div>
