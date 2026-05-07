select * from sales;
CREATE TABLE rollup_practice.sales 
LIKE academy_db.sales;
INSERT INTO rollup_practice.sales
SELECT * FROM academy_db.sales;

-- 별칭(Alias)
-- 컬럼이나 테이블에 임시 이름을 붙이는 기능
-- 컬럼의 이름을 보기좋게 변경 
-- 테이블 이름을 짧게 줄인다. 
-- 함수를 걸었을 때 너무 길어지면 별명을 줄 수 있다. 
-- select 컬럼명 as 별칭 from 테이블명 (as 생략가능)
-- from 테이블명 as 별칭;
select category, avg_amount
from(
	select category, avg(sales_amount) as avg_amount
	from sales
	group by category
) as t; -- 서브쿼리로 조회된 테이블에는 별칭이 필수 
-- 서브쿼리로 조회된 결과에는 이름이 없기 때문
select * from employee;

-- 부서별 평균을 inline view를 활용하여 조회하기 
-- 출력 컬럼 : department, avg_salary

select department,avg_salary
from(
	select department,
			avg(salary) as avg_salary
	from employee
	group by department 
)as dept_avg;

-- 평균 급여가 5000 이상인 부서만 조회하세요 
-- inline view 활용하기 
SELECT department, avg_salary
FROM (
    SELECT department,
           AVG(salary) AS avg_salary
    FROM employee
    GROUP BY department
) AS dept_avg
WHERE avg_salary >= 5000;
-- 각 부서의 최고 급여 조회하기 
select *
from(
	select department,max(salary) as max_salary
	from employee
	group by department
) as D;

-- sales 테이블을 이용하여 지역별 판매 건수를 서브쿼리를 이용하여 조회하기 
-- 지역 : region 
select *
from (
	select region,
			count(*) as sales_count
	from sales
	group by region
) as region_sales;
-- 지역별로 최고 판매금액, 최저 판매금액, 최고와 최저 판매금액의 차이를 조회하기
select region,
		max(sales_amount) as max_sales,
		min(sales_amount) as min_slaes,
		max(sales_amount) - min(sales_amount) as sales_gap
from sales
group by region ;

-- 카테고리별 총 판매금액 조회 후 평균보다 높은 카테고리 조회하기 
-- 카테고리별 총 판매금액을 구한 뒤 전체 카테고리 평균 판매금액보다 높은 카테고리를 조회 
-- 서브쿼리에서 바깥쪽 쿼리의 s1.region을 참조하고 있다. 
-- 각 행마다 자기 지역의 평균 가격을 구해서 비교하게 된다. 
-- 서울 행 -> 서울 평균과 비교 
-- 부산 행 -> 부산 평균과 비교
-- 대구 행 -> 대구 평균과 비교 

-- 실행 방식 
-- 1. 바깥쪽이 

-- delete에서 사용하는 서브쿼리 
-- 전체 평균 급여보다 적게 받는 사람 삭제하기 
delete from employee 
where salary < (
	select avg(salary)
	from (
		select avg(salary)
		from employee) t
	);
)

