// main text animation
const spanEl = document.querySelector("main h2 span");
const txtArr = [
  'Smart Drone Security System',
  'AI-Powered Surveillance Solution',
  'Intelligent Monitoring Platform',
  'Real-time Detection System'
];
let index = 0;
let currentTxt = txtArr[index].split("");

function writeTxt(){
  spanEl.textContent += currentTxt.shift();
  if(currentTxt.length !== 0){
    setTimeout(writeTxt, Math.floor(Math.random()*100));
  }else{
    currentTxt = spanEl.textContent.split("");
    setTimeout(deleteTxt, 3000);
  }
}
function deleteTxt(){
  currentTxt.pop();
  spanEl.textContent = currentTxt.join("");
  if(currentTxt.length !== 0){
    setTimeout(deleteTxt, Math.floor(Math.random()*100));
  }else{
    index = (index + 1) % txtArr.length;
    currentTxt = txtArr[index].split("");
    writeTxt();
  }
}
writeTxt();

// header active on scroll
const headerE1 = document.querySelector("header");
window.addEventListener("scroll", function(){
  scrollCheck();
});
function scrollCheck(){
  const browserScrollY = window.scrollY ? window.scrollY : window.pageYOffset;
  if(browserScrollY > 0){
    headerE1.classList.add('active');
  }else{
    headerE1.classList.remove('active');
  }
}

// (원본 그대로 유지) data-animation-scroll 훅
const scrollMoveE1 = document.querySelectorAll("[data-animation-scroll = 'true]");
for(let i = 0 ; i < scrollMoveE1.length; i++){
  scrollMoveE1[i].addEventListener("click", function(){
    animationMove(this.dataset.target);
  });
}
function animationMove(selector){
  const target = document.querySelector(selector);
  const browserScrollY = window.pageYOffset;
  const targetScrollY = target.getBoundingClientRect().top + browserScrollY;
  window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
}

// 모바일 헤더 햄버거 토글
const menuBtn = document.querySelector('.menu-toggle');
const navEl = document.querySelector('header nav');

if (menuBtn && navEl) {
  const closeNav = () => {
    navEl.classList.remove('open');
    document.body.classList.remove('has-mobile-nav');
    menuBtn.setAttribute('aria-expanded', 'false');
  };
  const openNav = () => {
    navEl.classList.add('open');
    document.body.classList.add('has-mobile-nav');
    menuBtn.setAttribute('aria-expanded', 'true');
  };

  menuBtn.addEventListener('click', () => {
    const opened = navEl.classList.toggle('open');
    document.body.classList.toggle('has-mobile-nav', opened);
    menuBtn.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  // 메뉴 클릭 시 자동 닫힘
  navEl.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', closeNav);
  });

  // 데스크탑 전환 시 강제 닫기
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeNav();
  });
}

// 섹션 인뷰 애니메이션
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const triggerPoint = windowHeight * 0.7;
  return (rect.top <= triggerPoint && rect.bottom >= 0);
}

function handleScrollAnimation() {
  const sections = document.querySelectorAll('#about, #features, #portfolio, #contact');
  sections.forEach(section => {
    if (isElementInViewport(section)) {
      section.classList.add('visible');
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const sectionsToAnimate = document.querySelectorAll('#about, #features, #portfolio, #contact');
  sectionsToAnimate.forEach(section => {
    section.classList.add('animated');
  });
  handleScrollAnimation();
});

window.addEventListener('scroll', handleScrollAnimation);
