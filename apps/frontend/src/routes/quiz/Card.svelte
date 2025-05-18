<script lang="ts">

  let { front, back, flipped } = $props();
</script>

<div class="cardContainer">
  {#if flipped}
    <div class="back card">
      {back}
    </div>
  {:else}
    <div class="front card">
      {front}
    </div>
  {/if}
</div>

<style>
  .cardContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
  }
  .card {
    width: 500px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid #ddd;
    user-select: none;
  }
  .back {
    background-color: aqua;
  }
  .front {
    background-color: deeppink;
  }
</style>
