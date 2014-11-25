var pg = require('pg').native; 

// Configuration.
var host = 'db-edlab.cs.umass.edu';
var port = 7391;

// The postgres client.
var client;

//set db user and password here once
var vernaldi = false;

if(vernaldi)
{
	var dbuser = 'vmetayer';
	var dbpassword = 'vmetayer';
}
else
{
	var dbuser = 'malmusta';
	var dbpassword = 'malmusta';
}


function isLoggedIn(req)
{
	if(req)
    {
		if(req.session.username)
        {
			return true;
		}
	}
	else
    {
		return false;
	}
}
//vernaldi
exports.db = function (user, pass, db)
{
	if (!db)
	{
        	db = user;
	}

	if (pass)
	{
		user = user + ':' + pass;
	}

	var obj = {};
	obj.conn = 'tcp://' + user + '@' + host + ':' + port + '/' + db;
	obj.login   = login; 
	obj.signup = signup;
	obj.recommended = recommended; //TO DO
	obj.find = find; //TO DO
	obj.modifyInterest = modifyInterest;
	obj.navigate = navigate;
	obj.getContacts = getContacts;
	obj.getLists = getLists;
	obj.addContact = addContact;
	obj.addList = addList;
	obj.likeList = likeList;
	obj.checkUsername = checkUsername;
	obj.checkContact = checkContact;
	obj.getinterests = getinterests;
	return obj;
}

function find(obj, cb)

{

    var that = this;

    pg.connect(that.conn, function (err, client) {

    var terms = obj.terms;

    console.log(terms);

    var sql = "SELECT DISTINCT * FROM LIST l WHERE l.list_type = '0' and (";

        for(var h=0; h<terms.length;h++){

        sql= sql+"lower(title) like lower('%"+terms[h]+"%') OR lower(description) like lower('%"+terms[h]+"%') ";

        if(h!=terms.length-1){

        sql= sql+"or ";

        }

        else{

        sql = sql+") and l.list_type=0";

        }

        

        }

        sql = sql+ "OR LID IN (select lid from link lk where (";

        for(var j=0;j<terms.length; j++){

        sql= sql+"lower(link_title) like lower('%"+terms[j]+"%') or lower(comment) like lower('%"+terms[j]+"%') ";

        if(j!=terms.length-1){

            sql= sql+"or ";

            }

        else{



        sql = sql+") and l.list_type=0";

        }

        

        }

        sql= sql+ "and lk.lid=l.lid) OR LID IN (select lid from list_tags lt where( ";

        for(var k=0; k<terms.length; k++){

        sql= sql+"lower(tag) like lower('%"+terms[k]+"%') and lt.lid=l.lid ";

        if(k!=terms.length-1){

            sql= sql+ "or ";

            }

        else{



        sql = sql+") and l.list_type=0";

        sql = sql+")"

        }

        }

        sql= sql+ ";";

        console.log(sql);

    client.query(sql, 

    function (err, result){

    if(err){

    

    console.log(err.toString());

    }

    else{

    

    console.log('found something');

    return cb(err, result);


    

    }

    });

        });

    

};


function getinterests(obj,cb)
{
var list = obj.list;
	
	var that = this;
	if (obj)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = 'SELECT interest FROM USER_INTERESTS WHERE username = $1;';
			client.query(sql, [obj.uname],
            function (err, result)
			{
				cb(err,result)
			});
		});
	}
	else throw "Invalid user object: " + JSON.stringify(obj);
}

