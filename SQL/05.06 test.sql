drop table book ,course,enollment,instructor,member,rental,student;

create table member(
	member_id int primary key,
	name varchar(50),
	email varchar(100) unique,
	age int
);

alter table member
drop column age;

alter table member
add column phone varchar(20);

create database if not exists academy_db
character set utf8mb4
COLLATE utf8mb4_unicode_ci;

create table product(
	product_id int primary key,
	name varchar(50),
	price int,
	stock int 
);

insert into product (product_id,name,price,stock)
values
(1,'키보드',30000,50),
(2,'akdntm',15000,30);

select *
from product;

select *
from product
where price >= 10000;

update product
set stock = stock +10
where product_id = 1;

delete from product
where product_id=2;

CREATE TABLE product(
    product_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE(),
    CONSTRAINT chk_price CHECK(price > 0),
    CONSTRAINT chk_stock CHECK(stock >= 0)
);

create table product(
	product_id int primary key,
	name varchar(50),
	price int,
	category varchar(50)
);

insert into product(product_id,name,price,category)
values 
(1,'아이폰 프로',1200000,'전자기기'),
(2,'갤럭시폰',900000,'전자기기'),
(3,'냉장고',500000,'가전'),
(4,'노트북 프로',1500000,'컴퓨터');

select *
from product
where name like '%폰%';

select *
from product 
where price between 100000 and 500000;

select * 
from product
where category in('전자기기','가전','컴퓨터');

select *
from product
where name like '%폰%'
and price between 100000 and 500000
and category in('전자기기','가전','컴퓨터');

create table user(
user_id int primary key,
name varchar(50)
);

create table post(
post_id INT PRIMARY key,
title VARCHAR(100),
user_id INT,
foreign key (user_id) references user(user_id)
);


