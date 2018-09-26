var html, body;
    
window.onscroll = function (e) {
    html = document.documentElement;
    body = document.body;

    if (html.scrollTop > 20 || body.scrollTop > 20) {
        document.getElementById("goUpButton").style.display = "block";
    } else {
        document.getElementById("goUpButton").style.display = "none";
    }
}

window.onload = function () {
    html = document.documentElement;
    body = document.body;

    links = document.links;

    for (var i = 0; i < links.length; i++) {
        links[i].onclick = function () {
            // Animation settings
            var timeInterval = 16.66; // 16.66 ms is the refresh rate at 60 Hz
            var duration = 500;

            event.preventDefault()
            
            // Get the element
            var element = document.getElementById(this.hash.substring(1));
            // Get the current scroll position
            var startLocation = body.scrollTop || html.scrollTop;
            // The getBoundingClientrect.top contains the y coordinates of the element
            var destLocation = element ? element.getBoundingClientRect().top : 0;

            // We prevent the animation from overshooting if the div is lower than the
            // maximum scrolling value
            var pageHeight = Math.max(
                body.scrollHeight, 
                body.offsetHeight, 
                html.clientHeight, 
                html.scrollHeight, 
                html.offsetHeight
            );
            // The maximum scrolling value will be the page height minus the rendered window height
            var limit = pageHeight - window.innerHeight;

            if (destLocation > limit) {
                destLocation = limit;
            }
            
            // This will finish right when the scrolling is done to prevent the screen
            // from moving abruptly for a split-second before actually starting 
            // the scroll due to the hash changing in the address bar.
            setTimeout(() => {
                // Change the hash in address bar
                window.location.hash = this.hash;
            }, duration)

            scrollTo(startLocation, destLocation, timeInterval, duration, Math.easeInOutQuad);
        }
    }

    function scrollTo(from, to, timeInterval, duration, posFunction) { 
        // We Calculate the amount of steps needed with the interval and duration
        var steps = duration / timeInterval;
        // With that we determine how long the steps have to be
        var stepLength = (to - from) / steps;
        // Initialize the timer
        var currentTime = 0;
        // For logging purposes
        var logPoints = '';

        var scrollProcess = setInterval(function () {
            currentTime += timeInterval;
            
            // If the current time is equal or exceeds the duration, stop the process
            if (currentTime >= (duration)) {
                clearInterval(scrollProcess)
            }

            var scrollTo = posFunction(to - from, currentTime, duration, from);

            // Useless if not logged, duh
            logPoints += '(' + currentTime + ',' + scrollTo + ')';

            document.documentElement.scrollTop = Math.round(scrollTo);

        }, timeInterval);
    }

    Math.easeInOutQuad = function (c, t, d, b) {
        // c: The distance between elements
        // t: Current time
        // d: Duration of the process
        // b: Starting point

        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };
}