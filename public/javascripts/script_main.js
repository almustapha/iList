var links = new Array();
var tags = new Array();
var interests= new Array();
var state = true;

$(document).ready(function()
{
	if (state)
		{
		  get_recommended();
		  state =false;
		}
	
	$(document).bind('keydown', function(e)
	{ 
        if (e.which == 27)
        {
            remove_newcontact();
            remove_newlist();
        }
        
        if (e.which == 13)
        {
            find();
        }
    }); 
	
	$(".link_class").live('click', function(event)
	{
		$("#page_object").html("<param NAME='wmode' VALUE='opaque'><embed src='"+event.target.id+"' frameborder='0'><param NAME='wmode' VALUE='opaque'></embed>");
	});
	
	$(".list_class").live('click', function(event)
	{
		
		var req = $.ajax({
			type: 'GET',
			url : '/navigate',
			data: {'list_id':event.target.id}
				});
		
		req.done (function(data)
				{
					var content = "<h4>"+data.result[0].title+"</h4><button type= 'submit' id='"+data.result[0].lid+"' onclick='like(this.id)'><img src='/images/like.png' width='26' height='21' alt='submit'/><a id='num_likes'>  "+data.result[0].num_likes+"</a></button><p>"+data.result[0].description+"<ul class='list'>";
					for(var i=0; i<data.result.length; i++)
						{
							content=content+"<li><a href='#' id='"+data.result[i].url+"' class='link_class'>"+data.result[i].link_title+"</a><br><a class='link' target='_newtab' href='"+data.result[i].url+"'>Open in new tab</a><p>"+data.result[i].comment+"</p></li>";
						}
					content = content+ "</ul>";
					$('#side_bar').html(content);
				});
		
	});
	
	$(".contact_class").live('click', function(event)
			{
			var req = $.ajax({
			type: 'GET',
			url : '/getlists',
			data: {'username': event.target.id, 'type': 1}});
		
		req.done (function(data)
				{
					var content = "<h4>"+event.target.id+ "'s lists:</h4><ul class='list'>";
					for(var i=0; i<data.lists.length; i++)
						{
							content=content+"<li><a href='#' id='"+data.lists[i].lid+"' class='list_class'>"+data.lists[i].title+"</a><p>"+data.lists[i].description+"</p></li>";
						}
					content = content+ "</ul>";
					$('#side_bar').html(content);
				});
				
			});
	
});

function clear_textbox(thisfield, initial_text)
{
    if (thisfield.value === initial_text)
    {
        thisfield.value = "";
    }
}

function undo_click(thisfield, initial_text)
{
    if (thisfield.value === "")
    {
        thisfield.value = initial_text;
    }
}


function find()
{
	var terms = $("#search").val();
	if(terms==="Search")
		{
			var msg= 	$('#search');
			msg.attr('value', 'Type something here first!');
			setTimeout(function ()
					{
						msg.attr('value', 'Search');
					}, 1000);
			
		}
	else  
	{
		
		var req = $.ajax({
			type: 'GET',
			url : '/find',
			data: {'terms': terms}});
		
		req.done (function(data)
				{
			var content = "<h4>Search Results:</h4><ul class='list'>";
			for(var i=0; i<data.lists.length; i++)
				{
					content=content+"<li><a href='#' id='"+data.lists[i].lid+"' class='list_class'>"+data.lists[i].title+"</a><p>"+data.lists[i].description+"</p></li>";
				}
		
			content = content+ "</ul>";
			$('#side_bar').html(content);
			});
			
	}	
}
var process_tags = function ()
{
	var tag = $("#tag").val();
	if(tag==="")
		$('#note').html('Cannot add blank tag!');
	else  
	{
		tags[tags.length]=tag;
		$('#tag').attr('value', '');
		$("#added").append(tag+", ");		
	}	
}

function add_link()
{
	var title = $("#l_title").val();
	var comment = $("#comment").val();
	var url = $("#url").val();
	if(title==="")
		$('#note').html('Title of the link cannot be blank!');
	else if(comment==="")
		$('#note').html('Comment of the link cannot be blank!');
	else if(url==="")
		$('#note').html('URL of the link cannot be blank!');
	else  
	{
		var notify = $('#note');
		notify.html('Link ' + (links.length+1) + '" added');
		notify.fadeOut(function () {
			notify.empty();
			notify.show();
		});
		
		
		if(links.length===0)
			$("#popup").append("<button type='button' onclick='add_list()'>Create List</button>");
		links[links.length]=[url,title,comment];
		$('#l_title').attr('value', '');
		$('#comment').attr('value', '');
		$('#url').attr('value', '');
		$("#link_num").html("Link "+(links.length+1));
	}
}

function show_lists()
{
	var req = $.ajax({
		type: 'GET',
		url : '/getlists',
		data: {'type': 0}
		});
	
	req.done (function(data)
			{
				var content = "<h4>My lists:</h4><ul class='list'>";
				for(var i=0; i<data.lists.length; i++)
					{
						content=content+"<li><a href='#' id='"+data.lists[i].lid+"' class='list_class'>"+data.lists[i].title+"</a><p>"+data.lists[i].description+"</p></li>";
					}
				content = content+ "</ul>";
				$('#side_bar').html(content);
			});
}

