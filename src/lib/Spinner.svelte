<div class="loader"></div>

<style>
  .loader {
    aspect-ratio: 1 / 1;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    border-radius: 50%;
    display: inline-block;
    border-top: 3px solid var(--primary);
    border-right: 3px solid transparent;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>