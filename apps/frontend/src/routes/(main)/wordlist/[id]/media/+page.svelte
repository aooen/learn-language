<script lang="ts">
  import { onMount } from 'svelte';
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { client } from '$lib/utils/api';
  import { SiteType } from '@learn-language/shared/utils/siteType';

  type SubtitleItem = Awaited<
    ReturnType<Awaited<ReturnType<(typeof client.mediaInfo)[':wordlistId']['$get']>>['json']>
  >[number];

  let player: InstanceType<Window['YT']['Player']>;
  let fullUrl = $state<string | null>(null);

  const wordlistId = $derived(page.params['id']);
  const VIDEO_CONTAINER_ID = 'youtube-player';

  let notSupportedMedia = $state(false);
  let wordMean = $state<wordMeaning[]>([]);
  let allSubtitle: SubtitleItem[] = $state([]);
  let selectedWord: string | null = $state('');
  let selectedKoWord: string | null = $state('');
  let showWordOverlay = $state(false);
  let activeSubIndex = $state(-1);
  let isSubtitleLoaded = $state(false);

  let subtitleContainer: HTMLDivElement;
  let userHasScrolled = false;

  type wordMeaning = {
    koWord: string;
    enWord: string;
  };

  // 유튜브 가져오기
  onMount(() => {
    async function load() {
      const res = await client.wordlist[':id'].$get({ param: { id: wordlistId } });
      const json = await res.json();
      fullUrl = json.sourceUrl;
      if (json.sourceType !== SiteType.Youtube || !fullUrl) {
        notSupportedMedia = true;
        return;
      }

      /**
       * Extract video ID from different YouTube URL formats:
       * - https://www.youtube.com/watch?v=-4GmbBoYQjE
       * - https://www.youtube.com/watch?v=-4GmbBoYQjE&t=2
       * - https://youtu.be/-4GmbBoYQjE
       * - https://youtu.be/-4GmbBoYQjE?t=2
       */
      const videoId = (() => {
        let matches;

        // For youtu.be format
        if (fullUrl.includes('youtu.be')) {
          matches = fullUrl.match(/youtu\.be\/([^?&]+)/);
          if (matches) return matches[1];
        }

        // For youtube.com format
        matches = fullUrl.match(/[?&]v=([^?&]+)/);
        if (matches) return matches[1];

        // If no match found, return the original URL (fallback)
        return fullUrl;
      })();

      player = new window.YT.Player(VIDEO_CONTAINER_ID, {
        videoId,
        playerVars: { autoplay: 0 },
        events: {
          onReady: handlePlayerReady,
        },
      });
    }

    if (window.YT) {
      load();
    } else {
      window.onYouTubeIframeAPIReady = load;
    }
  });

  // 자막 동기화 Interval 바인드
  onMount(() => {
    const intervalId = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        const idx = allSubtitle.findIndex(
          (sub) => time >= sub.startTime / 1000 && time < sub.endTime / 1000,
        );
        if (idx !== -1 && idx !== activeSubIndex) {
          activeSubIndex = idx;
        }
        if (!userHasScrolled) {
          setTimeout(() => {
            const activeElem = document.getElementById(`subtitle-${idx}`);
            if (activeElem && subtitleContainer) {
              const containerHeight = subtitleContainer.clientHeight;
              const elemOffset =
                activeElem.offsetTop - containerHeight / 2 + activeElem.clientHeight / 2;
              subtitleContainer.scrollTo({ top: elemOffset, behavior: 'auto' });
            }
          }, 0);
        }
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  });

  // 플레이어 준비 완료 후 자막 가져오기
  async function handlePlayerReady() {
    try {
      const response = await client.mediaInfo[':wordlistId'].$get({ param: { wordlistId } });
      allSubtitle = await response.json();

      player.playVideo();
      isSubtitleLoaded = true;
    } catch (error) {
      console.error('자막 불러오기 실패:', error);
    }
  }

  // 스크롤 핸들러
  let scrollTimeout: ReturnType<typeof setTimeout>;
  function handleScroll() {
    if (subtitleContainer.scrollTop !== 0) {
      userHasScrolled = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        userHasScrolled = false;
      }, 3000);
    }
  }

  // 단어 클릭 핸들러
  async function handleWordClick(word: string) {
    try {
      const response = await client.words.find.$post({ json: { wordlistId, word } });
      wordMean = (await response.json()) as wordMeaning[];
      player.pauseVideo();

      selectedWord = wordMean[0].enWord;
      selectedKoWord = wordMean[0].koWord;

      showWordOverlay = true;
    } catch (error) {
      console.error('단어 불러오기 실패:', error);
    }
  }

  function splitWords(text: string): string[] {
    let firstStep = text.trim().split(/\s+/);

    // 띄어쓰기와 함께 ,와.와!나,?같은 부호기호를 제거해야함
    let words: string[] = firstStep.map((word) => {
      const cleanedWord = word.replace(/^[,.!?]+|[,.!?]+$/g, '');
      return cleanedWord;
    });

    return words.filter((w) => w.length > 0);
  }

  // 오버레이한 뜻 창을 닫는다.
  function closeOverlay() {
    showWordOverlay = false;
    selectedWord = null;
    selectedKoWord = null;
    player.playVideo();
  }
