package ex2_while;

import java.util.Scanner;

public class DoWhileExample {
	public static void main(String[] args) {
		System.out.println("메시지를 입력하세요");
		System.out.println("프로그램을 종료하려면 q를 입력하세요");
		
		Scanner sc = new Scanner(System.in);
		
		String inputString;
		
		do {
			System.out.print(">");
			inputString = sc.nextLine();
			System.out.println(inputString);
		}while(!inputString.equals("q"));
		//------------------------------------------//
		String password;
		int count = 0;
		
		do {
			System.out.println("비밀번호 : ");
			password = sc.nextLine();
			count++;
			
			if(password.equals("1234")) {
				System.out.println("로그인 성공");
			}else if(count == 5) {
				System.out.println("접속 차단");
			}
		}while(!password.equals("1234") && count <5);
		
		//-----------------------------------------------//
		
		int original;
		int reverse = 0;
		
		System.out.println("정수입력 : ");
		original =sc.nextInt();
		
		do {
			reverse = reverse * 10 + original %10;
			original /= 10;
		}while (original !=0);
		
		System.out.println(reverse);
		
		
		
		
		
		
		
		
		
		
		
	}
}