function addList(obj, cb)
{
	var list = obj.list;
	
	var that = this;
	if (obj)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = 'INSERT INTO LIST(username, title, description, num_likes, list_type) VALUES($1, $2, $3, $4, $5)';
			client.query(sql, [obj.uname, list[0], list[1], obj.num_likes, list[2]],
            function (err, result)
			{
				var sql2 = "select lid, title from list where lid = (select max(lid) from list);"
				client.query(sql2, 
				function (err, result){
					
					
					var list_id = result.rows[0].lid;
					console.log(list_id);
					var links = obj.links;
					var tags = obj.tags;
					var linkCounter = 0;
					var tagCounter = 0;
					var bool = true;
					var bool2 = true;
					
					
					for(var i=0; i<links.length && bool; i++){
						client.query("INSERT INTO LINK(lid, url, link_title, comment) VALUES($1, $2, $3, $4)",[list_id, links[i][0], links[i][1], links[i][2]], 
								function (err, result){
							if(err){
								bool = false;
								console.log(err.toString());
							}
							else{
								linkCounter++;
								console.log('no error links');
								if(linkCounter===links.length){
									bool = false;
									
								}
							}
						});
						
					}
					
					for(var j=0; j<tags.length && bool2; j++){
						client.query("INSERT INTO LIST_TAGS(lid, tag) VALUES($1, $2)",[list_id, tags[j]], 
						function (err, result){
							if(err){
								bool2 = false;
								console.log(err.toString());
							}
							else{
								tagCounter++;
								console.log('no error tags');
								if(tagCounter===tags.length&&linkCounter===links.length){
									bool2 = false;
									return cb(err, obj);
								}
								
							}
						});
						}
					
					
					
                	});
				});
				
		});
	}
	else
	{
		throw "Invalid user object: " + JSON.stringify(obj);
	}
}

function recommended(obj, cb)
{
	console.log("in");
	var that = this;
	if (true)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = 'SELECT interest FROM USER_INTERESTS WHERE username= $1;';

			client.query(sql, [obj.uname],
            function (err, result)
			{
				console.log(result);
				if(result.rows.length>2)
					
				{var randomnumber1=Math.floor(Math.random()*result.rows.length);
				var randomnumber2=Math.floor(Math.random()*randomnumber1);
				var randomnumber3=randomnumber1+Math.floor(Math.random()*(result.rows.length-randomnumber1));
				
				var tag1=result.rows[randomnumber1].interest;
				var tag2=result.rows[randomnumber2].interest;
				var tag3=result.rows[randomnumber3].interest;
				}
				else if (result.rows.length>1)
				{
					var tag1=result.rows[0].interest;
					var tag2=result.rows[1].interest;
					var tag3=tag1;
				}
				
				else 
					{
						var tag1=result.rows[0].interest;
						var tag2= tag1;
						var tag3 =tag2;
					}
				
				var sql2 = "select * from list where list_type = 0  AND lid IN (SELECT lid FROM LIST_TAGS WHERE tag= $1 OR tag =$2 OR tag=$3) ORDER BY num_likes DESC LIMIT 15;";
				client.query(sql2, [tag1,tag2,tag3],
				function (err, result)
				{					
							if(err)
							{
								console.log(err.toString());
							}
							else
							{
								console.log(result.rows);
								cb(err, result)
							}
				});
										
			});
					
		});
	}
	else
	{
		throw "Invalid user object: " + JSON.stringify(obj);
	}
}

function getLists(obj, cb)
{
	
	 var that = this;
	  if(obj.uname != null)
	  {
		  if(obj.type===0)
			{ //get own lists
		  pg.connect(that.conn, function (err, client) {
	        if (err) {
	            throw err;
	        }
	        var sql = 'select *	from list where username = $1 ORDER BY num_likes DESC;';
			client.query(sql, [obj.uname],
                    function (err, result) {
	                         cb(err, result)
	                     });
	    });
	  }
		  else
		  { //get contacts list
			  pg.connect(that.conn, function (err, client)
			{
		        if (err)
		        {
		            throw err;
		        }
		        var sql = 'select *	from list where username = $1 AND (list_type =0 OR list_type=1) ORDER BY num_likes DESC;';
				client.query(sql, [obj.uname],
	                    function (err, result) {
		                         cb(err, result)
		                     });
		    });
			  
		  }
	  }
	  else
	  {
		  throw "Invalid user object: " + JSON.stringify(obj);
	  }
}

