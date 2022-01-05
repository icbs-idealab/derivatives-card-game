<div class={icon ? "input flex jc-between" : "input"} style={style}>
    <input 
        type="text"
        placeholder={placeholder}
        on:input={onUpdate}
        value={value}
    />
    {#if icon}
        <div class="input-icon">
            <Icon icon={icon} />
        </div>
    {/if}
</div>

<script lang="ts">
    import Icon from "../icon/icon.svelte"
    export let value: string = 'Initial Value'
    export let placeholder: string = 'Enter your text here'
    export let icon: string = ''
    export let onUpdate: (e: any) => any = (e) => {
        console.log('updated value: ', e.target.value)
    }
    export let style: string = '';
</script>