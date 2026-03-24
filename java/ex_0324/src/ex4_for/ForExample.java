package ex4_for;

import java.util.Scanner;

public class ForExample {
	public static void main(String[] args) {
		//지역변수: 특정 영역 내에서 만들어진 변수는 해당 영역 내에서만 사용할 수 있음 
		//안에서 만든 변수는 바깥에서 사용할 수 없지만 바깥에서 만든 변수는 안쪽에서 사용 가능
		for(int i = 1; i<=3; i++) {
			System.out.println(i);
		}
		
		System.out.println("-----------------------------------");
		for(int i = 5; i>=1; i--) {
			System.out.println(i);
		};
		
		System.out.println("-----------------------------------");
		int sum = 0;
		for (int i=1; i <=10; i++) {
			sum +=i;
		}
		System.out.println("1~10까지의 총 합: " + sum);
		
		System.out.println("-----------------------------------");
		
		for(int i=1; i <= 10; i++) {
			if (i % 3 ==0) {
				System.out.println(i);
			}
		}
		System.out.println("-----------------------------------");	
		
		for(int i=1; i <= 20; i++) {
			if (i % 2 ==0) {
				System.out.println(i);
			}
		}
		
		System.out.println("-----------------------------------");
		
		int result = 3;
		for(int i=1; i <=9; i++) {
			System.out.println(result*i);
		}
		
		System.out.println("-----------------------------------");
		
		Scanner sc=new Scanner(System.in);
		
		System.out.print("정수 a :");
		int a = sc.nextInt();
		int sum1=0;
		
		for (int i=1; i<=a; i++) {
			sum1 += i;
		}
		System.out.println(sum1);
		
		System.out.println("-----------------------------------");
		
		int count =0;
		for(int i = 0; i <= 9; i++) {
			System.out.println("정수입력 : ");
			int b = sc.nextInt();
			
			
			if (b%2 == 0);
			count++;
		}
		System.out.println(count);
		
	}
	
}
