var ChatWorker  = (function(undefined) {

    var intervalId = null;
    var interval = 500;
    var timestamp = 0;

    function init() {
        console.log('INIT');
        loadTimer();
    }

    function loadTimer() {
        if(intervalId != null)
            clearInterval(intervalId)

        intervalId = setTimeout(function() {
            load('http://159.89.191.42/rooms/check-for-updates/' + timestamp, function(x) {
                var response = JSON.parse(x.response);
                timestamp = response.timestamp;
                if(response.messages.length > 0)
                {
                    postMessage({status: 'new_messages', messages: response.messages});
                }
                loadTimer();
            })
        }, interval);
    }

    function load(url, callback) {
        var xhr;

        if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
        else {
            var versions = ["MSXML2.XmlHttp.5.0",
                            "MSXML2.XmlHttp.4.0",
                            "MSXML2.XmlHttp.3.0",
                            "MSXML2.XmlHttp.2.0",
                            "Microsoft.XmlHttp"]

            for(var i = 0, len = versions.length; i < len; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                }
                catch(e){}
            } // end for
        }

        xhr.onreadystatechange = ensureReadiness;

        function ensureReadiness() {
            if(xhr.readyState < 4) {
                return;
            }

            if(xhr.status !== 200) {
                return;
            }

            // all is well
            if(xhr.readyState === 4) {
                callback(xhr);
            }
        }

        xhr.open('GET', url, true);
        xhr.send('');
    }

    return {
        init
    }
})();

ChatWorker.init();
