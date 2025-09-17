const introAnimation = () => {
  const tl = gsap.timeline({ defaults: { ease: 'expo.inOut', duration: 1 }});
  tl.to('.intro__title', { duration: 1.5, y: 0, autoAlpha: 1, delay: 0.5 })
    .to('.intro__background--left, .intro__background--right', { scaleX: 1 })
    .to('.intro__background--left, .intro__background--right', { scaleY: 0, transformOrigin: 'top center' })
    .to('.intro__title', { duration: 1.5, y: -60, autoAlpha: 0 }, '-=0.6')
    .to('.intro', { y: '-100%' }, '-=0.5');
  return tl;
};

// 인트로 실행
gsap.timeline({ paused: false, delay: 0.2 }).add(introAnimation());

// 화면 아무 곳이나 클릭 → main.html 이동
document.addEventListener('click', () => {
  window.location.href = '../main/main.html';
});
