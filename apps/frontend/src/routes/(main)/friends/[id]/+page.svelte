<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { getLangText } from '$lib/constants/lang';
  import type { User } from '$lib/types/user';
  import { client } from '$lib/utils/api';
  import { getImageUrl } from '$lib/utils/user';

  let error = $state('');
  let user = $state<User | null>(null);

  onMount(async () => {
    const id = page.params.id;
    try {
      const res = await client.friends[':friendId'].$get({ param: { friendId: id } });
      if (res.ok) {
        const data = await res.json();
        user = data.user;
      } else {
        error = await res.text();
      }
    } catch {
      error = '친구 정보를 불러오는 데 실패했습니다';
    }
  });
</script>

<div class="mypage-container">
  <h2>친구 정보</h2>

  {#if error}
    <p class="error">{error}</p>
  {:else if user}
    <section class="profile">
      <div class="image-wrapper">
        <img class="profile-image" src={getImageUrl(user.image)} alt="프로필 이미지" />
      </div>

      <div class="lang-grid">
        <div><strong>아이디</strong><br />{user.username}</div>
        <div><strong>모국어</strong><br />{getLangText(user.motherLang)}</div>
        <div><strong>목표 언어</strong><br />{getLangText(user.targetLang)}</div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <h4>총 학습 단어</h4>
          <p>--</p>
        </div>
        <div class="stat-item">
          <h4>레벨</h4>
          <p>--</p>
        </div>
      </div>
    </section>
  {/if}
</div>

<style lang="scss">
  .mypage-container {
    max-width: 480px;
    margin: 2rem auto;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fff;
  }

  h2 {
    text-align: center;
    margin-bottom: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  .image-wrapper {
    text-align: center;
    margin-bottom: 1rem;
  }

  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ccc;
  }

  .lang-grid {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    font-size: 0.95rem;
  }

  .stats {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .stat-item {
    flex: 1;
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 6px;
    text-align: center;
    background-color: #fafafa;

    h4 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: #555;
    }

    p {
      font-size: 1.25rem;
      font-weight: bold;
    }
  }

  .error {
    color: #e00;
    text-align: center;
    margin-bottom: 1rem;
  }
</style>
