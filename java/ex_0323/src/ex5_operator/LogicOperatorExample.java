package ex5_operator;

public class LogicOperatorExample {
	public static void main(String[] args) {
		int x = 10;
		int y = 5;
		
		boolean result = x >= 10 && y ==10;
		System.out.println(result);
		
		//앞의 식으로 true/false가 결정되는 경우 뒤는 연산하지 않음
		result = (x-y) >=10 && (++y) ==5;//앞의 식이 false이기 때문에 뒤에 식 증감은 계산 X
		System.out.println(y);
		result = (x-y) <=10 || (++y) == 5;
		System.out.println(y);
		
		//비트논리연산자
		//기능은 논리연산자와 같지만 비트단위(2진수)의 연산만 가능
		//피연산자가 1,0이라는 것과 산출 결과가 1,0으로 나옴
		//1은 true 0은 false라고 생각하면 논리연산자와 차이는 없음
		
		// & 논리곱 : 둘 다 1이면 1, 아니면 0
		// | 논리합 : 둘 중 하나라도 1이면 1, 아니면 0
		// ^ 배타적 논리합 : 두 항이 다르면 1, 같으면 0
		// ~ 부정 :1을 0으로, 0을 1로 연산
		int a = 10; //1010
		int b = 7; //0111
		int c = a & b;
		System.out.println(c);
		
		int a2 = 12;//0100
		int b2 = 8;//1000
		int c2 = a2 | b2;
		System.out.println(c2);
		
		int a3 = 9;//1001
		int b3 = 11;//1011
		int c3 = a3 ^ b3;
		System.out.println(c3);
		
		//~ 연산
		//2진수는 음수를 표현할 수 없다.
		//비트의 맨 앞자리는 부호의 표현
		int a4 = 7;//0111 -> 1000 -> 1001
		System.out.println(~a4);
		
		
	}
}