drop table student;
-- 학생 테이블
CREATE TABLE student (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

INSERT INTO student (id, name) VALUES
(1, '철수'),
(2, '영희'),
(3, '민수');

drop table enroll;
-- 수강 테이블
CREATE TABLE enroll (
  id INT PRIMARY KEY,
  student_id INT,
  class_name VARCHAR(50),
  constraint fk_enroll_student foreign key (student_id)
  references student(id)
);

INSERT INTO enroll (id, student_id, class_name) VALUES
(1, 1, '데이터베이스'),
(2, 1, '자바'),
(3, 2, '데이터베이스');

-- Inner Join
-- 학생 이름, 수업명을 조회하고 싶다. 
select name, class_name
from student s
inner join enroll e
on s.id = e.student_id;

-- 값 자체가 연결 역할을 하기 때문에 fk로 설정하지 않아도 가능은 하다. 
-- 하지만 fk로 연결하여 join을 하는것을 기본으로 한다. 
-- fk로 연결하지 않으면 데이터의 무결성이 보장되지 않기 때문
-- 잘못된 데이터가 들어와도 막을 수 없다. 

CREATE TABLE customer (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(30),
    grade VARCHAR(20)
);

CREATE TABLE product (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(50),
    category VARCHAR(30),
    price INT
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    quantity INT,
    order_date DATE,

    CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),

    CONSTRAINT fk_orders_product
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

INSERT INTO customer VALUES
(1, '김민준', 'VIP'),
(2, '이서연', '일반'),
(3, '박지훈', 'VIP'),
(4, '최유나', '일반'),
(5, '정하늘', '실버');

INSERT INTO product VALUES
(101, '노트북', '전자제품', 1200000),
(102, '마우스', '전자제품', 50000),
(103, '키보드', '전자제품', 80000),
(201, '의자', '가구', 150000),
(202, '책상', '가구', 300000);

INSERT INTO orders VALUES
(1, 1, 101, 1, '2026-05-01'),
(2, 1, 102, 2, '2026-05-01'),
(3, 2, 201, 1, '2026-05-02'),
(4, 3, 101, 1, '2026-05-02'),
(5, 3, 202, 1, '2026-05-03'),
(6, 4, 103, 3, '2026-05-03'),
(7, 5, 201, 2, '2026-05-04'),
(8, 5, 102, 1, '2026-05-04');

-- 고객명, 상품명, 주문수량, 주문일자 조회하기 
select customer_name,product_name,quantity,order_date
from orders o
inner join customer c
on o.customer_id = c.customer_id
inner join product p
on o.product_id = p.product_id ;

-- 고객별 총 구매 금액 
-- group by 사용하기 
select customer_name,sum(quantity*price)
from orders o 
inner join customer c
on o.customer_id= c.customer_id
inner join product p
on o.product_id  = p.product_id 
group by c.customer_name;
-- 총 구매금액이 100만원 이상인 고객 조회하기 
select customer_name,sum(quantity*price) as total_price
from orders o 
inner join customer c
on o.customer_id= c.customer_id
inner join product p
on o.product_id  = p.product_id 
group by c.customer_name
having total_price >= 1000000;
-- 카테고리별 총 매출 조회 
select category,sum(quantity*price)
from orders o 
inner join product p
on o. product_id = p.product_id 
group by p.category ;

-- VIP 고객의 주문 내역 조회하기 
-- 이름,등급,제품명,주문수량,주문날짜
SELECT customer_name,
       grade,
       product_name,
       quantity,
       order_date
FROM orders o
INNER JOIN customer c
ON o.customer_id = c.customer_id
INNER JOIN product p
ON o.product_id = p.product_id
WHERE grade = 'VIP';

select DAYNAME, class_name
from student s
left outer join enroll e
on s.id = e.student_id;

-- 민수는 수강내역이 없지만, 왼쪽 테이블에 있으므로 반드시 나온다. 
-- 대신 enroll쪽 값은 없기 때문에 null로 채워진다. 

INSERT INTO customer VALUES
(6, '한지민', '일반');

INSERT INTO product VALUES
(203, '소파', '가구', 700000);

-- 주문내역이 한번도 없는 고객의 이름을 조회하세요 
select customer_name
from customer c
left outer join orders o 
on o.customer_id = c.customer_id;

-- 모든 고객의 주문 건수를 조회하세요 
-- 주문이 없는 고객은 0으로 출력되게 하세요 
select customer_name, count(order_id)
from customer c
left outer join orders o 
on c.customer_id = o.customer_id
group by c.customer_name;

-- right outer join
-- 오른쪽 테이블을 기준으로 전부 출력하는 join
select name,class_name
from student s
right outer join enroll e
on s.id = e.student_id;
-- 모든 수강 기록을 기준으로 학생 이름을 붙여줘 

-- full outer join 
-- 양쪽 테이블의 모든 데이터를 조호 ㅣ
-- 일치하면 연결하고, 일치하지 않으면 없는 쪽을 null로 표시 
-- mysql은 full outer join을 직접 지원하지는 않는다. 
-- left join과 right join을 union으로 합쳐서 구현한다. 

-- union : 두 가지 select 결과를 이어붙이ㅏㄴ다. 
-- 중복제거를 자동으로 해준다. 
-- union all : 중복 제거 없이 모두 출력이 된다. 

CREATE TABLE color (
  name VARCHAR(20)
);

INSERT INTO color VALUES ('빨강'), ('파랑');

CREATE TABLE size (
  name VARCHAR(20)
);

INSERT INTO size VALUES ('S'), ('M'), ('L');
-- 색상고 ㅏ사이즈의 모든 조합을 만들기
select c.name,e.name
from color c
cross join size e;


insert into employee values
(1,'대표',null),
(2,'팀장',1),
(3,'사원',2);

-- 고객명과 추천인 이름을 조회하기 
-- 추천인 없는 고객 조회
select * from customer where recommender_id is null;
-- 추천 관계 문장 출려하기

-- 가장 많은 고객을 추천한 사람 조회 ( 사람순으로 )

-- 고객 테이블과 주소테이블을 이용하여 고객의 이름, 성, 주소를 조회하세요 
select last_name,first_name,address
from customer c 
join address a 
on c.address_id =a.address ;

create view customer_address_view as
select last_name,first_name,address
from customer c 
join address a 
on c.address_id =a.address ;

select * from customer_address_view;

-- 고객별 영화 대여 횟수를 customer_rental_count_view로 만들기 


