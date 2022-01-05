<div class="modal-backdrop fixed-full" style={`z-index: ${zIndex}`}>
    <div class="backdrop-color fixed-full" style={`background: ${color}; opacity: ${opacity}`}></div>
    <div class="backdrop-content">
        <slot />
    </div>
</div>

<style>
    .modal-backdrop {
        z-index: 0
    }
    .backdrop-color {
        z-index: 1;
    }
    .backdrop-content {
        height: 100%;
        z-index: 2;
        position: relative;
    }
</style>

<script lang="ts">
    export let color: string = 'var(--dm-darker)'
    export let opacity: number = 0.85
    export let zIndex: number = 1
</script>