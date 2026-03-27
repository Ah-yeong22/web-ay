package ex1_class;


public class StudentMain {
	public static void main(String[] args) {
		

		Student a = new Student();
		a.name = "홍길동" ;
		a.age = 10;
		a.score = 70;

		Student a2 = new Student();
		a2.name = "영희" ;
		a2.age = 12;
		a2.score = 80;

		Student a3 = new Student();
		a3.name = "철수" ;
		a3.age = 13;
		a3.score = 100;
		
		//배열에는 같은 타입의 데이터만 넣을 수 있다.
		//데이터의 타입은 배열 앞에 명시한다. 
		Student[] students = {a, a2, a3};
		
		System.out.println(students[0].name);
		
		//배열에 들어있는 내용을 모두 출력하기 
		for(int i=0; i<students.length; i++) {
			System.out.println(students[i].name);
			System.out.println(students[i].age);
			System.out.println(students[i].score);
			System.out.println("--------------------");
		}
	}
}



