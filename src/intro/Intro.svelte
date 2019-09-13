<script>
  import Cookie from "../utils/cookie.js";
  import Config from "./config.js";

  function startIntro() {
    const introWasShown = Cookie.getCookie("introWasShowen");
    const intro = introJs();

    if (!introWasShown) {
      intro.setOptions(Config).start();

      intro.onexit(function() {
        Cookie.setCookie("introWasShowen", true, 30);
      });
    }
  }
</script>

<svelte:window on:load={startIntro} />
