package ex5_static;

public class Calculator {

	//파이 : 3.141592;
	static double pi = 3.141592;
	
	//외부에서 두 수를 받아 더하여 반환하는 plus메서드 작성하기 
	
	static public int plus(int x, int y) {
		return x+y;
	}
	
	static public int minus (int x, int y) {
		return x-y;
	}
}
