CREATE TABLE USERS (
username varchar(20),
f_name varchar(50),
l_name varchar(50),
email varchar(100),
image bytea,
primary key (username));

CREATE TABLE USER_INTERESTS (
username varchar(20) references USERS(username),
interest varchar(50),
primary key(username,interest));

CREATE TABLE USER_CONTACT (
username varchar(20) references USERS(username),
contact_user varchar(20) references USERS(username),
primary key (username,contact_user));

CREATE TABLE LIST_TYPE (
list_type_id int2,
type_desc varchar(15),
primary key (list_type_id));

INSERT INTO LIST_TYPE VALUES (0, 'Public');
INSERT INTO LIST_TYPE VALUES (1, 'Contacts Only');
INSERT INTO LIST_TYPE VALUES (2, 'Private');

CREATE SEQUENCE list_lid_seq;

CREATE TABLE LIST (
lid int not null default nextval('list_lid_seq'),
username varchar(20) references USERS(username),
title varchar(50),
description varchar(256),
num_likes int,
list_type int2 references LIST_TYPE(list_type_id),
primary key (lid));

CREATE SEQUENCE link_linkid_seq;

CREATE TABLE LINK (
link_id int not null default nextval('link_linkid_seq'),
url text,
link_title varchar(50),
comment text,
primary key(link_id));

CREATE TABLE LIST_LINKS (
lid int references LIST(lid),
link_id int references LINK(link_id)
primary key(lid, link_id));


