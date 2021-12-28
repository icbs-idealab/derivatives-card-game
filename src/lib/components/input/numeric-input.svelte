<div class="input flex jc-between">
    <input 
        type="number"
        placeholder={placeholder}
        on:input={onUpdate}
        value={value}
    />
    <div class="controls flex">
        <ClickWrapper handler={increment}>
            <Icon icon="chevronDown" color="var(--dm-dark)" />
        </ClickWrapper>
        <ClickWrapper handler={decrement}>
            <Icon icon="chevronUp" color="var(--dm-dark)" />
        </ClickWrapper>
    </div>
</div>

<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
    import ClickWrapper from "$lib/components/interaction/click-wrapper.svelte";
    export let value: number = 0
    export let placeholder: string = 'Enter your text here'
    export let onUpdate: (e: any) => any = (e) => {
        console.log('updated value: ', e.target.value)
    }
    export let decrement = () => {}
    export let increment = () => {}
</script>

<!-- <style>
    .controls {
    }
</style> -->