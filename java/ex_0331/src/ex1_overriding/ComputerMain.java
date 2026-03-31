package ex1_overriding;

public class ComputerMain {
	public static void main(String[] args) {
		double r = 5.0;
		
		Calculator calculator = new Calculator();
		System.out.println(calculator.areaCircle(r));
		
		Computer computer = new Computer();
		System.out.println(computer.areaCircle(r));
	}
}
