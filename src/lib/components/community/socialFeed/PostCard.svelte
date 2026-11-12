<script>
 import { onMount } from 'svelte';
 import * as Avatar from '$lib/components/ui/avatar';
 import { Badge } from '$lib/components/ui/badge';
 import { Button } from '$lib/components/ui/button';
 import * as Card from '$lib/components/ui/card';
 import ResilientImage from '$lib/components/shared/ResilientImage.svelte';
 import { ArrowUpRight, Eye, Clock3, MessageSquare, ChevronDown, Tag } from 'lucide-svelte';
 import PostLikeButton from './PostLikeButton.svelte';
 import PostComments from './PostComments.svelte';
 let { post, currentPath = '/community', showImage = true, preview = true, compact = false } = $props();
 const id = $props.id();
 let mounted = $state(false);
 let expanded = $state(false);
 let commentsOpened = $state(false);
 let newComments = $state(0);
 let trigger = $state(null);
 onMount(() => { mounted = true; });
 const avatarFallback = $derived(post.author.name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase() ?? '').join('') || 'CM');
 const count = $derived(post.comments + newComments);
 $effect(() => { post.id; post.comments; newComments = 0; });
 function toggleComments() { expanded = !expanded; if (expanded) commentsOpened = true; }
 function closeComments() { expanded = false; trigger?.focus(); }
</script>
<article class="post-preview" class:post-preview-compact={compact} aria-label={post.title || `Post by ${post.author.name}`}>
 <Card.Root class="post-preview-card">
  <Card.Header class="post-preview-header">
   <Avatar.Root class="post-preview-avatar"><Avatar.Image src={post.author.avatar ?? undefined} alt={post.author.name} /><Avatar.Fallback>{avatarFallback}</Avatar.Fallback></Avatar.Root>
   <div class="post-preview-identity">
    <div class="post-preview-author-line"><span class="post-preview-author">{post.author.name}</span><Badge class="post-preview-topic">{post.categoryLabel}</Badge><Badge variant="outline" class="post-preview-type">{post.typeLabel}</Badge></div>
    <div class="post-preview-metadata"><span><Clock3 aria-hidden="true" /><time datetime={post.createdAt}>{post.timestampLabel}</time></span><span><Eye aria-hidden="true" />{post.views} views</span></div>
   </div>
   <Button href={post.href} variant="ghost" size="icon" class="post-preview-open" aria-label={`Open ${post.title || 'post'}`}><ArrowUpRight aria-hidden="true" /></Button>
  </Card.Header>
  <Card.Content class="post-preview-content">
   {#if post.title}<svelte:element this={compact ? 'h3' : 'h2'} class="post-preview-title"><a href={post.href}>{post.title}</a></svelte:element>{/if}
   <p class="post-preview-body" class:post-preview-excerpt={preview}>{post.content}</p>
   {#if showImage && post.image}<div class="post-preview-media"><ResilientImage src={post.image} fallbackSrc={null} alt={post.title || 'Community post'} class="post-preview-image" hideOnError loading="lazy" /></div>{/if}
   {#if post.tags.length}<div class="post-preview-tags" aria-label="Post topics">{#each post.tags as tag}<a href={`/community/posts?tag=${encodeURIComponent(tag)}`}><Tag aria-hidden="true" />{tag}</a>{/each}</div>{/if}
  </Card.Content>
  <Card.Footer class="post-preview-footer">
   <PostLikeButton {post} {currentPath} />
   {#if mounted}
    <Button variant="ghost" class="post-engagement-button" bind:ref={trigger} aria-expanded={expanded} aria-controls={`${id}-comments`} onclick={toggleComments}>
     <MessageSquare aria-hidden="true" /><span>{count} {count === 1 ? 'comment' : 'comments'}</span><ChevronDown aria-hidden="true" class={expanded ? 'post-comments-chevron expanded' : 'post-comments-chevron'} />
    </Button>
   {:else}<Button href={`${post.href}#comments`} variant="ghost" class="post-engagement-button"><MessageSquare aria-hidden="true" />{count} comments</Button>{/if}
  </Card.Footer>
  <div id={`${id}-comments`} hidden={!expanded}>
   {#if commentsOpened}{#key post.id}<PostComments {post} {currentPath} onposted={() => newComments += 1} onclose={closeComments} />{/key}{/if}
  </div>
 </Card.Root>
</article>
