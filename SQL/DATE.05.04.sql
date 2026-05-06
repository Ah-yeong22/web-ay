-- HAVING
-- WHERE과 기능은 같다. 
-- 그룹화된 결과에 조건을 적용할 때 사용하는 키워드 
-- WHERE -> 묶기 전에 필터링
-- HAVING -> 묶은 후에 필터링

-- GROUP BY를 사용하면 데이터가 다음과 같이 바뀐다., 
-- 여러 행 -> 그룹으로 묶임 -> 짖ㅂ계 값이 생성

-- WHERE 에서는 집계 함수를 사용할 수 없다. 

-- 평균 급여가 5000 보다 큰 부서의 정보를 조회하세요 
select DEPARTMENT_ID, AVG(SALARY)
from EMPLOYEES
-- where AVG(SALARY) > 5000 -- 전체 행에 대해서 평균급여를 구함
group by DEPARTMENT_ID
having avg(SALARY) > 5000;

-- 급여가 5000 이상인 사원들을 대상으로 
-- 부서별 평균 급여가 7000 이상인 부서 조회하기 
select DEPARTMENT_ID,AVG(SALARY)
from employees
where SALARY >= 5000
group by DEPARTMENT_ID 
HAVING AVG(SALARY) >= 7000;

-- 많이 하는 실수 
-- WHERE 절에 그룹함수 조건 걸기 
-- GROUP BY 안한 속성을 SELECT에서 사용
-- HAVING 대신에 WHERE 사용 

-- 부서별 사원 수를 구하고 사원 수가 3명 이상인 부서만 조회하세요 
-- 
select COUNT(*),DEPARTMENT_ID
from employees 
group by DEPARTMENT_ID 
having COUNT(*) >=3;

-- 부서별 최고 급여가 10000 이상인 부서 조회
select DEPARTMENT_ID,MAX(SALARY)
from employees 
group by DEPARTMENT_ID
having MAX(SALARY) >=10000;

 -- 입사년도별 사원 수 중 5명 이상인 년도만 출력 
select YEAR(HIRE_DATE),COUNT(*)
from employees 
group by year(HIRE_DATE) 
having COUNT(*) >= 5;

DROP TABLE IF EXISTS sales;

CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50),
    amount INT,
    sale_date DATE
);

INSERT INTO sales (category, amount, sale_date) VALUES
('식품', 80000, '2025-01-01'),
('식품', 70000, '2025-01-02'),
('식품', 60000, '2025-01-03'),
('전자제품', 250000, '2025-01-01'),
('전자제품', 150000, '2025-01-02'),
('의류', 30000, '2025-01-01'),
('의류', 25000, '2025-01-03'),
('도서', 12000, '2025-01-02'),
('가구', 180000, '2025-01-03'),
('가구', 50000, '2025-01-04'),
('문구', 10000, '2024-12-31'),
('문구', 15000, '2025-01-02');

-- 판매 내역 테이블
select * from SALES;

-- 판매가 두번 이상 발생한 카테고리만 조회하기 
select CATEGORY,COUNT(CATEGORY)
from sales 
group by category 
having COUNT(CATEGORY) >=2;

-- 카페고리별 평균 결제 금액이 100,000원 이상인 것만 조회하기 
select CATEGORY, AVG(AMOUNT)
from sales 
group by category 
having avg(AMOUNT) >= 100000;

-- 2025-01-02 이후의 거래만 대상으로, 카테고리별 총액이 20000원 이상인 경우만 조회하기 
select category,SUM(AMOUNT)
from SALES
where SALE_DATE >= 2025-01-02
group by category 
having SUM(AMOUNT) >= 20000;

