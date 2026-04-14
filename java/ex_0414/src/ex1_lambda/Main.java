package ex1_lambda;

public class Main {
	public static void main(String[] args) {
		
		CalculatorService cs = new CalculatorService();
		
		Calculator c = (a,b) -> a+b;
		cs.execute(c);
		
		//람다식을 반환받아서 사용
		Calculator add = cs.getCalculator("add");
	}
}
