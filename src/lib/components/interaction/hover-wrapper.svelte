<script lang="ts">
    export let onEnter: (...props: any) => any = () => console.log('Hovering over item')
    export let onLeave: (...props: any) => any = () => console.log('Stopped hovering over item')
</script>

<div class="hover-wrapper" on:mouseenter={onEnter} on:mouseleave={onLeave}>
    <slot />
</div>