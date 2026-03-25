package ex2_while;

import java.util.Scanner;

public class WhileExample {
	public static void main(String[] args) {
		
		int x = 1;
		
		//x의 값이 변하지 않으면 조건이 거짓이 될 수 없기 때문에 무한으로 돌아감 
		while(x <4) {
			System.out.println(x);
			x++; //초기식의 값을 변화시켜줄 수 잇는 증감식을 따로 작성해야 함
		}
		
		int num = (int)(Math.random()*6) +1;

		Scanner sc= new Scanner(System.in);
		int answer = 0;
		
		while(answer != num) {
			System.out.print("정답 : ");
			answer = sc.nextInt();
			if(answer != num) {
				System.out.println("오답임");
			}
			if(answer == num) {
				System.out.println("정답임");
			}
		}
		
		int i =1;
		int sum = 0;
		while (i <= 100) {
			sum +=i;
			i++;
		}System.out.println("총합" + sum);
		
		System.out.print("정수를 입력하세요: ");
		int total =sc.nextInt();
		int a = 0;
		
		while(total > 0) {
			a += total % 10;
			total = total /10;
		}
		System.out.println(a);
	}
}
