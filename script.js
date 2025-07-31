// main text animation
const spanEl = document.querySelector("main h2 span");
const txtArr = ['Smart Drone Security System','AI-Powered Surveillance Solution', 'Intelligent Monitoring Platform', 'Real-time Detection System'];
let index = 0;
let currentTxt = txtArr[index].split("");
function writeTxt(){
    spanEl.textContent += currentTxt.shift();
    if(currentTxt.length !==0){
        setTimeout(writeTxt, Math.floor(Math.random()*100))
    }
    else{
        currentTxt = spanEl.textContent.split("");
        setTimeout(deleteTxt, 3000);
    }
}
function deleteTxt(){
    currentTxt.pop();
    spanEl.textContent = currentTxt.join("");
    if(currentTxt.length !==0){
        setTimeout(deleteTxt, Math.floor(Math.random()*100))
    }
    else{
        index = (index +1) % txtArr.length;
        currentTxt = txtArr[index].split("");
        writeTxt();
    }
}
writeTxt();
//header에 active 클래스 추가
const headerE1 = document.querySelector("header");
window.addEventListener("scroll", function(){
    scrollCheck();
});
function scrollCheck(){
    const browserScrollY = window.scrollY ? window.scrollY : window.pageYOffset;
    if(browserScrollY > 0){
        headerE1.classList.add('active');
    }
    else{
        headerE1.classList.remove('active');
    }
}
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
    window.scrollTo({top:targetScrollY, behavior:'smooth'});
}