function getContacts(obj, cb)
{
	var that = this;
	  if(obj.uname != null){
	  pg.connect(that.conn, function (err, client) {
	        if (err) {
	            throw err;
	        }
	        var sql = 'SELECT contact_user FROM user_contact WHERE username = $1;';
			client.query(sql, [obj.uname],
                  function (err, result) {
	                         cb(err, result)
	                     });
	    });
	  }
	  else{
		  throw "Invalid user object: " + JSON.stringify(obj);
	  }
}

function addContact(obj, cb)
{
	var that = this;
	if (obj.uname && obj.contact)
	{
//check if username exists
		pg.connect(that.conn, function (err, client)
		{
			var sql = 'INSERT INTO USER_CONTACT(username, contact_user) VALUES($1, $2);';
			client.query(sql, [obj.uname, obj.contact],
                     function (err, result)
			{			
				cb(err, result)
                     });
		});
	}
	else
	{
		throw "Invalid user object: " + JSON.stringify(obj);
	}
};

function login(obj, cb)
{
	var that = this;
	if(obj.uname != null && obj.pass != null)
	{
	  pg.connect(that.conn, function (err, client) {
	        if (err) {
	            throw err;
	        }
	        var sql = 'select * from users where username = $1;';
			client.query(sql, [obj.uname],
                     function (err, result) {
	                         cb(err, result)
	                     });
	    });
	  }
	  else{
		  throw "Invalid user object: " + JSON.stringify(obj);
	  }
}

function checkUsername(username, cb)
{
	var that = this;
	if (username)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = "SELECT username FROM USERS WHERE username = '"+username+"'";
			console.log(sql);
			client.query(sql,
                     function (err, result)
			{
				console.log(result);
				cb(err, result)
                     });
		});
	}
	else
	{
		throw "Invalid username: " + username;
	}
}

function modifyInterest(obj, cb)
{
	var interests = obj.interests;
    var that = this;
    if (obj) {
        pg.connect(that.conn, function (err, client) {
            if (err) {
                throw err;
            }

            if (obj.op === 0) 
            {
            	var interest_counter = 0;
            	var bool = true;
            	for(var i=0; i<interests.length && bool; i++)
            	{
					client.query("INSERT INTO USER_INTERESTS(username, interest) VALUES($1, $2)",[obj.uname, interests[i]], 
							function (err, result){
						if(err)
						{
							bool = false;
							console.log(err.toString());
						}
						else
						{
							interest_counter++;
							console.log('no error in interests');
							if(interests.length===interest_counter)
							{
								bool = false;
								cb(err,result);
							}
						}
					});
					
				}           	
            }
            else {
                var sql = 'DELETE FROM FROM USER_INTERESTS WHERE INTEREST = $1;';
                client.query(sql, [obj.interests],
                     	function (err, result)
                     	{
                     	    cb(err, result)
                     	});
            }
        });
    }
    else
	{
		throw "Invalid interest: " + obj;
	}
}
function checkContact(obj, cb)
{
	var that = this;
	if (obj.username && obj.contact)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = "SELECT * FROM USER_CONTACT WHERE username = '" +username+ "' AND contact_user = '" +contact+ "'";
			client.query(sql,
                     function (err, result)
                     {
				console.log(result);
				cb(err, result)
                     });
		});
	}
	else
	{
		throw "Invalid username: " + obj.username;
	}
}

function likeList(list_id, cb)
{
	var that = this;
	if (list_id)
	{
		pg.connect(that.conn, function (err, client)
		{
			
				var sql = "UPDATE LIST SET num_likes = num_likes +1  WHERE lid = "+parseInt(list_id, 10);
				client.query(sql,
                     	function (err, result)
                     	{
								var sql = "SELECT num_likes FROM LIST WHERE lid = "+parseInt(list_id, 10);
									client.query(sql,
	                     	function (err, result)
	                     	{						
								cb(err, result)
	                     	});
					
						
                     	});
			
		});
	}
	else
	{
		throw "Invalid list ID: " + list_id;
	}

}


