package ex_variable;

public class Ex1_Variable {

	public static void main(String[] args) {
		System.out.println(10);
		System.out.println(3.14);
		System.out.println("홍길동");
		
		int x; //x라는 이름의 정수타입 변수 선언
		x = 10;
		System.out.println(x+1);
		
		x = 55;
		System.out.println(x);
		
		x =  x+1;
		System.out.println(x);
		
		int y = 30;
		
		int hour = 3;
		int minute = 5;
		//숫자 + 문자열은 문자열로 합쳐짐 "3시간 5분" -> 이 자체가 문자열이 됨
		System.out.println(hour + "시간 " + minute + "분");
		int totalMinute = hour*60 + minute;
		System.out.println("총" + totalMinute + "분");
		
		//변수는 또 다른 변수에 대입되어 메모리 간에 값을 복사 가능
		int a=3;
		int b=a;
		System.out.println("a=" +a);
		System.out.println("b="+b);
	}

}
