<div class="text-area">
    <textarea 
        type="text"
        placeholder={placeholder}
        on:input={onUpdate}
    >{value}</textarea>
</div>

<script lang="ts">
    export let value: string = 'Initial Value'
    export let placeholder: string = 'Write your message here'
    export let onUpdate: (e: any) => any = (e) => {
        console.log('updated value: ', e.target.value)
    }
</script>

<style>
    textarea {
        width: 100%;
        height: 100%;
        resize: none;
        border: none;
        font-size: 0.85em;
        font-family: "Poppins", sans-serif
    }
</style>