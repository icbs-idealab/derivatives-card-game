<script lang="ts">
    import Button from "$lib/components/button/button.svelte";
    import TextArea from "$lib/components/input/text-area.svelte";
    import TextInput from "$lib/components/input/text-input.svelte";
    export let email: string = ''
    export let message: string = ''
    export let updateEmail = (value: string) => {}
    export let updateMessage = (value: string) => {}

    function onUpdateEmail({target}){ 
        updateEmail(target.value)
    }
    function onUpdatePassword({target}){ 
        updateMessage(target.value)
    }

    export function onSubmit(submission: any){
        console.log('submitting')
        console.table(submission)
    }

    function submit(){
        if(onSubmit && typeof onSubmit === 'function'){
            onSubmit({email, message})
        }
    }
</script>

<div class="request-access">
    <TextInput value={email} onUpdate={onUpdateEmail} placeholder="Enter your email" />
    <TextArea value={message} onUpdate={onUpdatePassword} placeholder="Enter your message" />
    <div class="button-container">
        <Button type="proceed" label="Request" action={submit} />
    </div>
</div>

<style>
    .request-access {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, auto);
        grid-gap: 15px;
        padding-top: 30px;
    }
</style>