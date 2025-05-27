<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { client } from '$lib/utils/api';
  import { SiteType } from '@learn-language/shared/utils/siteType';

  let player: InstanceType<Window['YT']['Player']>;
  let fullUrl = $state<string | null>(null);

  const wordlistId = $derived(page.params['id']);
  const youtubeVideoID = 'youtube-player';

  let notSupportedMedia = $state(false);
  let showingEnSubtitleText = $state('');
  let showingKoSubtitleText = $state(''); //화면에 표시할 한글 자막
  let showingTimeLine = $state(''); // 화면에 표시할 시간
  let abstractedSubtitle = $state<Caption[]>([]);
  let wordMean = $state<wordMeaning[]>([]);
  let allSubtitle: SubtitleItem[] = $state([]); //자막을 담아둘 변수
  let selectedWord: string | null = $state(''); //불러온 영단어를 저장할 변수
  let selectedKoWord: string | null = $state(''); //불러온 한글뜻을 저장할 변수
  let showWordOverlay = $state(false); //단어를 클릭하고, 화면에 출력하기 위한 변수
  let subtitleContainer: HTMLDivElement;
  let userHasScrolled = false;
  let scrollTimeout: ReturnType<typeof setTimeout>;
  let activeSubIndex = $state(-1);

  type Caption = {
    start: number;
    end: number;
    text: string;
    koText: string;
  };

  type wordMeaning = {
    koWord: string;
    enWord: string;
  };

  interface SubtitleItem {
    timeLine: string;
    text: string;
    koText: string;
    start: number;
    end: number;
  }

  //유튜브 가져오기
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

      player = new window.YT.Player(youtubeVideoID, {
        height: '500',
        width: '800',
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

  //자막 가져오기
  async function fetchSubtitle(fullUrl: string) {
    try {
      const response = await client.mediaInfo.$post({ json: { fullUrl } });
      abstractedSubtitle = (await response.json()) as Caption[];
      allSubtitle = abstractedSubtitle.map((sub) => ({
        text: sub.text,
        koText: sub.koText,
        timeLine: `${sub.start} ~ ${sub.end}`,
        start: sub.start,
        end: sub.end,
      }));
    } catch (error) {
      console.error('자막 불러오기 실패:', error);
    }
  }

  let isSubtitleLoaded = $state(false);

  // 플레이어 준비 완료 후 자막 가져오기
  async function handlePlayerReady() {
    try {
      await fetchSubtitle(fullUrl!);
      player.playVideo();
      isSubtitleLoaded = true;
    } catch (error) {
      console.error('자막 불러오기 실패:', error);
    }

    setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        const idx = allSubtitle.findIndex((sub) => time >= sub.start && time < sub.end);
        if (idx !== -1 && idx !== activeSubIndex) {
          if (
            showingEnSubtitleText != null &&
            showingKoSubtitleText != null &&
            showingTimeLine != null
          ) {
            activeSubIndex = idx;
            showingEnSubtitleText = allSubtitle[idx].text;
            showingKoSubtitleText = allSubtitle[idx].koText;
            showingTimeLine = allSubtitle[idx].timeLine;
          }
        }
        if (!userHasScrolled) {
          setTimeout(() => {
            const activeElem = document.getElementById(`subtitle-${activeSubIndex}`);
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
  }

  //스크롤 핸들러
  function handleScroll() {
    if (subtitleContainer.scrollTop !== 0) {
      userHasScrolled = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        userHasScrolled = false;
        // 3초 후 현재 자막 위치로 자동 스크롤 복귀
        const activeElem = document.getElementById(`subtitle-${activeSubIndex}`);
        if (activeElem && subtitleContainer) {
          const containerHeight = subtitleContainer.clientHeight;
          const elemOffset =
            activeElem.offsetTop - containerHeight / 2 + activeElem.clientHeight / 2;
          subtitleContainer.scrollTo({ top: elemOffset, behavior: 'smooth' });
        }
      }, 3000);
    }
  }

  // 단어 클릭 핸들러
  async function handleWordClick(word: string) {
    try {
      const response = await client.words.find.$post({ json: { word } });
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

    //띄어쓰기와 함께 ,와.와!나,?같은 부호기호를 제거해야함
    let words: string[] = firstStep.map((word) => {
      const cleanedWord = word.replace(/^[,.!?]+|[,.!?]+$/g, '');
      return cleanedWord;
    });

    return words.filter((w) => w.length > 0);
  }

  //오버레이한 뜻 창을 닫는다.
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
  <div id="main-container">
    <div id="main-wrapper">
      <div id={youtubeVideoID}>
        <!--이 영역은 유튜브가 출력됨니다.-->
      </div>

      {#if !isSubtitleLoaded}
        <div class="loading-message">자막을 가져오는 중입니다...</div>
      {/if}

      {#if notSupportedMedia}
        <div class="loading-message">지원하지 않는 미디어입니다.</div>
      {/if}

      <div class="subtitle-container" bind:this={subtitleContainer} onscroll={handleScroll}>
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

        {#each allSubtitle as subtitle, i (subtitle.timeLine)}
          <div
            id={'subtitle-' + i}
            class="subtitle-item {i === activeSubIndex ? 'current' : 'previous'}"
          >
            <div class="timeline">{subtitle.timeLine}</div>
            <div class="text">
              {#each splitWords(subtitle.text) as word, idx (idx)}
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
            <div class="koText">{subtitle.koText}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
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

  #youtube-player {
    width: 800px;
    height: 500px;
    margin: 0 auto;
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
    min-width: 420px;
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
    flex-direction: column-reverse;
    justify-content: flex-start;
    scroll-behavior: auto;
    overflow-anchor: none;
    gap: 12px;
    position: relative;
  }

  .subtitle-item {
    transition:
      opacity 0.3s ease,
      font-size 0.3s ease;
    margin-bottom: 10px;
    padding: 10px 0;
    flex-shrink: 0;
  }

  .subtitle-item.current {
    font-weight: bold;
    font-size: 2rem;
    color: #000;
    opacity: 1;
  }

  .subtitle-item.previous {
    opacity: 0.7;
    font-size: 1.5rem;
    color: #666;
  }

  .timeline {
    font-size: 0.9rem;
    color: #1976d2;
    margin-bottom: 4px;
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
  }

  .word-span:hover,
  .word-span:focus {
    background: #e0f7fa;
    outline: none;
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
    padding: 2rem;
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
