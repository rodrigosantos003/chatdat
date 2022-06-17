-- CHATDAT - CREATE
-- AUTORES: João Fernandes & Rodrigo Santos
-- ÚLTIMA MODIFICAÇÃO: 2022-06-15

-- CRIAÇÃO DA BASE DE DADOS
drop database if exists chatdat;
create database if not exists chatdat;
use chatdat;

-- CRIAÇÃO DE TABELAS
-- User
create table user (id int not null auto_increment,
					username varchar(255) not null unique,
                    password varchar(255) not null,
                    color varchar(10) not null,
                    constraint pk_user_id primary key (id));

-- Room
create table room (id int not null auto_increment,
					name varchar(255) not null unique,
                    private boolean not null,
                    password varchar(255),
                    constraint pk_room_id primary key (id));

-- Message
create table message (id int not null auto_increment,
						author varchar(255) not null,
                        author_color varchar(10) not null,
                        content text not null,
                        date datetime not null,
                        image text,
                        room_id int not null,
                        private boolean not null,
                        target varchar(100),
                        constraint pk_message_id primary key (id));

-- Room Member
create table room_member (id int not null auto_increment,
							room_id int not null,
                            user_id int not null,
                            constraint pk_room_members_id primary key (id));

-- Session
create table session (id int not null auto_increment,
                        expires int not null,
                        data text,
                        constraint pk_session_id primary key (id));

-- DEFINIÇÃO DE FOREING KEYS
alter table room_member add constraint fk_room_member_room
foreign key (room_id) references room (id);

alter table room_member add constraint fk_room_member_user
foreign key (user_id) references user (id);