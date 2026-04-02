package ex1_innerclass.exam;

public class CMain {

	public static void main(String[] args) {
		Calculator result = new Calculator();
		Calculator.Result result2 = result.add(10,20);
		
		result2.show();
	}
}
