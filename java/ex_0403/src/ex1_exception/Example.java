package ex1_exception;

import java.util.InputMismatchException;
import java.util.Scanner;

public class Example {

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		try {
			System.out.println("'정수 입력 : ");
			int num = sc.nextInt();
			System.out.println("결과 : " + num);
		} catch (Exception e) {
			System.out.println("정수만 입력 가능");
		}
		
		String[] fruits = {"사과","바나나","포도","복숭아"};
		try {
			System.out.println("인덱스 입력 : ");
			int index = sc.nextInt();
			System.out.println("결과 : " + fruits[index]);
		}catch (ArrayIndexOutOfBoundsException e ) {
			System.out.println("존재하지 않는 인덱스임");
		}catch (InputMismatchException e) {
			System.out.println("숫자를 입력해야 합ㄴ니다.");
		}
	}
}
