<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Collecting } from '$lib/types/collecting';

  let {
    collecting,
    deleteCollecting,
  }: {
    collecting: Collecting;
    deleteCollecting: (id: number) => void;
  } = $props();

  let progressNum = $derived(parseFloat(collecting.progress));

  function gotoWordlist() {
    goto(`/wordlist/${collecting.wordlistId}`);
  }
</script>

<div class="wordlist-item {collecting.error ? 'has-error' : ''}">
  <div class="content-wrapper">
    {#if collecting.title}
      <div class="item-title">
        <span>{collecting.title}</span>

        {#if collecting.wordlistId !== null}
          <div class="actions">
            <button class="wordlist-button" onclick={gotoWordlist}>
              단어장<span>으로 이동</span>
            </button>
            {#if collecting.progress.startsWith('1')}
              <button class="delete-button" onclick={() => deleteCollecting(collecting.id)}>
                ✖
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    {#if collecting.error}
      <div class="item-error">
        <span class="error-icon">⚠️</span>
        <p class="error-message">{collecting.error}</p>
      </div>
    {:else}
      <div class="progress-container">
        <div class="progress-bar" style="width: {progressNum * 100}%"></div>
        <span class="progress-text">{(progressNum * 100).toFixed(0)}%</span>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use 'sass:color';

  .wordlist-item {
    width: 100%;
    max-width: 540px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    padding: 20px 25px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e0e0e0;
    position: relative;
    overflow: hidden;

    &.has-error {
      border-color: #ff6b6b;
      background-color: #fffafa;
    }
  }

  .content-wrapper {
    overflow: hidden;
    flex-grow: 1;
  }

  .item-title {
    display: flex;
    align-items: center;
    color: #333333;
    margin-bottom: 12px;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;

    span {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .progress-container {
    width: 100%;
    background-color: #e9ecef;
    border-radius: 8px;
    height: 18px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(to right, #6dd5ed, #2196f3);
    border-radius: 8px;
    transition: width 0.5s ease-out;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #495057;
    font-size: 0.9em;
    font-weight: 600;
    text-shadow: 0 0 3px rgba(255, 255, 255, 0.7);
  }

  .item-error {
    display: flex;
    align-items: center;
    background-color: #ffebeb;
    color: #cc0000;
    padding: 10px 15px;
    border-radius: 8px;
  }

  .error-icon {
    font-size: 1.2em;
    margin-right: 10px;
  }

  .error-message {
    font-size: 1em;
    font-weight: 500;
    margin: 0;
  }

  .actions {
    display: flex;
    flex: 0 0 auto;
    gap: 6px;
    margin-left: 10px;

    .wordlist-button {
      background-color: #5cb85c;
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;

      @media (max-width: 640px) {
        span {
          display: none;
        }
      }

      &:hover {
        background-color: color.adjust(#4cae4c, $lightness: -10%);
      }
    }

    .delete-button {
      border: 0;
      background-color: transparent;
      color: #ef4444;
      font-size: 1rem;
      cursor: pointer;
    }
  }
</style>
