package ex2_method;

public class MethodExample {

	//메소드의 구조
	//접근제한자 반환형 메서드명(매개변수){
	// 실행하고자 하는 명령
	// return 반환값;
	//}
	// 반환할 값이 없으면 반환형은 void
	//외부에서 받을 값이 없으면 매개변수는 생략 가능
	
	public void printInfo() {	
		System.out.println("메서드가 호출되었습니다.");
		
	
	}public int add(int a, int b) {
		return a+ b;
	}
	public double circleArea(int a) {
		return 3.14*a*a;
		
	}
	
	public void circleRound(int r) {
		System.out.println(2*3.14*r);
	}
	
	//배열의 선언
	//자료형 [] 배열명 = {1,2,3}
	//자료형 [] 배열명 = new int[3];
	public int countEven(int[] x) {
		int count = 0;
		for(int i  : x) {
			if(i%2 == 0) {
				count++;
			}
		}
		return count;
		
	}
	public int countChar(String c, char c2) {
		int count = 0;
		for(int i =0; i<c.length(); i++) {
			if(c.charAt(i) == c2) {
				count++;
			}
		}return count;
		
		
		
		
		
		
		
		
	}
}
