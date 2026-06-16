// ==========================================================================
// 1. Initialize Lenis (Smooth Scrolling)
// ==========================================================================
const lenis = new Lenis({
    duration: 1.2, // Speed of the smooth scroll
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
});

// Sync Lenis scroll with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ==========================================================================
// 2. Storytelling / Overlapping Parallax Effect
// ==========================================================================
// Make the hero section scroll at a different speed to create depth, 
// so the next section visually slides OVER it.
gsap.to(".hero-section", {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// Fade in and slide up elements as they enter the screen
const sections = gsap.utils.toArray('section:not(#hero)');
sections.forEach((section) => {
    gsap.from(section, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: section,
            start: "top 85%", // Triggers when the top of the section hits 85% of viewport height
            toggleActions: "play none none reverse" // Reverses when scrolling back up
        }
    });
});

// ==========================================================================
// 3. Impact Section Animations (Your Original Code, Optimized)
// ==========================================================================
gsap.fromTo(
    ".impact-card",
    {
        y: 100,
        opacity: 0
    },
    {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2, // Cascading effect
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#impact",
            start: "top 80%"
        }
    }
);

gsap.from(".impact-heading", {
    y: 50,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
        trigger: "#impact",
        start: "top 80%"
    }
});

// ==========================================================================
// 4. GSAP Optimized Number Counters
// ==========================================================================
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
    const target = +counter.dataset.target;
    
    // Use GSAP to animate the numbers instead of IntersectionObserver
    gsap.fromTo(counter, 
        { innerText: 0 }, 
        {
            innerText: target,
            duration: 2,
            snap: { innerText: 1 }, // Snaps the value to whole numbers
            ease: "power2.out",
            scrollTrigger: {
                trigger: counter,
                start: "top 90%"
            },
            onUpdate: function() {
                // Formats with commas and adds the "+" sign
                counter.innerHTML = Math.ceil(counter.innerText).toLocaleString() + "+";
            }
        }
    );
});
// ==========================================================================
// Navbar Scroll Effect
// ==========================================================================
ScrollTrigger.create({
    start: "top -50", // Triggers when the user scrolls 50px down
    end: 99999, // Keeps the effect active indefinitely as you scroll down
    toggleClass: { className: "scrolled", targets: "nav" }
});


// ==========================================================================
// Anti-Peek Curtain Footer Fix
// ==========================================================================
// 1. Hide the footer instantly on page load so it can't peek through
gsap.set("#contact", { visibility: "hidden" });

// 2. Only make the footer visible when the user reaches the transparent spacer
ScrollTrigger.create({
    trigger: "footer",           // Watches the empty <footer> spacer at the end of the HTML
    start: "top bottom",         // Triggers the exact moment the spacer enters the bottom of the screen
    onEnter: () => gsap.set("#contact", { visibility: "visible" }), // Show footer
    onLeaveBack: () => gsap.set("#contact", { visibility: "hidden" }) // Hide it again if they scroll back up
});

// ==========================================================================
// Curtain Reveal Footer Logic
// ==========================================================================
function setupFooterReveal() {
    const contactSection = document.getElementById('contact');
    const footerSpacer = document.querySelector('footer');
    
    if (contactSection && footerSpacer) {
        // Set the empty <footer> height to exactly match the #contact section
        footerSpacer.style.height = `${contactSection.offsetHeight}px`;
    }
}

// Run the setup when the page loads
window.addEventListener('load', setupFooterReveal);

// Re-calculate if the user resizes their browser or rotates their phone
window.addEventListener('resize', setupFooterReveal);


// ==========================================================================
// Dark Mode Toggle Logic
// ==========================================================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;

// 1. Check if the user previously saved a theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun'); // Switch icon to sun
    }
}

// 2. Listen for clicks on the toggle button
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        // Toggle the dark-mode class on the body
        document.body.classList.toggle('dark-mode');
        
        // Check if dark mode is now active
        if (document.body.classList.contains('dark-mode')) {
            // Save preference and switch to Sun icon
            localStorage.setItem('theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            // Save preference and switch to Moon icon
            localStorage.setItem('theme', 'light');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });
}

// ==========================================================================
// Active Navbar Link Logic
// ==========================================================================
function setActiveNavLink() {
    // Get all the links in the navbar
    const navLinks = document.querySelectorAll('.navbar ul li a');
    
    // Get the current page URL path
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        // Get the path of the specific link
        const linkPath = new URL(link.href).pathname;
        
        // If the current browser URL matches the link's URL, make it active
        // (The second condition handles cases where the root domain '/' loads index.html)
        if (currentPath === linkPath || (currentPath === '/' && linkPath.endsWith('index.html'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Run the function as soon as the page loads
window.addEventListener('load', setActiveNavLink);

// ==========================================================================
// Programs Vertical Auto-Slider (Condensed)
// ==========================================================================
window.addEventListener('load', () => {
    const track = document.querySelector('.programs-track'),
          dots = document.querySelectorAll('.dot'),
          box = document.querySelector('.programs-slider-container');
    
    if (!track || !dots.length) return;

    let index = 0, timer;

    // Moves the track and updates the active dot
    const slideTo = (i) => {
        gsap.to(track, { yPercent: -100 * (index = i), duration: 1.2, ease: "power3.inOut" });
        dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
    };

    // Auto-play controls
    const play = () => timer = setInterval(() => slideTo((index + 1) % dots.length), 4000);
    const stop = () => clearInterval(timer);

    // Click and Hover interactions
    dots.forEach((dot, i) => dot.onclick = () => { stop(); slideTo(i); play(); });
    box.onmouseenter = stop;
    box.onmouseleave = play;

    // Start the slider
    play();
});