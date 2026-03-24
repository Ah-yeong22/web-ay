package ex2_if;

import java.util.Scanner;

public class IfElseExample {
	public static void main(String[] args) {
		int age = 17;
		
		if (age >= 20) {
			System.out.println("성인입니다. ");
		} else {
			System.out.println("미성년자입니다. ");
		}
		
		Scanner sc = new Scanner(System.in);
		System.out.print("x: ");
		int a = sc.nextInt();
		
		if (a%2 == 0) {
			System.out.println("짝수입니다. ");
		} else {
			System.out.println("홀수입니다.");
		}
		
		System.out.print("비밀번호 : ");
		int pw = sc.nextInt();
		
		
		if (pw == 1234) {
			System.out.println("로그인 성공");
		} else {
			System.out.println("비밀번호가 일치하지 않습니다. ");
		}
	}
}
