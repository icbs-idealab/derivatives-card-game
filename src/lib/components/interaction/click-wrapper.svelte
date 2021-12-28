<script lang="ts">
    export let handler: (...props: any) => any = () => console.log('')
    export let style: string = ''
    export let classes: string = ''
    export let disabled: boolean = false
    function onClick(...props){
        if(!disabled){
            handler(...props)
        }
    }
</script>

<div class={"click-wrapper" + " " + classes} on:click={onClick} style={style}>
    <slot />
</div>