package ex1_exception.throwsexample;

import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Converter c = new Converter();
		
		Scanner sc = new Scanner(System.in);
		
		try {
			System.out.println("문자열 입력 : ");
			String input = sc.next();
			int num = c.toInt(input);
			System.out.println("변환 결과 " + num);
			
		} catch (Exception e) {
			System.out.println("숫자로 변환할 수 없음");		
		}
	}
}
