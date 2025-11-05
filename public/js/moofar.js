
// moofar.js - Full JS including smooth easing parallax for hero + about page, scroll animations, forms
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rafThrottle(fn){
    let running=false;
    return function(...args){
      if(running) return;
      running=true;
      requestAnimationFrame(()=>{fn.apply(this,args);running=false;});
    };
  }

  // ---------- Homepage Hero Easing Parallax ----------
  let heroState={sunY:0,hillBackX:0,hillMidX:0,hillFrontX:0,cloudsX:[]};
  function updateHeroParallax(){
    const hero=document.querySelector('#hero');
    if(!hero) return;
    const offset=window.pageYOffset||document.documentElement.scrollTop;
    const screenWidth=window.innerWidth;
    const scale=screenWidth<768?0.3:1;
    const ease=0.08;

    const sun=hero.querySelector('.sun');
    const hillBack=hero.querySelector('.hill.back');
    const hillMid=hero.querySelector('.hill.mid');
    const hillFront=hero.querySelector('.hill.front');
    const clouds=hero.querySelectorAll('.cloud');

    const targetSunY=offset*0.05*scale;
    const targetBackX=offset*0.02*scale;
    const targetMidX=offset*0.04*scale;
    const targetFrontX=offset*0.06*scale;

    heroState.sunY+=(targetSunY-heroState.sunY)*ease;
    heroState.hillBackX+=(targetBackX-heroState.hillBackX)*ease;
    heroState.hillMidX+=(targetMidX-heroState.hillMidX)*ease;
    heroState.hillFrontX+=(targetFrontX-heroState.hillFrontX)*ease;

    if(sun) sun.style.transform=`translateY(${heroState.sunY}px)`;
    if(hillBack) hillBack.style.transform=`translateX(${heroState.hillBackX}px)`;
    if(hillMid) hillMid.style.transform=`translateX(${heroState.hillMidX}px)`;
    if(hillFront) hillFront.style.transform=`translateX(${heroState.hillFrontX}px)`;

    clouds.forEach((cloud,i)=>{
      const speed=(0.03+i*0.01)*scale;
      heroState.cloudsX[i]=heroState.cloudsX[i]||0;
      const targetCloudX=offset*speed;
      heroState.cloudsX[i]+=(targetCloudX-heroState.cloudsX[i])*ease;
      cloud.style.transform=`translateX(${heroState.cloudsX[i]}px)`;
    });

    requestAnimationFrame(updateHeroParallax);
  }

  // ---------- About Page Easing Parallax ----------
  let aboutState={sunY:0,hillBackX:0,hillMidX:0,hillFrontX:0,cloudsX:[]};
  function updateAboutParallax(){
    const section=document.querySelector('#about-parallax');
    if(!section) return;
    const offset=window.pageYOffset||document.documentElement.scrollTop;
    const screenWidth=window.innerWidth;
    const scale=screenWidth<768?0.3:1;
    const ease=0.08;

    const sun=section.querySelector('.sun');
    const hillBack=section.querySelector('.hill.back');
    const hillMid=section.querySelector('.hill.mid');
    const hillFront=section.querySelector('.hill.front');
    const clouds=section.querySelectorAll('.cloud');

    const targetSunY=offset*0.03*scale;
    const targetBackX=offset*0.015*scale;
    const targetMidX=offset*0.025*scale;
    const targetFrontX=offset*0.04*scale;

    aboutState.sunY+=(targetSunY-aboutState.sunY)*ease;
    aboutState.hillBackX+=(targetBackX-aboutState.hillBackX)*ease;
    aboutState.hillMidX+=(targetMidX-aboutState.hillMidX)*ease;
    aboutState.hillFrontX+=(targetFrontX-aboutState.hillFrontX)*ease;

    if(sun) sun.style.transform=`translateY(${aboutState.sunY}px)`;
    if(hillBack) hillBack.style.transform=`translateX(${aboutState.hillBackX}px)`;
    if(hillMid) hillMid.style.transform=`translateX(${aboutState.hillMidX}px)`;
    if(hillFront) hillFront.style.transform=`translateX(${aboutState.hillFrontX}px)`;

    clouds.forEach((cloud,i)=>{
      const speed=(0.02+i*0.01)*scale;
      aboutState.cloudsX[i]=aboutState.cloudsX[i]||0;
      const targetCloudX=offset*speed;
      aboutState.cloudsX[i]+=(targetCloudX-aboutState.cloudsX[i])*ease;
      cloud.style.transform=`translateX(${aboutState.cloudsX[i]}px)`;
    });

    requestAnimationFrame(updateAboutParallax);
  }

  // ---------- Scroll-triggered animations ----------
  const animateEls=Array.from(document.querySelectorAll('[data-animate]'));
  function revealOnScroll(){
    const vh=window.innerHeight;
    animateEls.forEach(el=>{
      if(el.classList.contains('in-view')) return;
      const rect=el.getBoundingClientRect();
      if(rect.top<=vh-80) el.classList.add('in-view');
    });
  }

  function onScrollHandler(){
    if(!prefersReduced){
      revealOnScroll();
    }
  }

  const throttledScroll=rafThrottle(onScrollHandler);
  window.addEventListener('scroll',throttledScroll,{passive:true});
  window.addEventListener('resize',rafThrottle(onScrollHandler));

  // ---------- DOMContentLoaded ----------
  document.addEventListener('DOMContentLoaded',()=>{
    updateHeroParallax();
    updateAboutParallax();
    onScrollHandler();

    // Homepage quick form
    const quickForm=document.getElementById('home-contact');
    if(quickForm){
      quickForm.addEventListener('submit',e=>{
        e.preventDefault();
        alert('Thanks — we will contact you via the provided email.');
        quickForm.reset();
      });
    }

    // Contact form AJAX submit to Netlify function
    const contactForm=document.getElementById('contact-form');
    if(contactForm){
      contactForm.addEventListener('submit',async e=>{
        e.preventDefault();
        const botField=contactForm.querySelector('input[name="bot-field"]');
        if(botField && botField.value) return;
        const data={
          name:contactForm.name.value.trim(),
          email:contactForm.email.value.trim(),
          message:contactForm.message.value.trim()
        };
        if(!data.name||!data.email||!data.message){
          alert('Please fill all fields.');
          return;
        }
        try{
          const res=await fetch('/.netlify/functions/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
          if(!res.ok){alert('Sorry — something went wrong.');return;}
          window.location.href='/success';
        }catch(err){console.error(err);alert('Sorry — unable to send right now.');}
      });
    }

    // Menu toggle
    window.toggleMenu=function(){
      const btn=document.querySelector('.menu-btn');
      const expanded=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded',String(!expanded));
      document.body.classList.toggle('menu-open');
    };
  });
})();


