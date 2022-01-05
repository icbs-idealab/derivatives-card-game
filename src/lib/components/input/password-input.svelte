<div class="input flex jc-between">
    <input 
        type="password"
        placeholder={placeholder}
        on:input={onUpdate}
        value={value}
    />
    <div class="secure-icon">
        <Icon icon="lock" />
    </div>
</div>

<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
    export let value: string = 'Initial Value'
    export let placeholder: string = 'Enter your text here'
    export let onUpdate: (e: any) => any = (e) => {
        console.log('updated value: ', e.target.value)
    }
</script>

<style></style>