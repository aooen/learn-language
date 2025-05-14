<script lang="ts">
    import { onMount } from 'svelte';
    import { client } from '$lib/utils/api';
  
    let player: unknown;
  
    /**
     * 이부분에 단어장이나 퀴즈에서 호출 시 전달된 유튜브 videoID를 저장해주는 setter가 필요하다.
     */
    let videoId = $state('UKp2CrfmVfw'); 
    let fullUrl = $state(
      'https://www.youtube.com/watch?v=aKq8bkY5eTU&pp=ygUS66-47Iqk7YSw67mE7Iqk7Yq4');
  
    const youtubeVideoID = 'youtube-player';
  
    let showingSubtitleText = $state(''); //화면에 표시할 자막
    let showingTimeLine = $state(''); //화면에 표시할 시간
    let abstractedSubtitle = $state<Caption[]>([]);
  
    type Caption = {
      start: number;
      end: number;
      text: string;
    };
    //유튜브 가져오기
    onMount(() => {
      function load() {
        player = new YT.Player(youtubeVideoID, {
          height: '500',
          width: '800',
          videoId: videoId,
          playerVars: { autoplay: 0 },
          events: {
            onReady: handlePlayerReady
          },
        });
      }
  
      if (window.YT) {
        load();
      } else {
        window.onYouTubeIframeAPIReady = load;
      }
    });  
      //자막 가져오기기
      async function fetchSubtitle(fullUrl: string) {
      try {
        const response = await client.mediaInfo.$post({ json: { fullUrl } });
        abstractedSubtitle = await response.json() as Caption[];
      } catch (error) {
        console.error("자막 불러오기 실패:", error);
      }
    }
  
    let isSubtitleLoaded = $state(false);
    //플레이어 준비 완료 후 자막 가져오기
    async function handlePlayerReady(event) {
        
      try{
        await fetchSubtitle(fullUrl);
        player.playVideo();
        isSubtitleLoaded = true;
      } catch (error) {
        console.error("자막 불러오기 실패:", error);
      }
  
      setInterval(() => {
        if (player && player.getCurrentTime) {
          const time = player.getCurrentTime();
          for (const sub of abstractedSubtitle) {
            if (time >= sub.start && time < sub.end) {
              showingSubtitleText = sub.text;
              showingTimeLine = `${sub.start} ~ ${sub.end}`;
              break;
            }
          }
        }
      }, 100);
    }
  
  </script>
  
  
  
  
  <svelte:head>
    <script src="https://www.youtube.com/iframe_api"></script>
  </svelte:head>
  
  <div class="videoWrapper">
    <div id="main-container">
      <div id="main-wrapper">
  
        <div id={youtubeVideoID}>.</div>
  
  
        {#if !isSubtitleLoaded}
          <div class="loading-message">자막을 가져오는 중입니다...</div>
        {/if}
        
        <div class="subtitle-container">
          <div id="timeline">{showingTimeLine}</div>
          <div id="text">{showingSubtitleText}</div>
        </div>
        
  
      </div>
    </div>
  </div>
  
  
  <style>
    .videoWrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      /* 영상만 중앙 정렬 */
    }
  
    /* 영상 아래에 자연스럽게 배치 */
    .loading-message {
      margin: 30px auto 0 auto;
      text-align: center;
      font-style: italic;
      background: #fff;
      color: #333;
      padding: 12px 36px;
      border-radius: 16px;
      font-size: 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
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
      max-width: 90vw;
      text-align: center;
      box-shadow: 0 4px 18px rgba(0,0,0,0.13);
      border: 3px solid #222;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  
    #timeline {
      font-size: 1.08rem;
      color: #1976d2;
      margin-bottom: 8px;
      letter-spacing: 1px;
      font-weight: 500;
    }
  
    #text {
      font-size: 1.8rem;
      font-weight: 600;
      line-height: 1.6;
      word-break: break-word;
      color: #111;
    }
  </style>
  