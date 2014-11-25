var interests= new Array();
var username;
var password;

var process_login = function ()
{
    $("#login").submit(function () 
    {

        if ($("#username").val() != "" && $("#password").val() != "") 
        {
            return true;
        }

        $("#message").html("Username and password are required").show().fadeOut(1000);

        return false;

    });
	
}

var process_interest = function ()
{
	var interest = $("#interest").val();
	if(interest==="")
		$('#note').html('Cannot add blank interest!');
	else  
	{
		if(interests.length===0)
			$("#popup").append("<button type='button' onclick='complete_signup()'>Done</button>");
		interests[interests.length]=interest;
		$('#interest').attr('value', '');
		$("#added").append(interest+", ");		
	}	
}

var complete_signup = function ()
{
	var req = $.ajax({
			type: 'POST',
			url : '/addinterest',
			data: { 'username': username, 'interests' : interests}});

	req.done(function (data)
	{
		if(data.code==0)
			{
				$('#username').attr('value', username);
				$('#password').attr('value', password);
				document.loginForm.submit();
			}
		else 
			$('#note').html('Please try again!');
	});	
}

var process_signup = function ()
{
	var first_name = $("#first_name").val();
	var last_name = $("#last_name").val();
	var user_name = $("#user_name").val();
	var reg_email = $("#reg_email").val();
	var reg_email2 = $("#reg_email2").val();
	var reg_password = $("#reg_password").val();

	if(first_name==="")
		$('#message').html('All fields are required to signup!');
	else if(last_name==="")
		$('#message').html('All fields are required to signup!');
	else if(user_name==="")
		$('#message').html('All fields are required to signup!');
	else if(reg_email==="")
		$('#message').html('All fields are required to signup!');
	else if(reg_email2==="")
		$('#message').html('All fields are required to signup!');
	else if(reg_password==="")
		$('#message').html('All fields are required to signup!');
	else if(reg_email!==reg_email2)
		$('#message').html('Emails do not match!');
	else
	{	
		var req = $.ajax({
			type: 'POST',
			url : '/signup',
			data: { 'fname' : first_name, 'lname' : last_name, 'uname' : user_name, 'email' : reg_email, 'pass' : reg_password}});
		
		req.done(function (data)
		{
			if(data.code===0)
			{
				$('#message').html('Username already exists');
				$('#user_name').attr('value', '');
			}
			
			else
			{	
				username = user_name;
				password = reg_password;
				var back = document.getElementById('background');
				var obj = document.getElementById('popup');
				back.style.display = 'block';
				obj.style.display = 'block';			
			}
		});
	}	
}




















