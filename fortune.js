(function()
{
    "use strict";
    var fortunes;
    var fortuneParagraph = document.getElementById("fortune");
    var fortuneURL = localStorage.getItem("fortuneURL") ||
        "https://raw.githubusercontent.com/bwinton/whimsy/gh-pages/urlbar-sayings.txt";
    var xhr;
    var another = document.getElementById("another");
    var menuButton = document.getElementById("menu-button");
    var urlInput = document.getElementById("urlInput");

    function setErrorMessage(errorMessage)
    {
        var error = document.getElementById("error");
        error.textContent = errorMessage;
        document.body.className = "state-error";
    }

    function displayRandomFortune()
    {
        var randomIndex = Math.floor(Math.random() * fortunes.length);
        fortuneParagraph.textContent = fortunes[randomIndex];
    }

    function loadFortunes()
    {
        // TODO Manage the states cleanlier
        document.body.className = "state-loading";

        xhr = new XMLHttpRequest({
            mozSystem: true,
            mozAnon: true
        });
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === xhr.DONE)
            {
                if (xhr.status === 200)
                {
                    var fortunesText = xhr.responseText;
                    if (!fortunesText)
                    {
                        setErrorMessage("Could not get the fortunes: no text retrieved");
                        return;
                    }
                    fortunes = fortunesText.split("\n");
                    fortunes = fortunes.filter(function(text)
                    {
                        // Only keep non-empty and non-commented lines.
                        return text && !text.startsWith("#");
                    });
                    document.body.classList.remove("state-loading");
                    displayRandomFortune();

                }
                else
                {
                    setErrorMessage("Could not load the fortunes. (error code: " + xhr.status +
                        ", error message: \"" + xhr.statusText + "\")");
                }
            }
        };

        xhr.open("GET", fortuneURL, true);
        xhr.send(null);
    }

    another.addEventListener("mouseup", displayRandomFortune);
    loadFortunes();
    urlInput.value = fortuneURL;
    menuButton.addEventListener("mouseup", function()
    {
        document.body.classList.toggle("display-menu");
        // The URL can be changed if the previous screen was the menu.
        // Check that the URL has changed. If so, reload the fortunes.
        var newURL = urlInput.value;
        if (fortuneURL !== newURL)
        {
            fortuneURL = newURL;
            localStorage.setItem("fortuneURL", fortuneURL);
            loadFortunes();
        }
    });
})();

