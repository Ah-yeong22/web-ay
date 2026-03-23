package ex5_operator;

public class SingleOperatorExample {
	public static void main(String[] args) {
		//부호를 결정하는 연산자
		int x = -100;
		x= -x;
		System.out.println("x의 값 : " + x);
		
		//증감연산자 1씩 증가시키거나 1씩 감소시키는 연산자 
		//++ : 1 증가
		//-- : 1 감소
		//전위연산 : 연산자가 앞에오는 연산
		int a = 5;
		System.out.println(++a);
		//후위연산
		//사용을 먼저하고 연산이 나중에 이루어짐
		int b = 5;
		System.out.println(b++); //5
		System.out.println(b); //6
		
		//증감연산자 ++x -> x = x + 1;
		x =5;
		int result = ++x + x++;
		System.out.println(result);
		System.out.println(x);
		
		//x y z의 값  
		x= 2;
		int y=3;
		int z= x++ + ++y;
		System.out.println(x);
		System.out.println(y);
		System.out.println(z);
		
		//논리 부정 연산자
		//!논리형 데이터 true->false / false->true
		boolean isOn = true;
		System.out.println(!isOn);
		
		
		
	}
}