</script>

<svelte:head>
  <script src="https://www.youtube.com/iframe_api"></script>
</svelte:head>

<div class="videoWrapper">
  <a class="back-link" href={`/wordlist/${wordlistId}`}> 단어장으로 돌아가기 </a>

  <div id="main-container">
    <div id="main-wrapper">
      <div id={VIDEO_CONTAINER_ID}>
        <!--이 영역은 유튜브가 출력됨니다.-->
      </div>

      {#if !isSubtitleLoaded}
        <div class="loading-message">자막을 가져오는 중입니다...</div>
      {/if}

      {#if notSupportedMedia}
        <div class="loading-message">지원하지 않는 미디어입니다.</div>
      {/if}

      <div class="subtitle-container" bind:this={subtitleContainer} onwheel={handleScroll}>
        {#if showWordOverlay}
          <div
            class="overlayOff"
            role="button"
            tabindex="0"
            onclick={closeOverlay}
            onkeydown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') closeOverlay();
            }}
          >
            <div
              class="overlayOn"
              role="dialog"
              tabindex="0"
              onclick={(e) => e.stopPropagation()}
              onkeydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                }
              }}
            >
              <div class="word-en">{selectedWord}</div>
              <div class="word-ko">{selectedKoWord}</div>
            </div>
          </div>
        {/if}

        {#each allSubtitle as subtitle, i (subtitle.id)}
          <div
            id={'subtitle-' + i}
            class={clsx('subtitle-item', {
              current: i === activeSubIndex,
              previous: i !== activeSubIndex,
            })}
          >
            <div class="timeline">
              {(subtitle.startTime / 1000).toFixed(1)}초 ~ {(subtitle.endTime / 1000).toFixed(1)}초
            </div>
            <div class="text">
              {#each splitWords(subtitle.subtitle) as word, idx (idx)}
                <span
                  role="button"
                  tabindex="0"
                  class="word-span"
                  onclick={() => handleWordClick(word)}
                  onkeydown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleWordClick(word);
                    }
                  }}
                >
                  {word}
                </span>
              {/each}
            </div>
            <div class="koText">{subtitle.koSubtitle}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .videoWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    flex-direction: column;
  }

  #main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  #main-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
  }

  .back-link {
    width: 100%;
    max-width: 800px;
    padding: 0.75rem;
    margin-bottom: 10px;
    border: none;
    border-radius: 6px;
    background-color: #0070f3;
    color: #fff;
    font-size: 0.9em;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
  }

  #youtube-player {
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 9;
  }

  .loading-message {
    margin: 30px auto 0 auto;
    text-align: center;
    font-style: italic;
    background: #fff;
    color: #333;
    padding: 12px 36px;
    border-radius: 16px;
    font-size: 1.2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    border: 1.5px solid #eee;
    width: fit-content;
  }

  .subtitle-container {
    margin: 30px auto 0 auto;
    background: #fff;
    color: #111;
    padding: 28px 56px;
    border-radius: 32px;
    font-size: 1.8rem;
    max-width: 800px;
    text-align: center;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.13);
    border: 3px solid #222;
    width: 100%;
    box-sizing: border-box;
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    scroll-behavior: auto;
    overflow-anchor: none;
    gap: 12px;
    position: relative;
    scrollbar-width: none;

    @media (max-width: 480px) {
      padding: 10px;
      font-size: 1rem;
    }
  }

  .subtitle-item {
    transition:
      color 0.3s ease,
      font-size 0.3s ease;
    margin-bottom: 10px;
    padding: 10px 0;
    flex-shrink: 0;

    &.current {
      font-weight: bold;
      font-size: 1.2em;
      color: #000;
      opacity: 1;
    }

    &.previous {
      opacity: 0.7;
      color: #666;
    }

    @media (max-width: 480px) {
      padding: 0;
    }
  }

  .timeline {
    font-size: 0.5em;
    color: #1976d2;
    margin-bottom: 4px;

    @media (max-width: 480px) {
      font-size: 0.6rem;
    }
  }

  .text {
    font-weight: 600;
    line-height: 1.4;
  }

  .word-span {
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 2px;
    transition: background 0.2s;
    display: inline-block;

    &:hover,
    &:focus {
      background: #e0f7fa;
      outline: none;
    }
  }

  .overlayOff {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .overlayOn {
    background: white;
    padding: 2em;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    max-width: 80%;
    text-align: center;
  }

  .word-en {
    font-size: 2em;
    font-weight: 700;
    color: #1976d2;
    margin-bottom: 12px;
  }

  .word-ko {
    font-size: 1.7em;
    color: #333;
  }
</style>
