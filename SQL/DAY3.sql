-- FILM테이블에서 길이가 60분 이상 90분 이하인 영화를 조회해라
select title,length from film
where length between 60 and 90;

select title,length,rating
from film
where rating in ('g','pg','pg-13');

select * 
from actor
where first_name like 'A%';

select title
from film 
where title like '%Love%';

select *
from actor
where last_name like 'A__';

select *
from actor
where first_name like '_A%';

select first_name
from actor 
where first_name like '____';

select title
from film 
where title not like 'A%';

select customer_id 
from customer
where email like '%.org';

select title
from film 
where title not like '%dinosaur%';

create table FRUIT(
	ID INT primary key,
	NAME VARCHAR(30),
	PRICE INT
);

insert into FRUIT (ID, NAME, PRICE)
values
(1,'사과',3000),
(2,'바나나',2000),
(3,'포도',5000);

select * from FRUIT;

-- 한 건 추가
insert  into FRUIT (ID,NAME,PRICE)
VALUES(4,'복숭아',6000);

create table FRUIT_BACKUP(
	ID INT primary key,
	NAME VARCHAR(30),
	PRICE INT
);

insert into FRUIT_BACKUP(ID,NAME,PRICE)
select ID, NAME,PRICE
from fruit 
where PRICE <= 3000;

select *
from fruit_backup ;

-- 일부 컬럼만 추가하기 
-- 컬럼이 NOT NULL이면 무조건 써야 함 
insert into FRUIT(ID)
values (5);

select *
from fruit f ;

-- 컬럼명을 생략하는  INSERT 
insert into FRUIT VALUES(6,'딸기',3900);

-- NULL 값을 직접 넣을 수 있다. 
insert into fruit  VALUES(7,'키위',7000);

-- DEFAULT값 사용하기 

-- 문자열 데이터를 넣을 때 작은 따옴표를 사용한다. 

create table FLOWER(
	NAME VARCHAR(30),
	COLOR VARCHAR(30),
	PRICE INT
);

insert into flower (NAME,COLOR ,PRICE)
values
('장미','빨강',3000),
('해바라기','노랑',6000),
('튤립','보라',5000),
('안개꽃','흰색',2000);

update flower
set NAME = '코스모스'
where NAME = '장미'; -- 조건을 걸지 않으면 테이블내의 모든 속성이 수정될 수 있다. 

-- 여러 조건으로 UPDATE하기 
-- AND를 사용하여 조건을 모두 만족하는 행만 수정하기 
-- 꽃 테이블에서 색깔이 보라색이고 가격이 오천원 이상인 꽃의 이름을 진달래로 바꾸기
update FLOWER
set NAME = '진달래 '
where COLOR = '보라색' AND PRICE >= 5000;

select * 
from FLOWER;

create table ACTOR_PRACTICE as
select ACTOR_ID, FIRST_NAME, LAST_NAME, LAST_UPDATE
from SAKILA.ACTOR;

select * from ACTOR_PRACTICE;

update ACTOR_PRACTICE
set FIRST_NAME = 'JAMES'
where ACTOR_ID = 1;

update ACTOR_PRACTICE
set FIRST_NAME = 'MINA',
    LAST_NAME = 'LEE'
where ACTOR_ID = 2;

select * from ACTOR_PRACTICE;

update FILM
set RENTAL_RATE = 4.99
where film_id = 1;

update actor
set first_name = 'TEST'
where first_name like 'A%';

select * 
from actor;

-- 영화 번화가 1인 영화에 대해 대여기간을 1증가 시키기 
select TITEL,TENTAL_DURATION 
from FILM
where film_id = 1;

update film f 
set RENTAL_DURATION = f.rental_duration +1
where f.film_id =1;

select rental_duration 
from FILM;

update FILM
set RENTAL_RATE = rental_rate * 1.1 
where RENTAL_RATE;

select *
from FILM;

delete 
from actor 
where actor_id = 1;

