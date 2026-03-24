package ex2_if;

import java.util.Scanner;

public class RandomExample {
	public static void main(String[] args) {
		//Math 클래스
		//random()매서드
		//-0..0 <= ~<1.0 사이의 double타입 난수를 하나 뽑아주는 기능
		
		int num = (int)(Math.random()*6) +1;
		System.out.println("결과 :" + num);
		
		if (num == 1) {
			System.out.println("결과 : 1");
		}else if (num == 2) {
			System.out.println("결과 : 2");
		}else if (num == 3) {
			System.out.println("결과 : 3");
		}else if (num == 4) {
			System.out.println("결과 : 4");
		}else if (num == 5) {
			System.out.println("결과 : 5");
		}else if (num == 6) {
			System.out.println("결과 :6");
		}
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("구매 금액 :");
		int price = sc.nextInt();
		
		if(price >= 100000) {
			System.out.println("20% 할인");
			System.out.println("최종금액은 " + (price * 0.8));
		}else if (price >= 50000) {
			System.out.println("10% 할인");
			System.out.println("최종금액은" + (price * 0.9));
		}
	}
	
}
