package ex1_innerclass.localclass;

//지역 내부 클래스
//외부클래스의 메서드 안에 선언되고, 그 메서드 안에서만 사용되는 클래스
public class Outer {

	int num = 10;
	
	
	void method() {
		int value=100;
		class Local{
			void print() {
				//바깥 클래스의 필드와 메서드를 사용할 수 있다.
				System.out.println(num);
				//메서드 안에서 만들어진 지역변수도 사용가능
				//지역변수의 값이 바뀌면 안된다. 
				System.out.println(value);
			}
			
		}
		
		Local local = new Local();
		local.print();
	}
}
