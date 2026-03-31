package ex6_test;

public class CalculatorMain {

	public static void main(String[] args) {
		CalPlus plus = new CalPlus();
		System.out.println(plus.gerResult(1, 5));
		CalMinus minus = new CalMinus();
		System.out.println(minus.gerResult(5, 6));
		
	}
	
}
