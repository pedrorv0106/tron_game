pc.script.createLoadingScreen(function(app) {
    var showSplash = function() {
        // splash wrapper
        var wrapper = document.createElement("div");
        wrapper.id = "application-splash-wrapper";
        document.body.appendChild(wrapper);

        // splash
        var splash = document.createElement("div");
        splash.id = "application-splash";
        wrapper.appendChild(splash);
        splash.style.display = "none";

        var logo = document.createElement("img");
        logo.src = "https://tk-assets.sfo2.digitaloceanspaces.com/bombertron/bombertron/bombertron.png";
        splash.appendChild(logo);
        logo.onload = function() {
            splash.style.display = "block";
        };

        var container = document.createElement("div");
        container.id = "progress-bar-container";
        splash.appendChild(container);

        var bar = document.createElement("div");
        bar.id = "progress-bar";
        container.appendChild(bar);
    };

    var hideSplash = function() {
        var splash = document.getElementById("application-splash-wrapper");
        splash.parentElement.removeChild(splash);
    };

    var setProgress = function(value) {
        var bar = document.getElementById("progress-bar");
        if (bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + "%";
        }
    };

    showSplash();

    app.on("preload:end", function() {
        app.off("preload:progress");
    });
    app.on("preload:progress", setProgress);
    app.on("start", hideSplash);
});