-- 여러 행을 삭제 
-- 이름이 JOHN인 배우 모두 삭제하기 
delete from actor 
where FIRST_NAME = 'JOHN'
;

-- LIKE를 이용한 삭제 
-- 이름이 A로 시작하는 배우 삭제하기 
delete from actor 
where FIRST_NAME like '%A';

-- 데이터만 전부 삭제하기 
delete from ACTOR;

-- FLOWER 테이블의 장미 삭제하기 
-- 외래키 컬럼이 데이터를 참조하고 있으면 참조당하는 쪽의 데이터를 먼저 삭제할 수 없다. 
-- 외래키를 설정할 때 ON DELETE CASCADE 설정을 주게 되면 같이 삭제 가능 
delete from FLOWER where FLOWE_NAME = '장미';

-- POT 테이블에서 장미꽃을 담고있는 화분 데이터 삭제하기 
delete from table_pot
where NUM = '장미';

create table PRODUCTS (
	no INT primary key,
	NAME VARCHAR(30),
	PRICE INT,
	P_DATE DATE
);

insert into products (no,NAME,PRICE,P_DATE)
values 
(1000,'컴퓨터',100,'2021-04-15'),
(1002,'냉장고',200,'2021-03-29'),
(1003,'에어컨',300,'2020-12-15'),
(1004,'오디오',20,'2020-12-15'),
(1005,'세탁기',60,'2021-04-15');

select *
from PRODUCTS;

update PRODUCTS 
set PRICE = PRICE + 20
where no = 1000;

select *
from PRODUCTS;

delete from products 
where NAME = '세탁기';

select *
from products;

select NAME,PRICE
from products;

-- 사용자 생성하기 
create user 'STUDENT_USER'@'LOCALHOST'
IDENTIFIED by '1234';

-- 사용자 확인하기 
-- MySql 사용자는 mysql.user 테이블에서 확인할 수 잇다. 
select user, host from mysql.user;

-- GRANT
-- 사용자에게 권한을 주는 명령어 
-- GRANT 권한 ON 데이터베이스명.테이블명 TO '사용자명'@'접속위치';

-- sakila 데이터베이스의 actor 테이블을 조회할 수 있는 권한 주기 
grant select 
on sakila.ACTOR
to 'STUDENT_USER'@'LOCALHOST';

select * from ACTOR;

-- SAKILA 데이터베이스의 다른 테이블에도 접근할 수 있다. 
grant select,insert,update 
on sakila.*
to 'STUDENT_USER'@'LOCALHOST';

-- 모든 권한 부여하기 
grant all privileges 
on sakila.*
to 'STUDENT_USER'@'LOCALHOST';

-- 권한 확인하기 
show GRANTS for 'STUDENT_USER'@'LOCALHOST';

-- REVOKE
-- 사용자에게 부여한 권한을 회수하는 명령어
-- REVOKE 권한 ON 데이터베이스명. 테이블명 FROM '사용자명'@'접속위치';

revoke select 
on SAKILA.ACTOR
from 'STUDENT_USER'@'LOCALHOST';

revoke all PRIVILEGES 
on SAKILA.*
from 'STUDENT_USER'@'LOCALHOST';


-- 자주 쓰이는 권한의 종류 
-- SELECT,INSERT,UPDATE,DELETE : 데이터 관련
-- CREATE, DROP, ALTER : 테이블 관련 
-- INDEX : 인덱스 생성/삭제 관련 
-- REFERENCES : 외래키 관련 권한 
-- ALL PRIVILIEGES 
-- 사용자 삭제 
-- DROP USER '사용자명'@'접속위치';
drop user 'STUDENT_USER'@'LOCALHOST';

create user 'test_user'@'localhost'
identified by '1234';

grant all privileges
on skaila.*
to 'test_user'@'localhost';

grant select ,update 
on sakila.film
to 'test_user'@'localhost';

revoke select 
on sakila.film
from 'test_user'@'localhost';

drop user 'test_user'@'localhost';

-- 영화 가격 수정하기 
