<script lang="ts">
  import { deferralImageDataUriToObjectUrl, isDeferralGifDataUri } from "@shared/deferralCardSvg";

  let {
    src,
    alt = "",
    class: cls = "",
  }: { src: string; alt?: string; class?: string } = $props();

  let displaySrc = $state("");

  $effect(() => {
    const current = src;
    if (!isDeferralGifDataUri(current)) {
      displaySrc = current;
      return;
    }
    const objectUrl = deferralImageDataUriToObjectUrl(current);
    if (!objectUrl) {
      displaySrc = current;
      return;
    }
    displaySrc = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  });
</script>

<img src={displaySrc} {alt} class={cls} decoding="async" />
