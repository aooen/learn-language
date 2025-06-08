<script lang="ts">
  let {
    front,
    back,
    flipped = false,
    progress,
  }: {
    front: string;
    back?: string;
    flipped?: boolean;
    progress?: number;
  } = $props();
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

  {#if progress !== undefined}
    <div class="progress">
      <div class="progress-bar" style="width: {progress}%;"></div>
      <span class="progress-text">Progress: {progress}%</span>
    </div>
  {/if}
</div>

<style>
  .cardContainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400px;
  }
  .card {
    width: 100%;
    max-width: 500px;
    height: 300px;
    display: flex;
    margin: 0 10px 24px;
    padding: 20px;
    justify-content: center;
    align-items: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    border: 1px solid #eee;
    user-select: none;
    font-size: 1.2rem;
  }
  .back {
    background-color: #cbe4ff;
  }
  .front {
    background-color: #ffb6dd;
  }
  .progress {
    width: 100%;
    max-width: 300px;
    height: 32px;
    background: #f3f4f6;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: left;
  }
  .progress-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
    opacity: 0.15;
    z-index: 0;
    border-radius: 16px;
    transition: width 0.3s;
    height: 100%;
  }
  .progress-text {
    position: relative;
    z-index: 1;
    font-weight: bold;
    color: #2563eb;
    font-size: 1.1rem;
    padding-left: 16px;
  }
</style>
