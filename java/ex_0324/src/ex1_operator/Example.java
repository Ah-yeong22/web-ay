package ex1_operator;

import java.util.Scanner;

public class Example {
	public static void main(String[] args) {
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("공의개수 :");
		int ball= sc.nextInt();
		int box = (ball % 5) == 0 ? ball/5 : ball/5 +1;
		System.out.println(box);
		
		System.out.print("가로x : ");
		int x = sc.nextInt();
		System.out.print("세로y : ");
		int y = sc.nextInt();
		int area = x*y;
		int round = (x+y) *2;
		System.out.println(area);
		System.out.println(round);
		
		System.out.print("하루에 받는 용돈 : ");
		int money = sc.nextInt();
		System.out.print("날짜 수 : ");
		int day = sc.nextInt();
		System.out.print("사용금액 : ");
		int used = sc.nextInt();
		int total = (money * day) - used;
		System.out.println(total);
		
		System.out.print("국어 : ");
		int korea = sc.nextInt();
		System.out.print("영어 : ");
		int English = sc.nextInt();
		System.out.print("수학 : ");
		int math = sc.nextInt();
		int total1 = korea + English + math;
		double average = (total1/3.0);
		boolean grade = korea >= 60 && English >= 60 && math >=60 && average >=60 ? true: false;
		System.out.println("합격여부 : " + grade);
		
	}
}
