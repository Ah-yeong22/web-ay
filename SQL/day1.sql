create database if not exists academy_db
character set = utf8mb4
collate = utf8mb4_unicode_ci;

# 한줄 주석
-- 한줄 주석

# TBL_MEMBER 라는 이름의 테이블 만들기 
-- 문자열 : 이름 (길이 50)
-- 정수 : 나이 
-- 제약조건은 없음

-- SQL은 스크립트 전체가 실행되지 않는다. 
-- 구문별로 실행이 된다. 

create table tbl_member (
	name varchar(50),
	age int
);

-- 테이블명 TBL_CAR
-- 속성
-- 정수 : id
-- 문자열 : brand(길이 100)
-- 문자열 : color (길이 100)
-- 정수 : price
-- id 속성에 기본키 제약조건 주기 

create table TBL_CAR (
	id int primary key,
	brand varchar(100),
	color varchar(100),
	price int
);

-- 테이블 삭제 

drop table tbl_car;

-- 테이블이 존재할 때만 삭제하는 방식 
-- DROP TABLE IF EXISTS 테이블명;

-- 테이블 안의 데이터도 전부 삭제된다. 
-- 외래키(FK)로 연결된 테이블이 있을 경우 삭제가 안될 수 있다. 

-- 속성 옆에 제약조건을 주는거랑 CONSTRAINT 써서 제약조건을 주는거랑 차이 
-- 속성 옆에 작성한는 방법 (inline 방식)
-- 간단하고 직관적이다

-- CONSTRAINT로 제약 조건 작성(Table - level 방식)
-- 이름 지정 여부 
-- Constraint car_pk primary key(id)
-- inline 방식은 이름이 자동생성 -> 나중에 수정 / 삭제 안됨 
-- 여러 컬럼 제약조건 가능 여부 
-- inline 방식은 단일컬럼에만 가능
-- CONSTRAINT PK_ORDER PRIMARY KEY(USER_ID, PRODUCT_ID)

-- 가독성과 구조 
-- INLINE 방식
-- 간단, 빠르게 작성, 소규모 테이블에 적합하다. 

-- CONSTRAINT 방식 
-- 구조가 명확
-- 제약조건을 한 곳에서 관리 가능
-- 실무에서 더 많이 사용됨 

create table EXAMPLE(
	COL1 VARCHAR(10) not null,
	COL2 VARCHAR(10),
	CREATE_DATE DATETIME default CURRENT_TIMESTAMP()
);

-- 수정하기 
-- ALTER TABLE 테이블명 ... 

-- 컬럼 추가하기 
-- ADD COLUMN 컬럼명 데이터타입

alter table example add column col3 varchar(50);

-- 컬럼 삭제하기
-- drop column 컬럼명;
alter table example  drop column col3;

-- 컬럼명 변경하기 
-- rename column 컬럼명 to 바꿀 컬럼명;
alter table example rename column col2 to col8;

-- 컬럼의 타입 변경하기 
-- modify column 컬럼명 타입;
alter table example modify column col8 int;

-- 제약조건 추가하기 
-- ADD 제약조건 종류(대상컬럼);
alter table example add primary key(COL1);

-- 제약조건 삭제하기 
-- drop 제약조건 종류 ;
alter table example drop primary key;

-- show index from 테이블 
-- 제약조건에 부여된 이름 찾기 KEY_NAME 부분이 부여된 이름임

show index from tbl_CAR;

# STUDENT 테이블 만들기
# 속성
# ID : 정수, 기본키
# NAME : 문자열(50), NOT NULL
# AGE : 정수
# EMAIL : 문자열(100)

# 다음의 컬럼을 테이블에 추가하세요
# PHONE : 문자열(20)

# AGE컬럼의 타입을 정수 -> TINYINT로 수정하세요

# NAME컬럼의 이름을 STUDENT_NAME으로 변경하세요

# PHONE 컬럼을 삭제하세요

# EMAIL 컬럼을 NOT NULL로 변경하세요

create table table_student(
	id int primary key,
	name varchar(50) not null,
	age int,
	email varchar(100)
);

alter table table_student add column phone varchar(20);

alter table table_student modify column age TINYINT;

alter table table_student  rename column name to student_name;

alter table table_student  drop column phone;

alter table table_student modify email varchar(100) not null;

-- 여러 컬럼을 한 번에 추가하기 
-- ADDRESS : 문자열(100)
-- GRADE : 정수 

alter table table_student 
add address varchar(100),
add grade int;

-- grade 컬럼의 기본값을 1로 설정하기 
alter table table_student
modify column grade int default 1;

-- ADD 로 추가하기 
-- PK, UNIQUE, CHECK
-- MODIFY로 수정하기 
-- NOT NULL, DEEAULT

create table TBL_ANIMAL(
	id int primary key,
	type varchar(100),
	age int, 
	feed varchar(100)
);

create table tbl_student2(
	ind int primary key,
	name varchar(100),
	major varchar(100),
	gender char(1) not null defult 'W',
	birth date,
	constraint ban_char check (gender in ('M','W')),
	constraint ban_date check(birth >= '1980-01-01')
);

-- default : 컬럼에 값이 아예 주어지지 않았을 때 자동으로 들어가는 기본값을 정하는 규칙
-- not null : 컬럼에 NULL 값 자체를 허용하지 않겠다. 
-- 같이 사용하면 값 생략시 'W'가 들어가게 되고, 누군가 NULL을 넣으려고 하면 DB가 거부 
-- not null 이 없고 default만 있을 때 누군가 gender 자리에 null 이라고 넣으면 데이터가 null이라고 들어가게 된다. 

-- Gendern 