function signup(obj, cb)
{
	var that = this;
	if (obj.uname && obj.fname && obj.lname && obj.email && obj.pass)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = 'INSERT INTO USERS(username, f_name, l_name, email, password) VALUES($1, $2, $3, $4, $5);';
			client.query(sql, [obj.uname, obj.fname, obj.lname, obj.email, obj.pass],
                     function (err, result)
			{
				cb(err, obj)
                     });
		});
	}
	else
	{
		throw "Invalid user object: " + JSON.stringify(obj);
	}
};


function navigate(obj, cb)
{
	var that = this;
	if (obj.lid)
	{
		pg.connect(that.conn, function (err, client)
		{
			var sql = "SELECT * FROM LIST WHERE lid = " + obj.lid;
			client.query(sql,
                     function (err, result)
			{
				if(result.rows.length>0)
				{
					//VALID LIST. CHECK ON TYPE NOW
					
					if(result.rows[0].list_type===0)
					{
						//PUBLIC
						client.query("select * from link l, list li where l.lid = "+obj.lid + " and l.lid=li.lid",
                     					function (err, result)
								{
									cb(err, result, 0);
								});
    					}
					else if (obj.username!=="")
					{
						//Contacts-only
						if(result.rows[0].list_type===1)
						{
							var db= this;
							db.checkContact( {	username: obj.username, contact: result.rows[0].username},
										function (err, result)
										{
											if(err)
										{
											console.log(err.toString());
										}
										else
										{
					  						if(result.rows.length>0)
											{
												client.query("select * from link l, list li where l.lid = "+obj.lid + " and l.lid=li.lid",
                     											function (err, result)
															{
															cb(err, result, 1);
															});
											}
											else
											{
												
												cb(err,result,2);
											}			  
										}
										});
						
						}
						
						else
						{
							//Private
							if(result.rows[0].username===obj.username)
							{
								client.query("SELECT * FROM ",
                     					function (err, result)
								{
									cb(err, result,3);
								});
							}
							else
							{
								cb(err,result,4);
							}

						}


  					}
					
						
				}
				else
				{
					cb("","",4);
				}
                     });
		});
	}
	
	else
	{
		throw "Invalid username: " + obj.username;
	}

};

exports.process_navigate = function (req, res)
{	
	var data = req.query;

	if (data)
	{
		var list_id = data.list_id
	}

	if (req.session.username)
	{
		var u_name = req.session.username;
		var db = exports.db(dbuser,dbpassword);
		db.navigate({	lid: list_id,
				username: u_name},
				function (err, obj, code)
				{					
					if(err)
					{
						console.log(err.toString());
					}
					else
					{
					  	res.send({'result':obj.rows});			  
					}
				});
	}
	
	else
	{
		var db = exports.db(dbuser,dbpassword);
		db.navigate({	lid: list_id,
				username: ''},
				function (err, obj)
				{
					if(err)
					{
						console.log(err.toString());
					}
					else
					{
						res.send({'result':obj.rows});				  
					}
				});
	}
	
	
};

exports.process_interests = function (req, res)
{
	var data = req.body;

	if(isLoggedIn(req))
		{
			var username= req.session.username;
			var interests = data.interests;
		}
	else 
	{
		var username = data.username;
		var interests = data.interests;
	}

	var db = exports.db(dbuser,dbpassword);
	db.modifyInterest(	{uname: username, interests: interests, op: 0},
				function (err, result)
				{				
					if (err)
								{
									console.log(err.toString());
									console.log('Could not process interests!');
								}
								else
								{
									console.log('Processed interests for ' + username);
									res.send({'code': 0});							
								}
                        
				
      					                   
                     	});				
};

