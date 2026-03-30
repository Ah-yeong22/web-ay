package ex1_final;

import java.util.Scanner;

public class DiscountMain {
	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		System.out.println("금액 : ");
		int money = sc.nextInt();
		
		Discount d = new Discount();
		int total = d.disCountRate(money);
		System.out.println(total);
		
	}
}
