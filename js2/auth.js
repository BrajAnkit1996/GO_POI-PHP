$(document).ready(function()
{
  $('.form').find('input, textarea').on('keyup blur focus', function(e) 
  {
    var $this = $(this),label = $this.prev('label');
    if (e.type === 'keyup') 
    {
      if ($this.val() === '') 
      {
        label.removeClass('active highlight');
      } 
      else 
      {
        label.addClass('active highlight');
      }
    } 
    else if (e.type === 'blur') 
    {
      if ($this.val() === '') 
      {
        label.removeClass('active highlight');
      } 
      else 
      {
        label.removeClass('highlight');
      }
    } 
    else if (e.type === 'focus') 
    {
      if ($this.val() === '') 
      {
        label.removeClass('highlight');
      } 
      else if ($this.val() !== '') 
      {
        label.addClass('highlight');
      }
    }
  });

  $(document).on('click', '.tab a', function(event)
  {
      $(this).parent().addClass('active');
      $(this).parent().siblings().removeClass('active');
      target = $(this).attr('href');
      $('.tab-content > div').not(target).hide();
      $(target).fadeIn(600);
      event.preventDefault();
  });

  $(document).on("submit","#register-form",function(event)
  {
    var error = false;
    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var postData = $(this).serializeArray();
    var formURL     = $(this).attr("action");
    postData.push({name: 'method', value: 'register'});

    if((postData[3].value).length < 6)
    {
      show_error("Password must be atleast 6 chars.");
      error = true;
    }
    

    if((postData[0].value).length < 1)
    {
        show_error("Please enter username");
        error = true;
    }
   

    if((postData[1].value).length < 1)
    {
        show_error("Please enter your name");
        error = true;
    }
   

    if(!emailRegex.test(postData[2].value))
    {
      show_error("Please enter valid email")
      error = true;
    }
   

    if(!error)
    {
      $.post(formURL, postData, function (data) 
      {
        var decode = JSON.parse(data);
        if(decode.response == 'User Name Already Exist')
        {
          show_error('User Name Already Exist');
         
        }
        else if(decode.response == 'Email ID Already Exist')
        {
          show_error('Email ID Already Exist');
          
        }
        else if(decode.response == true)
        {
          var storedEvent = JSON.parse(localStorage.getItem("event"));
          if(storedEvent)
          {
            var data = storedEvent[0];
            $.post('userAuth', data, function (data) 
            {
                var decode = JSON.parse(data);
                if(decode.response.listName)
                {
                    $('#my-fav').html('<i class="fa fa-heart" aria-hidden="true"></i> Saved');
                    $('body').animate({ scrollTop: 1000 });
                localStorage.clear();
                }
            });
            }
          $('#signin').html('Hi, '+decode.name +  '<br><u>Logout</u>');
          $("#signin").prop('id',"signout");
          $("#fade_layer").hide();
        }
      });
    }
    event.preventDefault();
  });

  $(document).on("submit","#login-form",function(event)
  {
    var error = false;
    var postData    = $(this).serializeArray();
    var formURL     = $(this).attr("action");
    postData.push({name: 'method', value: 'login'});
    if((postData[1].value).length < 6)
    {
      $('#pwd-msg').fadeIn(600);
      error = true;
    }
    else
    {
      $('#pwd-msg').fadeOut(600);
    }

    if((postData[0].value).length < 1)
    {
      $('#usr-msg').fadeIn(600);
      error = true;
    }
    else
    {
      $('#usr-msg').fadeOut(600); 
    }

    if(!error)
    {
      $.post(formURL, postData, function (data) 
      {
        var decode = JSON.parse(data);
        if(decode.response == true)
        {
          var storedEvent = JSON.parse(localStorage.getItem("event"));
          if(storedEvent)
          {
            var data = storedEvent[0];
            $.post('userAuth', data, function (data) 
            {
              var decode = JSON.parse(data);
              if(decode.response.listName)
              {
                $('#my-fav').html('<i class="fa fa-heart" aria-hidden="true"></i> Saved');
                $('body').animate({ scrollTop: 1000 });
                localStorage.clear();
              }
            });
          }
          $('#signin').html('Hi, '+decode.name +  '<br><u>Logout</u>');
          $("#signin").prop('id',"signout");
          $("#fade_layer").hide();
        }
        else
        {
          show_error(decode.response);
        }
      });
    }
    event.preventDefault();
  });
  
  $(window).keydown(function(event) // added to stop form reload 
  {
    if(event.keyCode == 13) 
    {
      event.preventDefault();
      return false;
    }
  });
});