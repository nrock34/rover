<script>
 import PostCard from './PostCard.svelte';
 let { post, currentPath = '/community' } = $props();
</script>
<PostCard {post} {currentPath} compact showImage={false} />
