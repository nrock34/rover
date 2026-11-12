<script>
 import PostcardsPage from '../../postcards/+page.svelte';
 let { data } = $props();
</script>
<div class="app-shell py-2 text-sm">Development preview · Sample postcards</div>
<PostcardsPage {data} />
