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
  let showingEnSubtitleText = $state(''); // 화면에 표시할 영어 자막
  let showingKoSubtitleText = $state(''); //화면에 표시할 한글 자막
  let showingTimeLine = $state(''); // 화면에 표시할 시간
  let abstractedSubtitle = $state<Caption[]>([]);
  let wordMean = $state<wordMeaning[]>([]);
  let allSubtitle: SubtitleItem[] = $state([]); //자막을 담아둘 변수
  let selectedWord: string | null = $state(''); //불러온 영단어를 저장할 변수
  let selectedKoWord: string | null = $state(''); //불러온 한글뜻을 저장할 변수
  let showWordOverlay = $state(false); //단어를 클릭하고, 화면에 출력하기 위한 변수

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
      console.log(response);
      abstractedSubtitle = (await response.json()) as Caption[];
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

    let lastSubtitleId = '';

    setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = player.getCurrentTime();
        for (const sub of abstractedSubtitle) {
          if (time >= sub.start && time < sub.end) {
            showingEnSubtitleText = sub.text;
            showingKoSubtitleText = sub.koText;
            showingTimeLine = `${sub.start} ~ ${sub.end}`;
            const currentSubId = `${sub.start}-${sub.end}`;

            //화면에 모든 자막을 출력할때 사용하기 위한 부분입니다. - 객체 배열
            if (currentSubId !== lastSubtitleId) {
              //겹치는 자막은 저장하지 않겠음

              allSubtitle = [
                ...allSubtitle,
                {
                  text: showingEnSubtitleText,
                  timeLine: showingTimeLine,
                  koText: showingKoSubtitleText,
                },
              ];
              if (!userHasScrolled) {
                setTimeout(() => {
                  subtitleContainer.scrollTop = 0;
                }, 0);
              }
              lastSubtitleId = currentSubId;
            }
            break;
          }
        }
      }
    }, 100);
  }

  let subtitleContainer: HTMLDivElement;
  let userHasScrolled = false;
  let scrollTimeout: ReturnType<typeof setTimeout>;

  function handleScroll() {
    if (subtitleContainer.scrollTop !== 0) {
      userHasScrolled = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        userHasScrolled = false;
        subtitleContainer.scrollTop = 0;
      }, 3000);
    }
  }

  // 단어 클릭 핸들러
  async function handleWordClick(word: string) {
    //console.log($state.snapshot(word));
    // todo: wordMean에 koWord와 enWord가 있다.
    // 1. 단어를 누르면 영상을 정지하게 한다.
    // 2. 영어뜻과 한글 뜻을 화면에 출력한다.
    // 3. 화면의 다른 곳을 클릭하면 화면이 내려가고 영상을 다시 재생시킨다.
    try {
      const response = await client.findMean.$post({ json: { word } });
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
      const cleanedWord = word.replace(/[!]$/, '');
      return cleanedWord;
    });

    return words;
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

        {#each allSubtitle.slice(-10).reverse() as subtitle, i (subtitle.timeLine)}
          <div class="subtitle-item {i === 0 ? 'current' : 'previous'}">
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
    scroll-behavior: smooth;
    overflow-anchor: none;
    gap: 12px;
    position: relative;
  }

  .subtitle-item {
    /* transform 제거하여 자연스러운 플로우 사용 */
    transition:
      opacity 0.3s ease,
      font-size 0.3s ease;
    margin-bottom: 10px;
    padding: 10px 0;
    flex-shrink: 0; /* 아이템 크기 고정 */
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
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%); /* 가로, 세로 모두 중앙 정렬 */
    z-index: 30;
    background: rgba(255, 255, 255, 0.97);
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
    padding: 20px 40px;
    min-width: 200px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 0.7em;
    pointer-events: auto;
  }

  .overlayOn {
    display: flex;
    flex-direction: column;
    align-items: center;
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
