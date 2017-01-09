$(document).ready(function(){
  $("#load-captcha").click(function() {
    $("#load-captcha").html('<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading...');
    $.getJSON("captcha/generate", function() {
//      console.log("success");
    }).done(function(data) {
//      console.log(data);
      $("#uid-captcha").val(data.uid);
      $("#image-captcha").attr('src', 'data:image/jpeg;base64,' + data.image);
      $("#load-captcha").html('Load new captcha');
    });
  });
  $("#verify-captcha").click(function() {
    if ($("#input-captcha").val() == "") {
      alert("You have to input the verification code! Are you really human?");
    } else {
      var id = $("#uid-captcha").val()
      var code = $("#input-captcha").val()
      var verifyUrl = "captcha/validate?id=" + id + "&code=" + code;
      $.ajax(verifyUrl, {
        statusCode : {
          202: function (response) {
            alert("Captcha correct!");
          },
          409: function (response) {
            alert("Captcha incorrect!");
          }
        }
      });
    }
  });
});