-- 카테고리별 총 판매 금액을 구하되, 판매금액이 200,000이상인 카테고리만 조회하기 
select CATEGORY,SUM(AMOUNT)
from SALES
group by CATEGORY
having SUM(AMOUNT) >= 200000;
-- 카테고리별 가장 큰 판매금액을 구하되 가장 큰 금액이 200,000원 이상인 카테고리만 조회하세요 
select CATEGORY, MAX(AMOUNT)
from SALES
group by category 
having max(AMOUNT) >= 200000;
-- 카테고리별 판매 총액을 구한 뒤, 총 판매 금액이 50,000이상인 카테고리만 조회
select CATEGORY, SUM(AMOUNT)
from SALES
group by category 
having SUM(AMOUNT) >= 50000;
-- 2025년 1월 1일에 판매된 데이터만 대상으로 하여 카테고리별 판매 총액 구하기
select CATEGORY,SALE_DATE,SUM(AMOUNT)
from SALES
where SALE_DATE='2025-01-01'
group by category 
having SUM(AMOUNT);
-- 총 판매 금액이 20,000이상인것만 조회하기
select CATEGORY,SUM(AMOUNT)
from SALES 
group by CATEGORY
having SUM(AMOUNT) >= 20000;

-- ROLLUP
-- GROUP BY가 그룹별로 집계를 해준다면, ROLLUP은 소계와 총계까지 
-- 한 번에 만드는 기능 

-- 아래에서 위로 합계를 말아 올리는 기능
-- 카테고리별 판매금액 
select CATEGORY,SUM(AMOUNT)
from SALES
group by CATEGORY;

-- ROLLUP을 사용하여 카테고리별 합계와 전체 합계를 같이 조회
select CATEGORY,SUM(AMOUNT)
from SALES
group by CATEGORY with ROLLUP;

INSERT INTO sales (category, amount, sale_date) VALUES
-- 2024 데이터 보강
('식품', 50000, '2024-01-02'),
('식품', 40000, '2024-01-03'),
('전자제품', 120000, '2024-02-01'),
('전자제품', 80000, '2024-02-03'),
('의류', 20000, '2024-03-01'),
('가구', 90000, '2024-03-05'),
-- 2026 데이터 추가
('식품', 90000, '2026-01-01'),
('식품', 70000, '2026-01-02'),
('전자제품', 300000, '2026-01-03'),
('전자제품', 200000, '2026-01-04'),
('의류', 60000, '2026-02-01'),
('도서', 15000, '2026-02-03'),
('가구', 250000, '2026-03-01'),
('가구', 100000, '2026-03-05');

-- 년도별 + 카테고리별 ROLLUP
select 
	YEAR(SALE_DATE),
	CATEGORY,
	SUM(AMOUNT)
from SALES
group by YEAR(SALE_DATE),CATEGORY with rollup;
-- 년도 + 카테고리별 합계 
-- 년도별 합계 
-- 전체 합계 

-- 월별 + 카테고리별 총 판매량 ROLLUP
select 
	MONTH(SALE_DATE),
	CATEGORY,
	SUM(AMOUNT)
from SALES
group by MONTH(SALE_DATE),CATEGORY with rollup;

select * from sales ;

select COUNT(E.COMMISSION_PCT) from EMPLOYEES E; 
-- *쓰면 전체 행 개수를 세줌 속성을 넣으면 NULL값 제외

-- SALES테이블에서 카테고리의 개수 세기
select COUNT(distinct CATEGORY) from SALES;

-- IFNULL(컬럼, 대체값)
select FIRST_NAME,SALARY,IFNULL(E.COMMISSION_PCT,0)
from EMPLOYEES E;

INSERT INTO employees (employee_id, first_name, last_name, email, hire_date, job_id, salary, commission_pct, manager_id, department_id)
VALUES
(201, 'Chris', 'Brown', 'CBROWN', '2025-01-10', 'IT_PROG', NULL, NULL, 103, 60),
(202, 'Emma', 'Stone', 'ESTONE', '2025-02-15', 'FI_ACCOUNT', NULL, NULL, 108, 100),
(203, 'Liam', 'Smith', 'LSMITH', '2025-03-20', 'PU_CLERK', NULL, NULL, 114, 30),
(204, 'Olivia', 'Davis', 'ODAVIS', '2025-04-05', 'IT_PROG', NULL, NULL, 103, 60),
(205, 'Noah', 'Wilson', 'NWILSON', '2025-05-01', 'FI_ACCOUNT', NULL, NULL, 108, 100);

select * from EMPLOYEES where SALARY is null;

-- 전체 급여 평균 
select AVG(IFNULL(SALARY,0)) FROM EMPLOYEES;