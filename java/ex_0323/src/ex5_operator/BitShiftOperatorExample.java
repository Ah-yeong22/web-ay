package ex5_operator;

public class BitShiftOperatorExample {
	public static void main(String[] args) {
		int num1 = 1; //0001
		int result1 = num1 <<3;
		System.out.println(result1);
		
		int num2 = -8;//00001000 -> 11110111 -> 11111000
		int result3 = num2 >> 3;
	}

}
