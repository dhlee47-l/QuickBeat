document.addEventListener("DOMContentLoaded", function () {
    const isQuizPage = window.location.pathname.includes('quiz.html');

    if (isQuizPage) {
        initNavbar();
    } else {
        fetch("../html/navbar.html")
            .then(response => response.text())
            .then(data => {
                document.getElementById("navbar-container").innerHTML = data;
                initNavbar();
            })
            .catch(error => console.error("Error loading navbar:", error));
    }
});


function initNavbar() {
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    function handleScroll() {
        if (!mobileQuery.matches) return;

        const currentScroll = window.scrollY;

        if (currentScroll > lastScroll && currentScroll > 50) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }

        lastScroll = currentScroll;
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    const throttledHandleScroll = throttle(handleScroll, 100);

    window.removeEventListener('scroll', throttledHandleScroll);

    window.addEventListener('scroll', throttledHandleScroll);

    window.addEventListener('resize', () => {
        if (!mobileQuery.matches) {
            navbar.classList.remove('hidden');
        }
    });
}