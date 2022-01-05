<script lang="ts">
    import Icon from "../icon/icon.svelte";
    export let icon: string = 'user'
    export let label: string = 'App Menu Item'
    export let color: string = 'var(--dm-dark)'
    export let action: (...props: any) => any = () => console.log('clicked ', label)
</script>

<div class="app-menu-item flex jc-start" on:click={action}>
    <Icon size="26" icon={icon} color={color} />
    <p class="label flex" style={`color: ${color}!important;`}>{label}</p>
</div>

<style>
    p {
        font-size: 0.8em;
        height: auto;
        line-height: 1.45;
    }
</style>