<script lang="ts">
  import { onMount } from 'svelte';
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import { client } from '$lib/utils/api';
  import { getImageUrl } from '$lib/utils/user';

  type Friend = Awaited<
    ReturnType<Awaited<ReturnType<typeof client.friends.$get>>['json']>
  >['friends'][number];
  type Requester = Awaited<
    ReturnType<Awaited<ReturnType<typeof client.friends.$get>>['json']>
  >['requesters'][number];

  let friends = $state<Friend[]>([]);
  let requesters = $state<Requester[]>([]);
  let error = $state('');
  let newFriendUsername = $state('');

  async function fetchFriends() {
    try {
      const res = await client.friends.$get();
      const data = await res.json();
      friends = data.friends;
      requesters = data.requesters;
    } catch {
      error = '친구 목록을 불러오는 데 실패했습니다';
    }
  }

  onMount(fetchFriends);

  async function addFriend() {
    error = '';
    try {
      const trimmed = newFriendUsername.trim();
      if (!trimmed) {
        error = '친구 아이디를 입력하세요.';
        return;
      }
      const res = await client.friends.$post({
        json: { friendUsername: trimmed },
      });
      if (res.ok) {
        await fetchFriends();
        newFriendUsername = '';
      } else {
        const data = (await res.json()) as { success: boolean; message?: string };
        error = data.message ?? '친구 추가에 실패했습니다';
      }
    } catch {
      error = '친구 추가에 실패했습니다';
    }
  }

  async function removeFriend(id: number) {
    error = '';
    try {
      const res = await client.friends[':friendId'].$delete({ param: { friendId: String(id) } });
      if (res.ok) {
        friends = friends.filter((f) => f.id !== id);
      } else {
        error = await res.text();
      }
    } catch {
      error = '친구 삭제에 실패했습니다';
    }
  }

  async function acceptFriend(id: number) {
    error = '';
    try {
      const res = await client.friends.accept.$post({ json: { requesterId: String(id) } });
      if (res.ok) {
        await fetchFriends();
      } else {
        error = await res.text();
      }
    } catch {
      error = '친구 수락에 실패했습니다';
    }
  }

  function viewFriend(id: number) {
    goto(`/friends/${id}`);
  }
</script>

<div class="container">
  <h2>친구 목록</h2>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="friend-list">
    {#each friends as friend, index (friend.id)}
      <div class="friend-card">
        <div
          class={clsx('left', { isRequesting: friend.isRequesting })}
          tabindex={index}
          role="button"
          aria-label={`${friend.username} 정보 보기`}
          onclick={() => viewFriend(friend.id)}
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              viewFriend(friend.id);
            }
          }}
        >
          <img class="avatar" src={getImageUrl(friend.image)} alt="프로필 이미지" />
          <span>{friend.username}{friend.isRequesting ? '에게 친구 요청함' : ''}</span>
        </div>
        <button class="action-button" onclick={() => removeFriend(friend.id)}>
          {friend.isRequesting ? '요청 취소' : '삭제'}
        </button>
      </div>
    {/each}
  </div>

  {#if friends.length === 0}
    <p class="empty">아직 친구가 없습니다.</p>
  {/if}

  {#if requesters.length > 0}
    <h3>친구 요청</h3>
    <div class="friend-list">
      {#each requesters as requester (requester.id)}
        <div class="friend-card">
          <div class="left isRequesting">
            <img class="avatar" src={getImageUrl(requester.image)} alt="프로필 이미지" />
            <span>{requester.username}</span>
          </div>
          <button class="action-button" onclick={() => acceptFriend(requester.id)}>수락</button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="add-form">
    <input
      type="text"
      bind:value={newFriendUsername}
      placeholder="친구 아이디 입력"
      class="add-input"
      onkeydown={(e) => {
        if (e.key === 'Enter') addFriend();
      }}
    />
    <button class="add-button" onclick={addFriend}>+ 친구 추가</button>
  </div>
</div>

<style lang="scss">
  .container {
    max-width: 520px;
    margin: 2rem auto;
    padding: 1rem;
    text-align: center;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .friend-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .friend-card {
    background: #f5f5f5;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &:not(.isRequesting) {
      cursor: pointer;
    }
  }

  .avatar {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 50%;
    border: 1px solid #ccc;
  }

  .action-button {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #5a78f0;
    border-radius: 6px;
    background: transparent;
    color: #5a78f0;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(90, 120, 240, 0.1);
    }
  }

  .add-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .add-input {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 1rem;
  }

  .add-button {
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    background: #5a78f0;
    color: white;
    font-size: 1rem;
    cursor: pointer;

    &:hover {
      background: #3a5be0;
    }
  }

  .error {
    color: red;
    margin-bottom: 1rem;
  }

  .empty {
    color: #888;
  }
</style>
