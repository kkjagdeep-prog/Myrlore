  /* ==========================================
     MYRL​​ORE® — CAPRI SECRET ARCHIVE
     INTERRUPTED EMERGENCE · CORRUPTED TRANSMISSION
  ========================================== */

  const konamiSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
  ];

  let konamiPosition = 0;
  let secretActive = false;
  let secretPreviousFocus = null;

  let capriImage = null;
  let patchTimers = [];
  let glitchTimers = [];
  let sequenceTimers = [];

  const secretStyle = document.createElement("style");

  secretStyle.textContent = `
    #myrloreSecretOverlay {
      --capri-pink: #ff43b7;
      --capri-green: #8cff55;
      --capri-purple: #9c62ff;

      position: fixed;
      inset: 0;
      z-index: 999999;
      display: grid;
      place-items: center;
      overflow: hidden;
      padding: 24px;
      isolation: isolate;
      background: #08090b;
      color: #eeeDE8;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity .4s ease, visibility .4s ease;
    }

    #myrloreSecretOverlay.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #myrloreSecretOverlay .secret-noise {
      position: absolute;
      inset: -50%;
      z-index: 2;
      pointer-events: none;
      opacity: .07;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
    }

    #myrloreSecretOverlay.fracture-start .secret-noise {
      opacity: .28;
      animation: capriNoise .12s steps(2) infinite;
    }

    #myrloreSecretOverlay.fracture-heavy .secret-noise {
      opacity: .48;
      animation: capriNoise .055s steps(2) infinite;
    }

    #myrloreSecretOverlay::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 3;
      pointer-events: none;
      opacity: 0;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent 2px,
        rgba(255,255,255,.12) 3px,
        transparent 4px
      );
    }

    #myrloreSecretOverlay.fracture-start::before {
      opacity: .24;
      animation: scanlineDrift .18s steps(3) infinite;
    }

    #myrloreSecretOverlay.fracture-heavy::before {
      opacity: .65;
      animation: scanlineDrift .065s steps(2) infinite;
    }

    .capri-glitch-patches {
      position: absolute;
      inset: 0;
      z-index: 5;
      overflow: hidden;
      pointer-events: none;
    }

    .capri-patch {
      position: absolute;
      left: var(--patch-x);
      top: var(--patch-y);
      width: var(--patch-width);
      height: var(--patch-height);
      opacity: 0;
      overflow: hidden;
      transform: translate3d(0,0,0);
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,.95) 0 1px,
        rgba(15,15,18,.9) 1px 3px,
        rgba(255,67,183,.9) 3px 4px,
        rgba(15,15,18,.9) 4px 6px
      );
      mix-blend-mode: screen;
      clip-path: polygon(
        0 0, 100% 0, 99% 82%,
        77% 100%, 48% 85%, 21% 100%, 0 76%
      );
      will-change: transform, opacity;
    }

    .capri-patch::before,
    .capri-patch::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .capri-patch::before {
      background: var(--capri-pink);
      opacity: .75;
      transform: translateX(-5px);
      mix-blend-mode: screen;
    }

    .capri-patch::after {
      background: var(--capri-green);
      opacity: .65;
      transform: translateX(6px);
      mix-blend-mode: screen;
    }

    .capri-patch.visible {
      animation: patchCorrupt .42s steps(2) forwards;
    }

    .capri-patch.fade {
      animation: patchCutOut .2s steps(2) forwards;
    }

    .capri-patch.pixel-block {
      background: repeating-linear-gradient(
        90deg,
        rgba(255,255,255,.9) 0 3px,
        rgba(255,67,183,.8) 3px 6px,
        rgba(0,0,0,.9) 6px 9px,
        rgba(140,255,85,.8) 9px 12px
      );
      clip-path: none;
    }

    .capri-patch.pixel-block::before {
      background: repeating-linear-gradient(
        to bottom,
        transparent 0 3px,
        rgba(255,255,255,.9) 3px 4px
      );
    }

    .capri-tear {
      position: absolute;
      left: -5%;
      width: 110%;
      height: var(--tear-height);
      top: var(--tear-y);
      z-index: 6;
      opacity: 0;
      pointer-events: none;
      background: linear-gradient(
        to bottom,
        rgba(255,67,183,.95) 0 2px,
        rgba(255,255,255,.92) 2px 3px,
        rgba(12,12,14,.98) 3px 8px,
        rgba(140,255,85,.9) 8px 10px,
        rgba(255,255,255,.65) 10px 11px,
        rgba(12,12,14,.95) 11px 100%
      );
      box-shadow: 0 0 0 1px rgba(255,255,255,.15);
      transform: translateX(0);
      clip-path: polygon(0 0, 100% 0, 100% 80%, 0 100%);
    }

    #myrloreSecretOverlay.fracture-start .capri-tear {
      animation: tearSnap .28s steps(2) infinite;
    }

    #myrloreSecretOverlay.fracture-heavy .capri-tear {
      animation: tearViolent .095s steps(2) infinite;
    }

    .capri-screen-strip {
      position: absolute;
      left: -10%;
      width: 120%;
      height: var(--strip-height);
      top: var(--strip-y);
      z-index: 7;
      pointer-events: none;
      opacity: 0;
      background: linear-gradient(
        90deg,
        transparent 0 5%,
        rgba(255,67,183,.7) 12%,
        rgba(255,255,255,.8) 40%,
        rgba(140,255,85,.65) 70%,
        transparent 95%
      );
      mix-blend-mode: screen;
    }

    .capri-screen-strip.active {
      animation: stripDisplace .23s steps(2) forwards;
    }

    /* ==========================================
       CAPRI PORTAL
    ========================================== */

    #capriPortal {
      position: fixed;
      z-index: 9;
      left: 15.5%;
      top: 52%;
      width: clamp(180px, 27vw, 350px);
      height: min(72vh, 520px);
      transform: translate(-50%, -50%);
      opacity: 0;
      pointer-events: none;
      overflow: visible;
      perspective: 1000px;
    }

    #capriPortal::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0;
      background: #08090b;
      clip-path: polygon(
        7% 0, 88% 2%, 100% 15%,
        94% 34%, 100% 49%, 91% 65%,
        98% 100%, 12% 96%, 0 79%,
        7% 59%, 0 37%
      );
    }

    #capriPortal::after {
      content: "";
      position: absolute;
      inset: -4px;
      opacity: 0;
      pointer-events: none;
      background: linear-gradient(
        to bottom,
        var(--capri-pink) 0 2px,
        transparent 2px 18%,
        var(--capri-green) 18% 20%,
        transparent 20% 47%,
        #fff 47% 48%,
        transparent 48% 78%,
        var(--capri-pink) 78% 80%,
        transparent 80%
      );
      clip-path: polygon(
        7% 0, 88% 2%, 100% 15%,
        94% 34%, 100% 49%, 91% 65%,
        98% 100%, 12% 96%, 0 79%,
        7% 59%, 0 37%
      );
    }

    #capriPortal.portal-open {
      opacity: 1;
    }

    #capriPortal.portal-open::before {
      animation: tearOpening .9s cubic-bezier(.2,.8,.2,1) forwards;
    }

    #capriPortal.portal-open::after {
      animation: tearEdge .75s steps(3) forwards;
    }

    #capriFlight {
      position: absolute;
      inset: 0;
      opacity: 0;
      transform: translate3d(-45px,0,0) scale(.86);
      transform-origin: center center;
      clip-path: inset(0 100% 0 0);
      will-change: transform, opacity, clip-path, filter;
    }

    #capriImage {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      object-position: center;
      position: relative;
      z-index: 3;
    }

    .capri-rgb {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      opacity: 0;
      pointer-events: none;
      mix-blend-mode: screen;
    }

    .capri-rgb-pink {
      z-index: 2;
      filter: sepia(1) saturate(8) hue-rotate(275deg);
      transform: translateX(-5px);
    }

    .capri-rgb-green {
      z-index: 1;
      filter: sepia(1) saturate(8) hue-rotate(65deg);
      transform: translateX(5px);
    }

    /* Normal emergence */

    #capriPortal.capri-emerging #capriFlight {
      animation: capriBreakThrough 1.65s cubic-bezier(.16,1,.3,1) forwards;
    }

    #capriPortal.capri-emerging .capri-rgb {
      opacity: .55;
      animation: rgbSnap .16s steps(2) 5;
    }

    /* Interrupted halfway */

    #capriPortal.capri-interrupted #capriFlight {
      animation-play-state: paused !important;
      filter: contrast(1.35);
    }

    #capriPortal.capri-interrupted .capri-rgb {
      opacity: .85;
      animation: transmissionFlicker .12s steps(2) infinite;
    }

    /* Corrupted transmission */

    #capriPortal.capri-transmitting #capriFlight {
      animation: capriTransmission .72s steps(2,end) forwards;
    }

    #capriPortal.capri-transmitting .capri-rgb {
      opacity: .9;
      animation: transmissionFlicker .09s steps(2) infinite;
    }

    /* Resume after interruption */

    #capriPortal.capri-resuming #capriFlight {
      animation: capriFinishBreakThrough .85s cubic-bezier(.16,1,.3,1) forwards;
    }

    #capriPortal.capri-resuming .capri-rgb {
      opacity: .65;
      animation: rgbSnap .12s steps(2) 5;
    }

    /* Settled image */

    #capriPortal.capri-settled,
    #capriPortal.capri-breakout,
    #capriPortal.capri-disappearing {
      opacity: 1;
      visibility: visible;
    }

    #capriPortal.capri-settled #capriFlight {
      opacity: 1;
      transform: translate3d(0,0,0) scale(1);
      clip-path: inset(0);
      animation: none;
      filter: none;
    }

    #capriPortal.capri-settled .capri-rgb {
      opacity: 0;
      animation: none;
    }

    /* Breakout */

    #capriPortal.capri-breakout #capriFlight {
      animation: capriOutsideScreen .62s cubic-bezier(.16,1,.3,1) forwards;
      transform-origin: center center;
      z-index: 20;
    }

    #capriPortal.capri-breakout .capri-rgb {
      opacity: .65;
      animation: rgbSnap .12s steps(2) 4;
    }

    /* Digital disintegration */

    #capriPortal.capri-disappearing #capriFlight {
      animation: capriDigitalDisintegration .48s steps(5,end) forwards;
      pointer-events: none;
    }

    #capriPortal.capri-disappearing .capri-rgb {
      opacity: .8;
      animation: rgbDisintegration .48s steps(5,end) forwards;
    }

    #capriPortal.capri-gone {
      opacity: 0;
      visibility: hidden;
    }

    #capriPortal.capri-gone #capriFlight {
      opacity: 0;
      visibility: hidden;
    }

    /* ==========================================
       ARCHIVE TEXT
    ========================================== */

    #myrloreSecretOverlay .secret-inner {
      position: relative;
      z-index: 12;
      opacity: 0;
      transform: translateY(18px);
      transition: opacity .8s ease, transform .8s ease;
    }

    #myrloreSecretOverlay.active .secret-inner {
      opacity: 1;
      transform: translateY(0);
    }

    #myrloreSecretOverlay .secret-symbol {
      color: var(--capri-pink);
      text-shadow: 2px 0 var(--capri-green);
    }

    #myrloreSecretOverlay h2 {
      text-shadow:
        2px 0 var(--capri-pink),
        -2px 0 var(--capri-green);
    }

    #myrloreSecretOverlay button {
      position: relative;
      z-index: 15;
    }

    /* ==========================================
       KEYFRAMES
    ========================================== */

    @keyframes capriNoise {
      0% { transform: translate(0,0); }
      25% { transform: translate(-2%,1%); }
      50% { transform: translate(2%,-1%); }
      75% { transform: translate(-1%,-2%); }
      100% { transform: translate(1%,2%); }
    }

    @keyframes scanlineDrift {
      0% { transform: translateY(-5px); }
      100% { transform: translateY(5px); }
    }

    @keyframes patchCorrupt {
      0% {
        opacity: 0;
        transform: translate3d(-18px,0,0) skewX(-18deg);
      }
      18% {
        opacity: .95;
        transform: translate3d(12px,0,0) skewX(8deg);
      }
      36% {
        opacity: .3;
        transform: translate3d(-9px,0,0) skewX(-5deg);
      }
      55% {
        opacity: .9;
        transform: translate3d(6px,0,0) skewX(3deg);
      }
      75% {
        opacity: .45;
        transform: translate3d(-3px,0,0);
      }
      100% {
        opacity: .78;
        transform: translate3d(0,0,0);
      }
    }

    @keyframes patchCutOut {
      0% { opacity: .8; transform: translateX(0); }
      30% { opacity: 1; transform: translateX(12px); }
      100% { opacity: 0; transform: translateX(-25px); }
    }

    @keyframes tearSnap {
      0% { opacity: 0; transform: translateX(0); }
      25% { opacity: .7; transform: translateX(3%); }
      50% { opacity: .15; transform: translateX(-2%); }
      75% { opacity: .85; transform: translateX(1%); }
      100% { opacity: .1; transform: translateX(0); }
    }

    @keyframes tearViolent {
      0% { opacity: .05; transform: translateX(-4%); }
      50% { opacity: .9; transform: translateX(3%); }
      100% { opacity: .15; transform: translateX(-2%); }
    }

    @keyframes stripDisplace {
      0% { opacity: 0; transform: translateX(-5%); }
      20% { opacity: 1; transform: translateX(4%); }
      45% { opacity: .75; transform: translateX(-3%); }
      100% { opacity: 0; transform: translateX(6%); }
    }

    @keyframes tearOpening {
      0% {
        opacity: 0;
        transform: scaleX(.02) scaleY(.05);
      }
      30% {
        opacity: 1;
        transform: scaleX(.55) scaleY(.4);
      }
      65% {
        opacity: 1;
        transform: scaleX(1.08) scaleY(1.04);
      }
      82% {
        opacity: 1;
        transform: scaleX(.98) scaleY(.99);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes tearEdge {
      0% { opacity: 0; transform: translateX(-12px); }
      25% { opacity: 1; transform: translateX(5px); }
      50% { opacity: .45; transform: translateX(-3px); }
      100% { opacity: .85; transform: translateX(0); }
    }

    /* Capri enters but stops halfway */

    @keyframes capriBreakThrough {
      0% {
        opacity: 0;
        transform: translate3d(-55px,0,0) scale(.76);
        clip-path: inset(0 100% 0 0);
      }
      22% {
        opacity: .4;
        transform: translate3d(-35px,0,0) scale(.82);
        clip-path: inset(0 78% 0 0);
      }
      42% {
        opacity: .9;
        transform: translate3d(-12px,0,0) scale(.93);
        clip-path: inset(0 42% 0 0);
      }
      45% {
        opacity: 1;
        transform: translate3d(-12px,0,0) scale(.93);
        clip-path: inset(0 42% 0 0);
      }
      65% {
        opacity: 1;
        transform: translate3d(-12px,0,0) scale(.93);
        clip-path: inset(0 42% 0 0);
      }
      82% {
        opacity: 1;
        transform: translate3d(5px,0,0) scale(1.015);
        clip-path: inset(0 8% 0 0);
      }
      92% {
        transform: translate3d(-2px,0,0) scale(1);
        clip-path: inset(0);
      }
      100% {
        opacity: 1;
        transform: translate3d(0,0,0) scale(1);
        clip-path: inset(0);
      }
    }

    /* Transmission flicker: small, abrupt position changes */

    @keyframes transmissionFlicker {
      0% {
        opacity: .9;
        transform: translate3d(-9px,0,0);
      }
      25% {
        opacity: .25;
        transform: translate3d(8px,-4px,0);
      }
      50% {
        opacity: .95;
        transform: translate3d(-4px,3px,0);
      }
      75% {
        opacity: .4;
        transform: translate3d(11px,0,0);
      }
      100% {
        opacity: .85;
        transform: translate3d(0,0,0);
      }
    }

    /* A short burst of corrupted image positions */

    @keyframes capriTransmission {
      0% {
        opacity: 1;
        transform: translate3d(-12px,0,0) scale(.93);
        clip-path: inset(0 42% 0 0);
        filter: contrast(1.5) saturate(1.7);
      }
      18% {
        opacity: .35;
        transform: translate3d(14px,-5px,0) scale(.96);
        clip-path: inset(8% 35% 15% 5%);
      }
      35% {
        opacity: 1;
        transform: translate3d(-18px,4px,0) scale(.9);
        clip-path: inset(0 48% 0 0);
      }
      52% {
        opacity: .45;
        transform: translate3d(10px,-3px,0) scale(.98);
        clip-path: inset(12% 28% 8% 12%);
      }
      72% {
        opacity: 1;
        transform: translate3d(-6px,2px,0) scale(.94);
        clip-path: inset(0 42% 0 0);
      }
      100% {
        opacity: 1;
        transform: translate3d(-12px,0,0) scale(.93);
        clip-path: inset(0 42% 0 0);
        filter: contrast(1.4) saturate(1.5);
      }
    }

    /* Complete the interrupted entrance */

    @keyframes capriFinishBreakThrough {
      0% {
        opacity: 1;
        transform: translate3d(-12px,0,0) scale(.93);
        clip-path: inset(0 42% 0 0);
      }
      30% {
        opacity: 1;
        transform: translate3d(5px,0,0) scale(1.015);
        clip-path: inset(0 8% 0 0);
      }
      55% {
        transform: translate3d(-2px,0,0) scale(1);
        clip-path: inset(0);
      }
      100% {
        opacity: 1;
        transform: translate3d(0,0,0) scale(1);
        clip-path: inset(0);
      }
    }

    @keyframes capriOutsideScreen {
      0% {
        opacity: 1;
        transform: translate3d(0,0,0) scale(1);
        filter: contrast(1);
      }
      18% {
        opacity: 1;
        transform: translate3d(8px,-5px,0) scale(1.12);
        filter: contrast(1.2);
      }
      45% {
        opacity: 1;
        transform: translate3d(22px,-12px,0) scale(1.42);
        filter: contrast(1.35);
      }
      72% {
        opacity: 1;
        transform: translate3d(18px,-9px,0) scale(1.55);
        filter: contrast(1.2);
      }
      100% {
        opacity: 1;
        transform: translate3d(18px,-9px,0) scale(1.55);
        filter: contrast(1.15);
      }
    }

    @keyframes capriDigitalDisintegration {
      0% {
        opacity: 1;
        transform: translate3d(18px,-9px,0) scale(1.55);
        clip-path: inset(0);
        filter: contrast(1.2);
      }
      18% {
        opacity: 1;
        transform: translate3d(30px,-5px,0) scale(1.6);
        clip-path: polygon(
          0 0, 100% 0, 100% 22%,
          72% 22%, 72% 35%, 100% 35%,
          100% 100%, 0 100%
        );
        filter: contrast(1.8);
      }
      38% {
        opacity: .85;
        transform: translate3d(-15px,8px,0) scale(1.45);
        clip-path: polygon(
          0 0, 58% 0, 58% 18%,
          100% 18%, 100% 42%, 35% 42%,
          35% 65%, 100% 65%, 100% 100%, 0 100%
        );
        filter: contrast(2) saturate(1.8);
      }
      62% {
        opacity: .5;
        transform: translate3d(25px,-12px,0) scale(1.25);
        clip-path: polygon(
          0 0, 35% 0, 35% 20%,
          80% 20%, 80% 40%, 25% 40%,
          25% 60%, 65% 60%, 65% 80%,
          100% 80%, 100% 100%, 0 100%
        );
        filter: contrast(2.5);
      }
      82% {
        opacity: .2;
        transform: translate3d(-35px,15px,0) scale(1.05);
        clip-path: polygon(
          0 0, 18% 0, 18% 30%,
          52% 30%, 52% 48%, 12% 48%,
          12% 75%, 40% 75%, 40% 100%, 0 100%
        );
        filter: contrast(3);
      }
      100% {
        opacity: 0;
        transform: translate3d(55px,-25px,0) scale(.72);
        clip-path: inset(45% 45% 45% 45%);
        filter: contrast(4);
      }
    }

    @keyframes rgbSnap {
      0% { transform: translateX(-8px); opacity: .65; }
      50% { transform: translateX(8px); opacity: .35; }
      100% { transform: translateX(0); opacity: .5; }
    }

    @keyframes rgbDisintegration {
      0% {
        opacity: .8;
        transform: translateX(-8px);
        clip-path: inset(0);
      }
      35% {
        opacity: .9;
        transform: translateX(18px);
        clip-path: inset(0 0 45% 0);
      }
      70% {
        opacity: .55;
        transform: translateX(-25px);
        clip-path: inset(35% 0 15% 0);
      }
      100% {
        opacity: 0;
        transform: translateX(45px);
        clip-path: inset(50% 50% 50% 50%);
      }
    }

    @media (min-width: 651px) {
      #myrloreSecretOverlay .secret-inner {
        width: min(560px, 48vw);
        margin-left: 35vw;
      }
    }

    @media (max-width: 650px) {
      #capriPortal {
        left: 50%;
        top: 24%;
        width: min(55vw, 230px);
        height: min(39vh, 280px);
      }

      #myrloreSecretOverlay .secret-inner {
        width: 94vw;
        padding-top: 170px;
      }

      #myrloreSecretOverlay h2 {
        font-size: clamp(38px, 12vw, 62px);
      }

      #myrloreSecretOverlay p {
        font-size: 9px;
      }

      @keyframes capriOutsideScreen {
        0% {
          opacity: 1;
          transform: translate3d(0,0,0) scale(1);
        }
        45% {
          opacity: 1;
          transform: translate3d(0,-8px,0) scale(1.35);
        }
        100% {
          opacity: 1;
          transform: translate3d(0,-8px,0) scale(1.4);
        }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #myrloreSecretOverlay,
      #myrloreSecretOverlay .secret-inner {
        transition: none;
      }

      #myrloreSecretOverlay.fracture-start::before,
      #myrloreSecretOverlay.fracture-heavy::before,
      #myrloreSecretOverlay.fracture-start .secret-noise,
      #myrloreSecretOverlay.fracture-heavy .secret-noise,
      #myrloreSecretOverlay.fracture-start .capri-tear,
      #myrloreSecretOverlay.fracture-heavy .capri-tear,
      #capriPortal.portal-open::before,
      #capriPortal.portal-open::after {
        animation: none;
      }

      #capriPortal.capri-emerging #capriFlight {
        animation: none;
        opacity: 1;
        transform: none;
        clip-path: none;
      }
    }
  `;

  document.head.appendChild(secretStyle);

  const secretOverlay = document.createElement("div");

  secretOverlay.id = "myrloreSecretOverlay";
  secretOverlay.setAttribute("aria-hidden", "true");

  secretOverlay.innerHTML = `
    <div class="secret-noise"></div>

    <div class="capri-glitch-patches" id="capriGlitchPatches"></div>

    <div class="capri-tear" style="--tear-y: 18%; --tear-height: 9px;"></div>
    <div class="capri-tear" style="--tear-y: 39%; --tear-height: 14px;"></div>
    <div class="capri-tear" style="--tear-y: 67%; --tear-height: 7px;"></div>
    <div class="capri-tear" style="--tear-y: 83%; --tear-height: 11px;"></div>

    <div id="capriPortal" aria-hidden="true">
      <div id="capriFlight">
        <img id="capriImage" alt="">
        <img class="capri-rgb capri-rgb-pink" alt="" aria-hidden="true">
        <img class="capri-rgb capri-rgb-green" alt="" aria-hidden="true">
      </div>
    </div>

    <div class="secret-inner">
      <div class="secret-index">
        MYRLORE® / RESTRICTED ARCHIVE
      </div>

      <span class="secret-symbol">✳</span>

      <h2>Stay curious.</h2>

      <p>
        YOU FOUND SOMETHING THAT WASN'T MEANT TO BE FOUND.<br>
        INDEPENDENT BY NATURE. CREATIVE BY DESIGN.
      </p>

      <button type="button" id="secretClose">
        RETURN TO THE STUDIO
      </button>
    </div>
  `;

  document.body.appendChild(secretOverlay);

  const capriPortal = $("#capriPortal", secretOverlay);
  const capriFlight = $("#capriFlight", secretOverlay);
  const capriImageElement = $("#capriImage", secretOverlay);
  const capriRgbPink = $(".capri-rgb-pink", secretOverlay);
  const capriRgbGreen = $(".capri-rgb-green", secretOverlay);
  const secretCloseButton = $("#secretClose", secretOverlay);
  const patchContainer = $("#capriGlitchPatches", secretOverlay);

  /* ==========================================
     CAPRI IMAGE
     FIRST SPRITE FRAME ONLY
     NO FRAME CYCLING
  ========================================== */

  function loadCapri() {
    if (!capriImageElement) return;

    capriImage = new Image();

    capriImage.onload = () => {
      const columns = 4;
      const rows = 4;

      const frameWidth = capriImage.naturalWidth / columns;
      const frameHeight = capriImage.naturalHeight / rows;

      const stillCanvas = document.createElement("canvas");
      stillCanvas.width = frameWidth;
      stillCanvas.height = frameHeight;

      const ctx = stillCanvas.getContext("2d");

      ctx.drawImage(
        capriImage,
        0,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth,
        frameHeight
      );

      const stillImage = stillCanvas.toDataURL("image/png");

      capriImageElement.src = stillImage;

      if (capriRgbPink) capriRgbPink.src = stillImage;
      if (capriRgbGreen) capriRgbGreen.src = stillImage;
    };

    capriImage.onerror = () => {
      console.error(
        "Capri image failed to load. Check capri-spritesheet.png in your website root."
      );
    };

    capriImage.src = "capri-spritesheet.png";
  }

  loadCapri();

  /* ==========================================
     PATCH CREATION
  ========================================== */

  function createGlitchPatch(options = {}) {
    if (!patchContainer || !secretActive) return;

    const patch = document.createElement("div");
    patch.className = "capri-patch";

    if (options.block) {
      patch.classList.add("pixel-block");
    }

    const x = options.x ?? Math.random() * 100;
    const y = options.y ?? Math.random() * 100;
    const width = options.width ?? 55 + Math.random() * 230;
    const height = options.height ?? 3 + Math.random() * 22;

    patch.style.setProperty("--patch-x", `${x}%`);
    patch.style.setProperty("--patch-y", `${y}%`);
    patch.style.setProperty("--patch-width", `${width}px`);
    patch.style.setProperty("--patch-height", `${height}px`);

    patchContainer.appendChild(patch);

    requestAnimationFrame(() => {
      if (secretActive && patch.isConnected) {
        patch.classList.add("visible");
      }
    });

    const lifetime = options.lifetime ?? 180 + Math.random() * 550;

    const timer = setTimeout(() => {
      patch.classList.remove("visible");
      patch.classList.add("fade");

      setTimeout(() => patch.remove(), 250);
    }, lifetime);

    patchTimers.push(timer);
  }

  /* ==========================================
     SCREEN STRIP DISPLACEMENT
  ========================================== */

  function createScreenStrip() {
    if (!patchContainer || !secretActive) return;

    const strip = document.createElement("div");
    strip.className = "capri-screen-strip";

    strip.style.setProperty(
      "--strip-y",
      `${Math.random() * 100}%`
    );

    strip.style.setProperty(
      "--strip-height",
      `${3 + Math.random() * 18}px`
    );

    patchContainer.appendChild(strip);

    requestAnimationFrame(() => {
      if (secretActive && strip.isConnected) {
        strip.classList.add("active");
      }
    });

    const timer = setTimeout(() => strip.remove(), 300);
    patchTimers.push(timer);
  }

  function clearPatchTimers() {
    patchTimers.forEach(timer => clearTimeout(timer));
    patchTimers = [];

    if (patchContainer) {
      patchContainer.replaceChildren();
    }
  }

  function clearSequenceTimers() {
    sequenceTimers.forEach(timer => clearTimeout(timer));
    sequenceTimers = [];
  }

  function scheduleSequence(callback, delay) {
    const timer = setTimeout(() => {
      if (secretActive) callback();
    }, delay);

    sequenceTimers.push(timer);
    return timer;
  }

  /* ==========================================
     CONTINUOUS SCREEN CORRUPTION
     NEVER STOPS WHILE ARCHIVE IS OPEN
  ========================================== */

  function startScreenFracture() {
    secretOverlay.classList.add("fracture-start");

    if (reducedMotion) return;

    for (let i = 0; i < 7; i++) {
      scheduleSequence(() => {
        createGlitchPatch({
          block: i % 2 === 0,
          width: 45 + Math.random() * 180,
          height: 3 + Math.random() * 15,
          lifetime: 180 + Math.random() * 400
        });
      }, 250 + i * 190);
    }

    scheduleSequence(() => {
      createScreenStrip();

      createGlitchPatch({
        x: 20,
        y: 28,
        width: 260,
        height: 12,
        block: true
      });
    }, 850);

    const buildUp = setInterval(() => {
      if (!secretActive) {
        clearInterval(buildUp);
        return;
      }

      createGlitchPatch({
        lifetime: 220 + Math.random() * 450,
        width: 55 + Math.random() * 250,
        height: 3 + Math.random() * 20,
        block: Math.random() > .5
      });

      if (Math.random() > .35) createScreenStrip();

      if (Math.random() > .5) {
        createGlitchPatch({
          lifetime: 150 + Math.random() * 350,
          width: 35 + Math.random() * 120,
          height: 3 + Math.random() * 10,
          block: true
        });
      }
    }, 135);

    glitchTimers.push(buildUp);

    const heavyGlitchLoop = setInterval(() => {
      if (!secretActive) {
        clearInterval(heavyGlitchLoop);
        return;
      }

      secretOverlay.classList.add("fracture-heavy");

      for (let i = 0; i < 8 + Math.floor(Math.random() * 9); i++) {
        createGlitchPatch({
          lifetime: 180 + Math.random() * 420,
          width: 45 + Math.random() * 280,
          height: 4 + Math.random() * 24,
          block: Math.random() > .35
        });
      }

      for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
        createScreenStrip();
      }

      const releaseTimer = setTimeout(() => {
        if (secretActive) {
          secretOverlay.classList.remove("fracture-heavy");
        }
      }, 280 + Math.random() * 320);

      glitchTimers.push(releaseTimer);
    }, 2200);

    glitchTimers.push(heavyGlitchLoop);

    const interferenceLoop = setInterval(() => {
      if (!secretActive) {
        clearInterval(interferenceLoop);
        return;
      }

      if (Math.random() > .42) {
        createGlitchPatch({
          x: Math.random() * 90,
          y: Math.random() * 100,
          width: 60 + Math.random() * 260,
          height: 3 + Math.random() * 18,
          lifetime: 160 + Math.random() * 300,
          block: true
        });
      }

      if (Math.random() > .65) createScreenStrip();
    }, 480);

    glitchTimers.push(interferenceLoop);
  }

  /* ==========================================
     CAPRI CINEMATIC SEQUENCE

     1. Tear opens
     2. Capri emerges
     3. Capri freezes halfway
     4. Corrupted transmission
     5. Capri completes emergence
     6. Capri breaks out
     7. Capri holds
     8. Capri disintegrates
  ========================================== */

  function emergeCapri() {
    if (!capriPortal || !capriFlight) return;

    createGlitchPatch({
      x: window.innerWidth <= 650 ? 50 : 15.5,
      y: window.innerWidth <= 650 ? 24 : 52,
      width: window.innerWidth <= 650 ? 190 : 280,
      height: 10,
      lifetime: 900,
      block: true
    });

    createScreenStrip();
    capriPortal.classList.add("portal-open");

    if (reducedMotion) {
      capriPortal.classList.add("capri-settled");

      capriFlight.style.opacity = "1";
      capriFlight.style.clipPath = "inset(0)";
      capriFlight.style.transform = "none";

      scheduleSequence(() => {
        capriPortal.classList.add("capri-gone");
        capriFlight.style.opacity = "0";
      }, 1800);

      return;
    }

    /* STAGE 1 — BEGIN EMERGENCE */

    scheduleSequence(() => {
      capriPortal.classList.add("capri-emerging");

      for (let i = 0; i < 9; i++) {
        createGlitchPatch({
          x: (window.innerWidth <= 650 ? 50 : 15.5) +
            (Math.random() - .5) * 14,
          y: (window.innerWidth <= 650 ? 24 : 52) +
            (Math.random() - .5) * 28,
          width: 35 + Math.random() * 180,
          height: 3 + Math.random() * 16,
          lifetime: 180 + Math.random() * 300,
          block: true
        });
      }

      for (let i = 0; i < 4; i++) {
        createScreenStrip();
      }
    }, 650);

    /* STAGE 2 — INTERRUPTED EMERGENCE */

    scheduleSequence(() => {
      capriPortal.classList.add("capri-interrupted");

      createScreenStrip();

      for (let i = 0; i < 8; i++) {
        createGlitchPatch({
          x: (window.innerWidth <= 650 ? 50 : 15.5) +
            (Math.random() - .5) * 20,
          y: (window.innerWidth <= 650 ? 24 : 52) +
            (Math.random() - .5) * 35,
          width: 45 + Math.random() * 190,
          height: 4 + Math.random() * 20,
          lifetime: 180 + Math.random() * 350,
          block: true
        });
      }
    }, 1350);

    /* STAGE 3 — CORRUPTED TRANSMISSION */

    scheduleSequence(() => {
      capriPortal.classList.remove("capri-interrupted");
      capriPortal.classList.add("capri-transmitting");

      for (let i = 0; i < 12; i++) {
        createGlitchPatch({
          x: (window.innerWidth <= 650 ? 50 : 15.5) +
            (Math.random() - .5) * 25,
          y: (window.innerWidth <= 650 ? 24 : 52) +
            (Math.random() - .5) * 40,
          width: 35 + Math.random() * 220,
          height: 3 + Math.random() * 22,
          lifetime: 180 + Math.random() * 350,
          block: true
        });
      }

      for (let i = 0; i < 5; i++) {
        createScreenStrip();
      }
    }, 2100);

    /* STAGE 4 — COMPLETE THE EMERGENCE */

    scheduleSequence(() => {
      capriPortal.classList.remove(
        "capri-emerging",
        "capri-transmitting"
      );

      capriPortal.classList.add("capri-resuming");

      createScreenStrip();

      for (let i = 0; i < 6; i++) {
        createGlitchPatch({
          x: (window.innerWidth <= 650 ? 50 : 15.5) +
            (Math.random() - .5) * 16,
          y: (window.innerWidth <= 650 ? 24 : 52) +
            (Math.random() - .5) * 28,
          width: 45 + Math.random() * 170,
          height: 4 + Math.random() * 16,
          lifetime: 180 + Math.random() * 350,
          block: true
        });
      }
    }, 2820);

    /* STAGE 5 — SETTLE AND HOLD */

    scheduleSequence(() => {
      capriPortal.classList.remove("capri-resuming");
      capriPortal.classList.add("capri-settled");

      capriFlight.style.opacity = "1";
      capriFlight.style.transform = "translate3d(0,0,0) scale(1)";
      capriFlight.style.clipPath = "inset(0)";

      capriPortal.classList.remove("portal-open");
    }, 3670);

    /* STAGE 6 — BREAK OUT TOWARDS THE VIEWER */

    scheduleSequence(() => {
      capriPortal.classList.add("capri-breakout");

      createScreenStrip();

      for (let i = 0; i < 8; i++) {
        createGlitchPatch({
          x: (window.innerWidth <= 650 ? 50 : 15.5) +
            (Math.random() - .5) * 20,
          y: (window.innerWidth <= 650 ? 24 : 52) +
            (Math.random() - .5) * 32,
          width: 45 + Math.random() * 190,
          height: 4 + Math.random() * 18,
          lifetime: 220 + Math.random() * 350,
          block: true
        });
      }
    }, 3900);

    /* STAGE 7 — HOLD OUTSIDE THE SCREEN */

    scheduleSequence(() => {
      capriPortal.classList.remove("capri-breakout");
      capriPortal.classList.add("capri-disappearing");

      for (let i = 0; i < 22; i++) {
        createGlitchPatch({
          lifetime: 250 + Math.random() * 350,
          width: 45 + Math.random() * 240,
          height: 4 + Math.random() * 24,
          block: true
        });
      }

      for (let i = 0; i < 9; i++) {
        createScreenStrip();
      }
    }, 5200);

    /* STAGE 8 — REMOVE CAPRI COMPLETELY */

    scheduleSequence(() => {
      capriPortal.classList.remove("capri-disappearing");
      capriPortal.classList.add("capri-gone");

      capriFlight.style.opacity = "0";
    }, 5700);

    /* FINAL CLEANUP — BACKGROUND GLITCHES CONTINUE */

    scheduleSequence(() => {
      capriPortal.classList.remove(
        "portal-open",
        "capri-emerging",
        "capri-interrupted",
        "capri-transmitting",
        "capri-resuming",
        "capri-settled",
        "capri-breakout",
        "capri-disappearing"
      );

      capriPortal.classList.add("capri-gone");
    }, 6100);
  }

  /* ==========================================
     OPEN SECRET ARCHIVE
  ========================================== */

  function activateSecretArchive() {
    if (secretActive) return;

    secretActive = true;
    secretPreviousFocus = document.activeElement;

    secretOverlay.classList.add("active");
    secretOverlay.setAttribute("aria-hidden", "false");
    secretOverlay.removeAttribute("inert");

    body.style.overflow = "hidden";

    clearPatchTimers();
    clearSequenceTimers();

    capriPortal.classList.remove(
      "portal-open",
      "capri-emerging",
      "capri-interrupted",
      "capri-transmitting",
      "capri-resuming",
      "capri-settled",
      "capri-breakout",
      "capri-disappearing",
      "capri-gone"
    );

    capriFlight.style.opacity = "0";
    capriFlight.style.transform = "translate3d(-45px,0,0) scale(.86)";
    capriFlight.style.clipPath = "inset(0 100% 0 0)";

    startScreenFracture();

    scheduleSequence(() => {
      emergeCapri();
      secretCloseButton?.focus();
    }, reducedMotion ? 0 : 2900);

    console.log("MYRL​​ORE® — SECRET ARCHIVE UNLOCKED");
  }

  /* ==========================================
     CLOSE SECRET ARCHIVE
  ========================================== */

  function closeSecretArchive() {
    if (!secretActive) return;

    secretActive = false;

    glitchTimers.forEach(timer => {
      clearInterval(timer);
      clearTimeout(timer);
    });

    glitchTimers = [];

    clearSequenceTimers();
    clearPatchTimers();

    if (gsapInstance) {
      gsapInstance.killTweensOf(capriFlight);
    }

    secretOverlay.classList.remove(
      "active",
      "fracture-start",
      "fracture-heavy"
    );

    capriPortal.classList.remove(
      "portal-open",
      "capri-emerging",
      "capri-interrupted",
      "capri-transmitting",
      "capri-resuming",
      "capri-settled",
      "capri-breakout",
      "capri-disappearing",
      "capri-gone"
    );

    secretOverlay.setAttribute("aria-hidden", "true");
    secretOverlay.setAttribute("inert", "");

    body.style.overflow = "";

    capriFlight.style.opacity = "0";
    capriFlight.style.transform = "";
    capriFlight.style.clipPath = "";

    secretPreviousFocus?.focus?.();
  }

  secretCloseButton?.addEventListener(
    "click",
    closeSecretArchive
  );

  /* ==========================================
     KONAMI CODE DETECTION
  ========================================== */

  document.addEventListener("keydown", event => {
    if (secretActive) return;

    const key = event.key.length === 1
      ? event.key.toLowerCase()
      : event.key;

    if (key === konamiSequence[konamiPosition]) {
      konamiPosition++;

      if (konamiPosition === konamiSequence.length) {
        konamiPosition = 0;
        activateSecretArchive();
      }
    } else {
      konamiPosition =
        key === konamiSequence[0] ? 1 : 0;
    }
  });

  /* ==========================================
     GLOBAL ESCAPE HANDLING
  ========================================== */

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    if (secretActive) {
      closeSecretArchive();
      return;
    }

    if (caseModal?.classList.contains("is-open")) {
      closeCaseStudy();
      return;
    }

    if (menuPanel?.classList.contains("open")) {
      closeMenu();
    }
  });

  /* ==========================================
     INITIAL ACCESSIBILITY STATES
  ========================================== */

  if (menuPanel) {
    menuPanel.setAttribute("aria-hidden", "true");
    menuPanel.setAttribute("inert", "");
  }

  if (caseModal) {
    caseModal.setAttribute("aria-hidden", "true");
    caseModal.setAttribute("inert", "");
  }

  secretOverlay.setAttribute("aria-hidden", "true");
  secretOverlay.setAttribute("inert", "");

  menuToggle?.setAttribute("aria-expanded", "false");

  /* ==========================================
     MYRL​​ORE® — SYSTEM READY
  ========================================== */

  console.log(
    "%cMYRL​​ORE®",
    "font-size:22px;font-weight:800;letter-spacing:5px;color:#c6b69a;"
  );

  console.log(
    "%cIndependent by nature. Creative by design.",
    "font-size:11px;color:#85868a;letter-spacing:2px;"
  );

  console.log(
    "%cSecret archive: ↑ ↑ ↓ ↓ ← → B A",
    "font-size:10px;color:#c6b69a;"
  );

})();
