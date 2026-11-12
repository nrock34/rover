<script>
 import { enhance } from '$app/forms';
 import { Button } from '$lib/components/ui/button';
 import { Input } from '$lib/components/ui/input';
 import * as Card from '$lib/components/ui/card';
 import { Mail, LoaderCircle } from 'lucide-svelte';
 let { result = null } = $props();
 let pending = $state(false);
 let email = $state('');
 const id = $props.id();
 const invalid = $derived(result?.error === 'invalid_email');
</script>

<Card.Root class="community-module community-card community-panel">
 <Card.Header class="community-card-heading">
  <div class="community-panel-title"><Mail aria-hidden="true" /><h2>Monthly community updates</h2></div>
  <p class="community-support text-sm">Community highlights and opportunities, once a month.</p>
 </Card.Header>
 <Card.Content class="community-card-content">
  <form data-analytics-form="newsletter" class="community-newsletter-form" method="POST" action="?/newsletterSignup" aria-busy={pending}
   use:enhance={() => {
    pending = true;
    return async ({ result: actionResult, update }) => {
     try { await update({reset: false}); if (actionResult.type === 'success') email = ''; }
     finally { pending = false; }
    };
   }}>
   <label for={`${id}-email`} class="text-sm font-medium">Email address</label>
   <Input id={`${id}-email`} name="email" type="email" autocomplete="email" bind:value={email} placeholder="you@example.com"
    class="community-control" required aria-invalid={invalid} aria-describedby={`${id}-feedback ${id}-help`} />
   <Button type="submit" variant="outline" disabled={pending} class="community-control w-full">
    {#if pending}<LoaderCircle class="community-pending-icon" aria-hidden="true" />{/if}{pending ? 'Subscribing…' : 'Subscribe'}
   </Button>
  </form>
  <div id={`${id}-feedback`} aria-live="polite" aria-atomic="true">
   {#if result?.status === 'success'}<p class="community-feedback text-sm">You’re subscribed. We’ll keep you posted.</p>
   {:else if result?.error}<p class="community-feedback text-sm text-destructive">{result.description ?? result.error}</p>{/if}
  </div>
  <p id={`${id}-help`} class="community-support mt-3 text-xs">Unsubscribe anytime.</p>
 </Card.Content>
</Card.Root>