exports.process_like = function (req, res)
{
	var data = req.body;
	var u_name = req.session.username;

	if (data)
	{
		var list_id =	data.list_id;
	}

	var db = exports.db(dbuser,dbpassword);
	db.checkUsername(	u_name,
				function (err, result)
				{
				if (result.rows.length>0)
				{
					db.likeList(	list_id,
							function (err, result)
							{

								if (err)
								{
									console.log(err.toString());
									console.log('Could not process like!');
								}
								else
								{
									console.log('Liked list ' + list_id);
									res.send({'likes': result.rows[0]});
									
								}
                         
                     				});
				}
      					                   
                     	});			

	
};

exports.process_login = function (req, res) 
{
    var data = req.query;

    if (data)
     {
        var uname = data.username;
        var pass = data.password;
    }
    console.log('in exports login');
    //connect to database then check if uname exists and password matches
    var db = exports.db(dbuser, dbpassword);
    db.checkUsername(uname,
				function (err, result) {
				    if (result.rows.length > 0) {
				        db.login({ uname: uname,
				            pass: pass
				        },
			  	        function (err, obj) {
			  	            if (err) {
			  	                console.log(err.toString());
			  	            }
			  	            else {
			  	                var rows = obj.rows[0];
			  	                if (rows.password == pass) {
			  	                    //username and password correct
			  	                    //get what we need
			  	                    req.session.username = rows.username;
			  	                    req.session.name = rows.f_name+" "+rows.l_name;
			  	                    console.log('found user: ' + rows.username + ' with correct pass ' + req.session.username);
			  	                    res.render('main', { username: req.session.name});

			  	                }
			  	                else {
			  	                    res.render('login', { msg: 'Incorrect username and/or password' });
			  	                    console.log('found user: ' + rows.username + ' with incorrect pass');

			  	                }

			  	            }
			  	        });
			  	    }
                    else
                        res.render('login', { msg: 'Incorrect username and/or password' });
				});
};

exports.new_list = function (req, res)
{
	var data = req.body;

	if (data)
	{

		var u_name = req.session.username;
		var list = data.list;
		var tags = data.tags;
		var l_num_likes = 0 ;
		var l_links = data.links;
	}
	

	var db = exports.db(dbuser,dbpassword);
	db.addList({uname: u_name,
			list: list,
			num_likes: l_num_likes,
			links: l_links,
			tags: tags},
                     function (err, obj)
			{
				if (err)
				{
					console.log(err.toString());
					console.log('Could not add list!');
				}
				else
				{
					console.log('Added list ' + obj.list[0]);
					res.send({'success': obj.list[0]})
				}
                         
                     });
	
	
};

exports.get_lists = function (req, res)
{
	var data = req.query;
	
	if(data.type==0)
		{
			var username = req.session.username;
		}
	else var username = data.username;
	console.log('in get Lists');
	//connect to database then check if uname exists and password matches
	var db = exports.db(dbuser,dbpassword);
	db.getLists({uname: username, type: data.type},
			  	function (err, obj)
			  	{
				  if(err)
				  {
					  console.log(err.toString());
				  }
				  else
				  {
					  var rows = obj.rows;
					  res.send({ 'lists' : rows});
					  
				  }
			  });
	
};

exports.add_contact = function (req, res)
{
	var data = req.body;
	var username = req.session.username;
	
	if (data)
	{
		var contact = data.user;
	}
	console.log('in exports add contact');
	//connect to database then check if uname exists and password matches
	var db = exports.db(dbuser,dbpassword);
	db.checkUsername(contact,
			function (err, result)
			{
				if (result.rows.length>0)
				{ 
					db.addContact({uname: username,
					  contact: contact},
					  	function (err, result)
					  	{
						  if(err)
						  {
							  console.log(err.toString());
							  console.log("couldn't add contact: "+contact+" to " +username);
							  res.send({'code' : 1});
						  }
						  else
						  {
							  res.send({'code' : 0});
							  console.log('user: '+contact+' is now  '+ username +'"s contact ');
								  							  
						  }
					  }); 
				}
				
				else res.send({'code' : 2});
			});
	
};

