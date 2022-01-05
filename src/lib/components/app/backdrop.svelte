<div class="modal-backdrop fixed-full" style={`z-index: ${zIndex}`}>
    <div class="backdrop-color fixed-full" style={`background: ${color}; opacity: ${opacity}`}></div>
    <div class="backdrop-content" on:click={handler}>
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
    // export let onClick: (e: any) => any = (e) => {
    //     console.log('click handler...', e)
    // }
    function handler(e){
        console.log('test...', e)
        console.log('class test...', e.target.className)
        // if(e.target && e.target.className && e.target.className.indexOf('backdrop-content') !== -1){
        //     console.log('success handler...', e)
        //     onClick(e)
        // }
        // if(e.path[1] && e.path[1].className.indexOf('backdrop-content') !== -1){
        //     console.log('success handler...', e)
        //     onClick(e)
        // }
    }
</script>