<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte"
    // export let id: string = 'tab-id'
    export let icon: string | null = null
    export let label: string = 'Tab'
    export let isActive: boolean = false;
    export let isFirst: boolean = false
    export let isLast: boolean = false
</script>

<div class="tab-item flex" data-is-last={isLast} data-is-first={isFirst} data-active={isActive}>
    <p>{label}</p>
    {#if icon}
        <div class="tab-icon flex">
            <Icon icon={icon} />
        </div>
    {/if}
    {#if isActive}
        <div class="active-highlight"></div>
    {/if}
</div>

<style>
    .tab-item {
        width: 100%;
        height: 100%;
        min-height: 66px;
        position: relative;
        cursor: default;
    }

    .tab-icon {
        height: 100%;
        width: 30px;
    }

    p {
        font-weight: 100!important;
        font-size: 11pt;
        margin: 0;
    }
    
    .tab-item[data-active="false"] p,
    .tab-item[data-active="false"] .tab-icon {
        opacity: 0.25;
    }

    .tab-item[data-active="true"] p {
        font-weight: 400;
        color: var(--dm-dark)
    }

    .active-highlight {
        height: 3px;
        width: 100%;
        background: black;
        position: absolute;
        right: 0;
        left: 0;
        z-index: 2;
        bottom: -1px;
    }
</style>