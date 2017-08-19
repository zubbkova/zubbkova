var Authenticate = function() {
    "use strict";
    
    var username = document.getElementById('text_login').value,
        password = document.getElementById('text_password').value;
    $.ajax({
        type: "POST",
        url: "https://www.advfn.com/p.php?java=login",
        data: "param=" + encodeURIComponent("username=" + username + "|password=" + password),
        dataType: "text",
        success: function(responseData, textStatus, jqXHR) {
            var response = responseData.replace(/(\r\n|\n|\r)/gm, "");
            console.log(responseData);
            if (response.indexOf('SID') > 0) {
                let loc = document.location.pathname.substr(0, document.location.pathname.indexOf("auth")) + "index.html";
                window.location = loc;
            }
        },
        error: function(responseData, textStatus, errorThrown) {
            console.log("Error");
        }
    });
}