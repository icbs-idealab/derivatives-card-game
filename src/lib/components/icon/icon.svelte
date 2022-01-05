<script lang="ts">
  import { icons } from "./icon-data";
  export let size = "24";
  export let strokeWidth = "1";
  export let color = "currentColor";
  export let icon;
  const targetIcon = icons[icon] || icons.default;
  const width = Math.floor(parseInt(size) * 1.15)
</script>

<svg 
  class="icon icon-tabler icon-tabler-square-rotated icon-svg" 
  xmlns="http://www.w3.org/2000/svg"
  stroke-width={strokeWidth} 
  stroke={color} 
  fill="none" 
  stroke-linecap="round" 
  stroke-linejoin="round"
  width={width}
  height={size}
>
  {@html targetIcon}
</svg>

<style>
  svg {
    transform: scale(0.725);
    stroke-width: 1.5px;
  }
</style>