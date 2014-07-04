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
        var docFrag = document.createDocumentFragment();
        var splitFortune = fortunes[randomIndex].replace(/^"|"$/g, "").split(/\n/);
        splitFortune.forEach(function(text, index)
        {
            if (index > 0)
                docFrag.appendChild(document.createElement("br"));

            docFrag.appendChild(document.createTextNode(text));
        });

        while (fortuneParagraph.hasChildNodes())
            fortuneParagraph.firstChild.remove();

        fortuneParagraph.appendChild(docFrag);
    }

    /**
     * Parse the fortunes according to the following rules:
     * - The comments (lines beginning with a "#") are ignored
     * - Allow multiline quotes:
     *    * the text begins with a quote (")
     *    * the text ends with a quote
     *    * if a quote is in the text, wait for the closing quote
     *
     * @param {string} fortunesText The raw text of the fortunes (downloaded through XHR).
     *
     * @return {array} The splited and parsed fortunes.
     */
    function parseFortunes(fortunesText)
    {
        var fortunes = fortunesText.split("\n");
        fortunes = fortunes.reduce(function(array, text, index)
        {
            var lastItem = array[array.length - 1];

            if (lastItem && lastItem.startsWith('"') && !(lastItem.endsWith('"') &&
                lastItem.match('"', "g").length % 2 === 0))
            {
                array.splice(array.length - 1, 1, lastItem + "\n" + text);
                return array;
            }
            // Only keep non-empty and non-commented lines.
            if (text && !text.startsWith("#"))
                array.push(text);

            return array;
        }, []);

        return fortunes;
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
                    // Let's parse the fortunes.
                    fortunes = parseFortunes(fortunesText);
                    // Display the fortunes.
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

