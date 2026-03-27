package ex2_method;

public class Calculator {
	public int getResult(int x, int y, String op) {
		if(op.equals("+")) {
			return x + y;
		}else if(op.equals("-")) {
			return x-y;
		}else if(op.equals("*")) {
			return x*y;
		}else if(op.equals("/")) {
			return x/y;
		}else {
			System.out.println("연산 기호가 올바르지 않습니다.");
			return -1;
		}
	}
}
