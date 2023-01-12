<div class="input flex jc-between">
    {#if showPassword}
        <input 
            type="text"
            placeholder={placeholder}
            on:input={onUpdate}
            value={value}
        />
    {:else}
        <input 
            type="password"
            placeholder={placeholder}
            on:input={onUpdate}
            value={value}
        />
    {/if}
    <button class="secure-icon" on:click={toggleShow}>
        {#if showPassword}
            <Icon icon="eyeOff" />
        {:else}
            <Icon icon="eye" />
        {/if}
    </button>
</div>

<script lang="ts">
    import Icon from "$lib/components/icon/icon.svelte";
    export let value: string = 'Initial Value'
    export let placeholder: string = 'Enter your text here'
    export let onUpdate: (e: any) => any = (e) => {
        console.log('updated value: ', e.target.value)
    }

    let showPassword = false

    function toggleShow(){
        showPassword = !showPassword
    }
</script>

<style>
    button {
        background: transparent;
        position: relative;
        right: -8px
    }

    button:hover {
        background: lightgray;
    }
</style>