function get_interests()
{
	var req = $.ajax({
		type: 'GET',
		url : '/interests'});
	
	req.done (function(data)
			{
				var content = "<h4>My interests:</h4><ul class='list'>";
				for(var i=0; i<data.interests.length; i++)
					{
						content=content+"<li><a href='#' id='"+data.interests[i].interest+"' class='interest_class'>"+data.interests[i].interest+"</a></li>";
					}
				content = content+ "</ul><h4>Add new interests:</h4><p id='added2'></p>Interest: <input type='text' maxlength='50' id='interest'/><p id='note3'></p><button type='button' onclick='process_interest()'>Add</button>";
				$('#side_bar').html(content);
			});
}


var process_interest = function ()
{
	var interest = $("#interest").val();
	if(interest==="")
		$('#note3').html('Cannot add blank interest!');
	else  
	{
		if(interests.length===0)
			$("#side_bar").append("<button type='button' onclick='add_interest()'>Done</button>");
		interests[interests.length]=interest;
		$('#interest').attr('value', '');
		$("#added2").append(interest+", ");		
	}	
}

var add_interest = function ()
{
	var req = $.ajax({
			type: 'POST',
			url : '/addinterest',
			data: { 'interests' : interests}});

	req.done(function (data)
	{
		get_interests();
		interests = new Array();
	});	
}

function get_recommended()
{
	var req = $.ajax({
		type: 'GET',
		url : '/recommended'});
	
	req.done (function(data)
			{
				var content = "<h4>Recommeded for you:</h4><ul class='list'>";
				for(var i=0; i<data.lists.length; i++)
					{
						content=content+"<li><a href='#' id='"+data.lists[i].lid+"' class='list_class'>"+data.lists[i].title+"</a><p>"+data.lists[i].description+"</p></li>";
					}
				content = content+ "</ul>";
				$('#side_bar').html(content);
				
				$("#page_object").html("<param NAME='wmode' VALUE='opaque'><embed src='"+data.url+"' frameborder='0'><param NAME='wmode' VALUE='opaque'></embed>");
			});
}

function get_contacts()
{
	var req = $.ajax({
			type: 'GET',
			url : '/getcontacts'});
		
	req.done (function(data)
				{
					var content = "<h4>My Contacts:</h4><ul class='list'>";
					for(var i=0; i<data.contacts.length; i++)
						{
							content=content+"<li><a href='#' id='"+data.contacts[i].contact_user+"' class='contact_class'>"+data.contacts[i].contact_user+"</a></li>";
						}
					content = content+ "</ul>";
					$('#side_bar').html(content);
				});
}

function add_contact()
{
	var user = $("#contact_username").val();
	if(user!=="")
	{
		var req = $.ajax({
		type: 'POST',
		url : '/addcontact',
		data: {'user':user}});
		
		req.done (function(data)
				{
					if (data.code===0)
						{
							remove_newcontact();
							get_contacts();
						}
					else if (data.code===1)
						$("#note2").html("This user is already a contact.");
					else $("#note2").html("Something went wrong. Does this username exist?");
						
				});
		
	}
	else $("#note2").html("Please enter a username first.");
}


function like(lid)
{
	var req = $.ajax({
		type: 'POST',
		url : '/like',
		data: {'list_id': lid}});
		
		req.done (function(data)
				{
						$("#num_likes").html(" "+data.likes.num_likes);
				});
		
}

function new_contact()
{
	var back = document.getElementById('background');
	var obj = document.getElementById('popup2');
	back.style.display = 'block';
	obj.style.display = 'block';
	$("#page_object").html("");
}

function new_list()
{
	var back = document.getElementById('background');
	var obj = document.getElementById('popup');
	back.style.display = 'block';
	obj.style.display = 'block';
	$("#page_object").html("");
}

function remove_newcontact()
{
	var back = document.getElementById('background');
	var obj = document.getElementById('popup2');
	back.style.display = 'none';
	obj.style.display = 'none';
	$('#contact_username').attr('value', '');
	$("#note2").html("");
	get_recommended();
	
}

function remove_newlist()
{
	var back = document.getElementById('background');
	var obj = document.getElementById('popup');
	back.style.display = 'none';
	obj.style.display = 'none';
	var links = new Array();
	var tags = new Array();
	$('#l_title').attr('value', '');
	$('#comment').attr('value', '');
	$('#url').attr('value', '');
	$("#added").html("");
	$("#note").html("");
	$("#title").attr('value', '');
	$("#desc").attr('value', '');
	get_recommended();
}

function add_list()
{
	var title = $("#title").val();
	var desc = $("#desc").val();
	var list_type;
	var type = document.getElementById("type");
	var val = type.options[type.selectedIndex].text;
	
	switch(val)
	{
		case "Public":
			list_type = 0;
			break;
		case "Contacts-Only":
			list_type = 1;
			break;
		case "Private":
			list_type= 2;
			break;
		
	}	
	
	if (title==="")
		$('#note').html('Title of the list cannot be blank!');
	else if (desc==="")
		$('#note').html('Description of the list cannot be blank!');
	else if (tags.length===0)
		$('#note').html('The list must have at least one tag.');
	else 
	{		var list = [title,desc,list_type]
			var req = $.ajax({
			type: 'POST',
			url : '/newlist',
			data: { 'list' : list, 'tags' : tags, 'links' : links}});
			remove_newlist();
	}
}