exports.get_contacts = function (req, res)
{
	var username = req.session.username;
	
	console.log('in exports get contacts');
	//connect to database then check if uname exists and password matches
	var db = exports.db(dbuser,dbpassword);
					
	db.getContacts({uname: username},
	  	function (err, obj)
	  	{
		  if(err){
			  console.log(err.toString());
			  console.log("couldn't get"+uname+"'s contact(s)");
		  }
		  else{
			  var rows = obj.rows;
			  res.send({'contacts' : rows});
			  console.log('I got the contacts');			  							  
		  }
	  }); 
					
};

exports.get_recommended = function (req, res)
{
	var username = req.session.username;
	var db = exports.db(dbuser,dbpassword);
	db.recommended({uname: username},
	  	function (err, obj)
	  	{
		  if(err)
		  {
			  console.log(err.toString());
		  }
		  else
		  {
			  if(typeof obj.rows[0]!=="undefined")
			  {var randomnumber=Math.floor(Math.random()*obj.rows.length);
			  db.navigate({lid: obj.rows[randomnumber].lid},
					  function (err,result)
					  {
				  
				  			if(err)
				  			{
				  					console.log(err.toString());
				  			}
				  			else
				  			{	
				  				var randomnumber2=Math.floor(Math.random()*result.rows.length);
				  				res.send({'lists': obj.rows, 'url': result.rows[randomnumber2].url});
				  			}
				  			});
			  }
			  else res.send({'lists': obj.rows, 'url': "http://elnux1.cs.umass.edu:9321/nolists"});
		  }
	  }); 
};

exports.process_signup = function (req, res)
{
	var data = req.body;
	console.log(data);

	if (data)
	{
		var f_name = data.fname;
		var l_name = data.lname;
		var u_name = data.uname;
		var e_mail = data.email;
		var p_ass = data.pass;	
	}

	var db = exports.db(dbuser,dbpassword);
	db.checkUsername(	u_name,
				function (err, result)
				{
				if (result.rows.length>0)
				{
					res.send({'code': 0 });
				}
				else
				{
					
					db.signup({	uname: u_name,
							fname: f_name,
							lname: l_name,
							email: e_mail,
							pass: p_ass},
                     				function (err, obj)
							{
								if (err)
								{
									console.log(err.toString());
									console.log('Could not add User!');
								}
								else
								{
									console.log('Added User ' + obj.uname);
									res.send({'code': 1});
								}
                         
                     				});
				}
      	});				                   		
};

exports.process_get_interests = function (req,res)
{
	var username = req.session.username;
	var db = exports.db(dbuser,dbpassword);
	db.getinterests({uname: username},
			function (err,result)
			{
				if(err)
					console.log(err.toString());
				else
					{
						res.send({'interests': result.rows});
					}
					
			});
};

exports.find = function (req, res)

{
    var data = req.query;
var username = req.session.username;

if (data)
	{
		var search= data.terms;
	}

var terms = search.split(' ');

console.log(terms);

console.log(username);

var db = exports.db(dbuser,dbpassword);

console.log(db);

db.find({terms: terms},

  function (err, result)

  {

  if(err)

  {

  console.log(err.toString());

  }

  else

  {

	  	res.send({'lists':result.rows});	  	  

  }

  }); 

};


exports.process_logout = function(req, res)
{
	req.session.destroy();
	res.render('login', {msg: ''});
};


exports.nolists = function(req, res)
{
	res.render('nolists');
};

exports.login = function(req, res)
{
	if(isLoggedIn(req))
    {
		res.render('main', {username: req.session.name});
	}
	else
    {
		res.render('login', {msg: ''});
	}
};

exports.main = function(req, res)
{
	if(isLoggedIn(req))
    {
		res.render('main', {username: req.session.name});
		console.log(req.session.username+' is logged in!');
	}
	
	else
    {
		console.log('No log in session');
		return res.render('login', {msg: 'Please log in.' });
	}
	
};