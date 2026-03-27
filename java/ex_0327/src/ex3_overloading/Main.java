package ex3_overloading;

public class Main {
	public static void main(String[] args) {
		OverloadingExample o = new OverloadingExample();
		CalC c = new CalC();
		
		//메서드 오버로딩의 장점 
		//같은 이름으로 여러가지 타입의 매개값을 처리할 수 잇다.
		
		int result = o.plus(1, 2);
		double result2 = o.plus(1.0, 2.0);
		
		System.out.println(result);
		System.out.println(result2);
		
		c.area(5, 4);
		
		double result4 = c.area(1.0);
		System.out.println(result4);
		
	}
}
