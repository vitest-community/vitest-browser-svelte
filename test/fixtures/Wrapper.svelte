<script lang="ts">
    import type {Snippet} from 'svelte'
    let {heading, children} = $props<{heading: string, children: Snippet}>()
</script>

<div>
    <h1>{heading}</h1>
    {@render children?.()}
</div>
