<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/stores/auth.svelte';
  import { client } from '$lib/utils/api';
  import { onMount } from 'svelte';

  let username = $state('');
  let password = $state('');

  onMount(async () => {
    if ((await client.user.me.$get()).ok) {
      goto('/home');
    }
  });

  async function submitLogin(e: Event) {
    e.preventDefault();
    try {
      await login({ username, password });
      goto('/home');
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  }
</script>

<div class="wrapper">
  <h1>ll.me.kr</h1>
  <h2>콘텐츠로 영어공부</h2>
  <form onsubmit={submitLogin} class="login-form">
    <div class="form-group">
      <label for="username">아이디</label>
      <input id="username" type="text" bind:value={username} required />
    </div>

    <div class="form-group">
      <label for="password">비밀번호</label>
      <input id="password" type="password" bind:value={password} required />
    </div>

    <button type="submit" class="login-button">로그인</button>
    <a class="signup-link" href="/signup">회원가입</a>
  </form>

  <footer>
    <a href="https://github.com/aooen/learn-language" target="_blank">GitHub</a>
    | 김학연 정주현 이지현 김준석 하유경
  </footer>
</div>

<style lang="scss">
  @use 'sass:color';

  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    h1,
    h2 {
      text-align: center;
      margin: 0;
      font-weight: lighter;
    }

    h2 {
      margin-top: 2px;
      color: #333;
      font-size: 1rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      width: 100%;
      max-width: 360px;
      padding: 0 10px;
      margin: 15px auto 0;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-weight: 500;
      }

      input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
      }
    }

    .login-button {
      padding: 10px;
      background-color: #4682b4;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        background-color: color.adjust(#4682b4, $lightness: -10%);
      }
    }

    .signup-link {
      padding: 5px;
      margin: 5px auto;
      border: none;
      border-radius: 4px;
      color: black;
      font-size: 16px;
      text-decoration: none;
      cursor: pointer;
    }

    footer {
      position: absolute;
      bottom: 20px;
      width: 100%;
      color: #444;
      font-size: 0.8rem;
      text-align: center;

      a {
        color: #444;
      }
    }
  }
</style>
