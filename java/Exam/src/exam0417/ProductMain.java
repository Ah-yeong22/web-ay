package exam0417;

import java.util.ArrayList;

public class ProductMain {
	public static void main(String[] args) {
		Product p = new Product("컴퓨터",7);
		
		System.out.println("==재고출력==");
		p.printInfo();
		
		System.out.println("==3개 판매==");
		p.sell(3);
		
		System.out.println("==재고출력==");
		p.printInfo();
		
		System.out.println("==10개 판매 시도==");
		p.sell(10);
		
		System.out.println("==재고출력==");
		p.printInfo();
		
		
	}
	
	
	
}
