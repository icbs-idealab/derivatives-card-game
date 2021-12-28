<script lang="ts">
import ClickWrapper from "$lib/components/interaction/click-wrapper.svelte";

import TabItem from "./tab-item.svelte";
export let tabs: any[] = []
export let activeTabId: string = ''
export let onClick: (tab: any) => any = (tab) => {
    console.log('clicked on tab: ', tab)
}

function handler(tab){
    if(onClick && typeof onClick === 'function'){
        onClick(tab)
    }
}
</script>

<div class="tabs" style={`grid-template-columns: repeat(${tabs.length}, 1fr)`}>
    {#each tabs as tab, index}
    <ClickWrapper handler={() => handler(tab)} style="width: 100%;">
        <TabItem 
            label={tab.label}
            icon={tab.icon}
            isActive={activeTabId === tab.id}
            isLast={index === tabs.length -1}
            isFirst={index === 0}
        />
    </ClickWrapper>
    {/each}
    <div class="underline"></div>
</div>

<style>
    .tabs {
        display: grid;
        grid-gap: 10px;
        width: 100%;
        position: relative;
        align-items: center;
    }

    .underline {
        background: lightgray;
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 1px;
        left: 0;
    }
</style>