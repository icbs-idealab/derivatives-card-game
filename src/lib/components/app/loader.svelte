<div>
  <div class="mesh-loader">
    <div class="set-one">
      <div class="circle flex"></div>
      <div class="circle flex"></div>
    </div>
    <div class="set-two">
      <div class="circle flex"></div>
      <div class="circle flex"></div>
    </div>
  </div>
</div>

<style>
    .mesh-loader {
        overflow: hidden;
        height: inherit;
        width: inherit;
    }

    .mesh-loader .circle {
        width: 30px;
        height: 30px;
        position: absolute;
        color: white;
        background: #f44336;
        border-radius: 50%;
        margin: -15px;
        line-height: 1;
        -webkit-animation: mesh 3s ease-in-out infinite -1.5s;
        animation: mesh 3s ease-in-out infinite -1.5s;
    }

    .mesh-loader > div .circle:last-child {
        -webkit-animation-delay: 0s;
        animation-delay: 0s;
    }

    .mesh-loader > div {
        position: absolute;
        top: 50%;
        left: 50%;
    }

    .mesh-loader > div:last-child {
        -webkit-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        transform: rotate(90deg);
    }

@-webkit-keyframes mesh {
  0% {
    -webkit-transform-origin: 50% -100%;
    transform-origin: 50% -100%;
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  50% {
    -webkit-transform-origin: 50% -100%;
    transform-origin: 50% -100%;
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
  50.1% {
    -webkit-transform-origin: 50% 200%;
    transform-origin: 50% 200%;
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform-origin: 50% 200%;
    transform-origin: 50% 200%;
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes mesh {
  0% {
    -webkit-transform-origin: 50% -100%;
    transform-origin: 50% -100%;
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  50% {
    -webkit-transform-origin: 50% -100%;
    transform-origin: 50% -100%;
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
  50.1% {
    -webkit-transform-origin: 50% 200%;
    transform-origin: 50% 200%;
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform-origin: 50% 200%;
    transform-origin: 50% 200%;
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>